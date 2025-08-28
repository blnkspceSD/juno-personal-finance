"use client"

import { createClient } from '@/lib/supabase/client'

// Simple retry utility (reused from other files)
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

export async function deleteTransaction(transactionId: string) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Delete the transaction (soft delete - set archived_at)
      const { data, error } = await supabase
        .from('transactions')
        .update({
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .eq('user_id', user.id) // Ensure user can only delete their own transactions
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to delete transaction: ${error.message}`)
      }

      return { success: true, data }
    });
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete transaction'
    }
  }
}

export async function hardDeleteTransaction(transactionId: string) {
  try {
    return await withRetry(async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Permanently delete the transaction
      const { data, error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id) // Ensure user can only delete their own transactions
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to permanently delete transaction: ${error.message}`)
      }

      return { success: true, data }
    });
  } catch (error) {
    console.error('Error permanently deleting transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to permanently delete transaction'
    }
  }
}