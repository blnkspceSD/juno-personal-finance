/**
 * Mock budget data for onboarding demonstrations
 * Provides realistic budget allocation data with proper colors
 */

export interface BudgetCategoryData {
  categoryId: string
  categoryName: string
  allocated: number
  color: string
}

/**
 * Gets mock budget allocation data that matches spending categories
 */
export function getMockBudgetAllocation(): BudgetCategoryData[] {
  return [
    {
      categoryId: 'groceries',
      categoryName: 'Groceries',
      allocated: 800,
      color: '#F5A623' // Orange - matches WaterfallChart
    },
    {
      categoryId: 'rent-mortgage',
      categoryName: 'Rent/Mortgage',
      allocated: 1200,
      color: '#EF4040' // Red - matches WaterfallChart
    },
    {
      categoryId: 'grab',
      categoryName: 'Grab',
      allocated: 150,
      color: '#0D9488' // Teal - matches WaterfallChart
    },
    {
      categoryId: 'bills',
      categoryName: 'Bills',
      allocated: 300,
      color: '#1D4ED8' // Blue - matches WaterfallChart
    },
    {
      categoryId: 'personal',
      categoryName: 'Personal',
      allocated: 250,
      color: '#c026d3' // Pink - matches WaterfallChart
    }
  ]
}

/**
 * Gets simplified budget allocation for onboarding states with less data
 */
export function getSimplifiedBudgetAllocation(): BudgetCategoryData[] {
  return [
    {
      categoryId: 'groceries',
      categoryName: 'Groceries',
      allocated: 800,
      color: '#F5A623'
    },
    {
      categoryId: 'rent-mortgage',
      categoryName: 'Rent/Mortgage',
      allocated: 1200,
      color: '#EF4040'
    },
    {
      categoryId: 'personal',
      categoryName: 'Personal',
      allocated: 300,
      color: '#c026d3'
    }
  ]
}

/**
 * Calculates total budget from allocation data
 */
export function calculateTotalBudget(budgetData: BudgetCategoryData[]): number {
  return budgetData.reduce((sum, item) => sum + item.allocated, 0)
}