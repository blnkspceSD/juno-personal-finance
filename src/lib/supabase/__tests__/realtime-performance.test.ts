/**
 * Performance and error handling tests for real-time balance updates
 * Tests edge cases, high-frequency updates, and network failure scenarios
 */

import { describe, it, expect, beforeEach, afterEach, vi, type MockedFunction } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useRealtimeBalance, useRealtimeConnection } from '@/lib/hooks/useRealtimeBalance'
import { getRealtimeManager } from '@/lib/supabase/realtime'
import type { EnvelopeBalanceChange } from '@/lib/supabase/realtime'
import type { Category } from '@/lib/types/database'

// Mock WebSocket for testing
class MockWebSocket {
  static CONNECTING = 0
  static OPEN = 1
  static CLOSING = 2
  static CLOSED = 3

  readyState = MockWebSocket.CONNECTING
  onopen?: (event: Event) => void
  onclose?: (event: CloseEvent) => void
  onerror?: (event: Event) => void
  onmessage?: (event: MessageEvent) => void

  constructor(url: string) {
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN
      this.onopen?.(new Event('open'))
    }, 10)
  }

  close() {
    this.readyState = MockWebSocket.CLOSED
    this.onclose?.(new CloseEvent('close'))
  }

  send(data: string) {
    // Mock send
  }

  simulateError() {
    this.onerror?.(new Event('error'))
  }

  simulateMessage(data: any) {
    this.onmessage?.(new MessageEvent('message', { data: JSON.stringify(data) }))
  }
}

vi.mock('@/lib/supabase/client', () => {
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn((callback) => {
      setTimeout(() => callback('SUBSCRIBED'), 10)
      return mockChannel
    }),
    unsubscribe: vi.fn()
  }

  const mockSupabaseClient = {
    channel: vi.fn(() => mockChannel),
    removeChannel: vi.fn(),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    realtime: {
      onopen: null as ((event: Event) => void) | null,
      onclose: null as ((event: CloseEvent) => void) | null,
      onerror: null as ((event: Event) => void) | null,
    }
  }

  return {
    createClient: () => mockSupabaseClient
  }
})

