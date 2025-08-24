/**
 * Utility functions for waterfall chart calculations and data transformation
 */

import type { 
  WaterfallDataPoint, 
  WaterfallChartData, 
  WaterfallCategory,
  TransactionForWaterfall,
  CategorySpending,
  WaterfallCalculationResult
} from '@/lib/types/waterfall'

// Juno Design System colors for categories using proper tokens
const JUNO_COLORS = {
  income: '#12B76A', // --juno-success for income
  expenses: {
    essential: [
      '#EF4040', // --juno-danger for critical expenses 
      '#F5A623', // --juno-warning for important expenses
      '#dc2626', // red-600 for housing/rent
      '#ea580c'  // orange-600 for utilities
    ],
    discretionary: [
      '#1D4ED8', // --juno-blue-700 for entertainment
      '#0D9488', // --juno-teal-600 for dining
      '#7c3aed', // purple-600 for shopping
      '#c026d3'  // pink-600 for personal
    ],
    others: [
      '#5C6568', // --juno-neutral-500 for miscellaneous
      '#798383', // --juno-neutral-400 for others
      '#6b7280', // gray-500 for unknown
      '#374151'  // gray-700 for transfers
    ]
  },
  net: {
    positive: '#12B76A', // --juno-success for positive net
    negative: '#EF4040'   // --juno-danger for negative net
  }
}

// Essential expense categories (typically fixed/necessary expenses)
const ESSENTIAL_CATEGORIES = [
  'rent', 'mortgage', 'utilities', 'insurance', 'groceries', 'gas', 'fuel',
  'phone', 'internet', 'electricity', 'water', 'council tax', 'income tax',
  'pension', 'national insurance', 'bills', 'transport', 'food'
]

/**
 * Determines if a category is essential based on its name
 */
function isEssentialCategory(categoryName: string): boolean {
  const normalizedName = categoryName.toLowerCase()
  return ESSENTIAL_CATEGORIES.some(essential => 
    normalizedName.includes(essential)
  )
}

/**
 * Assigns colors to categories based on their type and nature
 */
function assignCategoryColor(
  categoryName: string, 
  type: 'income' | 'expense',
  index: number
): string {
  if (type === 'income') {
    return JUNO_COLORS.income
  }

  const isEssential = isEssentialCategory(categoryName)
  const colorPalette = isEssential 
    ? JUNO_COLORS.expenses.essential 
    : JUNO_COLORS.expenses.discretionary

  return colorPalette[index % colorPalette.length]
}

/**
 * Processes transactions to calculate category spending
 */
export function calculateCategorySpending(
  transactions: TransactionForWaterfall[]
): WaterfallCalculationResult {
  const categoryTotals = new Map<string, CategorySpending>()

  // Group transactions by category
  transactions.forEach(transaction => {
    const key = transaction.category_id
    const existing = categoryTotals.get(key)
    
    if (existing) {
      existing.totalAmount += Math.abs(transaction.amount)
      existing.transactionCount += 1
    } else {
      categoryTotals.set(key, {
        categoryId: transaction.category_id,
        categoryName: transaction.category_name,
        totalAmount: Math.abs(transaction.amount),
        transactionCount: 1,
        color: ''
      })
    }
  })

  // Separate income and expenses
  const incomeCategories: CategorySpending[] = []
  const expenseCategories: CategorySpending[] = []

  let expenseIndex = 0
  transactions.forEach(transaction => {
    const category = categoryTotals.get(transaction.category_id)
    if (!category) return

    // Skip if already processed
    if (category.color) return

    if (transaction.amount > 0) {
      // Income
      category.color = JUNO_COLORS.income
      incomeCategories.push(category)
    } else {
      // Expense
      category.color = assignCategoryColor(
        transaction.category_name, 
        'expense', 
        expenseIndex++
      )
      expenseCategories.push(category)
    }
  })

  // Sort expense categories by amount (largest first)
  expenseCategories.sort((a, b) => b.totalAmount - a.totalAmount)

  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.totalAmount, 0)
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.totalAmount, 0)

  return {
    income: {
      total: totalIncome,
      categories: incomeCategories
    },
    expenses: {
      total: totalExpenses,
      categories: expenseCategories
    },
    net: totalIncome - totalExpenses
  }
}

