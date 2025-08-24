import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { RealtimeTransactionForm } from '@/components/transactions/RealtimeTransactionForm'
import type { Category } from '@/lib/types/database'

export default async function NewTransactionPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/login')
  }

  // Get current month budget categories
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7)
  const currentYear = currentDate.getFullYear()

  let categories: Category[] = []
  let budgetId = ''

  try {
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        id,
        categories (*)
      `)
      .eq('month', currentMonth)
      .eq('year', currentYear)

    if (budgetError) {
      console.error('Failed to fetch budget:', budgetError.message)
    } else if (budgets && budgets.length > 0) {
      const budget = budgets[0]
      categories = budget.categories || []
      budgetId = budget.id
    }
  } catch (error) {
    console.error('Error loading categories:', error)
  }

  return <RealtimeTransactionForm initialCategories={categories} budgetId={budgetId} />
}