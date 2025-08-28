"use client"

import { useState, useEffect, useCallback } from 'react'
import { fetchRecentTransactions, TransactionWithCategory } from '@/lib/transactions/queries'

interface UseRecentTransactionsReturn {
  transactions: TransactionWithCategory[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useRecentTransactions(limit: number = 7): UseRecentTransactionsReturn {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await fetchRecentTransactions(limit)
      
      if (result.success) {
        setTransactions(result.data)
      } else {
        setError(result.error || 'Failed to load transactions')
        setTransactions([]) // Clear stale data on error
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [limit])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    transactions,
    isLoading,
    error,
    refetch,
  }
}