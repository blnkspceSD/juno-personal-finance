"use client"

import { createClient } from '@/lib/supabase/client'

// Simple retry utility (reused)
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

export interface EditTransactionData {
  description: string
  amount: number
  date: string
  category_id: string
}

export async function updateTransaction(transactionId: string, updates: EditTransactionData) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Update the transaction
      const { data, error } = await supabase
        .from('transactions')
        .update({
          description: updates.description,
          amount: updates.amount,
          date: updates.date,
          category_id: updates.category_id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .eq('user_id', user.id) // Ensure user can only update their own transactions
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update transaction: ${error.message}`)
      }

      return { success: true, data }
    });
  } catch (error) {
    console.error('Error updating transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to update transaction'
    }
  }
}