/**
 * Real-time WebSocket connection management for Juno envelope budgeting
 * Handles Supabase Realtime subscriptions with automatic reconnection
 */

import { createClient } from './client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { categorizeError, getUserFriendlyError, createContextualError, type ErrorCode, type UserFriendlyError } from '@/lib/utils/errorMessages'

export interface EnvelopeBalanceChange {
  category_id: string
  budget_id: string
  category_name: string
  old_spent: number
  new_spent: number
  allocated: number
  remaining: number
  is_overspent: boolean
  timestamp: number
  transaction_id: string
  operation: 'INSERT' | 'UPDATE' | 'DELETE'
}

// Optimized payload for WebSocket transmission
export interface OptimizedBalanceUpdate {
  c: string // category_id (shortened)
  b: string // budget_id 
  s: number // new_spent
  o: number // old_spent
  a: number // allocated
  t: number // timestamp
  tx: string // transaction_id
  op: 'I' | 'U' | 'D' // operation (shortened)
}

export interface RetryableOperation {
  id: string
  type: 'balance_update' | 'category_fetch'
  payload: () => Promise<unknown>
  callback: (result: unknown) => void
  errorCallback?: (error: string) => void
  attempts: number
  lastAttempt: number
  originalTimestamp: number
}

export interface ConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error'
  error?: string
  userFriendlyError?: UserFriendlyError
  lastConnected?: Date
  reconnectAttempts: number
}

export interface RealtimeSubscription {
  channel: RealtimeChannel
  unsubscribe: () => void
}

