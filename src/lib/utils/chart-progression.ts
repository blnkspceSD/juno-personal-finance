/**
 * Chart Progression Engine
 * Intelligent system for determining optimal chart type based on data maturity
 */

import type {
  ChartStage,
  DataMaturityAnalysis,
  ChartProgressionConfig,
  UserProgressionState,
  StageValidationResult,
  Transaction,
  BudgetData,
  CategoryData
} from '@/lib/types/chart-progression'
import { DEFAULT_PROGRESSION_CONFIG } from '@/lib/types/chart-progression'

// Re-export for convenience
export { DEFAULT_PROGRESSION_CONFIG }

/**
 * Analyzes transaction data to determine maturity and recommend chart stage
 */
export function analyzeDataMaturity(
  transactions: Transaction[],
  budget?: BudgetData,
  config: ChartProgressionConfig = DEFAULT_PROGRESSION_CONFIG
): DataMaturityAnalysis {
  
  // Basic data metrics
  const transactionCount = transactions.length
  const categoryCount = new Set(transactions.map(t => t.categoryId)).size
  
  // Time span analysis
  const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime())
  const timeSpanDays = dates.length > 0 
    ? Math.ceil((dates[dates.length - 1].getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0
  
  // Budget completeness (how much of budget has allocated amounts)
  const budgetCompleteness = budget ? 
    budget.categories.filter(c => c.allocated > 0).length / Math.max(budget.categories.length, 1) :
    0
  
  // Data quality metrics
  const dataConsistency = calculateDataConsistency(transactions)
  const categoryDistribution = calculateCategoryDistribution(transactions)
  const temporalCoverage = calculateTemporalCoverage(transactions, timeSpanDays)
  
  // User tenure (days since first transaction)
  const userTenure = dates.length > 0 
    ? Math.ceil((new Date().getTime() - dates[0].getTime()) / (1000 * 60 * 60 * 24))
    : 0
  
  // Calculate overall data richness
  const dataRichness = calculateDataRichness({
    transactionCount,
    categoryCount,
    timeSpanDays,
    budgetCompleteness,
    dataConsistency,
    categoryDistribution,
    temporalCoverage
  })
  
  // Determine recommended chart and progression readiness
  const recommendedChart = determineRecommendedChart({
    transactionCount,
    categoryCount,
    timeSpanDays,
    dataRichness,
    userTenure
  }, config)
  
  const canProgressTo = determineProgressionOptions({
    transactionCount,
    categoryCount,
    timeSpanDays,
    dataRichness,
    userTenure
  }, config)
  
  // Calculate confidence in recommendation
  const confidence = calculateRecommendationConfidence({
    transactionCount,
    categoryCount,
    timeSpanDays,
    dataRichness,
    recommendedChart
  }, config)
  
  return {
    transactionCount,
    categoryCount,
    timeSpanDays,
    budgetCompleteness,
    dataConsistency,
    categoryDistribution,
    temporalCoverage,
    dataRichness,
    recommendedChart,
    confidence,
    canProgressTo,
    analysisDate: new Date().toISOString(),
    userTenure
  }
}

/**
 * Calculates data consistency score (0-1)
 * Higher score = more consistent transaction patterns
 */
function calculateDataConsistency(transactions: Transaction[]): number {
  if (transactions.length < 2) return 0
  
  // Analyze transaction frequency consistency
  const dates = transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime())
  const intervals: number[] = []
  
  for (let i = 1; i < dates.length; i++) {
    const daysBetween = Math.ceil((dates[i].getTime() - dates[i-1].getTime()) / (1000 * 60 * 60 * 24))
    intervals.push(daysBetween)
  }
  
  if (intervals.length === 0) return 0
  
  // Calculate coefficient of variation (lower = more consistent)
  const mean = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length
  const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - mean, 2), 0) / intervals.length
  const standardDeviation = Math.sqrt(variance)
  const coefficientOfVariation = mean > 0 ? standardDeviation / mean : 1
  
  // Convert to 0-1 score (lower coefficient = higher consistency)
  return Math.max(0, 1 - coefficientOfVariation / 2)
}

/**
 * Calculates category distribution score (0-1)
 * Higher score = more evenly distributed spending across categories
 */