/**
 * Groups small expense categories into "Other" to avoid tiny chart segments
 */
export function groupSmallExpenseCategories(
  categories: CategorySpending[],
  totalExpenses: number,
  minPercentageThreshold: number = 0.05 // 5% minimum
): CategorySpending[] {
  // Grouping disabled - just return original categories
  return categories
}

/**
 * Applies minimum width logic to ensure small segments are visible
 */
export function applyMinimumWidthLogic(
  categories: CategorySpending[],
  totalAmount: number,
  minWidthPercentage: number = 0.03 // 3% minimum width
): CategorySpending[] {
  const adjustedCategories = [...categories]
  let redistributionNeeded = 0

  // Calculate adjustments needed for minimum width
  adjustedCategories.forEach(category => {
    const currentPercentage = category.totalAmount / totalAmount
    if (currentPercentage < minWidthPercentage && currentPercentage > 0) {
      const adjustment = (minWidthPercentage * totalAmount) - category.totalAmount
      redistributionNeeded += adjustment
      category.totalAmount = minWidthPercentage * totalAmount
    }
  })

  // Redistribute the excess from larger categories proportionally
  if (redistributionNeeded > 0) {
    const largeCategories = adjustedCategories.filter(cat => 
      cat.totalAmount / totalAmount > minWidthPercentage * 2
    )
    
    if (largeCategories.length > 0) {
      const totalLargeAmount = largeCategories.reduce((sum, cat) => sum + cat.totalAmount, 0)
      
      largeCategories.forEach(category => {
        const proportion = category.totalAmount / totalLargeAmount
        category.totalAmount -= redistributionNeeded * proportion
      })
    }
  }

  return adjustedCategories
}

/**
 * Transforms calculation result into horizontal waterfall chart data points (simplified 3-bar layout)
 */
export function createWaterfallDataPoints(
  calculation: WaterfallCalculationResult
): WaterfallDataPoint[] {
  const dataPoints: WaterfallDataPoint[] = []

  // 1. Income bar (starts at 0)
  const incomePoint: WaterfallDataPoint = {
    id: 'income',
    name: 'Income',
    value: calculation.income.total,
    type: 'income',
    color: JUNO_COLORS.income,
    cumulative: calculation.income.total,
    stackStart: 0,
    stackEnd: calculation.income.total
  }
  dataPoints.push(incomePoint)

  // 2. Combined spending bar (contains all expense categories)
  const spendingPoint: WaterfallDataPoint = {
    id: 'spending',
    name: 'Spending',
    value: -calculation.expenses.total, // Negative for expenses
    type: 'expense',
    color: '#EF4040', // Using juno danger color for spending
    cumulative: calculation.income.total - calculation.expenses.total,
    stackStart: calculation.income.total - calculation.expenses.total,
    stackEnd: calculation.income.total,
    // Add categories as metadata for tooltip
    category: calculation.expenses.categories.map(cat => 
      `${cat.categoryName}: ${formatWaterfallCurrency(cat.totalAmount)}`
    ).join(', ')
  }
  dataPoints.push(spendingPoint)

  // 3. Net result bar
  const netPoint: WaterfallDataPoint = {
    id: 'net',
    name: 'Net Result',
    value: calculation.net,
    type: 'net',
    color: calculation.net >= 0 ? JUNO_COLORS.net.positive : JUNO_COLORS.net.negative,
    cumulative: calculation.net,
    stackStart: 0,
    stackEnd: calculation.net
  }
  dataPoints.push(netPoint)

  return dataPoints
}

/**
 * Main function to transform transactions into complete waterfall chart data
 */
