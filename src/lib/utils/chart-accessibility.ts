/**
 * Chart Accessibility Utilities
 * WCAG 2.1 AA compliance helpers for progressive charts
 */

import type { Transaction, BudgetData, CategoryData, DataMaturityAnalysis, ChartStage } from '@/lib/types/chart-progression'

/**
 * Generate accessible title for charts based on stage and data
 */
export function generateChartTitle(
  stage: ChartStage,
  analysis: DataMaturityAnalysis,
  categories: CategoryData[]
): string {
  const categoryCount = categories.length
  const transactionCount = analysis.transactionCount || 0
  
  switch (stage) {
    case 'empty-state':
      return 'Empty spending chart - Add transactions to see your data visualization'
    
    case 'bar':
      return `Spending comparison chart showing ${categoryCount} categories with ${transactionCount} transactions`
    
    case 'treemap':
      return `Hierarchical spending treemap displaying proportional spending across ${categoryCount} categories`
    
    case 'sankey':
      return `Cash flow diagram showing money flow from income through ${categoryCount} spending categories`
    
    default:
      return `Spending visualization chart with ${categoryCount} categories`
  }
}

/**
 * Generate detailed accessible description for charts
 */
export function generateChartDescription(
  stage: ChartStage,
  analysis: DataMaturityAnalysis,
  categories: CategoryData[],
  budget?: BudgetData
): string {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const overspentCategories = categories.filter(cat => cat.spent > cat.allocated)
  
  const transactionCount = analysis.transactionCount || 0
  const timeSpanDays = analysis.timeSpanDays || 0
  
  let description = `This ${getChartTypeDescription(stage)} contains data from ${transactionCount} transactions across ${categories.length} spending categories. `
  
  if (totalBudget > 0) {
    const utilizationPercent = Math.round((totalSpent / totalBudget) * 100)
    description += `Total spending: $${totalSpent.toFixed(2)} of $${totalBudget.toFixed(2)} budgeted (${utilizationPercent}% utilization). `
  }
  
  if (overspentCategories.length > 0) {
    description += `${overspentCategories.length} categories are over budget. `
  }
  
  const dataRichness = analysis.dataRichness || 'sparse'
  description += `Data spans ${timeSpanDays} days with ${dataRichness} data richness.`
  
  return description
}

/**
 * Get chart type description for screen readers
 */
function getChartTypeDescription(stage: ChartStage): string {
  switch (stage) {
    case 'empty-state':
      return 'empty state visualization'
    case 'bar':
      return 'bar chart'
    case 'treemap':
      return 'treemap visualization'
    case 'sankey':
      return 'sankey flow diagram'
    default:
      return 'chart'
  }
}

/**
 * Generate accessible data table for chart content
 */
export function generateAccessibleDataTable(
  categories: CategoryData[],
  stage: ChartStage
): {
  headers: string[]
  rows: string[][]
  caption: string
} {
  const headers = ['Category', 'Allocated', 'Spent', 'Remaining', 'Status']
  
  const rows = categories
    .sort((a, b) => b.spent - a.spent) // Sort by spending descending
    .map(category => {
      const remaining = category.allocated - category.spent
      const status = category.spent > category.allocated ? 'Over budget' : 
                    remaining < category.allocated * 0.1 ? 'Nearly spent' : 'On track'
      
      return [
        category.name,
        `$${category.allocated.toFixed(2)}`,
        `$${category.spent.toFixed(2)}`,
        `$${remaining.toFixed(2)}`,
        status
      ]
    })
  
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const totalRemaining = totalAllocated - totalSpent
  
  // Add totals row
  rows.push([
    'Total',
    `$${totalAllocated.toFixed(2)}`,
    `$${totalSpent.toFixed(2)}`,
    `$${totalRemaining.toFixed(2)}`,
    totalSpent > totalAllocated ? 'Over budget' : 'Within budget'
  ])
  
  const caption = `Spending data table for ${getChartTypeDescription(stage)} showing ${categories.length} categories`
  
  return { headers, rows, caption }
}

/**
 * Generate keyboard navigation instructions
 */
export function generateKeyboardInstructions(stage: ChartStage): string {
  const baseInstructions = 'Use Tab to navigate between interactive elements. Press Enter or Space to activate buttons.'
  
  switch (stage) {
    case 'empty-state':
      return `${baseInstructions} Use arrow keys to navigate onboarding options.`
    
    case 'bar':
      return `${baseInstructions} Use arrow keys to navigate between chart bars. Press Enter to view details.`
    
    case 'treemap':
      return `${baseInstructions} Use arrow keys to navigate treemap sections. Press Enter to drill down into categories.`
    
    case 'sankey':
      return `${baseInstructions} Use arrow keys to navigate flow connections. Press Enter to highlight flow paths.`
    
    default:
      return baseInstructions
  }
}

/**
 * Check color contrast compliance
 */
export function checkColorContrast(
  foreground: string,
  background: string = '#ffffff'
): {
  isCompliant: boolean
  ratio: number
  level: 'AA' | 'AAA' | 'FAIL'
} {
  // Simplified contrast checking - in production, use a proper color contrast library
  const fgLuminance = getLuminance(foreground)
  const bgLuminance = getLuminance(background)
  
  const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05)
  
  let level: 'AA' | 'AAA' | 'FAIL'
  if (ratio >= 7) {
    level = 'AAA'
  } else if (ratio >= 4.5) {
    level = 'AA'
  } else {
    level = 'FAIL'
  }
  
  return {
    isCompliant: level !== 'FAIL',
    ratio: Math.round(ratio * 100) / 100,
    level
  }
}

/**
 * Simple luminance calculation (simplified version)
 */
function getLuminance(color: string): number {
  // Convert hex to RGB
  const hex = color.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  // Apply gamma correction
  const sRGB = (c: number) => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  
  return 0.2126 * sRGB(r) + 0.7152 * sRGB(g) + 0.0722 * sRGB(b)
}

/**
 * Generate screen reader announcements for chart stage changes
 */
export function generateStageChangeAnnouncement(
  newStage: ChartStage,
  analysis: DataMaturityAnalysis
): string {
  const confidence = Math.round((analysis.confidence || 0) * 100)
  
  switch (newStage) {
    case 'bar':
      return `Chart upgraded to bar chart view with ${confidence}% confidence. Now showing budget comparisons across categories.`
    
    case 'treemap':
      return `Chart evolved to treemap visualization with ${confidence}% confidence. Now displaying proportional spending relationships.`
    
    case 'sankey':
      return `Chart advanced to cash flow diagram with ${confidence}% confidence. Now showing complete money flow from income to expenses.`
    
    default:
      return `Chart view changed to ${newStage} with ${confidence}% confidence.`
  }
}

/**
 * ARIA live region update for dynamic content
 */
export function createAriaLiveUpdate(
  message: string,
  politeness: 'polite' | 'assertive' = 'polite'
): {
  message: string
  politeness: 'polite' | 'assertive'
  timestamp: number
} {
  return {
    message,
    politeness,
    timestamp: Date.now()
  }
}

export default {
  generateChartTitle,
  generateChartDescription,
  generateAccessibleDataTable,
  generateKeyboardInstructions,
  checkColorContrast,
  generateStageChangeAnnouncement,
  createAriaLiveUpdate
}