function calculateCategoryDistribution(transactions: Transaction[]): number {
  if (transactions.length === 0) return 0
  
  // Group transactions by category
  const categoryTotals = new Map<string, number>()
  transactions.forEach(t => {
    const current = categoryTotals.get(t.categoryId) || 0
    categoryTotals.set(t.categoryId, current + Math.abs(t.amount))
  })
  
  const amounts = Array.from(categoryTotals.values())
  if (amounts.length <= 1) return 1
  
  // Calculate Gini coefficient (0 = perfect equality, 1 = perfect inequality)
  amounts.sort((a, b) => a - b)
  const n = amounts.length
  const totalAmount = amounts.reduce((sum, amount) => sum + amount, 0)
  
  if (totalAmount === 0) return 0
  
  let giniSum = 0
  for (let i = 0; i < n; i++) {
    giniSum += (2 * (i + 1) - n - 1) * amounts[i]
  }
  
  const giniCoefficient = giniSum / (n * totalAmount)
  
  // Convert to distribution score (0 = uneven, 1 = even)
  return Math.max(0, 1 - Math.abs(giniCoefficient))
}

/**
 * Calculates temporal coverage score (0-1)
 * Higher score = transactions span more of the time period consistently
 */
function calculateTemporalCoverage(transactions: Transaction[], timeSpanDays: number): number {
  if (transactions.length === 0 || timeSpanDays === 0) return 0
  
  // Count unique days with transactions
  const uniqueDays = new Set(transactions.map(t => t.date.split('T')[0])).size
  
  // Calculate coverage as ratio of days with transactions to total span
  return Math.min(1, uniqueDays / Math.max(timeSpanDays, 1))
}

/**
 * Determines overall data richness level
 */
function calculateDataRichness(metrics: {
  transactionCount: number
  categoryCount: number
  timeSpanDays: number
  budgetCompleteness: number
  dataConsistency: number
  categoryDistribution: number
  temporalCoverage: number
}): 'sparse' | 'growing' | 'rich' | 'mature' {
  const {
    transactionCount,
    categoryCount,
    timeSpanDays,
    budgetCompleteness,
    dataConsistency,
    categoryDistribution,
    temporalCoverage
  } = metrics
  
  // Calculate weighted richness score
  const richnessScore = (
    Math.min(transactionCount / 50, 1) * 0.25 +        // Transaction volume (25%)
    Math.min(categoryCount / 10, 1) * 0.20 +           // Category diversity (20%)
    Math.min(timeSpanDays / 30, 1) * 0.20 +            // Time span (20%)
    budgetCompleteness * 0.15 +                         // Budget completeness (15%)
    dataConsistency * 0.10 +                            // Data consistency (10%)
    categoryDistribution * 0.05 +                       // Category distribution (5%)
    temporalCoverage * 0.05                             // Temporal coverage (5%)
  )
  
  if (richnessScore >= 0.8) return 'mature'
  if (richnessScore >= 0.6) return 'rich'
  if (richnessScore >= 0.3) return 'growing'
  return 'sparse'
}

/**
 * Determines the recommended chart stage based on data metrics
 */
function determineRecommendedChart(
  metrics: {
    transactionCount: number
    categoryCount: number
    timeSpanDays: number
    dataRichness: 'sparse' | 'growing' | 'rich' | 'mature'
    userTenure: number
  },
  config: ChartProgressionConfig
): ChartStage {
  const { transactionCount, categoryCount, timeSpanDays, dataRichness, userTenure } = metrics
  const { thresholds, forceChart, disabledCharts = [] } = config
  
  // If force chart is set and not disabled, use it
  if (forceChart && !disabledCharts.includes(forceChart)) {
    return forceChart
  }
  
  // Check if no data - show empty state
  if (transactionCount === 0) {
    return 'empty-state'
  }
  
  // Check Sankey eligibility (most advanced)
  if (!disabledCharts.includes('sankey') &&
      transactionCount >= thresholds.sankey.minTransactions &&
      categoryCount >= thresholds.sankey.minCategories &&
      timeSpanDays >= thresholds.sankey.minTimeSpan &&
      userTenure >= thresholds.sankey.minUserTenure &&
      (dataRichness === 'rich' || dataRichness === 'mature')) {
    return 'sankey'
  }
  
  // Check Treemap eligibility (intermediate)
  if (!disabledCharts.includes('treemap') &&
      transactionCount >= thresholds.treemap.minTransactions &&
      categoryCount >= thresholds.treemap.minCategories &&
      timeSpanDays >= thresholds.treemap.minTimeSpan &&
      (dataRichness === 'growing' || dataRichness === 'rich' || dataRichness === 'mature')) {
    return 'treemap'
  }
  
  // Check Bar chart eligibility (basic)
  if (!disabledCharts.includes('bar') &&
      transactionCount >= thresholds.bar.minTransactions &&
      categoryCount >= thresholds.bar.minCategories &&
      timeSpanDays >= thresholds.bar.minTimeSpan) {
    return 'bar'
  }
  
  // Fallback to empty state if none qualify
  return 'empty-state'
}

