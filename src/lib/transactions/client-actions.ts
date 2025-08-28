"use client"

import { createClient } from '@/lib/supabase/client'

// Simple retry utility
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
      
      // Don't retry on the last attempt
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      // Simple delay before retry
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError!;
}

export interface TransactionData {
  description: string
  amount: number
  date: string
  category_id: string
}

export async function deleteTransactionClient(transactionId: string) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Delete the transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id) // Ensure user can only delete their own transactions

      if (error) {
        throw new Error(`Failed to delete transaction: ${error.message}`)
      }

      return { success: true }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete transaction'
    }
  }
}

export async function duplicateTransactionClient(transactionId: string) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Fetch the original transaction
      const { data: originalTransaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single()

      if (fetchError || !originalTransaction) {
        throw new Error('Transaction not found or access denied')
      }

      // Create the duplicate transaction with today's date
      const duplicateData: TransactionData = {
        description: originalTransaction.description,
        amount: originalTransaction.amount,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        category_id: originalTransaction.category_id,
      }

      const { data: newTransaction, error: createError } = await supabase
        .from('transactions')
        .insert({
          ...duplicateData,
          user_id: user.id,
        })
        .select()
        .single()

      if (createError) {
        throw new Error(`Failed to create duplicate transaction: ${createError.message}`)
      }

      return { success: true, data: newTransaction }
    });
  } catch (error) {
    console.error('Error duplicating transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to duplicate transaction'
    }
  }
}