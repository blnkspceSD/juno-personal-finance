/**
 * Budget calculation utilities for client and server side
 * Pure functions that can be used in any context
 */

import type { BudgetWithCategories, Category } from '@/lib/types/database'

export function calculateBudgetSummary(budget: BudgetWithCategories) {
  const totalAllocated = budget.categories.reduce((sum, cat) => sum + cat.allocated, 0)
  const totalSpent = budget.categories.reduce((sum, cat) => sum + cat.spent, 0)
  const availableToBudget = budget.total_income - totalAllocated
  const overspentCategories = budget.categories.filter(cat => cat.spent > cat.allocated).length

  return {
    total_income: budget.total_income,
    total_allocated: totalAllocated,
    total_spent: totalSpent,
    available_to_budget: availableToBudget,
    categories_count: budget.categories.length,
    overspent_categories: overspentCategories
  }
}

export function calculateCategoryStatus(category: Category) {
  const remaining = category.allocated - category.spent
  const percentageUsed = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
  const isOverspent = category.spent > category.allocated

  return {
    category,
    remaining,
    percentage_used: percentageUsed,
    is_overspent: isOverspent
  }
}