/**
 * Determines which chart stages user can progress to
 */
function determineProgressionOptions(
  metrics: {
    transactionCount: number
    categoryCount: number
    timeSpanDays: number
    dataRichness: 'sparse' | 'growing' | 'rich' | 'mature'
    userTenure: number
  },
  config: ChartProgressionConfig
): ChartStage[] {
  const options: ChartStage[] = []
  const { disabledCharts = [] } = config
  
  // Always include empty state as option
  if (!disabledCharts.includes('empty-state')) {
    options.push('empty-state')
  }
  
  // Check each stage eligibility
  const stages: ChartStage[] = ['bar', 'treemap', 'sankey']
  stages.forEach(stage => {
    if (!disabledCharts.includes(stage)) {
      const validation = validateChartStage(stage, metrics, config)
      if (validation.isValid) {
        options.push(stage)
      }
    }
  })
  
  return options
}

/**
 * Validates if a specific chart stage is appropriate for current data
 */
export function validateChartStage(
  stage: ChartStage,
  metrics: {
    transactionCount: number
    categoryCount: number
    timeSpanDays: number
    dataRichness: 'sparse' | 'growing' | 'rich' | 'mature'
    userTenure: number
  },
  config: ChartProgressionConfig
): StageValidationResult {
  const { transactionCount, categoryCount, timeSpanDays, dataRichness, userTenure } = metrics
  const { thresholds } = config
  
  const missingRequirements: string[] = []
  const recommendations: string[] = []
  
  switch (stage) {
    case 'empty-state':
      return { isValid: true, missingRequirements: [], recommendations: [] }
    
    case 'bar':
      if (transactionCount < thresholds.bar.minTransactions) {
        missingRequirements.push(`Need ${thresholds.bar.minTransactions - transactionCount} more transactions`)
        recommendations.push('Add more transactions to unlock bar chart view')
      }
      if (categoryCount < thresholds.bar.minCategories) {
        missingRequirements.push(`Need ${thresholds.bar.minCategories - categoryCount} more categories`)
        recommendations.push('Create transactions in different spending categories')
      }
      if (timeSpanDays < thresholds.bar.minTimeSpan) {
        missingRequirements.push(`Need ${thresholds.bar.minTimeSpan - timeSpanDays} more days of data`)
        recommendations.push('Continue tracking for a few more days')
      }
      break
    
    case 'treemap':
      if (transactionCount < thresholds.treemap.minTransactions) {
        missingRequirements.push(`Need ${thresholds.treemap.minTransactions - transactionCount} more transactions`)
        recommendations.push('Add more transactions to unlock proportional view')
      }
      if (categoryCount < thresholds.treemap.minCategories) {
        missingRequirements.push(`Need ${thresholds.treemap.minCategories - categoryCount} more categories`)
        recommendations.push('Diversify your spending across more categories')
      }
      if (timeSpanDays < thresholds.treemap.minTimeSpan) {
        missingRequirements.push(`Need ${thresholds.treemap.minTimeSpan - timeSpanDays} more days of data`)
        recommendations.push('Track spending for at least a week')
      }
      if (dataRichness === 'sparse') {
        missingRequirements.push('Need richer data patterns')
        recommendations.push('Add more consistent transaction patterns')
      }
      break
    
    case 'sankey':
      if (transactionCount < thresholds.sankey.minTransactions) {
        missingRequirements.push(`Need ${thresholds.sankey.minTransactions - transactionCount} more transactions`)
        recommendations.push('Build a substantial transaction history')
      }
      if (categoryCount < thresholds.sankey.minCategories) {
        missingRequirements.push(`Need ${thresholds.sankey.minCategories - categoryCount} more categories`)
        recommendations.push('Expand spending across more categories')
      }
      if (timeSpanDays < thresholds.sankey.minTimeSpan) {
        missingRequirements.push(`Need ${thresholds.sankey.minTimeSpan - timeSpanDays} more days of data`)
        recommendations.push('Track spending for at least 3 weeks')
      }
      if (userTenure < thresholds.sankey.minUserTenure) {
        missingRequirements.push(`Need ${thresholds.sankey.minUserTenure - userTenure} more days of app usage`)
        recommendations.push('Continue using the app to unlock advanced features')
      }
      if (dataRichness !== 'rich' && dataRichness !== 'mature') {
        missingRequirements.push('Need mature data patterns')
        recommendations.push('Build consistent spending patterns over time')
      }
      break
  }
  
  const isValid = missingRequirements.length === 0
  const fallbackStage = isValid ? undefined : getPreviousStage(stage)
  
  return {
    isValid,
    missingRequirements,
    recommendations,
    fallbackStage
  }
}

