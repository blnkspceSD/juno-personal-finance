/**
 * Category Spent Service
 * Handles manual updates of category spent amounts
 * (Replaces the automatic database triggers that caused issues)
 */

import { createClient } from '@/lib/supabase/client'

export class CategorySpentService {
  private supabase = createClient()

  /**
   * Update spent amount for a single category
   */
  async updateCategorySpent(categoryId: string): Promise<void> {
    try {
      // Calculate total spent for this category
      const { data: transactions, error: transactionError } = await this.supabase
        .from('transactions')
        .select('amount')
        .eq('category_id', categoryId)

      if (transactionError) {
        throw new Error(`Failed to fetch transactions: ${transactionError.message}`)
      }

      const totalSpent = transactions?.reduce((sum, t) => sum + t.amount, 0) || 0

      // Update the category spent amount
      const { error: updateError } = await this.supabase
        .from('categories')
        .update({ 
          spent: totalSpent,
          updated_at: new Date().toISOString()
        })
        .eq('id', categoryId)

      if (updateError) {
        throw new Error(`Failed to update category spent: ${updateError.message}`)
      }
    } catch (error) {
      console.error('Error updating category spent:', error)
      throw error
    }
  }

  /**
   * Update spent amounts for multiple categories
   */
  async updateMultipleCategoriesSpent(categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map(categoryId => this.updateCategorySpent(categoryId))
    await Promise.all(updates)
  }

  /**
   * Update spent amounts after transaction operations
   */
  async handleTransactionChange(
    operation: 'insert' | 'update' | 'delete',
    newTransaction?: { category_id: string },
    oldTransaction?: { category_id: string }
  ): Promise<void> {
    const categoriesToUpdate = new Set<string>()

    switch (operation) {
      case 'insert':
        if (newTransaction?.category_id) {
          categoriesToUpdate.add(newTransaction.category_id)
        }
        break
      case 'update':
        if (oldTransaction?.category_id) {
          categoriesToUpdate.add(oldTransaction.category_id)
        }
        if (newTransaction?.category_id && newTransaction.category_id !== oldTransaction?.category_id) {
          categoriesToUpdate.add(newTransaction.category_id)
        }
        break
      case 'delete':
        if (oldTransaction?.category_id) {
          categoriesToUpdate.add(oldTransaction.category_id)
        }
        break
    }

    if (categoriesToUpdate.size > 0) {
      await this.updateMultipleCategoriesSpent(Array.from(categoriesToUpdate))
    }
  }
}

// Export a singleton instance
export const categorySpentService = new CategorySpentService()