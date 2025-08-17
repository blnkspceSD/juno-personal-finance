/**
 * Utility functions for detecting user's data state during onboarding
 * Determines what chart visualizations should be shown based on available data
 */

export type DataAvailabilityState = 'no-data' | 'day-data' | 'week-data' | 'month-data'

export interface DataStateResult {
  state: DataAvailabilityState
  availableViews: ('day' | 'week' | 'month')[]
  defaultView: 'day' | 'week' | 'month'
  transactionCount: number
  oldestTransactionDate?: string
  newestTransactionDate?: string
  daySpan: number
}

/**
 * Analyzes transaction data to determine the user's onboarding state
 */
export function detectDataAvailabilityState(transactions: Array<{
  date: string
  amount: number
}>): DataStateResult {
  if (!transactions || transactions.length === 0) {
    return {
      state: 'no-data',
      availableViews: [],
      defaultView: 'day',
      transactionCount: 0,
      daySpan: 0
    }
  }

  // Sort transactions by date
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const oldestDate = new Date(sortedTransactions[0].date)
  const newestDate = new Date(sortedTransactions[sortedTransactions.length - 1].date)
  const daySpan = Math.ceil((newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const result: DataStateResult = {
    state: 'day-data',
    availableViews: ['day'],
    defaultView: 'day',
    transactionCount: transactions.length,
    oldestTransactionDate: sortedTransactions[0].date,
    newestTransactionDate: sortedTransactions[sortedTransactions.length - 1].date,
    daySpan
  }

  // Determine state based on date span
  if (daySpan >= 30) {
    result.state = 'month-data'
    result.availableViews = ['day', 'week', 'month']
    result.defaultView = 'month'
  } else if (daySpan >= 7) {
    result.state = 'week-data'
    result.availableViews = ['day', 'week']
    result.defaultView = 'week'
  } else {
    result.state = 'day-data'
    result.availableViews = ['day']
    result.defaultView = 'day'
  }

  return result
}

/**
 * Gets user-friendly messaging for each data state
 */
export function getDataStateMessaging(state: DataAvailabilityState, daySpan: number): {
  title: string
  subtitle: string
  encouragement?: string
} {
  switch (state) {
    case 'no-data':
      return {
        title: 'See where your money goes',
        subtitle: 'Start tracking your expenses to visualize your spending patterns',
        encouragement: 'Add your first transaction to get started!'
      }
    
    case 'day-data':
      return {
        title: 'Your spending today',
        subtitle: `${daySpan} day${daySpan === 1 ? '' : 's'} of transaction data`,
        encouragement: 'Keep tracking for 7 days to unlock weekly insights!'
      }
    
    case 'week-data':
      return {
        title: 'Your spending patterns',
        subtitle: `${daySpan} days of transaction data`,
        encouragement: 'Track for 30 days to unlock monthly budget comparisons!'
      }
    
    case 'month-data':
      return {
        title: 'Your financial overview',
        subtitle: `${daySpan} days of comprehensive transaction data`,
      }
  }
}

/**
 * Determines if budget allocation chart should be shown
 */
export function shouldShowBudgetAllocation(state: DataAvailabilityState): boolean {
  // Show budget allocation for all states except no-data
  return state !== 'no-data'
}

/**
 * Determines if spending breakdown chart should be shown
 */
export function shouldShowSpendingBreakdown(state: DataAvailabilityState): boolean {
  // Show spending breakdown for all states except no-data
  return state !== 'no-data'
}

/**
 * Gets the appropriate chart height based on data state
 */
export function getChartHeight(state: DataAvailabilityState): number {
  switch (state) {
    case 'no-data':
      return 200 // Empty state height
    case 'day-data':
      return 120 // Smaller charts for limited data
    case 'week-data':
      return 140 // Medium charts
    case 'month-data':
      return 160 // Full-size charts
  }
}

/**
 * Gets mock budget allocation data for demonstration
 */
export function getMockBudgetAllocation(): Array<{
  categoryId: string
  categoryName: string
  allocated: number
  color: string
}> {
  return [
    { categoryId: 'groceries', categoryName: 'Groceries', allocated: 800, color: '#F5A623' },
    { categoryId: 'rent', categoryName: 'Rent/Mortgage', allocated: 1200, color: '#EF4040' },
    { categoryId: 'transport', categoryName: 'Transport', allocated: 200, color: '#0D9488' },
    { categoryId: 'bills', categoryName: 'Bills', allocated: 300, color: '#1D4ED8' },
    { categoryId: 'personal', categoryName: 'Personal', allocated: 250, color: '#c026d3' }
  ]
}