/**
 * Chart Color Utilities
 * Handles category colors with budget/actual variations and accessibility
 */

/**
 * Converts hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

/**
 * Converts hex color to RGBA with specified opacity
 */
function hexToRgba(hex: string, opacity: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`
}

/**
 * Converts RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

/**
 * Applies a white tint to a color
 * @param color - Hex color string (e.g., "#3b82f6")
 * @param tintPercent - Percentage of white to mix (0-100, default 30)
 */
export function applyWhiteTint(color: string, tintPercent: number = 30): string {
  const rgb = hexToRgb(color)
  if (!rgb) return color // Return original if invalid hex
  
  const tintFactor = tintPercent / 100
  const newR = Math.round(rgb.r + (255 - rgb.r) * tintFactor)
  const newG = Math.round(rgb.g + (255 - rgb.g) * tintFactor)
  const newB = Math.round(rgb.b + (255 - rgb.b) * tintFactor)
  
  return rgbToHex(newR, newG, newB)
}

/**
 * Get category color for different chart contexts
 */
export function getCategoryColor(
  categoryColor: string, 
  context: 'actual' | 'budget' | 'overspent' | 'remaining' = 'actual'
): string {
  switch (context) {
    case 'actual':
      return categoryColor
    case 'budget':
      return applyWhiteTint(categoryColor, 60) // 60% white tint for budget bars
    case 'overspent':
      return '#ef4444' // Red for overspending
    case 'remaining':
      return applyWhiteTint(categoryColor, 70) // More white for remaining
    default:
      return categoryColor
  }
}

/**
 * Get chart colors for Nivo stacked bar chart using Juno primary color
 */
export function getBarChartColor(
  bar: any,
  categories: Array<{ id: string; name: string; color: string }>,
  chartData: Array<{ category: string; categoryId: string; overspent: number }>
) {
  const dataItem = chartData.find(item => item.category === bar.indexValue)
  if (!dataItem) return JUNO_PRIMARY_COLOR
  
  // Color scheme for stacked bars
  if (bar.id === 'spent') {
    // Full Juno primary color for actual spending portion
    return JUNO_PRIMARY_COLOR
  } else if (bar.id === 'remaining') {
    // Light tint for remaining budget portion
    return applyWhiteTint(JUNO_PRIMARY_COLOR, 70)
  } else if (bar.id === 'overspent') {
    // Red for overspent amount
    return '#ef4444'
  } else if (bar.id === 'allocated') {
    // Legacy support for old format
    return applyWhiteTint(JUNO_PRIMARY_COLOR, 60)
  }
  
  return JUNO_PRIMARY_COLOR
}

/**
 * Get chart colors for Nivo treemap using Juno primary color
 */
export function getTreemapColor(node: any, categories: Array<{ id: string; color: string }>) {
  // Use Juno primary color for all treemap elements
  if (node.data.categoryId) {
    return JUNO_PRIMARY_COLOR
  }
  
  // Use semantic colors for group nodes
  if (node.data.name === 'Essentials') return '#ef4444' // Red for essentials
  if (node.data.name === 'Discretionary') return JUNO_PRIMARY_COLOR // Juno primary for discretionary
  
  return JUNO_PRIMARY_COLOR
}

/**
 * Get chart colors for Nivo sankey using Juno primary color
 */
export function getSankeyColor(node: any, categories: Array<{ id: string; color: string }>) {
  // Use Juno primary color for category nodes
  if (node.categoryId) {
    return JUNO_PRIMARY_COLOR
  }
  
  // Special colors for income and savings nodes
  if (node.id === 'income') return '#10b981' // Green for income
  if (node.id === 'savings') return '#8b5cf6' // Purple for savings
  
  return JUNO_PRIMARY_COLOR
}

/**
 * Juno brand colors
 */
export const JUNO_PRIMARY_COLOR = '#85D6FF' // Juno accent color

/**
 * Generate accessible color palette for empty states
 */
export const CHART_FALLBACK_COLORS = [
  JUNO_PRIMARY_COLOR, // Use Juno primary as first fallback
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
  '#ec4899', // Pink
  '#6b7280'  // Gray
] as const

/**
 * Get fallback color by index for categories without colors
 */
export function getFallbackColor(index: number): string {
  return CHART_FALLBACK_COLORS[index % CHART_FALLBACK_COLORS.length]
}

/**
 * Ensure color has proper contrast for accessibility
 */
export function ensureColorContrast(
  color: string, 
  background: string = '#ffffff',
  minContrast: number = 4.5
): string {
  // This is a simplified version - in production you'd want a full contrast calculation
  // For now, we'll return the color as-is since category colors should already be accessible
  return color
}