export function transformTransactionsToWaterfall(
  transactions: TransactionForWaterfall[]
): WaterfallChartData {
  const calculation = calculateCategorySpending(transactions)
  
  // Apply smart grouping and minimum width logic to expense categories
  const processedExpenseCategories = calculation.expenses.categories
  
  // Skip grouping - just use original categories
  
  // No minimum width adjustment - use actual proportional sizes
  
  // Create updated calculation with processed categories
  const processedCalculation: WaterfallCalculationResult = {
    ...calculation,
    expenses: {
      total: calculation.expenses.total, // Keep original total for accuracy
      categories: processedExpenseCategories
    }
  }
  
  const dataPoints = createWaterfallDataPoints(processedCalculation)

  // Create categories for legend/interaction (using original amounts for tooltips)
  const categories: WaterfallCategory[] = [
    {
      id: 'income',
      name: 'Income',
      amount: calculation.income.total,
      type: 'income',
      color: JUNO_COLORS.income
    },
    ...processedExpenseCategories.map(cat => {
      const originalCategory = calculation.expenses.categories.find(orig => orig.categoryId === cat.categoryId)
      const totalExpenses = calculation.expenses.total
      
      // Add mock allocated amounts based on category name
      const getAllocatedAmount = (categoryName: string): number => {
        const categoryMap: Record<string, number> = {
          'Rent': 1200,
          'Food': 500,
          'Bills': 200,
          'Transport': 150,
          'Income tax': 500,
          'Personal': 250,
          'Groceries': 500,
          'Utilities': 200,
          'Grab': 150
        }
        return categoryMap[categoryName] || cat.totalAmount * 1.2 // Default to 20% more than spent
      }

      return {
        id: cat.categoryId,
        name: cat.categoryName,
        amount: cat.totalAmount,
        allocated: getAllocatedAmount(cat.categoryName),
        type: 'expense' as const,
        color: cat.color,
        // Store original amount for tooltip accuracy
        originalAmount: originalCategory?.totalAmount || cat.totalAmount,
        // Calculate percentage of total expenses
        percentage: ((originalCategory?.totalAmount || cat.totalAmount) / totalExpenses) * 100,
        // Mark if this is a grouped "Other" category
        isGrouped: cat.categoryId === 'other',
        // Pass through grouped category names
        groupedCategories: cat.groupedCategories
      }
    })
  ]

  return {
    dataPoints,
    totalIncome: calculation.income.total,
    totalExpenses: calculation.expenses.total,
    netAmount: calculation.net,
    categories
  }
}

/**
 * Formats currency for display in the chart
 */
export function formatWaterfallCurrency(amount: number): string {
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

/**
 * Generates mock data for a specific day
 */
export function generateMockWaterfallDataForDay(date: string): WaterfallChartData {
  // Parse the date
  const targetDate = new Date(date)
  const dayOfWeek = targetDate.getDay() // 0 = Sunday, 6 = Saturday
  const dayOfMonth = targetDate.getDate()
  
  // Generate realistic daily transactions based on day patterns
  const dailyTransactions: TransactionForWaterfall[] = []
  
  // Income (usually on specific days - salary day, freelance payments)
  if (dayOfMonth === 1) {
    // Salary on 1st of month
    dailyTransactions.push({
      id: `${date}-salary`,
      description: 'Monthly Salary',
      amount: 4300,
      date,
      category_id: 'salary',
      category_name: 'Salary',
      type: 'income'
    })
  }
  
  // Ensure we always have the same base categories for consistency
  const baseExpenses = [
    { category_id: 'rent', category_name: 'Rent', amount: 0 },
    { category_id: 'food', category_name: 'Food', amount: 0 },
    { category_id: 'bills', category_name: 'Bills', amount: 0 },
    { category_id: 'transport', category_name: 'Transport', amount: 0 },
    { category_id: 'tax', category_name: 'Income tax', amount: 0 },
    { category_id: 'personal', category_name: 'Personal', amount: 0 }
  ]

  // Weekday vs weekend patterns
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    // Weekday expenses
    dailyTransactions.push(
      {
        id: `${date}-transport`,
        description: 'Public Transport',
        amount: -8,
        date,
        category_id: 'transport',
        category_name: 'Transport',
        type: 'expense'
      },
      {
        id: `${date}-lunch`,
        description: 'Lunch',
        amount: -15,
        date,
        category_id: 'food',
        category_name: 'Food',
        type: 'expense'
      }
    )
  } else {
    // Weekend expenses
    dailyTransactions.push({
      id: `${date}-groceries`,
      description: 'Weekend Groceries',
      amount: -65,
      date,
      category_id: 'food',
      category_name: 'Food',
      type: 'expense'
    })
  }
  
  // Random daily expenses
  if (Math.random() > 0.6) {
    dailyTransactions.push({
      id: `${date}-coffee`,
      description: 'Coffee',
      amount: -5,
      date,
      category_id: 'food',
      category_name: 'Food',
      type: 'expense'
    })
  }
  
  // Bill payments (random days)
  if (dayOfMonth === 15) {
    dailyTransactions.push({
      id: `${date}-bills`,
      description: 'Monthly Bills',
      amount: -180,
      date,
      category_id: 'bills',
      category_name: 'Bills',
      type: 'expense'
    })
  }
  
  return transformTransactionsToWaterfall(dailyTransactions)
}