/**
 * Gets the previous stage in progression for fallback
 */
function getPreviousStage(stage: ChartStage): ChartStage {
  switch (stage) {
    case 'sankey': return 'treemap'
    case 'treemap': return 'bar'
    case 'bar': return 'empty-state'
    default: return 'empty-state'
  }
}

/**
 * Calculates confidence score for chart recommendation
 */
function calculateRecommendationConfidence(
  metrics: {
    transactionCount: number
    categoryCount: number
    timeSpanDays: number
    dataRichness: 'sparse' | 'growing' | 'rich' | 'mature'
    recommendedChart: ChartStage
  },
  config: ChartProgressionConfig
): number {
  const { transactionCount, categoryCount, timeSpanDays, dataRichness, recommendedChart } = metrics
  const { thresholds } = config
  
  if (recommendedChart === 'empty-state') {
    return transactionCount === 0 ? 1.0 : 0.5
  }
  
  const stageThreshold = thresholds[recommendedChart as keyof typeof thresholds]
  if (!stageThreshold) return 0.5
  
  // Calculate how much data exceeds minimum thresholds
  const transactionRatio = Math.min(transactionCount / stageThreshold.minTransactions, 2)
  const categoryRatio = Math.min(categoryCount / stageThreshold.minCategories, 2)
  const timeRatio = Math.min(timeSpanDays / stageThreshold.minTimeSpan, 2)
  
  // Base confidence from meeting thresholds
  let confidence = (transactionRatio + categoryRatio + timeRatio) / 6 // Average and normalize to 0-1
  
  // Boost confidence based on data richness
  const richnessBoost = {
    'sparse': 0,
    'growing': 0.1,
    'rich': 0.2,
    'mature': 0.3
  }[dataRichness]
  
  confidence = Math.min(1, confidence + richnessBoost)
  
  return Math.max(0, Math.min(1, confidence))
}

/**
 * Determines if user should progress to next chart stage automatically
 */
export function shouldAutoProgress(
  currentStage: ChartStage,
  analysis: DataMaturityAnalysis,
  config: ChartProgressionConfig
): boolean {
  if (!config.enableAutoProgression) return false
  if (analysis.recommendedChart === currentStage) return false
  if (analysis.confidence < 0.8) return false // High confidence required for auto-progression
  
  // Only progress forward, not backward (unless regression is enabled)
  const stageOrder: ChartStage[] = ['empty-state', 'bar', 'treemap', 'sankey']
  const currentIndex = stageOrder.indexOf(currentStage)
  const recommendedIndex = stageOrder.indexOf(analysis.recommendedChart)
  
  if (recommendedIndex > currentIndex) return true // Forward progression
  if (recommendedIndex < currentIndex && config.enableRegression) return true // Backward regression
  
  return false
}

/**
 * Gets next logical progression stage
 */
export function getNextProgressionStage(currentStage: ChartStage): ChartStage | null {
  switch (currentStage) {
    case 'empty-state': return 'bar'
    case 'bar': return 'treemap'
    case 'treemap': return 'sankey'
    case 'sankey': return null // Already at highest stage
    default: return null
  }
}