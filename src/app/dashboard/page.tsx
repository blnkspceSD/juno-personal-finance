import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthBudget, getMonthlySpendingData, getRecentTransactions } from '@/lib/supabase/queries'
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get current month budget, monthly spending data, and recent transactions
  let currentBudget = null
  let monthlySpendingData = []
  let recentTransactions = []
  
  try {
    [currentBudget, monthlySpendingData, recentTransactions] = await Promise.all([
      getCurrentMonthBudget(),
      getMonthlySpendingData(),
      getRecentTransactions(5)
    ])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }

  return <RealtimeDashboard 
    initialBudget={currentBudget} 
    user={user}
    monthlySpendingData={monthlySpendingData}
    recentTransactions={recentTransactions}
  />
}