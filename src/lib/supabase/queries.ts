// Juno Personal Finance - Database Queries
// Reusable queries for budget and transaction data

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { Budget, Category, Transaction, BudgetWithCategories } from '@/lib/types/database'

// Budget Queries
export async function getCurrentUserBudgets(): Promise<BudgetWithCategories[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { error } = await supabase
    .from('categories')
    .update({ allocated: amount })
    .eq('id', categoryId)

  if (error) {
    throw new Error(`Failed to update category: ${error.message}`)
  }
}

// Transaction Queries
export async function getRecentTransactions(limit: number = 10): Promise<(Transaction & { category_name: string, category_color?: string })[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (
        name,
        color
      )
    `)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch transactions: ${error.message}`)
  }

  // Transform data to include category name and color
  return (data || []).map(transaction => ({
    ...transaction,
    category_name: transaction.categories?.name || 'Uncategorized',
    category_color: transaction.categories?.color || '#6b7280'
  }))
}

export async function getTransactionsByCategory(categoryId: string): Promise<Transaction[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
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
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
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

// Category Group Queries
export async function getCategoryGroups(): Promise<{
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('category_groups')
    .select('*')
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch category groups: ${error.message}`)
  }

  return data || []
}

export async function getCategoriesWithSpending(): Promise<{
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
  group_id?: string;
}[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Get current month budget first
  const currentBudget = await getCurrentMonthBudget()
  if (!currentBudget) {
    return []
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('budget_id', currentBudget.id)
    .is('archived_at', null)
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch categories with spending: ${error.message}`)
  }

  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
    allocated: category.allocated || 0,
    spent: category.spent || 0,
    color: category.color || '#6366f1',
    group_id: category.group_id
  }))
}

export async function getCategoryGroupsWithCategories(): Promise<{
  groups: {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    color: string;
    icon?: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
  }[];
  categoriesByGroup: Record<string, {
    id: string;
    name: string;
    allocated: number;
    spent: number;
    color: string;
  }[]>;
}> {
  const [groups, categories] = await Promise.all([
    getCategoryGroups(),
    getCategoriesWithSpending()
  ])

  // Group categories by group_id
  const categoriesByGroup: Record<string, typeof categories> = {}
  
  // Initialize empty arrays for all groups
  groups.forEach(group => {
    categoriesByGroup[group.id] = []
  })
  
  // Add categories to their respective groups
  categories.forEach(category => {
    if (category.group_id && categoriesByGroup[category.group_id]) {
      categoriesByGroup[category.group_id].push({
        id: category.id,
        name: category.name,
        allocated: category.allocated,
        spent: category.spent,
        color: category.color
      })
    }
  })

  return { groups, categoriesByGroup }
}

export async function getUnassignedCategories(): Promise<{
  id: string;
  name: string;
  allocated: number;
  spent: number;
  color: string;
}[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Get current month budget first
  const currentBudget = await getCurrentMonthBudget()
  if (!currentBudget) {
    return []
  }

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('budget_id', currentBudget.id)
    .is('group_id', null)
    .is('archived_at', null)
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch unassigned categories: ${error.message}`)
  }

  return (data || []).map(category => ({
    id: category.id,
    name: category.name,
    allocated: category.allocated || 0,
    spent: category.spent || 0,
    color: category.color || '#6366f1'
  }))
}

// Group-based spending queries for dashboard charts
export async function getGroupedSpendingData(): Promise<{
  groupName: string
  groupColor: string
  groupIcon?: string
  totalSpent: number
  totalAllocated: number
  categories: {
    name: string
    spent: number
    allocated: number
    color: string
  }[]
}[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Get current month budget first
  const currentBudget = await getCurrentMonthBudget()
  if (!currentBudget) {
    return []
  }

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      allocated,
      spent,
      color,
      group_id,
      category_groups (
        name,
        color,
        icon
      )
    `)
    .eq('budget_id', currentBudget.id)
    .is('archived_at', null)
    .order('spent', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch grouped spending data: ${error.message}`)
  }

  // Group categories by their category groups
  const groupMap = new Map<string, {
    groupName: string
    groupColor: string
    groupIcon?: string
    totalSpent: number
    totalAllocated: number
    categories: {
      name: string
      spent: number
      allocated: number
      color: string
    }[]
  }>()

  // Handle ungrouped categories
  const ungroupedCategories: {
    name: string
    spent: number
    allocated: number
    color: string
  }[] = []

  data?.forEach(category => {
    if (category.group_id && category.category_groups) {
      const groupKey = category.category_groups.name
      
      if (!groupMap.has(groupKey)) {
        groupMap.set(groupKey, {
          groupName: category.category_groups.name,
          groupColor: category.category_groups.color,
          groupIcon: category.category_groups.icon,
          totalSpent: 0,
          totalAllocated: 0,
          categories: []
        })
      }

      const groupData = groupMap.get(groupKey)!
      groupData.totalSpent += category.spent || 0
      groupData.totalAllocated += category.allocated || 0
      groupData.categories.push({
        name: category.name,
        spent: category.spent || 0,
        allocated: category.allocated || 0,
        color: category.color
      })
    } else {
      // Collect ungrouped categories
      ungroupedCategories.push({
        name: category.name,
        spent: category.spent || 0,
        allocated: category.allocated || 0,
        color: category.color
      })
    }
  })

  const result = Array.from(groupMap.values())

  // Add ungrouped categories as a separate group if any exist
  if (ungroupedCategories.length > 0) {
    const ungroupedTotal = ungroupedCategories.reduce(
      (acc, cat) => ({
        spent: acc.spent + cat.spent,
        allocated: acc.allocated + cat.allocated
      }),
      { spent: 0, allocated: 0 }
    )

    result.push({
      groupName: 'Other',
      groupColor: '#6b7280',
      groupIcon: '📂',
      totalSpent: ungroupedTotal.spent,
      totalAllocated: ungroupedTotal.allocated,
      categories: ungroupedCategories
    })
  }

  // Sort by total spending (highest first) and limit to top 4 groups
  return result
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 4)
}

// Re-export utility functions for backwards compatibility
export { calculateBudgetSummary, calculateCategoryStatus } from '@/lib/utils/budget-calculations'