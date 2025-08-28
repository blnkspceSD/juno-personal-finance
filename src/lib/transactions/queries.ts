"use client"

import { createClient } from '@/lib/supabase/client'

export interface Transaction {
  id: string
  description: string
  amount: number
  date: string
  category_id: string
  receipt_url?: string
  created_at: string
  updated_at: string
  user_id: string
}

export interface TransactionWithCategory extends Transaction {
  category_name: string
  category_color?: string
}

// Simple retry utility (reused from client-actions)
async function withRetry<T>(
  operation: () => Promise<T>,
  maxAttempts: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

export async function fetchRecentTransactions(limit: number = 7) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Fetch recent transactions with category information
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          description,
          amount,
          date,
          category_id,
          receipt_url,
          created_at,
          updated_at,
          user_id,
          categories (
            name,
            color
          )
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw new Error(`Failed to fetch transactions: ${error.message}`)
      }

      // Transform data to match our interface
      const transactions: TransactionWithCategory[] = (data || []).map(tx => ({
        ...tx,
        category_name: tx.categories?.name || 'Uncategorized',
        category_color: tx.categories?.color || '#6B7280',
      }))

      return { success: true, data: transactions }
    });
  } catch (error) {
    console.error('Error fetching recent transactions:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch transactions',
      data: []
    }
  }
}

export async function fetchTransactionById(transactionId: string) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Fetch specific transaction with category information
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          id,
          description,
          amount,
          date,
          category_id,
          receipt_url,
          created_at,
          updated_at,
          user_id,
          categories (
            name,
            color
          )
        `)
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        throw new Error(`Failed to fetch transaction: ${error.message}`)
      }

      if (!data) {
        throw new Error('Transaction not found')
      }

      // Transform data to match our interface
      const transaction: TransactionWithCategory = {
        ...data,
        category_name: data.categories?.name || 'Uncategorized',
        category_color: data.categories?.color || '#6B7280',
      }

      return { success: true, data: transaction }
    });
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch transaction'
    }
  }
}