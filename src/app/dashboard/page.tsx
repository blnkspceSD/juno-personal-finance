import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthBudget, getMonthlySpendingData, getRecentTransactions, getCategoryGroupsWithCategories, getUnassignedCategories, getGroupedSpendingData } from '@/lib/supabase/queries'
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard'
import { ensureUserHasDefaultSetup } from '@/lib/services/userOnboardingService'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Ensure user has default setup (groups) if they're authenticated
  if (user) {
    try {
      await ensureUserHasDefaultSetup(user.id)
    } catch (error) {
      console.error('Error during user setup:', error)
    }
  }

  // Get current month budget, monthly spending data, recent transactions, and category groups
  let currentBudget = null
  let monthlySpendingData = []
  let recentTransactions = []
  let chartTransactions = []
  let categoryGroupsData = { groups: [], categoriesByGroup: {} }
  let unassignedCategories = []
  let groupedSpendingData = []
  
  try {
    [currentBudget, monthlySpendingData, recentTransactions, chartTransactions, categoryGroupsData, unassignedCategories, groupedSpendingData] = await Promise.all([
      getCurrentMonthBudget(),
      getMonthlySpendingData(),
      getRecentTransactions(5), // For recent transactions table
      getRecentTransactions(50), // For chart analysis - get more data
      getCategoryGroupsWithCategories(),
      getUnassignedCategories(),
      getGroupedSpendingData()
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
    groupedSpendingData={groupedSpendingData}
  />
}