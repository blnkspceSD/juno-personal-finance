import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthBudget, getMonthlySpendingData, getRecentTransactions, getCategoryGroupsWithCategories, getUnassignedCategories } from '@/lib/supabase/queries'
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get current month budget, monthly spending data, recent transactions, and category groups
  let currentBudget = null
  let monthlySpendingData = []
  let recentTransactions = []
  let chartTransactions = []
  let categoryGroupsData = { groups: [], categoriesByGroup: {} }
  let unassignedCategories = []
  
  try {
    [currentBudget, monthlySpendingData, recentTransactions, chartTransactions, categoryGroupsData, unassignedCategories] = await Promise.all([
      getCurrentMonthBudget(),
      getMonthlySpendingData(),
      getRecentTransactions(5), // For recent transactions table
      getRecentTransactions(50), // For chart analysis - get more data
      getCategoryGroupsWithCategories(),
      getUnassignedCategories()
    ])
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }

  return <RealtimeDashboard 
    initialBudget={currentBudget} 
    user={user}
    monthlySpendingData={monthlySpendingData}
    recentTransactions={recentTransactions}
    chartTransactions={chartTransactions}
    categoryGroups={categoryGroupsData.groups}
    categoriesByGroup={categoryGroupsData.categoriesByGroup}
    unassignedCategories={unassignedCategories}
  />
}