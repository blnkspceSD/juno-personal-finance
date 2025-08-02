import { createClient } from '@/lib/supabase/server'
import { getCurrentMonthBudget } from '@/lib/supabase/queries'
import { RealtimeDashboard } from '@/components/dashboard/RealtimeDashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get current month budget
  let currentBudget = null
  
  try {
    currentBudget = await getCurrentMonthBudget()
  } catch (error) {
    console.error('Error fetching budget:', error)
  }

  return <RealtimeDashboard initialBudget={currentBudget} user={user} />
}