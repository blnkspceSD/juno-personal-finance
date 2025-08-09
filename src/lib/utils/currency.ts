/**
 * Currency formatting utilities
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCurrencyCompact(amount: number): string {
  if (Math.abs(amount) >= 1000000) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(amount)
  }
  
  return formatCurrency(amount)
}

/**
 * Get currency CSS classes for consistent monospace styling
 */
export function getCurrencyClasses(additionalClasses?: string): string {
  const baseClasses = 'font-mono tabular-nums'
  return additionalClasses ? `${baseClasses} ${additionalClasses}` : baseClasses
}