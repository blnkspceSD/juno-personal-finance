/**
 * React hooks for real-time envelope balance updates
 * Provides optimistic updates and WebSocket synchronization
 */

import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { getRealtimeManager, type EnvelopeBalanceChange, type ConnectionState } from '@/lib/supabase/realtime'
import type { Category, BudgetWithCategories } from '@/lib/types/database'
import { debounce, batchUpdates } from '@/lib/utils/debounce'
import { balanceCache, messageDeduplicationCache, memoizeBalanceCalculation } from '@/lib/utils/cache'

export interface OptimisticTransaction {
  id: string
  category_id: string
  amount: number
  description: string
  date: string
  pending: boolean
}

export interface EnvelopeState extends Category {
  pending_amount?: number
  is_optimistic?: boolean
}

/**
 * Hook for real-time balance updates for a specific budget
 */
export function useRealtimeBalance(budgetId: string) {
  const [envelopes, setEnvelopes] = useState<EnvelopeState[]>([])
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0
  })
  const [optimisticTransactions, setOptimisticTransactions] = useState<OptimisticTransaction[]>([])
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)
  const balanceUpdateQueueRef = useRef<EnvelopeBalanceChange[]>([])

  // Debounced balance update handler to prevent excessive re-renders
  const debouncedBalanceUpdate = useMemo(() => 
    debounce((changes: EnvelopeBalanceChange[]) => {
      setEnvelopes(current => {
        const updatedEnvelopes = [...current]
        
        changes.forEach(change => {
          const index = updatedEnvelopes.findIndex(env => env.id === change.category_id)
          if (index !== -1) {
            updatedEnvelopes[index] = {
              ...updatedEnvelopes[index],
              spent: change.new_spent,
              is_optimistic: false,
              pending_amount: undefined
            }
          }
        })
        
        return updatedEnvelopes
      })
      
      // Remove corresponding optimistic transactions
      const transactionIds = changes.map(c => c.transaction_id).filter(Boolean)
      if (transactionIds.length > 0) {
        setOptimisticTransactions(current =>
          current.filter(tx => !transactionIds.includes(tx.id))
        )
      }
    }, 50), // 50ms debounce
    []
  )

  // Batch multiple balance changes for better performance
  const batchedBalanceUpdater = useMemo(() => 
    batchUpdates((changes: EnvelopeBalanceChange[]) => {
      debouncedBalanceUpdate(changes)
    }, 16), // One frame delay for batching
    [debouncedBalanceUpdate]
  )

  // Subscribe to real-time balance changes
  useEffect(() => {
    if (!budgetId) return

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    // Set up new subscription
    const manager = getRealtimeManager()
    const subscription = manager.subscribeToEnvelopeChanges(
      budgetId,
      handleBalanceChange,
      handleError
    )

    subscriptionRef.current = subscription

    // Set up connection state monitoring
    const connectionId = `balance-${budgetId}`
    manager.addConnectionListener(connectionId, setConnectionState)

    return () => {
      subscription.unsubscribe()
      manager.removeConnectionListener(connectionId)
      subscriptionRef.current = null
      
      // Clean up debounced functions
      debouncedBalanceUpdate.cancel()
      debouncedOptimisticUpdate.cancel()
    }
  }, [budgetId])

  /**
   * Handle real-time balance changes with batching, debouncing, and deduplication
   */
  const handleBalanceChange = useCallback((change: EnvelopeBalanceChange) => {
    // Check for duplicate messages
    const messageHash = messageDeduplicationCache.createMessageHash(change)
    if (messageDeduplicationCache.isDuplicate(messageHash)) {
      return // Skip duplicate message
    }
    messageDeduplicationCache.markProcessed(messageHash)

    // Invalidate cache for the affected category
    balanceCache.invalidateBalance(change.category_id)

    batchedBalanceUpdater(change)
  }, [batchedBalanceUpdater])

  /**
   * Handle connection errors
   */
  const handleError = useCallback((error: string) => {
    console.error('Real-time balance update error:', error)
    setConnectionState(current => ({
      ...current,
      status: 'error',
      error
    }))
  }, [])

  // Debounced optimistic updates to handle rapid successive operations
  const debouncedOptimisticUpdate = useMemo(() => 
    debounce((updates: Array<{ categoryId: string; amountChange: number }>) => {
      setEnvelopes(current =>
        current.map(envelope => {
          const update = updates.find(u => u.categoryId === envelope.id)
          if (update) {
            const currentPending = envelope.pending_amount || 0
            return {
              ...envelope,
              pending_amount: currentPending + update.amountChange,
              is_optimistic: true
            }
          }
          return envelope
        })
      )
    }, 25), // 25ms debounce for optimistic updates
    []
  )

  /**
   * Add optimistic transaction (before server confirmation)
   */
  const addOptimisticTransaction = useCallback((transaction: Omit<OptimisticTransaction, 'id' | 'pending'>) => {
    const optimisticTx: OptimisticTransaction = {
      ...transaction,
      id: `optimistic-${Date.now()}-${Math.random()}`,
      pending: true
    }

    setOptimisticTransactions(current => [...current, optimisticTx])

    // Update envelope with optimistic amount (debounced)
    debouncedOptimisticUpdate([{
      categoryId: transaction.category_id,
      amountChange: transaction.amount
    }])

    // Auto-remove optimistic transaction after timeout (fallback)
    setTimeout(() => {
      setOptimisticTransactions(current =>
        current.filter(tx => tx.id !== optimisticTx.id)
      )
      setEnvelopes(current =>
        current.map(envelope => {
          if (envelope.id === transaction.category_id) {
            const currentPending = envelope.pending_amount || 0
            return {
              ...envelope,
              pending_amount: Math.max(0, currentPending - transaction.amount),
              is_optimistic: currentPending <= transaction.amount ? false : true
            }
          }
          return envelope
        })
      )
    }, 10000) // 10 second timeout
  }, [debouncedOptimisticUpdate])

  /**
   * Update envelopes data (from initial load or refresh)
   */
  const updateEnvelopes = useCallback((newEnvelopes: Category[]) => {
    setEnvelopes(newEnvelopes.map(envelope => ({
      ...envelope,
      is_optimistic: false
    })))
  }, [])

  /**
   * Memoized calculation of envelope status including optimistic updates
   */
  const calculateEnvelopeStatus = useMemo(() => 
    memoizeBalanceCalculation(
      (envelope: EnvelopeState) => {
        const totalSpent = envelope.spent + (envelope.pending_amount || 0)
        const remaining = envelope.allocated - totalSpent
        const percentageUsed = envelope.allocated > 0 ? (totalSpent / envelope.allocated) * 100 : 0
        const isOverspent = totalSpent > envelope.allocated

        const calculation = {
          ...envelope,
          total_spent: totalSpent,
          remaining,
          percentage_used: percentageUsed,
          is_overspent: isOverspent,
          has_pending: (envelope.pending_amount || 0) > 0
        }

        // Cache the balance calculation
        balanceCache.setBalance(envelope.id, {
          spent: totalSpent,
          remaining,
          percentage: percentageUsed,
          isOverspent,
          lastTransactionId: envelope.id,
          transactionCount: 1
        })

        return calculation
      },
      (envelope) => `${envelope.id}-${envelope.spent}-${envelope.pending_amount}-${envelope.allocated}`,
      30000 // 30 second cache
    ), 
    []
  )

  /**
   * Calculate envelope status including optimistic updates
   */
  const getEnvelopeStatus = useCallback((envelope: EnvelopeState) => {
    // Try to get from cache first
    const cached = balanceCache.getBalance(envelope.id)
    if (cached && !envelope.is_optimistic && !envelope.pending_amount) {
      return {
        ...envelope,
        total_spent: cached.spent,
        remaining: cached.remaining,
        percentage_used: cached.percentage,
        is_overspent: cached.isOverspent,
        has_pending: false
      }
    }

    // Calculate fresh if not cached or has optimistic data
    return calculateEnvelopeStatus(envelope)
  }, [calculateEnvelopeStatus])

  /**
   * Get all envelope statuses with calculations
   */
  const envelopeStatuses = envelopes.map(getEnvelopeStatus)

  return {
    envelopes: envelopeStatuses,
    connectionState,
    addOptimisticTransaction,
    updateEnvelopes,
    isConnected: connectionState.status === 'connected',
    isReconnecting: connectionState.status === 'connecting',
    hasError: connectionState.status === 'error',
    optimisticTransactions
  }
}

