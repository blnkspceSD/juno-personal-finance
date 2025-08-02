/**
 * Simple performance tests for real-time balance updates
 * Tests the core performance optimizations we implemented
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { debounce, throttle, batchUpdates } from '@/lib/utils/debounce'
import { LRUCache, balanceCache, messageDeduplicationCache } from '@/lib/utils/cache'
import { getUserFriendlyError, categorizeError, createContextualError } from '@/lib/utils/errorMessages'

describe('Performance Utilities', () => {
  describe('Debounce functionality', () => {
    it('should debounce function calls', async () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      // Call multiple times rapidly
      debouncedFn('arg1')
      debouncedFn('arg2')
      debouncedFn('arg3')

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled()

      // Wait for debounce delay
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should have been called once with the last arguments
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg3')
    })

    it('should allow canceling debounced calls', () => {
      const mockFn = vi.fn()
      const debouncedFn = debounce(mockFn, 100)

      debouncedFn('test')
      debouncedFn.cancel()

      setTimeout(() => {
        expect(mockFn).not.toHaveBeenCalled()
      }, 150)
    })
  })

  describe('Throttle functionality', () => {
    it('should throttle function calls', async () => {
      const mockFn = vi.fn()
      const throttledFn = throttle(mockFn, 100)

      // Call multiple times rapidly
      throttledFn('arg1')
      throttledFn('arg2')
      throttledFn('arg3')

      // Should have been called once immediately (leading edge)
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith('arg1')

      // Wait for throttle period
      await new Promise(resolve => setTimeout(resolve, 150))

      // Should have been called again with trailing edge
      expect(mockFn).toHaveBeenCalledTimes(2)
      expect(mockFn).toHaveBeenLastCalledWith('arg3')
    })
  })

  describe('Batch updates', () => {
    it('should batch multiple calls together', async () => {
      const mockFn = vi.fn()
      const batchedFn = batchUpdates(mockFn, 50)

      // Add items to batch
      batchedFn('item1')
      batchedFn('item2')
      batchedFn('item3')

      // Should not have been called yet
      expect(mockFn).not.toHaveBeenCalled()

      // Wait for batch delay
      await new Promise(resolve => setTimeout(resolve, 100))

      // Should have been called once with all items
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(mockFn).toHaveBeenCalledWith(['item1', 'item2', 'item3'])
    })
  })
})

describe('Caching System', () => {
  describe('LRU Cache', () => {
    it('should store and retrieve values', () => {
      const cache = new LRUCache<string, number>({ maxSize: 3, ttl: 1000 })

      cache.set('key1', 100)
      cache.set('key2', 200)

      expect(cache.get('key1')).toBe(100)
      expect(cache.get('key2')).toBe(200)
      expect(cache.get('nonexistent')).toBeUndefined()
    })

    it('should respect TTL expiration', async () => {
      const cache = new LRUCache<string, number>({ maxSize: 3, ttl: 50 })

      cache.set('key1', 100)
      expect(cache.get('key1')).toBe(100)

      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(cache.get('key1')).toBeUndefined()
    })

    it('should evict oldest items when max size reached', () => {
      const cache = new LRUCache<string, number>({ maxSize: 2, ttl: 1000 })

      cache.set('key1', 100)
      cache.set('key2', 200)
      cache.set('key3', 300) // Should evict key1

      expect(cache.get('key1')).toBeUndefined()
      expect(cache.get('key2')).toBe(200)
      expect(cache.get('key3')).toBe(300)
    })
  })

  describe('Balance Cache', () => {
    beforeEach(() => {
      balanceCache.clear()
    })

    it('should cache balance calculations', () => {
      const calculation = {
        spent: 100,
        remaining: 400,
        percentage: 20,
        isOverspent: false,
        lastTransactionId: 'tx-123',
        transactionCount: 5
      }

      balanceCache.setBalance('category-1', calculation)
      const cached = balanceCache.getBalance('category-1')

      expect(cached).toEqual(calculation)
    })

    it('should invalidate specific category balances', () => {
      balanceCache.setBalance('category-1', {
        spent: 100,
        remaining: 400,
        percentage: 20,
        isOverspent: false,
        lastTransactionId: 'tx-123',
        transactionCount: 5
      })

      balanceCache.invalidateBalance('category-1')
      expect(balanceCache.getBalance('category-1')).toBeUndefined()
    })
  })

  describe('Message Deduplication', () => {
    it('should detect duplicate messages', () => {
      const message = {
        category_id: 'cat-1',
        transaction_id: 'tx-1',
        operation: 'INSERT',
        timestamp: Date.now(),
        new_spent: 100
      }

      const hash = messageDeduplicationCache.createMessageHash(message)
      
      expect(messageDeduplicationCache.isDuplicate(hash)).toBe(false)
      
      messageDeduplicationCache.markProcessed(hash)
      
      expect(messageDeduplicationCache.isDuplicate(hash)).toBe(true)
    })

    it('should create consistent hashes for same message', () => {
      const message = {
        category_id: 'cat-1',
        transaction_id: 'tx-1',
        operation: 'INSERT',
        timestamp: 123456789,
        new_spent: 100
      }

      const hash1 = messageDeduplicationCache.createMessageHash(message)
      const hash2 = messageDeduplicationCache.createMessageHash(message)

      expect(hash1).toBe(hash2)
    })
  })
})

describe('Error Handling', () => {
  describe('Error categorization', () => {
    it('should categorize network errors correctly', () => {
      const networkError = new Error('Network request failed')
      expect(categorizeError(networkError)).toBe('CONNECTION_FAILED')

      const timeoutError = new Error('Request timeout')
      expect(categorizeError(timeoutError)).toBe('NETWORK_TIMEOUT')
    })

    it('should categorize database errors correctly', () => {
      const dbError = new Error('Database connection failed')
      expect(categorizeError(dbError)).toBe('DATABASE_ERROR')

      const postgresError = new Error('PostgreSQL error: connection lost')
      expect(categorizeError(postgresError)).toBe('DATABASE_ERROR')
    })

    it('should categorize permission errors correctly', () => {
      const permError = new Error('Permission denied')
      expect(categorizeError(permError)).toBe('PERMISSION_ERROR')

      const unauthorizedError = { code: '401', message: 'Unauthorized' }
      expect(categorizeError(unauthorizedError)).toBe('PERMISSION_ERROR')
    })
  })

  describe('User-friendly error messages', () => {
    it('should provide user-friendly error messages', () => {
      const error = getUserFriendlyError('CONNECTION_LOST')
      
      expect(error.title).toBe('Connection Lost')
      expect(error.message).toContain('connection')
      expect(error.severity).toBe('medium')
      expect(error.dismissible).toBe(true)
    })

    it('should create contextual error messages', () => {
      const error = createContextualError('BALANCE_UPDATE_FAILED', {
        action: 'transaction_create',
        envelopeName: 'Groceries'
      })

      expect(error.message).toContain('Groceries')
      expect(error.severity).toBe('medium')
    })
  })
})

describe('Performance Characteristics', () => {
  it('should handle high-frequency operations efficiently', () => {
    const startTime = performance.now()
    
    // Simulate 1000 rapid cache operations
    const cache = new LRUCache<string, number>({ maxSize: 100, ttl: 60000 })
    
    for (let i = 0; i < 1000; i++) {
      cache.set(`key-${i}`, i)
      cache.get(`key-${i}`)
    }
    
    const endTime = performance.now()
    const duration = endTime - startTime
    
    // Should complete in under 50ms
    expect(duration).toBeLessThan(50)
  })

  it('should efficiently handle batched updates', async () => {
    const results: number[][] = []
    const batchedFn = batchUpdates((items: number[]) => {
      results.push(items)
    }, 10)

    // Add 100 items rapidly
    for (let i = 0; i < 100; i++) {
      batchedFn(i)
    }

    // Wait for batching
    await new Promise(resolve => setTimeout(resolve, 50))

    // Should have batched all items together
    expect(results).toHaveLength(1)
    expect(results[0]).toHaveLength(100)
  })
})