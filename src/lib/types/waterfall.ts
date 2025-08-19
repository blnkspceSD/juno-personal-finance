/**
 * TypeScript interfaces for waterfall chart data structure
 */

// Time period view types for ViewSelector
export type TimeViewPeriod = 'day' | 'week' | 'month' | 'custom'

// Date period interface for different time views
export interface DatePeriod {
  type: TimeViewPeriod
  value: string // Format depends on type
  label: string // Human readable label
  startDate: string // ISO date string
  endDate: string // ISO date string
}

export interface WaterfallDataPoint {
  id: string
  name: string
  value: number
  type: 'income' | 'expense' | 'net'
  category?: string
  color: string
  cumulative: number
  stackStart: number
  stackEnd: number
}

export interface WaterfallCategory {
  id: string
  name: string
  amount: number
  allocated?: number // Budget allocated amount for this category
  type: 'income' | 'expense'
  color: string
  subcategories?: WaterfallSubcategory[]
  originalAmount?: number // Original amount before minimum width adjustments
  percentage?: number // Percentage of total expenses
  isGrouped?: boolean // True if this is an "Other" grouped category
  groupedCategories?: string[] // Names of categories grouped into "Other"
}

export interface WaterfallSubcategory {
  id: string
  name: string
  amount: number
  color: string
}

export interface WaterfallChartData {
  dataPoints: WaterfallDataPoint[]
  totalIncome: number
  totalExpenses: number
  netAmount: number
  categories: WaterfallCategory[]
}

export interface WaterfallChartProps {
  data?: WaterfallChartData
  height?: number
  showLabels?: boolean
  showValues?: boolean
  className?: string
  onDataPointClick?: (dataPoint: WaterfallDataPoint) => void
  
  // New view selector props
  defaultView?: TimeViewPeriod
  defaultPeriod?: string
  onViewChange?: (view: TimeViewPeriod, period: string) => void
  enabledViews?: TimeViewPeriod[]
  customDateRange?: {
    minDate?: string
    maxDate?: string
  }
  
  // Enhanced period selector props
  periodSelectorProps?: {
    showRelativeLabels?: boolean // "Today", "This Week", etc.
    maxHistoryItems?: number
    customPeriodLabels?: Record<string, string>
  }
  
  // Real budget data
  currentBudget?: {
    id: string
    total_income: number
    categories: Array<{
      id: string
      name: string
      allocated: number
      spent: number
      color: string
    }>
  } | null
}

export interface TransactionForWaterfall {
  id: string
  description: string
  amount: number
  date: string
  category_id: string
  category_name: string
  type: 'income' | 'expense'
}

export interface CategorySpending {
  categoryId: string
  categoryName: string
  totalAmount: number
  transactionCount: number
  color: string
  groupedCategories?: string[] // Names of categories grouped into "Other"
}

export interface WaterfallCalculationResult {
  income: {
    total: number
    categories: CategorySpending[]
  }
  expenses: {
    total: number
    categories: CategorySpending[]
  }
  net: number
}