/**
 * Generates mock data for a specific week
 */
export function generateMockWaterfallDataForWeek(weekValue: string): WaterfallChartData {
  const { startDate, endDate } = parseWeekValue(weekValue)
  
  // Generate daily data for each day in the week and aggregate
  const weekTransactions: TransactionForWaterfall[] = []
  const currentDate = new Date(startDate)
  const endDateObj = new Date(endDate)
  
  while (currentDate <= endDateObj) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const dailyData = generateMockWaterfallDataForDay(dateStr)
    
    // Convert daily data to transactions
    dailyData.categories.forEach(cat => {
      weekTransactions.push({
        id: `${dateStr}-${cat.id}`,
        description: `${cat.name} (${currentDate.toLocaleDateString('en-US', { weekday: 'short' })})`,
        amount: cat.type === 'income' ? cat.amount : -cat.amount,
        date: dateStr,
        category_id: cat.id,
        category_name: cat.name,
        type: cat.type
      })
    })
    
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  // Aggregate transactions by category
  return aggregateTransactionsByCategory(weekTransactions)
}

/**
 * Parses week value and returns start/end dates
 */
function parseWeekValue(weekValue: string): { startDate: string; endDate: string } {
  if (weekValue.includes('-W')) {
    // ISO week format: 2025-W33
    const [year, week] = weekValue.split('-W')
    const startDate = getDateFromWeek(parseInt(year), parseInt(week))
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  } else {
    // Date format: assume it's the start of week
    const startDate = new Date(weekValue)
    const dayOfWeek = startDate.getDay()
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Adjust for Monday start
    startDate.setDate(diff)
    
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 6)
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }
  }
}

/**
 * Gets date from ISO week number
 */
function getDateFromWeek(year: number, week: number): Date {
  const jan1 = new Date(year, 0, 1)
  const daysToAdd = (week - 1) * 7 - jan1.getDay() + 1
  return new Date(year, 0, 1 + daysToAdd)
}

/**
 * Aggregates transactions by category for multi-day periods
 */
