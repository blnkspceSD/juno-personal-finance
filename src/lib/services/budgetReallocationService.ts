/**
 * Budget Reallocation Service
 * Handles intelligent budget reallocation when creating new categories
 * Maintains zero-sum budgeting principles
 */

import { createClient } from '@/lib/supabase/client'
import type { 
  Category, 
  CategoryWithMetrics, 
  BudgetSummary, 
  CategoryFundingStrategy,
  BudgetReallocation 
} from '@/lib/types/database'

export class BudgetReallocationService {
  private supabase = createClient()

  /**
   * Calculate budget summary for a given budget
   */
  async getBudgetSummary(budgetId: string): Promise<BudgetSummary> {
    // Get budget and categories
    const { data: budget, error: budgetError } = await this.supabase
      .from('budgets')
      .select(`
        *,
        categories (*)
      `)
      .eq('id', budgetId)
      .single()

    if (budgetError || !budget) {
      throw new Error(`Failed to fetch budget: ${budgetError?.message}`)
    }

    const categories = budget.categories || []
    const totalAllocated = categories.reduce((sum: number, cat: Category) => sum + cat.allocated, 0)
    const totalSpent = categories.reduce((sum: number, cat: Category) => sum + cat.spent, 0)
    const leftToBudget = budget.total_income - totalAllocated

    return {
      totalIncome: budget.total_income,
      totalAllocated,
      totalSpent,
      availableToSpend: totalAllocated - totalSpent,
      leftToBudget: Math.max(0, leftToBudget)
    }
  }

  /**
   * Calculate enhanced category metrics for funding decisions
   */
  calculateCategoryMetrics(categories: Category[]): CategoryWithMetrics[] {
    return categories.map(category => {
      const headroom = category.allocated - category.spent
      const utilizationRate = category.allocated > 0 ? category.spent / category.allocated : 0
      
      return {
        ...category,
        headroom,
        utilizationRate,
        isOverspent: category.spent > category.allocated,
        needsFunding: category.allocated === 0 && category.spent === 0 // New unfunded category
      }
    })
  }

  /**
   * Generate smart donor suggestions for budget reallocation
   */
  generateDonorSuggestions(
    categories: CategoryWithMetrics[],
    targetAmount: number,
    excludeCategoryIds: string[] = []
  ): CategoryWithMetrics[] {
    return categories
      .filter(cat => 
        !excludeCategoryIds.includes(cat.id) &&
        cat.headroom > 0 && // Has available budget
        !cat.isOverspent && // Not overspent
        cat.allocated > 0 // Has been allocated (not a new category)
      )
      .sort((a, b) => {
        // Primary: Headroom (descending)
        if (b.headroom !== a.headroom) return b.headroom - a.headroom
        
        // Secondary: Lower utilization rate (ascending) - prefer underutilized
        if (a.utilizationRate !== b.utilizationRate) return a.utilizationRate - b.utilizationRate
        
        // Tertiary: Higher allocated amount (more flexible categories)
        return b.allocated - a.allocated
      })
  }

  /**
   * Calculate optimal smart split strategy
   */
  calculateSmartSplit(
    donorCandidates: CategoryWithMetrics[],
    targetAmount: number,
    maxDonors: number = 4
  ): { categoryId: string; amount: number; percentage: number }[] {
    const topCandidates = donorCandidates.slice(0, maxDonors)
    const totalHeadroom = topCandidates.reduce((sum, cat) => sum + cat.headroom, 0)
    
    if (totalHeadroom < targetAmount) {
      // Not enough total headroom - distribute proportionally up to each category's limit
      return topCandidates.map(candidate => {
        const maxContribution = candidate.headroom
        const proportionalAmount = (candidate.headroom / totalHeadroom) * targetAmount
        const finalAmount = Math.min(maxContribution, proportionalAmount)
        
        return {
          categoryId: candidate.id,
          amount: Math.floor(finalAmount * 100) / 100, // Round to cents
          percentage: (finalAmount / targetAmount) * 100
        }
      }).filter(split => split.amount > 0)
    }

    // Enough headroom available - distribute proportionally
    return topCandidates.map(candidate => {
      const proportionalAmount = (candidate.headroom / totalHeadroom) * targetAmount
      const finalAmount = Math.floor(proportionalAmount * 100) / 100
      
      return {
        categoryId: candidate.id,
        amount: finalAmount,
        percentage: (finalAmount / targetAmount) * 100
      }
    }).filter(split => split.amount > 0)
  }

  /**
   * Execute budget reallocation in the database
   */
  async executeReallocation(
    budgetId: string,
    userId: string,
    strategy: CategoryFundingStrategy,
    toCategoryId: string,
    reason: string,
    transactionId?: string
  ): Promise<BudgetReallocation[]> {
    const reallocations: BudgetReallocation[] = []

    try {
      // Start a transaction
      const { data, error } = await this.supabase.rpc('execute_budget_reallocation', {
        p_budget_id: budgetId,
        p_user_id: userId,
        p_to_category_id: toCategoryId,
        p_donors: strategy.donors,
        p_reason: reason,
        p_transaction_id: transactionId
      })

      if (error) {
        throw new Error(`Reallocation failed: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Budget reallocation error:', error)
      throw error
    }
  }

  /**
   * Create a new category with funding strategy
   */
  async createCategoryWithFunding(
    budgetId: string,
    userId: string,
    categoryData: {
      name: string
      color?: string
      sort_order?: number
    },
    fundingStrategy: CategoryFundingStrategy,
    transactionId?: string
  ): Promise<{ category: Category; reallocations: BudgetReallocation[] }> {
    try {
      // First create the category with the allocated amount from the strategy
      const { data: category, error: categoryError } = await this.supabase
        .from('categories')
        .insert({
          user_id: userId,
          budget_id: budgetId,
          name: categoryData.name,
          allocated: fundingStrategy.totalAmount,
          spent: 0,
          sort_order: categoryData.sort_order || 0,
          color: categoryData.color || '#6366f1'
        })
        .select()
        .single()

      if (categoryError) {
        throw new Error(`Failed to create category: ${categoryError.message}`)
      }

      // Execute the reallocation if there are donors
      let reallocations: BudgetReallocation[] = []
      if (fundingStrategy.donors.length > 0) {
        reallocations = await this.executeReallocation(
          budgetId,
          userId,
          fundingStrategy,
          category.id,
          `Fund new category: ${categoryData.name}`,
          transactionId
        )
      }

      return { category, reallocations }
    } catch (error) {
      console.error('Category creation with funding error:', error)
      throw error
    }
  }

  /**
   * Undo the most recent reallocation
   */
  async undoReallocation(reallocationIds: string[]): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('undo_budget_reallocation', {
        p_reallocation_ids: reallocationIds
      })

      if (error) {
        throw new Error(`Failed to undo reallocation: ${error.message}`)
      }
    } catch (error) {
      console.error('Undo reallocation error:', error)
      throw error
    }
  }

  /**
   * Get categories that need funding (have transactions but no allocation)
   */
  async getCategoriesNeedingFunding(budgetId: string): Promise<CategoryWithMetrics[]> {
    const { data: categories, error } = await this.supabase
      .from('categories')
      .select(`
        *,
        transactions(count)
      `)
      .eq('budget_id', budgetId)
      .eq('allocated', 0)
      .gt('transactions.count', 0)

    if (error) {
      throw new Error(`Failed to fetch categories needing funding: ${error.message}`)
    }

    return this.calculateCategoryMetrics(categories || [])
      .filter(cat => cat.needsFunding)
  }
}