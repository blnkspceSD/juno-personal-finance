/**
 * Onboarding Data State Detection for Progressive Disclosure
 * Determines what chart visualizations to show based on user's transaction history
 */

export type OnboardingDataState = 'no-data' | 'day-data' | 'week-data' | 'month-data'

export interface DataStateResult {
  state: OnboardingDataState
  enabledViews: ('day' | 'week' | 'month')[]
  defaultView: 'day' | 'week' | 'month'
  transactionCount: number
  daySpan: number
  oldestTransaction?: string
  newestTransaction?: string
}

/**
 * Analyzes user's transaction data to determine onboarding state
 */
export function detectOnboardingDataState(transactions: Array<{
  date: string
  amount: number
}>): DataStateResult {
  
  // No data state
  if (!transactions || transactions.length === 0) {
    return {
      state: 'no-data',
      enabledViews: [],
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

  // Progressive disclosure based on data span
  if (daySpan >= 30) {
    // 1 month+ of data: Enable all views
    return {
      state: 'month-data',
      enabledViews: ['day', 'week', 'month'],
      defaultView: 'month',
      transactionCount: transactions.length,
      daySpan,
      oldestTransaction: sortedTransactions[0].date,
      newestTransaction: sortedTransactions[sortedTransactions.length - 1].date
    }
  } else if (daySpan >= 7) {
    // 1 week+ of data: Enable day and week, disable month
    return {
      state: 'week-data',
      enabledViews: ['day', 'week'],
      defaultView: 'week',
      transactionCount: transactions.length,
      daySpan,
      oldestTransaction: sortedTransactions[0].date,
      newestTransaction: sortedTransactions[sortedTransactions.length - 1].date
    }
  } else {
    // Less than 1 week: Only enable day view
    return {
      state: 'day-data',
      enabledViews: ['day'],
      defaultView: 'day',
      transactionCount: transactions.length,
      daySpan,
      oldestTransaction: sortedTransactions[0].date,
      newestTransaction: sortedTransactions[sortedTransactions.length - 1].date
    }
  }
}

/**
 * Gets user-friendly messaging for each onboarding state
 */
export function getOnboardingStateMessage(state: OnboardingDataState, daySpan: number, transactionCount: number): {
  title: string
  subtitle: string
  encouragement?: string
} {
  switch (state) {
    case 'no-data':
      return {
        title: 'See where your money goes',
        subtitle: 'Add your first transaction to visualize your spending patterns',
        encouragement: 'Start tracking to unlock insights!'
      }
    
    case 'day-data':
      return {
        title: 'Your spending journey begins',
        subtitle: `${transactionCount} transaction${transactionCount === 1 ? '' : 's'} over ${daySpan} day${daySpan === 1 ? '' : 's'}`,
        encouragement: 'Keep tracking for 7 days to unlock weekly insights!'
      }
    
    case 'week-data':
      return {
        title: 'Your spending patterns emerge',
        subtitle: `${transactionCount} transactions over ${daySpan} days`,
        encouragement: 'Track for 30 days to unlock monthly budget comparisons!'
      }
    
    case 'month-data':
      return {
        title: 'Your complete financial picture',
        subtitle: `${transactionCount} transactions over ${daySpan} days`,
      }
  }
}

/**
 * Determines chart layout based on onboarding state
 */
export function getChartLayout(state: OnboardingDataState): {
  showEmptyState: boolean
  showBudgetAllocation: boolean
  showSpendingBreakdown: boolean
  chartHeight: number
} {
  switch (state) {
    case 'no-data':
      return {
        showEmptyState: true,
        showBudgetAllocation: false,
        showSpendingBreakdown: false,
        chartHeight: 300
      }
    
    case 'day-data':
    case 'week-data':
    case 'month-data':
      return {
        showEmptyState: false,
        showBudgetAllocation: true,
        showSpendingBreakdown: true,
        chartHeight: 160 // Height for each chart in dual layout
      }
  }
}