function aggregateTransactionsByCategory(transactions: TransactionForWaterfall[]): WaterfallChartData {
  // Initialize with base categories to ensure consistency
  const categoryMap = new Map<string, {
    totalAmount: number
    categoryName: string
    type: 'income' | 'expense'
  }>()
  
  // Initialize all base categories first
  const baseCategories = [
    { id: 'salary', name: 'Salary', type: 'income' as const },
    { id: 'rent', name: 'Rent', type: 'expense' as const },
    { id: 'food', name: 'Food', type: 'expense' as const },
    { id: 'bills', name: 'Bills', type: 'expense' as const },
    { id: 'transport', name: 'Transport', type: 'expense' as const },
    { id: 'tax', name: 'Income tax', type: 'expense' as const },
    { id: 'personal', name: 'Personal', type: 'expense' as const }
  ]
  
  baseCategories.forEach(cat => {
    categoryMap.set(cat.id, {
      totalAmount: 0,
      categoryName: cat.name,
      type: cat.type
    })
  })
  
  // Aggregate actual transactions
  transactions.forEach(transaction => {
    const key = transaction.category_id
    const existing = categoryMap.get(key)
    
    if (existing) {
      existing.totalAmount += transaction.amount
    } else {
      categoryMap.set(key, {
        totalAmount: transaction.amount,
        categoryName: transaction.category_name,
        type: transaction.type
      })
    }
  })
  
  // Convert back to transaction format for processing (only non-zero amounts)
  const aggregatedTransactions: TransactionForWaterfall[] = Array.from(categoryMap.entries())
    .filter(([_, data]) => data.totalAmount !== 0) // Only include categories with actual amounts
    .map(([categoryId, data]) => ({
      id: `aggregated-${categoryId}`,
      description: `Aggregated ${data.categoryName}`,
      amount: data.totalAmount,
      date: new Date().toISOString().split('T')[0],
      category_id: categoryId,
      category_name: data.categoryName,
      type: data.type
    }))
  
  return transformTransactionsToWaterfall(aggregatedTransactions)
}

/**
 * Generates mock data for specific month
 */
export function generateMockWaterfallDataForMonth(month: string): WaterfallChartData {
  // Different data for different months
  const monthData: Record<string, TransactionForWaterfall[]> = {
    'august-2025': [
      { id: '1', description: 'Salary', amount: 4300, date: '2025-08-01', category_id: 'salary', category_name: 'Salary', type: 'income' },
      { id: '2', description: 'Rent Payment', amount: -1200, date: '2025-08-01', category_id: 'rent', category_name: 'Rent', type: 'expense' },
      { id: '3', description: 'Groceries', amount: -450, date: '2025-08-02', category_id: 'groceries', category_name: 'Food', type: 'expense' },
      { id: '4', description: 'Utilities', amount: -180, date: '2025-08-03', category_id: 'utilities', category_name: 'Bills', type: 'expense' },
      { id: '5', description: 'Transport', amount: -140, date: '2025-08-04', category_id: 'transport', category_name: 'Transport', type: 'expense' },
      { id: '6', description: 'Income Tax', amount: -500, date: '2025-08-04', category_id: 'tax', category_name: 'Income tax', type: 'expense' },
      { id: '7', description: 'Personal', amount: -200, date: '2025-08-06', category_id: 'personal', category_name: 'Personal', type: 'expense' }
    ],
    'july-2025': [
      { id: '1', description: 'Salary', amount: 4300, date: '2025-07-01', category_id: 'salary', category_name: 'Salary', type: 'income' },
      { id: '2', description: 'Rent Payment', amount: -1200, date: '2025-07-01', category_id: 'rent', category_name: 'Rent', type: 'expense' },
      { id: '3', description: 'Groceries', amount: -380, date: '2025-07-02', category_id: 'groceries', category_name: 'Food', type: 'expense' },
      { id: '4', description: 'Utilities', amount: -160, date: '2025-07-03', category_id: 'utilities', category_name: 'Bills', type: 'expense' },
      { id: '5', description: 'Transport', amount: -120, date: '2025-07-04', category_id: 'transport', category_name: 'Transport', type: 'expense' },
      { id: '6', description: 'Income Tax', amount: -500, date: '2025-07-04', category_id: 'tax', category_name: 'Income tax', type: 'expense' },
      { id: '7', description: 'Personal', amount: -150, date: '2025-07-06', category_id: 'personal', category_name: 'Personal', type: 'expense' }
    ],
    'june-2025': [
      { id: '1', description: 'Salary', amount: 4300, date: '2025-06-01', category_id: 'salary', category_name: 'Salary', type: 'income' },
      { id: '2', description: 'Rent Payment', amount: -1200, date: '2025-06-01', category_id: 'rent', category_name: 'Rent', type: 'expense' },
      { id: '3', description: 'Groceries', amount: -420, date: '2025-06-02', category_id: 'groceries', category_name: 'Food', type: 'expense' },
      { id: '4', description: 'Utilities', amount: -140, date: '2025-06-03', category_id: 'utilities', category_name: 'Bills', type: 'expense' },
      { id: '5', description: 'Transport', amount: -130, date: '2025-06-04', category_id: 'transport', category_name: 'Transport', type: 'expense' },
      { id: '6', description: 'Income Tax', amount: -500, date: '2025-06-04', category_id: 'tax', category_name: 'Income tax', type: 'expense' },
      { id: '7', description: 'Personal', amount: -180, date: '2025-06-06', category_id: 'personal', category_name: 'Personal', type: 'expense' }
    ]
  }

  const transactions = monthData[month] || monthData['august-2025']
  return transformTransactionsToWaterfall(transactions)
}

