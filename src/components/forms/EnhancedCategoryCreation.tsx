/**
 * Enhanced Category Creation Component
 * Integrates category creation with budget reallocation flow
 * Shows funding popover for inline budget allocation
 */

'use client'

import { useState, useCallback } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CategoryFundingPopover } from '@/components/budget/CategoryFundingPopover'
import { BudgetReallocationService } from '@/lib/services/budgetReallocationService'
import { useToast } from '@/components/ui/use-toast'
import type { 
  Category, 
  CategoryWithMetrics, 
  CategoryFundingStrategy,
  BudgetReallocation 
} from '@/lib/types/database'

interface EnhancedCategoryCreationProps {
  /** The category name being created */
  categoryName: string
  /** Transaction amount that triggered the creation */
  transactionAmount: number
  /** Current budget ID */
  budgetId: string
  /** Current user ID */
  userId: string
  /** All available categories for donor selection */
  allCategories: Category[]
  /** Available to spend amount */
  availableToSpend: number
  /** Left to budget amount */
  leftToBudget: number
  /** Callback when category is successfully created */
  onCategoryCreated: (categoryId: string, reallocations: BudgetReallocation[]) => Promise<void>
  /** Callback when user chooses to skip funding */
  onSkipFunding: (categoryId: string) => Promise<void>
  /** Callback to close the popover */
  onClose: () => void
  /** Loading state */
  isLoading?: boolean
  /** Whether popover is open */
  isOpen: boolean
}

export function EnhancedCategoryCreation({
  categoryName,
  transactionAmount,
  budgetId,
  userId,
  allCategories,
  availableToSpend,
  leftToBudget,
  onCategoryCreated,
  onSkipFunding,
  onClose,
  isLoading = false,
  isOpen
}: EnhancedCategoryCreationProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const { toast } = useToast()\n  const reallocationService = new BudgetReallocationService()\n\n  // Calculate donor categories (exclude categories that don't have budget to give)\n  const donorCategories = allCategories.filter(cat => {\n    const headroom = cat.allocated - cat.spent\n    return headroom > 0 && cat.allocated > 0\n  })\n\n  const handleFundingConfirm = useCallback(async (\n    strategy: CategoryFundingStrategy, \n    monthlyCap?: number\n  ) => {\n    if (isProcessing) return\n\n    setIsProcessing(true)\n    try {\n      // Create category with funding\n      const result = await reallocationService.createCategoryWithFunding(\n        budgetId,\n        userId,\n        {\n          name: categoryName,\n          color: '#6366f1', // Default color\n          sort_order: allCategories.length\n        },\n        strategy\n      )\n\n      // Show success toast\n      toast({\n        title: 'Category created successfully',\n        description: `${categoryName} is now funded with ${strategy.totalAmount > 0 ? `${strategy.totalAmount}` : '0'} allocated.`,\n      })\n\n      // Notify parent components\n      await onCategoryCreated(result.category.id, result.reallocations)\n      onClose()\n\n    } catch (error) {\n      console.error('Category creation with funding error:', error)\n      toast({\n        title: 'Failed to create category',\n        description: error instanceof Error ? error.message : 'An unexpected error occurred',\n        variant: 'destructive'\n      })\n    } finally {\n      setIsProcessing(false)\n    }\n  }, [isProcessing, budgetId, userId, categoryName, allCategories.length, reallocationService, toast, onCategoryCreated, onClose])\n\n  const handleSkipFunding = useCallback(async () => {\n    if (isProcessing) return\n\n    setIsProcessing(true)\n    try {\n      // Create category with zero allocation\n      const result = await reallocationService.createCategoryWithFunding(\n        budgetId,\n        userId,\n        {\n          name: categoryName,\n          color: '#6366f1',\n          sort_order: allCategories.length\n        },\n        {\n          type: 'manual',\n          donors: [],\n          totalAmount: 0\n        }\n      )\n\n      // Show info toast about needing funding\n      toast({\n        title: 'Category created',\n        description: `${categoryName} was created but needs budget allocation. Check your Budget Inbox.`,\n        variant: 'default'\n      })\n\n      // Notify parent that category needs funding\n      await onSkipFunding(result.category.id)\n      onClose()\n\n    } catch (error) {\n      console.error('Category creation error:', error)\n      toast({\n        title: 'Failed to create category',\n        description: error instanceof Error ? error.message : 'An unexpected error occurred',\n        variant: 'destructive'\n      })\n    } finally {\n      setIsProcessing(false)\n    }\n  }, [isProcessing, budgetId, userId, categoryName, allCategories.length, reallocationService, toast, onSkipFunding, onClose])\n\n  return (\n    <Popover open={isOpen} onOpenChange={(open) => !open && onClose()}>\n      <PopoverContent className=\"w-[600px] p-0\" align=\"start\" side=\"bottom\">\n        <CategoryFundingPopover\n          categoryName={categoryName}\n          transactionAmount={transactionAmount}\n          categories={donorCategories}\n          availableToSpend={availableToSpend}\n          leftToBudget={leftToBudget}\n          onFundingConfirm={handleFundingConfirm}\n          onSkipFunding={handleSkipFunding}\n          isLoading={isProcessing || isLoading}\n        />\n      </PopoverContent>\n    </Popover>\n  )\n}\n\n// Hook for easier integration with transaction forms\nexport function useCategoryCreationWithFunding(\n  budgetId: string,\n  userId: string,\n  allCategories: Category[],\n  availableToSpend: number,\n  leftToBudget: number,\n  onCategoryCreated?: (categoryId: string, reallocations: BudgetReallocation[]) => void,\n  onCategoryNeedsFunding?: (categoryId: string) => void\n) {\n  const [pendingCategory, setPendingCategory] = useState<{\n    name: string\n    transactionAmount: number\n  } | null>(null)\n\n  const createCategoryWithFunding = useCallback(async (\n    name: string, \n    transactionAmount: number\n  ): Promise<string | null> => {\n    // Show the funding popover\n    setPendingCategory({ name, transactionAmount })\n    \n    // Return a promise that resolves when the popover is handled\n    return new Promise((resolve) => {\n      const handleCreated = (categoryId: string, reallocations: BudgetReallocation[]) => {\n        onCategoryCreated?.(categoryId, reallocations)\n        resolve(categoryId)\n      }\n\n      const handleSkipped = (categoryId: string) => {\n        onCategoryNeedsFunding?.(categoryId)\n        resolve(categoryId)\n      }\n\n      // Store the resolve function to be called by the popover\n      ;(window as any).__categoryCreationResolve = resolve\n      ;(window as any).__categoryCreationHandlers = { handleCreated, handleSkipped }\n    })\n  }, [onCategoryCreated, onCategoryNeedsFunding])\n\n  const closeFundingPopover = useCallback(() => {\n    setPendingCategory(null)\n    // Clean up any pending promises\n    if ((window as any).__categoryCreationResolve) {\n      (window as any).__categoryCreationResolve(null)\n      delete (window as any).__categoryCreationResolve\n      delete (window as any).__categoryCreationHandlers\n    }\n  }, [])\n\n  return {\n    pendingCategory,\n    createCategoryWithFunding,\n    closeFundingPopover\n  }\n}