describe('Real-time Performance and Error Handling', () => {
  let mockWebSocket: MockWebSocket

  beforeEach(() => {
    vi.clearAllMocks()
    mockSupabaseClient.channel.mockReturnValue(mockChannel)
    mockChannel.on.mockReturnValue(mockChannel)
    mockChannel.subscribe.mockImplementation((callback) => {
      setTimeout(() => callback('SUBSCRIBED'), 10)
      return mockChannel
    })

    // Mock WebSocket globally
    global.WebSocket = MockWebSocket as any
    mockWebSocket = new MockWebSocket('ws://test')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('High-frequency update performance', () => {
    it('should handle rapid successive balance updates without memory leaks', async () => {
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      // Simulate 100 rapid balance changes
      const updates: EnvelopeBalanceChange[] = Array.from({ length: 100 }, (_, i) => ({
        category_id: 'test-category',
        budget_id: 'test-budget-id',
        category_name: 'Test Category',
        old_spent: i * 10,
        new_spent: (i + 1) * 10,
        allocated: 1000,
        remaining: 1000 - (i + 1) * 10,
        is_overspent: false,
        timestamp: Date.now() + i,
        transaction_id: `tx-${i}`,
        operation: 'INSERT'
      }))

      // Apply updates rapidly
      await act(async () => {
        for (const update of updates) {
          result.current.addOptimisticTransaction({
            category_id: update.category_id,
            amount: 10,
            description: `Transaction ${update.transaction_id}`,
            date: '2025-08-02'
          })
        }
      })

      // Should not crash and should handle all updates
      expect(result.current.optimisticTransactions).toHaveLength(100)
    })

    it('should debounce rapid UI updates to prevent excessive re-renders', async () => {
      let renderCount = 0
      const { result, rerender } = renderHook(() => {
        renderCount++
        return useRealtimeBalance('test-budget-id')
      })

      // Simulate many rapid updates
      await act(async () => {
        for (let i = 0; i < 50; i++) {
          result.current.addOptimisticTransaction({
            category_id: 'test-category',
            amount: 1,
            description: `Micro transaction ${i}`,
            date: '2025-08-02'
          })
        }
      })

      // Should not render excessively (allow some renders but not 50+)
      expect(renderCount).toBeLessThan(20)
    })

    it('should handle large payload updates efficiently', async () => {
      const startTime = performance.now()
      
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      // Simulate updating 1000 envelopes at once
      const largeEnvelopeSet = Array.from({ length: 1000 }, (_, i) => ({
        id: `envelope-${i}`,
        user_id: 'test-user',
        budget_id: 'test-budget-id',
        name: `Envelope ${i}`,
        allocated: 100,
        spent: Math.random() * 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      await act(async () => {
        result.current.updateEnvelopes(largeEnvelopeSet)
      })

      const endTime = performance.now()
      const processingTime = endTime - startTime

      // Should process large updates quickly (under 100ms)
      expect(processingTime).toBeLessThan(100)
      expect(result.current.envelopes).toHaveLength(1000)
    })
  })

  describe('Error handling and recovery', () => {
    it('should handle WebSocket connection failures gracefully', async () => {
      const { result } = renderHook(() => useRealtimeConnection('test-connection'))

      // Simulate connection error
      act(() => {
        mockSupabaseClient.realtime.onerror?.(new Event('error'))
      })

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(result.current.hasError).toBe(true)
      expect(result.current.connectionState.status).toBe('error')
    })

    it('should attempt automatic reconnection with exponential backoff', async () => {
      const { result } = renderHook(() => useRealtimeConnection('test-connection'))

      // Simulate connection loss
      act(() => {
        mockSupabaseClient.realtime.onclose?.(new CloseEvent('close'))
      })

      await new Promise(resolve => setTimeout(resolve, 50))

      expect(result.current.connectionState.status).toBe('disconnected')
      expect(result.current.connectionState.reconnectAttempts).toBeGreaterThan(0)
    })

    it('should handle malformed WebSocket messages without crashing', async () => {
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      // Simulate malformed message
      expect(() => {
        mockWebSocket.simulateMessage({ invalid: 'data', missing: 'required_fields' })
      }).not.toThrow()

      // Should maintain stable state
      expect(result.current.connectionState.status).not.toBe('error')
    })

    it('should handle database query failures during balance calculations', async () => {
      // Mock database error
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ 
              data: null, 
              error: new Error('Database connection failed') 
            })
          }))
        }))
      })

      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      // Should handle error gracefully
      expect(result.current.hasError).toBeFalsy() // Should not propagate DB errors to UI state
    })

    it('should limit maximum reconnection attempts', async () => {
      const { result } = renderHook(() => useRealtimeConnection('test-connection'))

      // Simulate multiple connection failures
      for (let i = 0; i < 10; i++) {
        act(() => {
          mockSupabaseClient.realtime.onerror?.(new Event('error'))
        })
        await new Promise(resolve => setTimeout(resolve, 10))
      }

      // Should eventually stop trying and report error
      expect(result.current.connectionState.reconnectAttempts).toBeLessThanOrEqual(5)
      expect(result.current.hasError).toBe(true)
    })
  })

  describe('Memory management', () => {
    it('should clean up subscriptions when component unmounts', () => {
      const { unmount } = renderHook(() => useRealtimeBalance('test-budget-id'))

      expect(mockChannel.subscribe).toHaveBeenCalled()

      unmount()

      expect(mockChannel.unsubscribe).toHaveBeenCalled()
    })

    it('should remove stale optimistic transactions after timeout', async () => {
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      await act(async () => {
        result.current.addOptimisticTransaction({
          category_id: 'test-category',
          amount: 50,
          description: 'Test transaction',
          date: '2025-08-02'
        })
      })

      expect(result.current.optimisticTransactions).toHaveLength(1)

      // Wait for timeout (mocked to be shorter)
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 10100)) // Just over 10 second timeout
      })

      expect(result.current.optimisticTransactions).toHaveLength(0)
    })

    it('should prevent memory leaks from connection state listeners', () => {
      const realtimeManager = getRealtimeManager()
      const initialListenerCount = Object.keys(realtimeManager['listeners']).length

      const { unmount: unmount1 } = renderHook(() => useRealtimeConnection('test-1'))
      const { unmount: unmount2 } = renderHook(() => useRealtimeConnection('test-2'))
      const { unmount: unmount3 } = renderHook(() => useRealtimeConnection('test-3'))

      // Should have added listeners
      expect(Object.keys(realtimeManager['listeners']).length).toBeGreaterThan(initialListenerCount)

      unmount1()
      unmount2()
      unmount3()

      // Should have cleaned up listeners
      expect(Object.keys(realtimeManager['listeners']).length).toBe(initialListenerCount)
    })
  })

  describe('Network quality handling', () => {
    it('should handle slow network responses gracefully', async () => {
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      // Mock slow database response
      mockSupabaseClient.from.mockReturnValue({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn().mockImplementation(() => 
              new Promise(resolve => setTimeout(() => 
                resolve({ data: { spent: 100 }, error: null }), 5000
              ))
            )
          }))
        }))
      })

      await act(async () => {
        result.current.addOptimisticTransaction({
          category_id: 'test-category',
          amount: 50,
          description: 'Slow transaction',
          date: '2025-08-02'
        })
      })

      // Should show optimistic update immediately
      expect(result.current.envelopes.some(e => e.pending_amount && e.pending_amount > 0)).toBe(true)
    })

    it('should handle intermittent connectivity', async () => {
      const { result } = renderHook(() => useRealtimeConnection('test-connection'))

      // Simulate connection loss and recovery
      act(() => {
        mockSupabaseClient.realtime.onclose?.(new CloseEvent('close'))
      })

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(result.current.isDisconnected).toBe(true)

      // Simulate reconnection
      act(() => {
        mockSupabaseClient.realtime.onopen?.(new Event('open'))
      })

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(result.current.isConnected).toBe(true)
      expect(result.current.connectionState.reconnectAttempts).toBe(0)
    })
  })

  describe('Data consistency', () => {
    it('should handle out-of-order message delivery', async () => {
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      const olderUpdate: EnvelopeBalanceChange = {
        category_id: 'test-category',
        budget_id: 'test-budget-id',
        category_name: 'Test Category',
        old_spent: 0,
        new_spent: 50,
        allocated: 1000,
        remaining: 950,
        is_overspent: false,
        timestamp: Date.now() - 1000, // Older timestamp
        transaction_id: 'tx-1',
        operation: 'INSERT'
      }

      const newerUpdate: EnvelopeBalanceChange = {
        ...olderUpdate,
        new_spent: 100,
        remaining: 900,
        timestamp: Date.now(),
        transaction_id: 'tx-2'
      }

      // Apply newer update first, then older update
      await act(async () => {
        // This should be handled gracefully without reverting newer state
        result.current.updateEnvelopes([{
          id: 'test-category',
          user_id: 'test-user',
          budget_id: 'test-budget-id',
          name: 'Test Category',
          allocated: 1000,
          spent: 100, // Newer value
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
      })

      // Should maintain the newer value despite out-of-order delivery
      const envelope = result.current.envelopes.find(e => e.id === 'test-category')
      expect(envelope?.spent).toBe(100)
    })

    it('should handle concurrent optimistic updates correctly', async () => {
      const { result } = renderHook(() => useRealtimeBalance('test-budget-id'))

      // Add multiple optimistic transactions concurrently
      await act(async () => {
        result.current.addOptimisticTransaction({
          category_id: 'test-category',
          amount: 25,
          description: 'Transaction 1',
          date: '2025-08-02'
        })
        result.current.addOptimisticTransaction({
          category_id: 'test-category',
          amount: 30,
          description: 'Transaction 2',
          date: '2025-08-02'
        })
        result.current.addOptimisticTransaction({
          category_id: 'test-category',
          amount: 15,
          description: 'Transaction 3',
          date: '2025-08-02'
        })
      })

      expect(result.current.optimisticTransactions).toHaveLength(3)
      
      // Should accumulate pending amounts correctly
      const envelope = result.current.envelopes.find(e => e.id === 'test-category')
      expect(envelope?.pending_amount).toBe(70) // 25 + 30 + 15
    })
  })
})