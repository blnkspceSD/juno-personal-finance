/**
 * TypeScript interfaces for progressive chart system
 * Handles intelligent chart progression based on data maturity
 */

// Chart stages in progressive system
export type ChartStage = 'empty-state' | 'bar' | 'treemap' | 'sankey'

// Time period types for different chart stages
export type TimeViewPeriod = 'day' | 'week' | 'month' | 'custom'

// Data maturity analysis result
export interface DataMaturityAnalysis {
  // Raw data metrics
  transactionCount: number
  categoryCount: number
  timeSpanDays: number
  budgetCompleteness: number // 0-1 scale
  
  // Data quality metrics
  dataConsistency: number // 0-1 scale
  categoryDistribution: number // 0-1 scale (how evenly distributed spending is)
  temporalCoverage: number // 0-1 scale (how much of time period has data)
  
  // Calculated scores
  dataRichness: 'sparse' | 'growing' | 'rich' | 'mature'
  recommendedChart: ChartStage
  confidence: number // 0-1 scale
  
  // Progression readiness
  canProgressTo: ChartStage[]
  shouldRegressTo?: ChartStage
  
  // Metadata
  analysisDate: string
  userTenure: number // days since first transaction
}

// Chart progression configuration
export interface ChartProgressionConfig {
  // Thresholds for chart stage progression
  thresholds: {
    bar: {
      minTransactions: number
      minCategories: number
      minTimeSpan: number
    }
    treemap: {
      minTransactions: number
      minCategories: number
      minTimeSpan: number
      minDataRichness: number
    }
    sankey: {
      minTransactions: number
      minCategories: number
      minTimeSpan: number
      minDataRichness: number
      minUserTenure: number
    }
  }
  
  // Override settings
  forceChart?: ChartStage
  disabledCharts?: ChartStage[]
  
  // Feature flags
  enableAutoProgression: boolean
  enableRegression: boolean
  enableEducationalPrompts: boolean
}

// Default progression configuration
export const DEFAULT_PROGRESSION_CONFIG: ChartProgressionConfig = {
  thresholds: {
    bar: {
      minTransactions: 3,
      minCategories: 2,
      minTimeSpan: 1 // 1 day
    },
    treemap: {
      minTransactions: 15,
      minCategories: 4,
      minTimeSpan: 7, // 1 week
      minDataRichness: 0.4
    },
    sankey: {
      minTransactions: 50,
      minCategories: 6,
      minTimeSpan: 21, // 3 weeks
      minDataRichness: 0.7,
      minUserTenure: 14 // 2 weeks of app usage
    }
  },
  enableAutoProgression: true,
  enableRegression: true,
  enableEducationalPrompts: true
}

// User progression state
export interface UserProgressionState {
  userId: string
  currentChart: ChartStage
  lastProgression?: string // ISO date
  progressionHistory: {
    chart: ChartStage
    date: string
    trigger: 'auto' | 'manual' | 'regression'
    dataAnalysis: DataMaturityAnalysis
  }[]
  
  // User preferences
  preferredChart?: ChartStage
  hasSeenEducation: ChartStage[]
  manualOverrides: number
  
  // A/B testing
  cohort?: string
  experimentFlags?: Record<string, boolean>
}

// Chart transition animation configuration
export interface ChartTransitionConfig {
  enableTransitions: boolean
  transitionDuration: number // milliseconds
  transitionType: 'fade' | 'slide' | 'scale' | 'morph'
  preserveContext: boolean // maintain zoom, selection, etc.
}

// Educational content for each chart stage
export interface ChartEducationContent {
  stage: ChartStage
  title: string
  description: string
  benefits: string[]
  nextStepHint?: string
  videoUrl?: string
  interactive?: boolean
}

// Progressive chart props interface
export interface ProgressiveChartProps {
  // Data
  transactions: Transaction[]
  budget?: BudgetData
  categories?: CategoryData[]
  
  // Configuration
  config?: Partial<ChartProgressionConfig>
  transitionConfig?: ChartTransitionConfig
  
  // Stage override
  forceStage?: ChartStage
  
  // Callbacks
  onStageChange?: (newStage: ChartStage, analysis: DataMaturityAnalysis) => void
  onEducationRequest?: (stage: ChartStage) => void
  onDataInsight?: (insight: DataInsight) => void
  
  // Styling
  height?: number
  className?: string
  
  // Loading state
  isLoading?: boolean
}

// Data insight types for educational prompts
export interface DataInsight {
  type: 'spending_pattern' | 'budget_variance' | 'category_growth' | 'savings_opportunity'
  title: string
  description: string
  severity: 'info' | 'warning' | 'success'
  actionable: boolean
  suggestedAction?: string
  chartStageRelevant: ChartStage[]
}

// Chart performance metrics for optimization
export interface ChartPerformanceMetrics {
  stage: ChartStage
  renderTime: number
  dataSize: number
  interactionLatency: number
  memoryUsage: number
  userEngagement: {
    timeSpent: number
    interactions: number
    taskCompletion: number
  }
}

// Transaction data interface (simplified)
export interface Transaction {
  id: string
  amount: number
  date: string // ISO date
  categoryId: string
  categoryName: string
  description: string
  type: 'income' | 'expense'
}

// Budget data interface
export interface BudgetData {
  id: string
  totalIncome: number
  period: string // YYYY-MM format
  categories: CategoryData[]
}

// Category data interface
export interface CategoryData {
  id: string
  name: string
  allocated: number
  spent: number
  color: string
  type: 'income' | 'expense'
  isEssential?: boolean
}

// Chart stage validation result
export interface StageValidationResult {
  isValid: boolean
  missingRequirements: string[]
  recommendations: string[]
  fallbackStage?: ChartStage
}

// Data transformation context for chart stages
export interface ChartDataContext {
  stage: ChartStage
  timeframe: TimeViewPeriod
  aggregationLevel: 'transaction' | 'category' | 'period'
  filterCriteria?: {
    categories?: string[]
    dateRange?: { start: string; end: string }
    amountRange?: { min: number; max: number }
  }
}