/**
 * Hook for real-time updates for a specific envelope/category
 */
export function useRealtimeEnvelope(categoryId: string) {
  const [envelope, setEnvelope] = useState<EnvelopeState | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null)

  useEffect(() => {
    if (!categoryId) return

    // Clean up existing subscription
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe()
    }

    // Set up category-specific subscription
    const manager = getRealtimeManager()
    const subscription = manager.subscribeToCategoryUpdates(
      categoryId,
      (updatedCategory) => {
        setEnvelope(current => ({
          ...current,
          ...updatedCategory,
          is_optimistic: false
        }))
        setIsUpdating(false)
      },
      (error) => {
        console.error('Category update error:', error)
        setIsUpdating(false)
      }
    )

    subscriptionRef.current = subscription

    return () => {
      subscription.unsubscribe()
      subscriptionRef.current = null
    }
  }, [categoryId])

  /**
   * Update envelope data
   */
  const updateEnvelope = useCallback((newEnvelope: Category) => {
    setEnvelope({
      ...newEnvelope,
      is_optimistic: false
    })
  }, [])

  /**
   * Mark as updating (for optimistic UI feedback)
   */
  const markUpdating = useCallback(() => {
    setIsUpdating(true)
  }, [])

  return {
    envelope,
    isUpdating,
    updateEnvelope,
    markUpdating
  }
}

/**
 * Hook for connection state monitoring
 */
export function useRealtimeConnection(id: string = 'default') {
  const [connectionState, setConnectionState] = useState<ConnectionState>(() => 
    getRealtimeManager().getConnectionState()
  )

  useEffect(() => {
    const manager = getRealtimeManager()
    manager.addConnectionListener(id, setConnectionState)
    
    return () => {
      manager.removeConnectionListener(id)
    }
  }, [id])

  return {
    connectionState,
    isConnected: connectionState.status === 'connected',
    isConnecting: connectionState.status === 'connecting',
    isDisconnected: connectionState.status === 'disconnected',
    hasError: connectionState.status === 'error',
    error: connectionState.error,
    reconnectAttempts: connectionState.reconnectAttempts
  }
}