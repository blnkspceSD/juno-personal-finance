// Juno Personal Finance - Database Queries
// Reusable queries for budget and transaction data

import { createClient } from '@/lib/supabase/server'
import type { Budget, Category, Transaction, BudgetWithCategories } from '@/lib/types/database'

// Budget Queries
export async function getCurrentUserBudgets(): Promise<BudgetWithCategories[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        *,
        transactions (*)
      )
    `)
    .order('year', { ascending: false })
    .order('month', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch budgets: ${error.message}`)
  }

  return data || []
}

export async function getCurrentMonthBudget(): Promise<BudgetWithCategories | null> {
  const supabase = await createClient()
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM
  const currentYear = currentDate.getFullYear()

  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        *,
        transactions (*)
      )
    `)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch current budget: ${error.message}`)
  }

  return data || null
}

export async function getBudgetById(budgetId: string): Promise<BudgetWithCategories | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (
        *,
        transactions (*)
      )
    `)
    .eq('id', budgetId)
    .single()

  if (error) {
    throw new Error(`Failed to fetch budget: ${error.message}`)
  }

  return data
}

// Category Queries
export async function getCategoriesByBudget(budgetId: string): Promise<Category[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('budget_id', budgetId)
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch categories: ${error.message}`)
  }

  return data || []
}

export async function updateCategoryAllocated(categoryId: string, amount: number): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('categories')
    .update({ allocated: amount })
    .eq('id', categoryId)

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`)
  }
}

// Transaction Queries
export async function getRecentTransactions(limit: number = 10): Promise<Transaction[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  return data || []
}

export async function getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('category_id', categoryId)
    .order('date', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch category transactions: ${error.message}`)
  }

  return data || []
}

export async function addTransaction(transaction: {
  category_id: string
  amount: number
  description: string
  date: string
}): Promise<Transaction> {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add transaction: ${error.message}`)
  }

  return data
}

// Re-export utility functions for backwards compatibility
export { calculateBudgetSummary, calculateCategoryStatus } from '@/lib/utils/budget-calculations'