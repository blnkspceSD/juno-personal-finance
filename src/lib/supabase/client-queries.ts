// Juno Personal Finance - Client-side Database Queries
// For use in client components (browser environment)

import { createClient } from '@/lib/supabase/client'

// Waterfall Chart Data Queries (Client-side versions)
export async function getTransactionsForWaterfallChart(
  startDate: string,
  endDate: string
): Promise<{
  id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  category_name: string;
  type: 'income' | 'expense';
}[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      amount,
      description,
      date,
      category_id,
      categories (
        name
      )
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch transactions for waterfall: ${error.message}`)
  }

  console.log(`Raw transactions fetched (${startDate} to ${endDate}):`, JSON.stringify(data, null, 2))

  // Transform data and determine income vs expense based on amount
  return (data || []).map(transaction => ({
    id: transaction.id,
    amount: transaction.amount,
    description: transaction.description,
    date: transaction.date,
    category_id: transaction.category_id,
    category_name: transaction.categories?.name || 'Uncategorized',
    type: transaction.amount > 0 ? 'income' : 'expense'
  }))
}

export async function getTransactionsForMonth(monthKey: string): Promise<{
  id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  category_name: string;
  type: 'income' | 'expense';
}[]> {
  // Parse month key like "august-2025" to "2025-08"
  const [monthName, year] = monthKey.split('-')
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  const monthIndex = monthNames.indexOf(monthName.toLowerCase())
  
  if (monthIndex === -1) {
    throw new Error(`Invalid month name: ${monthName}`)
  }
  
  const monthNumber = String(monthIndex + 1).padStart(2, '0')
  const yearMonth = `${year}-${monthNumber}`
  
  // Calculate start and end dates for the month
  const startDate = `${yearMonth}-01`
  const endDate = new Date(parseInt(year), monthIndex + 1, 0).toISOString().split('T')[0] // Last day of month
  
  return getTransactionsForWaterfallChart(startDate, endDate)
}

export async function getBudgetIncomeForMonth(monthKey: string): Promise<number> {
  const supabase = createClient()
  
  // Parse month key like "august-2025" to "2025-08"
  const [monthName, year] = monthKey.split('-')
  const monthNames = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ]
  const monthIndex = monthNames.indexOf(monthName.toLowerCase())
  
  if (monthIndex === -1) {
    throw new Error(`Invalid month name: ${monthName}`)
  }
  
  const monthNumber = String(monthIndex + 1).padStart(2, '0')
  const yearMonth = `${year}-${monthNumber}`
  const yearNum = parseInt(year)
  
  const { data: budget, error } = await supabase
    .from('budgets')
    .select('total_income')
    .eq('month', yearMonth)
    .eq('year', yearNum)
    .single()

  if (error) {
    console.warn(`No budget found for ${yearMonth}:`, error)
    return 0
  }

  return budget?.total_income || 0
}

export async function getTransactionsForWeek(weekStart: string): Promise<{
  id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  category_name: string;
  type: 'income' | 'expense';
}[]> {
  const startDate = weekStart
  const endDate = new Date(weekStart)
  endDate.setDate(endDate.getDate() + 6)
  const endDateStr = endDate.toISOString().split('T')[0]
  
  return getTransactionsForWaterfallChart(startDate, endDateStr)
}

export async function getTransactionsForDay(date: string): Promise<{
  id: string;
  amount: number;
  description: string;
  date: string;
  category_id: string;
  category_name: string;
  type: 'income' | 'expense';
}[]> {
  return getTransactionsForWaterfallChart(date, date)
}

export async function getAvailableDataMonths(): Promise<string[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('date')
    .order('date', { ascending: false })

  if (error) {
    console.error('Failed to fetch available months:', error)
    return []
  }

  if (!data || data.length === 0) {
    return []
  }

  // Extract unique year-month combinations and convert to our month key format
  const months = new Set<string>()
  data.forEach(transaction => {
    const date = new Date(transaction.date)
    const year = date.getFullYear()
    const monthIndex = date.getMonth()
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    const monthKey = `${monthNames[monthIndex]}-${year}`
    months.add(monthKey)
  })

  return Array.from(months).sort((a, b) => {
    // Sort by year then month (most recent first)
    const [monthA, yearA] = a.split('-')
    const [monthB, yearB] = b.split('-')
    const monthNames = [
      'january', 'february', 'march', 'april', 'may', 'june',
      'july', 'august', 'september', 'october', 'november', 'december'
    ]
    
    const yearComparison = parseInt(yearB) - parseInt(yearA)
    if (yearComparison !== 0) return yearComparison
    
    return monthNames.indexOf(monthB) - monthNames.indexOf(monthA)
  })
}