/**
 * Transforms waterfall data into mixed bar chart format
 */
export function transformToMixedBarData(waterfallData: WaterfallChartData, period: string) {
  // Calculate essential vs discretionary expenses
  const essentialExpenses = waterfallData.categories
    .filter(cat => cat.type === 'expense' && isEssentialCategory(cat.name))
    .reduce((sum, cat) => sum + cat.amount, 0)
  
  const discretionaryExpenses = waterfallData.categories
    .filter(cat => cat.type === 'expense' && !isEssentialCategory(cat.name))
    .reduce((sum, cat) => sum + cat.amount, 0)

  return {
    period,
    income: waterfallData.totalIncome,
    essentialExpenses,
    discretionaryExpenses,
    totalSpending: essentialExpenses + discretionaryExpenses,
    net: waterfallData.netAmount
  }
}

/**
 * Generates mixed bar data for multiple months
 */
export function generateMixedBarDataForMonths(months: string[]) {
  return months.map(month => {
    const waterfallData = generateMockWaterfallDataForMonth(month)
    const displayMonth = month.split('-')[0].charAt(0).toUpperCase() + month.split('-')[0].slice(1, 3)
    return transformToMixedBarData(waterfallData, displayMonth)
  })
}

/**
 * Fetches real waterfall data for a specific month
 */
export async function fetchRealWaterfallDataForMonth(month: string): Promise<WaterfallChartData> {
  // Use client-side queries to avoid server-side import issues
  const { getTransactionsForMonth, getBudgetIncomeForMonth } = await import('@/lib/supabase/client-queries')
  
  try {
    const [transactions, budgetIncome] = await Promise.all([
      getTransactionsForMonth(month),
      getBudgetIncomeForMonth(month)
    ])
    
    // Convert to our expected format
    const waterfallTransactions: TransactionForWaterfall[] = transactions.map(tx => ({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      category_id: tx.category_id,
      category_name: tx.category_name,
      type: tx.type
    }))

    // Add budget income as a virtual transaction
    if (budgetIncome > 0) {
      // Parse month correctly: "august-2025" -> "2025-08-01"
      const [monthName, year] = month.split('-')
      const monthNames = [
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december'
      ]
      const monthIndex = monthNames.indexOf(monthName.toLowerCase())
      const monthNumber = String(monthIndex + 1).padStart(2, '0')
      
      waterfallTransactions.unshift({
        id: 'budget-income',
        description: 'Monthly Income',
        amount: budgetIncome,
        date: `${year}-${monthNumber}-01`,
        category_id: 'income',
        category_name: 'Income',
        type: 'income'
      })
    }
    
    return transformTransactionsToWaterfall(waterfallTransactions)
  } catch (error) {
    console.error('Failed to fetch real waterfall data for month:', error)
    // Fallback to mock data if real data fails
    return generateMockWaterfallDataForMonth(month)
  }
}

/**
 * Fetches real waterfall data for a specific week
 */
export async function fetchRealWaterfallDataForWeek(weekStart: string): Promise<WaterfallChartData> {
  const { getTransactionsForWeek } = await import('@/lib/supabase/client-queries')
  
  try {
    const transactions = await getTransactionsForWeek(weekStart)
    
    const waterfallTransactions: TransactionForWaterfall[] = transactions.map(tx => ({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      category_id: tx.category_id,
      category_name: tx.category_name,
      type: tx.type
    }))
    
    return transformTransactionsToWaterfall(waterfallTransactions)
  } catch (error) {
    console.error('Failed to fetch real waterfall data for week:', error)
    // Fallback to mock data
    return generateMockWaterfallDataForWeek(weekStart)
  }
}

