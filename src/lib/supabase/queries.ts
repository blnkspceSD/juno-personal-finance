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
export async function getRecentTransactions(limit: number = 10): Promise<(Transaction & { category_name: string })[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name
      )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  // Transform data to include category name
  return (data || []).map(transaction => ({
    ...transaction,
    category_name: transaction.categories?.name || 'Uncategorized'
  }))
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

  // Get the category to determine if this is income or expense
  const { data: category, error: categoryError } = await supabase
    .from('categories')
    .select('name')
    .eq('id', transaction.category_id)
    .single()

  if (categoryError) {
    throw new Error(`Failed to get category: ${categoryError.message}`)
  }

  // Determine if this is an income category
  const categoryName = category.name.toLowerCase()
  const isIncomeCategory = categoryName.includes('salary') || 
                           categoryName.includes('income') ||
                           categoryName.includes('bonus') ||
                           categoryName.includes('freelance') ||
                           categoryName.includes('wage') ||
                           categoryName.includes('revenue')

  // Store expenses as negative amounts, income as positive
  const finalAmount = isIncomeCategory ? Math.abs(transaction.amount) : -Math.abs(transaction.amount)

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      ...transaction,
      amount: finalAmount, // Use the corrected amount
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to add transaction: ${error.message}`)
  }

  return data
}

// Chart Data Queries
export async function getMonthlySpendingData(): Promise<{
  month: string;
  actual: number;
  estimated: number;
}[]> {
  const supabase = await createClient()
  
  // Get the last 12 months
  const endDate = new Date()
  const startDate = new Date()
  startDate.setMonth(endDate.getMonth() - 11)
  
  // Get all budgets in the date range
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      month,
      total_income,
      categories (
        allocated,
        spent
      )
    `)
    .gte('month', startDate.toISOString().slice(0, 7))
    .lte('month', endDate.toISOString().slice(0, 7))
    .order('month', { ascending: true })

  if (budgetsError) {
    console.error('Failed to fetch monthly spending data:', budgetsError)
    return []
  }

  // Transform data for chart
  const chartData = (budgets || []).map(budget => {
    const monthDate = new Date(budget.month + '-01')
    const monthShort = monthDate.toLocaleDateString('en-US', { month: 'short' })
    
    const estimated = budget.categories?.reduce((sum, category) => sum + (category.allocated || 0), 0) || 0
    const actual = budget.categories?.reduce((sum, category) => sum + (category.spent || 0), 0) || 0
    
    return {
      month: monthShort,
      actual: Math.round(actual),
      estimated: Math.round(estimated)
    }
  })
  
  return chartData
}

// Re-export utility functions for backwards compatibility
export { calculateBudgetSummary, calculateCategoryStatus } from '@/lib/utils/budget-calculations'