class RealtimeManager {
  private supabase = createClient()
  private channels: Map<string, RealtimeChannel> = new Map()
  private connectionState: ConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0
  }
  private reconnectTimer?: NodeJS.Timeout
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000 // Start with 1 second
  private listeners: Map<string, Set<(state: ConnectionState) => void>> = new Map()
  
  // Rate limiting for updates
  private updateFrequencyLimit = 100 // Max 100 updates per second
  private lastUpdateTimes: Map<string, number> = new Map()
  private pendingUpdates: Map<string, EnvelopeBalanceChange> = new Map()
  private updateTimer?: NodeJS.Timeout

  // Graceful degradation
  private fallbackMode = false
  private fallbackPollingInterval = 5000 // 5 seconds
  private fallbackTimer?: NodeJS.Timeout
  private activeBudgets: Set<string> = new Set()
  private fallbackCallbacks: Map<string, (change: EnvelopeBalanceChange) => void> = new Map()

  // Retry logic for failed operations
  private retryQueue: Map<string, RetryableOperation> = new Map()
  private maxRetries = 3
  private retryDelays = [1000, 2000, 4000] // Exponential backoff in milliseconds
  private retryTimer?: NodeJS.Timeout

  constructor() {
    this.setupConnectionMonitoring()
    this.startUpdateProcessor()
    this.startRetryProcessor()
  }

  /**
   * Subscribe to envelope balance changes for a specific budget
   */
  subscribeToEnvelopeChanges(
    budgetId: string,
    onBalanceChange: (change: EnvelopeBalanceChange) => void,
    onError?: (error: string) => void
  ): RealtimeSubscription {
    const channelName = `envelope-changes-${budgetId}`
    
    // Store for fallback mode
    this.activeBudgets.add(budgetId)
    this.fallbackCallbacks.set(budgetId, onBalanceChange)

    // Remove existing channel if it exists
    this.unsubscribeChannel(channelName)

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `category_id=in.(select id from categories where budget_id=eq.${budgetId})`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          this.handleTransactionChange(payload, onBalanceChange, onError)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'categories',
          filter: `budget_id=eq.${budgetId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          this.handleCategoryUpdate(payload, onBalanceChange, onError)
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          this.updateConnectionState({ 
            status: 'connected', 
            error: undefined,
            userFriendlyError: undefined 
          })
          this.disableFallbackMode()
        } else if (status === 'CHANNEL_ERROR') {
          const errorCode = categorizeError(err)
          const userFriendlyError = createContextualError(errorCode, {
            action: 'realtime_subscription',
            retryCount: this.connectionState.reconnectAttempts
          })
          
          this.updateConnectionState({ 
            status: 'error', 
            error: err?.message || 'Channel subscription error',
            userFriendlyError
          })
          this.enableFallbackMode()
          onError?.(userFriendlyError.message)
        }
      })

    this.channels.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => {
        this.unsubscribeChannel(channelName)
        this.activeBudgets.delete(budgetId)
        this.fallbackCallbacks.delete(budgetId)
      }
    }
  }

  /**
   * Subscribe to category updates for real-time balance changes
   */
  subscribeToCategoryUpdates(
    categoryId: string,
    onUpdate: (category: any) => void,
    onError?: (error: string) => void
  ): RealtimeSubscription {
    const channelName = `category-${categoryId}`
    
    this.unsubscribeChannel(channelName)

    const channel = this.supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'categories',
          filter: `id=eq.${categoryId}`
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.new) {
            onUpdate(payload.new)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          const errorCode = categorizeError(err)
          const userFriendlyError = getUserFriendlyError(errorCode)
          onError?.(userFriendlyError.message)
        }
      })

    this.channels.set(channelName, channel)

    return {
      channel,
      unsubscribe: () => this.unsubscribeChannel(channelName)
    }
  }

  /**
   * Handle transaction changes and trigger balance updates with rate limiting
   */
  private async handleTransactionChange(
    payload: RealtimePostgresChangesPayload<any>,
    onBalanceChange: (change: EnvelopeBalanceChange) => void,
    onError?: (error: string) => void
  ) {
    try {
      const transaction = payload.new || payload.old
      if (!transaction?.category_id) return

      // Check rate limiting
      const categoryId = transaction.category_id
      const now = Date.now()
      const lastUpdate = this.lastUpdateTimes.get(categoryId) || 0
      const timeSinceLastUpdate = now - lastUpdate

      if (timeSinceLastUpdate < (1000 / this.updateFrequencyLimit)) {
        // Rate limited - queue the update instead
        this.queueBalanceUpdate(payload, onBalanceChange, onError)
        return
      }

      await this.processBalanceUpdate(payload, onBalanceChange, onError)
      this.lastUpdateTimes.set(categoryId, now)
    } catch (error) {
      const errorCode = categorizeError(error)
      const userFriendlyError = createContextualError(errorCode, {
        action: 'transaction_change'
      })
      onError?.(userFriendlyError.message)
    }
  }

  /**
   * Queue balance update for rate-limited processing
   */
  private queueBalanceUpdate(
    payload: RealtimePostgresChangesPayload<any>,
    onBalanceChange: (change: EnvelopeBalanceChange) => void,
    onError?: (error: string) => void
  ) {
    const transaction = payload.new || payload.old
    if (!transaction?.category_id) return

    // Store the latest update for each category (overwrite if exists)
    this.pendingUpdates.set(transaction.category_id, {
      payload,
      onBalanceChange,
      onError
    } as any)
  }

  /**
   * Process queued balance updates periodically
   */
  private startUpdateProcessor() {
    this.updateTimer = setInterval(() => {
      const updates = Array.from(this.pendingUpdates.entries())
      this.pendingUpdates.clear()

      updates.forEach(([categoryId, updateInfo]) => {
        this.processBalanceUpdate(
          (updateInfo as any).payload,
          (updateInfo as any).onBalanceChange,
          (updateInfo as any).onError
        )
        this.lastUpdateTimes.set(categoryId, Date.now())
      })
    }, 1000 / this.updateFrequencyLimit) // Process at max rate
  }

  /**
   * Process individual balance update with optimized payload and retry logic
   */
  private async processBalanceUpdate(
    payload: RealtimePostgresChangesPayload<any>,
    onBalanceChange: (change: EnvelopeBalanceChange) => void,
    onError?: (error: string) => void
  ) {
    const operationId = `balance-${payload.new?.id || payload.old?.id}-${Date.now()}`
    
    try {
      const result = await this.executeWithRetry(operationId, async () => {
        const transaction = payload.new || payload.old
        if (!transaction?.category_id) return null

        // Only fetch essential category data for better performance
        const { data: category, error } = await this.supabase
          .from('categories')
          .select('id, budget_id, name, spent, allocated')
          .eq('id', transaction.category_id)
          .single()

        if (error) throw error

        return {
          transaction,
          category,
          payload
        }
      }, onError)

      if (result) {
        const { transaction, category } = result

        // Create optimized balance change object
        const balanceChange: EnvelopeBalanceChange = {
          category_id: transaction.category_id,
          budget_id: category.budget_id,
          category_name: category.name,
          old_spent: payload.old?.amount || 0,
          new_spent: category.spent,
          allocated: category.allocated,
          remaining: category.allocated - category.spent,
          is_overspent: category.spent > category.allocated,
          timestamp: Date.now(),
          transaction_id: transaction.id,
          operation: payload.eventType as any
        }

        onBalanceChange(balanceChange)
      }
    } catch (error) {
      const errorCode = categorizeError(error)
      const userFriendlyError = createContextualError(errorCode, {
        action: 'balance_update'
      })
      onError?.(userFriendlyError.message)
    }
  }

  /**
   * Handle direct category updates
   */
  private handleCategoryUpdate(
    payload: RealtimePostgresChangesPayload<any>,
    onBalanceChange: (change: EnvelopeBalanceChange) => void,
    onError?: (error: string) => void
  ) {
    try {
      const category = payload.new
      if (!category) return

      const balanceChange: EnvelopeBalanceChange = {
        category_id: category.id,
        budget_id: category.budget_id,
        category_name: category.name,
        old_spent: payload.old?.spent || 0,
        new_spent: category.spent,
        allocated: category.allocated,
        remaining: category.allocated - category.spent,
        is_overspent: category.spent > category.allocated,
        timestamp: Date.now(),
        transaction_id: '', // No specific transaction for direct updates
        operation: 'UPDATE'
      }

      onBalanceChange(balanceChange)
    } catch (error) {
      const errorCode = categorizeError(error)
      const userFriendlyError = createContextualError(errorCode, {
        action: 'category_update'
      })
      onError?.(userFriendlyError.message)
    }
  }

  /**
   * Set up connection monitoring and auto-reconnection
   */
  private setupConnectionMonitoring() {
    // Listen to connection state changes
    this.supabase.realtime.onopen = () => {
      this.updateConnectionState({ 
        status: 'connected', 
        error: undefined,
        lastConnected: new Date(),
        reconnectAttempts: 0
      })
      this.clearReconnectTimer()
    }

    this.supabase.realtime.onclose = () => {
      const userFriendlyError = getUserFriendlyError('CONNECTION_LOST')
      this.updateConnectionState({ 
        status: 'disconnected',
        userFriendlyError
      })
      this.attemptReconnection()
    }

    this.supabase.realtime.onerror = (error: any) => {
      const errorCode = categorizeError(error)
      const userFriendlyError = getUserFriendlyError(errorCode)
      this.updateConnectionState({ 
        status: 'error', 
        error: error?.message || 'WebSocket connection error',
        userFriendlyError
      })
      this.attemptReconnection()
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnection() {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      const userFriendlyError = createContextualError('RECONNECTION_FAILED', {
        retryCount: this.maxReconnectAttempts
      })
      this.updateConnectionState({ 
        status: 'error', 
        error: 'Max reconnection attempts exceeded',
        userFriendlyError
      })
      this.enableFallbackMode()
      return
    }

    this.clearReconnectTimer()
    
    const delay = this.reconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts)
    
    this.reconnectTimer = setTimeout(() => {
      this.updateConnectionState({ 
        status: 'connecting',
        reconnectAttempts: this.connectionState.reconnectAttempts + 1
      })
      
      // Attempt to reconnect by resubscribing to all channels
      this.reconnectAllChannels()
    }, delay)
  }

  /**
   * Reconnect all active channels
   */
  private reconnectAllChannels() {
    this.channels.forEach((channel, channelName) => {
      try {
        channel.subscribe()
      } catch (error) {
        console.error(`Failed to reconnect channel ${channelName}:`, error)
      }
    })
  }

  /**
   * Update connection state and notify listeners
   */
  private updateConnectionState(updates: Partial<ConnectionState>) {
    this.connectionState = { ...this.connectionState, ...updates }
    
    // Notify all listeners
    this.listeners.forEach((listenerSet) => {
      listenerSet.forEach((listener) => {
        try {
          listener(this.connectionState)
        } catch (error) {
          console.error('Error notifying connection state listener:', error)
        }
      })
    })
  }

  /**
   * Add connection state listener
   */
  addConnectionListener(id: string, listener: (state: ConnectionState) => void) {
    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set())
    }
    this.listeners.get(id)!.add(listener)
  }

  /**
   * Remove connection state listener
   */
  removeConnectionListener(id: string, listener?: (state: ConnectionState) => void) {
    if (listener) {
      this.listeners.get(id)?.delete(listener)
    } else {
      this.listeners.delete(id)
    }
  }

  /**
   * Unsubscribe from a specific channel
   */
  private unsubscribeChannel(channelName: string) {
    const channel = this.channels.get(channelName)
    if (channel) {
      this.supabase.removeChannel(channel)
      this.channels.delete(channelName)
    }
  }

  /**
   * Clean up all connections
   */
  cleanup() {
    this.clearReconnectTimer()
    this.stopFallbackPolling()
    if (this.updateTimer) {
      clearInterval(this.updateTimer)
      this.updateTimer = undefined
    }
    if (this.retryTimer) {
      clearInterval(this.retryTimer)
      this.retryTimer = undefined
    }
    this.channels.forEach((channel) => {
      this.supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.listeners.clear()
    this.lastUpdateTimes.clear()
    this.pendingUpdates.clear()
    this.activeBudgets.clear()
    this.fallbackCallbacks.clear()
    this.retryQueue.clear()
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return { ...this.connectionState }
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
  }

  /**
   * Enable fallback polling mode when WebSocket fails
   */
  private enableFallbackMode() {
    if (this.fallbackMode) return

    console.warn('Real-time connection failed, switching to polling mode')
    this.fallbackMode = true
    this.startFallbackPolling()
  }

  /**
   * Disable fallback mode and return to real-time
   */
  private disableFallbackMode() {
    if (!this.fallbackMode) return

    console.log('Real-time connection restored, disabling polling mode')
    this.fallbackMode = false
    this.stopFallbackPolling()
  }

  /**
   * Start polling for balance changes as fallback
   */
  private startFallbackPolling() {
    this.stopFallbackPolling() // Clear any existing timer

    this.fallbackTimer = setInterval(async () => {
      try {
        await this.pollForBalanceChanges()
      } catch (error) {
        console.error('Error during fallback polling:', error)
      }
    }, this.fallbackPollingInterval)
  }

  /**
   * Stop fallback polling
   */
  private stopFallbackPolling() {
    if (this.fallbackTimer) {
      clearInterval(this.fallbackTimer)
      this.fallbackTimer = undefined
    }
  }

  /**
   * Poll database for balance changes when real-time is unavailable
   */
  private async pollForBalanceChanges() {
    const budgetIds = Array.from(this.activeBudgets)
    
    for (const budgetId of budgetIds) {
      try {
        const { data: categories, error } = await this.supabase
          .from('categories')
          .select('id, budget_id, name, spent, allocated, updated_at')
          .eq('budget_id', budgetId)

        if (error) throw error

        const callback = this.fallbackCallbacks.get(budgetId)
        if (!callback) continue

        // Check each category for changes since last poll
        for (const category of categories) {
          const lastKnownUpdate = this.lastUpdateTimes.get(category.id) || 0
          const categoryUpdated = new Date(category.updated_at).getTime()

          if (categoryUpdated > lastKnownUpdate) {
            // Create a balance change event
            const balanceChange: EnvelopeBalanceChange = {
              category_id: category.id,
              budget_id: category.budget_id,
              category_name: category.name,
              old_spent: 0, // We don't have the old value in polling mode
              new_spent: category.spent,
              allocated: category.allocated,
              remaining: category.allocated - category.spent,
              is_overspent: category.spent > category.allocated,
              timestamp: categoryUpdated,
              transaction_id: `poll-${Date.now()}`,
              operation: 'UPDATE'
            }

            callback(balanceChange)
            this.lastUpdateTimes.set(category.id, categoryUpdated)
          }
        }
      } catch (error) {
        console.error(`Error polling budget ${budgetId}:`, error)
      }
    }
  }

  /**
   * Check if currently in fallback mode
   */
  isFallbackMode(): boolean {
    return this.fallbackMode
  }

  /**
   * Force enable fallback mode (for testing or manual control)
   */
  forceFallbackMode() {
    this.enableFallbackMode()
  }

  /**
   * Execute operation with retry logic
   */
  private async executeWithRetry<T>(
    operationId: string,
    operation: () => Promise<T>,
    onError?: (error: string) => void
  ): Promise<T | null> {
    try {
      const result = await operation()
      // Remove from retry queue if successful
      this.retryQueue.delete(operationId)
      return result
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`Operation ${operationId} failed:`, errorMsg)

      // Add to retry queue
      const retryOperation: RetryableOperation = {
        id: operationId,
        type: 'balance_update',
        payload: operation,
        callback: () => {}, // Will be handled by the retry processor
        errorCallback: onError,
        attempts: 0,
        lastAttempt: Date.now(),
        originalTimestamp: Date.now()
      }

      this.retryQueue.set(operationId, retryOperation)
      return null
    }
  }

  /**
   * Start retry processor for failed operations
   */
  private startRetryProcessor() {
    this.retryTimer = setInterval(() => {
      this.processRetryQueue()
    }, 1000) // Check every second
  }

  /**
   * Process retry queue for failed operations
   */
  private async processRetryQueue() {
    const now = Date.now()
    const operationsToRetry = Array.from(this.retryQueue.entries()).filter(([_, op]) => {
      const timeSinceLastAttempt = now - op.lastAttempt
      const shouldRetry = op.attempts < this.maxRetries && 
                         timeSinceLastAttempt >= this.retryDelays[op.attempts]
      return shouldRetry
    })

    for (const [operationId, operation] of operationsToRetry) {
      try {
        operation.attempts++
        operation.lastAttempt = now

        // Execute the retry
        const result = await operation.payload()
        
        if (result) {
          // Success - remove from retry queue
          this.retryQueue.delete(operationId)
          console.log(`Operation ${operationId} succeeded on attempt ${operation.attempts}`)
        }
      } catch (error) {
        console.error(`Retry ${operation.attempts} failed for operation ${operationId}:`, error)
        
        // Check if we've exhausted all retries
        if (operation.attempts >= this.maxRetries) {
          const errorMsg = `Operation ${operationId} failed after ${this.maxRetries} attempts`
          console.error(errorMsg)
          operation.errorCallback?.(errorMsg)
          this.retryQueue.delete(operationId)
        }
      }
    }

    // Clean up operations that are too old (more than 5 minutes)
    const maxAge = 5 * 60 * 1000
    for (const [operationId, operation] of this.retryQueue.entries()) {
      if (now - operation.originalTimestamp > maxAge) {
        console.warn(`Removing stale operation ${operationId} from retry queue`)
        this.retryQueue.delete(operationId)
      }
    }
  }

  /**
   * Get retry queue status (for monitoring)
   */
  getRetryQueueStatus() {
    return {
      queueSize: this.retryQueue.size,
      operations: Array.from(this.retryQueue.entries()).map(([id, op]) => ({
        id,
        type: op.type,
        attempts: op.attempts,
        timeSinceOriginal: Date.now() - op.originalTimestamp
      }))
    }
  }

  /**
   * Clear retry queue (for testing or manual control)
   */
  clearRetryQueue() {
    this.retryQueue.clear()
  }

  /**
   * Get current user-friendly error for display in UI
   */
  getCurrentUserError(): UserFriendlyError | null {
    return this.connectionState.userFriendlyError || null
  }

  /**
   * Dismiss current error (mark as acknowledged by user)
   */
  dismissCurrentError() {
    this.updateConnectionState({
      userFriendlyError: undefined
    })
  }

  /**
   * Get connection health summary for monitoring
   */
  getConnectionHealth() {
    return {
      status: this.connectionState.status,
      isHealthy: this.connectionState.status === 'connected',
      reconnectAttempts: this.connectionState.reconnectAttempts,
      inFallbackMode: this.fallbackMode,
      retryQueueSize: this.retryQueue.size,
      activeSubscriptions: this.channels.size,
      currentError: this.getCurrentUserError(),
      lastConnected: this.connectionState.lastConnected
    }
  }
}

// Lazy-loaded singleton instance
let _realtimeManager: RealtimeManager | null = null

export const getRealtimeManager = (): RealtimeManager => {
  if (!_realtimeManager) {
    _realtimeManager = new RealtimeManager()
  }
  return _realtimeManager
}

// Export convenience hooks for React components
export const useRealtimeConnection = () => {
  return getRealtimeManager().getConnectionState()
}