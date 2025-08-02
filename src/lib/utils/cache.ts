/**
 * Client-side caching utilities for balance calculations and real-time updates
 * Reduces redundant calculations and WebSocket message processing
 */

export interface CacheEntry<T> {
  value: T
  timestamp: number
  ttl: number
}

export interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
}

/**
 * Generic LRU cache with TTL support
 */
export class LRUCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>()
  private readonly maxSize: number
  private readonly defaultTTL: number

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 1000
    this.defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutes default
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return undefined
    }

    // Check if entry has expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key)
      return undefined
    }

    // Move to end (mark as recently used)
    this.cache.delete(key)
    this.cache.set(key, entry)
    
    return entry.value
  }

  set(key: K, value: V, ttl?: number): void {
    const now = Date.now()
    const entryTTL = ttl || this.defaultTTL

    // If at max capacity, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      value,
      timestamp: now,
      ttl: entryTTL
    })
  }

  has(key: K): boolean {
    return this.get(key) !== undefined
  }

  delete(key: K): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    // Clean expired entries first
    this.cleanExpired()
    return this.cache.size
  }

  private cleanExpired(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

/**
 * Balance calculation cache for envelope budgeting
 */
export interface BalanceCalculation {
  spent: number
  remaining: number
  percentage: number
  isOverspent: boolean
  lastTransactionId: string
  transactionCount: number
}

export class BalanceCache {
  private cache = new LRUCache<string, BalanceCalculation>({
    ttl: 2 * 60 * 1000, // 2 minutes TTL for balance calculations
    maxSize: 500
  })

  private transactionHashes = new LRUCache<string, string>({
    ttl: 5 * 60 * 1000, // 5 minutes for transaction hashes
    maxSize: 1000
  })

  /**
   * Get cached balance calculation for a category
   */
  getBalance(categoryId: string): BalanceCalculation | undefined {
    return this.cache.get(categoryId)
  }

  /**
   * Set balance calculation for a category
   */
  setBalance(categoryId: string, calculation: BalanceCalculation): void {
    this.cache.set(categoryId, calculation)
  }

  /**
   * Check if transactions have changed since last calculation
   */
  hasTransactionsChanged(categoryId: string, currentHash: string): boolean {
    const cachedHash = this.transactionHashes.get(categoryId)
    return cachedHash !== currentHash
  }

  /**
   * Update transaction hash for a category
   */
  updateTransactionHash(categoryId: string, hash: string): void {
    this.transactionHashes.set(categoryId, hash)
  }

  /**
   * Invalidate balance cache for a specific category
   */
  invalidateBalance(categoryId: string): void {
    this.cache.delete(categoryId)
    this.transactionHashes.delete(categoryId)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
    this.transactionHashes.clear()
  }
}

/**
 * Message deduplication cache for WebSocket messages
 */
export class MessageDeduplicationCache {
  private messageHashes = new LRUCache<string, boolean>({
    ttl: 30 * 1000, // 30 seconds TTL for message deduplication
    maxSize: 10000
  })

  /**
   * Check if a message has been processed recently
   */
  isDuplicate(messageHash: string): boolean {
    return this.messageHashes.has(messageHash)
  }

  /**
   * Mark a message as processed
   */
  markProcessed(messageHash: string): void {
    this.messageHashes.set(messageHash, true)
  }

  /**
   * Create a hash for a WebSocket message
   */
  createMessageHash(payload: any): string {
    const key = JSON.stringify({
      categoryId: payload.category_id,
      transactionId: payload.transaction_id,
      operation: payload.operation,
      timestamp: payload.timestamp,
      amount: payload.new_spent
    })
    
    // Simple hash function
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      const char = key.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }
}

/**
 * Lazy-loaded singleton instances for global use
 */
let _balanceCache: BalanceCache | null = null
let _messageDeduplicationCache: MessageDeduplicationCache | null = null

export const getBalanceCache = (): BalanceCache => {
  if (!_balanceCache) {
    _balanceCache = new BalanceCache()
  }
  return _balanceCache
}

export const getMessageDeduplicationCache = (): MessageDeduplicationCache => {
  if (!_messageDeduplicationCache) {
    _messageDeduplicationCache = new MessageDeduplicationCache()
  }
  return _messageDeduplicationCache
}

// Backward compatibility exports
export const balanceCache = getBalanceCache()
export const messageDeduplicationCache = getMessageDeduplicationCache()

/**
 * Utility function to create a hash from transactions for change detection
 */
export function createTransactionHash(transactions: Array<{ id: string; amount: number; updated_at: string }>): string {
  const hashInput = transactions
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(tx => `${tx.id}:${tx.amount}:${tx.updated_at}`)
    .join('|')
  
  // Simple hash function
  let hash = 0
  for (let i = 0; i < hashInput.length; i++) {
    const char = hashInput.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString()
}

/**
 * Memoization decorator for expensive balance calculations
 */
export function memoizeBalanceCalculation<T extends any[], R>(
  fn: (...args: T) => R,
  keyFn: (...args: T) => string,
  ttl: number = 60000 // 1 minute default
) {
  const cache = new LRUCache<string, R>({ ttl })

  return (...args: T): R => {
    const key = keyFn(...args)
    const cached = cache.get(key)
    
    if (cached !== undefined) {
      return cached
    }

    const result = fn(...args)
    cache.set(key, result)
    return result
  }
}