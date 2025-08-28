"use server"

import { createClient as createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TransactionData {
  description: string
  amount: number
  date: string
  category_id: string
}

export async function deleteTransaction(transactionId: string) {
  try {
    const supabase = await createServerClient()
    
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

    // Revalidate relevant pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')

    return { success: true }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to delete transaction'
    }
  }
}

export async function duplicateTransaction(transactionId: string) {
  try {
    const supabase = await createServerClient()
    
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

    // Revalidate relevant pages
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/transactions')

    return { success: true, data: newTransaction }
  } catch (error) {
    console.error('Error duplicating transaction:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to duplicate transaction'
    }
  }
}