/**
 * Fetches real waterfall data for a specific day
 */
export async function fetchRealWaterfallDataForDay(date: string): Promise<WaterfallChartData> {
  const { getTransactionsForDay } = await import('@/lib/supabase/client-queries')
  
  try {
    const transactions = await getTransactionsForDay(date)
    
    const waterfallTransactions: TransactionForWaterfall[] = transactions.map(tx => ({
      id: tx.id,
      description: tx.description,
      amount: tx.amount,
      date: tx.date,
      category_id: tx.category_id,
      category_name: tx.category_name,
      type: tx.type
    }))
    
    return transformTransactionsToWaterfall(waterfallTransactions)
  } catch (error) {
    console.error('Failed to fetch real waterfall data for day:', error)
    // Fallback to mock data
    return generateMockWaterfallDataForDay(date)
  }
}

/**
 * Returns list of months that have data available (async version for real data)
 */
export async function getAvailableDataMonths(): Promise<string[]> {
  try {
    const { getAvailableDataMonths } = await import('@/lib/supabase/client-queries')
    return await getAvailableDataMonths()
  } catch (error) {
    console.error('Failed to fetch available months:', error)
    // Fallback to mock data months
    return ['august-2025', 'july-2025', 'june-2025']
  }
}

/**
 * Returns list of months that have data available (sync version for backwards compatibility)
 */
export function getAvailableMonths(): string[] {
  return ['august-2025', 'july-2025', 'june-2025']
}

/**
 * Checks if a month has data available (sync version, fallback to mock data list)
 */
export function hasDataForMonth(month: string): boolean {
  return getAvailableMonths().includes(month)
}

/**
 * Checks if a month has data available (async version for real data)
 */
export async function hasRealDataForMonth(month: string): Promise<boolean> {
  const availableMonths = await getAvailableDataMonths()
  return availableMonths.includes(month)
}

/**
 * Generates mock data for development/testing (backwards compatibility)
 */
export function generateMockWaterfallData(): WaterfallChartData {
  const mockTransactions: TransactionForWaterfall[] = [
    // Income
    { id: '1', description: 'Salary', amount: 3500, date: '2025-01-01', category_id: 'salary', category_name: 'Salary', type: 'income' },
    { id: '2', description: 'Freelance', amount: 800, date: '2025-01-05', category_id: 'freelance', category_name: 'Freelance', type: 'income' },
    
    // Essential Expenses
    { id: '3', description: 'Rent Payment', amount: -1200, date: '2025-01-01', category_id: 'rent', category_name: 'Rent', type: 'expense' },
    { id: '4', description: 'Groceries', amount: -400, date: '2025-01-02', category_id: 'groceries', category_name: 'Food', type: 'expense' },
    { id: '5', description: 'Utilities', amount: -150, date: '2025-01-03', category_id: 'utilities', category_name: 'Bills', type: 'expense' },
    { id: '6', description: 'Transport', amount: -120, date: '2025-01-04', category_id: 'transport', category_name: 'Transport', type: 'expense' },
    { id: '7', description: 'Income Tax', amount: -450, date: '2025-01-04', category_id: 'tax', category_name: 'Income tax', type: 'expense' },
    
    // Discretionary Expenses  
    { id: '8', description: 'Dining Out', amount: -200, date: '2025-01-06', category_id: 'dining', category_name: 'Personal', type: 'expense' },
    { id: '9', description: 'Entertainment', amount: -100, date: '2025-01-07', category_id: 'entertainment', category_name: 'Others', type: 'expense' },
    { id: '10', description: 'Charity Donation', amount: -50, date: '2025-01-08', category_id: 'charity', category_name: 'Charity', type: 'expense' }
  ]

  return transformTransactionsToWaterfall(mockTransactions)
}