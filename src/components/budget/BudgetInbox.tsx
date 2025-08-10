/**
 * Budget Inbox Component
 * Safety net for categories that need funding
 * Shows persistent cards for unfinished budget allocation items
 */

'use client'

import { useState, useCallback } from 'react'
import { AlertTriangle, X, DollarSign, Target, Clock, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatCurrency } from '@/lib/utils/currency'
import { CategoryFundingPopover } from './CategoryFundingPopover'
import type { Category, CategoryWithMetrics, CategoryFundingStrategy } from '@/lib/types/database'

interface UnfundedCategory extends CategoryWithMetrics {
  lastTransactionAmount?: number
  lastTransactionDate?: string
  transactionCount: number
  totalDeficit: number
}

interface BudgetInboxProps {
  /** Categories that need funding */
  unfundedCategories: UnfundedCategory[]
  /** All categories for donor selection */
  allCategories: Category[]
  /** Available to spend amount */
  availableToSpend: number
  /** Left to budget amount */
  leftToBudget: number
  /** Callback when funding is applied */
  onFundingApplied: (categoryId: string, strategy: CategoryFundingStrategy, monthlyCap?: number) => Promise<void>
  /** Callback when category is dismissed for the month */
  onCategoryDismissed: (categoryId: string) => Promise<void>
  /** Loading state */
  isLoading?: boolean
}

export function BudgetInbox({
  unfundedCategories,
  allCategories,
  availableToSpend,
  leftToBudget,
  onFundingApplied,
  onCategoryDismissed,
  isLoading = false
}: BudgetInboxProps) {
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null)
  const [processingCategoryId, setProcessingCategoryId] = useState<string | null>(null)

  // Don't render if no unfunded categories
  if (unfundedCategories.length === 0) {
    return null
  }

  const handleQuickCover = useCallback(async (category: UnfundedCategory, amount: number) => {
    setProcessingCategoryId(category.id)
    try {
      // Use simple smart split strategy for quick cover
      const strategy: CategoryFundingStrategy = {
        type: 'smart_split',
        donors: [], // Will be calculated by the service
        totalAmount: amount
      }
      await onFundingApplied(category.id, strategy)
    } finally {
      setProcessingCategoryId(null)
    }
  }, [onFundingApplied])

  const handleSetMonthlyCap = useCallback(async (category: UnfundedCategory, cap: number) => {
    setProcessingCategoryId(category.id)
    try {
      const strategy: CategoryFundingStrategy = {
        type: 'smart_split',
        donors: [],
        totalAmount: cap
      }
      await onFundingApplied(category.id, strategy, cap)
    } finally {
      setProcessingCategoryId(null)
    }
  }, [onFundingApplied])

  const handleAdvancedFunding = useCallback((categoryId: string) => {
    setExpandedCategoryId(expandedCategoryId === categoryId ? null : categoryId)
  }, [expandedCategoryId])

  const handleDismiss = useCallback(async (categoryId: string) => {
    setProcessingCategoryId(categoryId)
    try {
      await onCategoryDismissed(categoryId)
    } finally {
      setProcessingCategoryId(null)
    }
  }, [onCategoryDismissed])

  return (
    <Card className=\"border-orange-200 bg-orange-50/50\">
      <CardHeader className=\"pb-3\">
        <div className=\"flex items-center justify-between\">
          <div className=\"flex items-center gap-2\">
            <AlertTriangle className=\"h-5 w-5 text-orange-600\" />
            <CardTitle className=\"text-lg text-orange-800\">
              Budget Inbox
            </CardTitle>
            <Badge variant=\"outline\" className=\"text-orange-700 border-orange-300\">
              {unfundedCategories.length} item{unfundedCategories.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <p className=\"text-sm text-orange-700\">
          Categories that need budget allocation to cover recent transactions
        </p>
      </CardHeader>

      <CardContent className=\"space-y-3\">
        {unfundedCategories.map((category) => {
          const isProcessing = processingCategoryId === category.id
          const isExpanded = expandedCategoryId === category.id
          const suggestedQuickAmount = category.lastTransactionAmount || category.totalDeficit
          const suggestedMonthlyCap = Math.ceil((category.totalDeficit * 1.5) / 10) * 10 // 150% of deficit, rounded

          return (
            <Card key={category.id} className=\"border-orange-200 bg-white\">
              <CardContent className=\"p-4\">
                <div className=\"flex items-start justify-between gap-3 mb-3\">
                  <div className=\"flex-1 min-w-0\">
                    <div className=\"flex items-center gap-2 mb-1\">
                      <h4 className=\"font-semibold text-foreground truncate\">
                        Finish setting up {category.name}
                      </h4>
                      <Badge 
                        variant=\"outline\" 
                        className=\"text-xs shrink-0\"
                        style={{
                          backgroundColor: `${category.color}15`,
                          color: category.color,
                          borderColor: `${category.color}30`
                        }}
                      >
                        <Clock className=\"h-3 w-3 mr-1\" />
                        {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                    
                    <div className=\"flex items-center gap-4 text-sm text-muted-foreground\">
                      <span>
                        Needs: <span className=\"font-medium text-orange-700\">{formatCurrency(category.totalDeficit)}</span>
                      </span>
                      {category.lastTransactionDate && (
                        <span>
                          Last used: {new Date(category.lastTransactionDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant=\"ghost\"
                          size=\"sm\"
                          onClick={() => handleDismiss(category.id)}
                          disabled={isProcessing || isLoading}
                          className=\"h-8 w-8 p-0 shrink-0\"
                        >
                          <X className=\"h-4 w-4\" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ignore this month</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                {/* Quick Actions */}
                <div className=\"flex flex-wrap gap-2 mb-3\">
                  <Button
                    size=\"sm\"
                    onClick={() => handleQuickCover(category, suggestedQuickAmount)}
                    disabled={isProcessing || isLoading}
                    className=\"h-8\"
                  >
                    <DollarSign className=\"h-3 w-3 mr-1\" />
                    Cover {formatCurrency(suggestedQuickAmount)}
                    {isProcessing && category.lastTransactionAmount === suggestedQuickAmount && (
                      <div className=\"ml-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent\" />
                    )}
                  </Button>

                  <Button
                    size=\"sm\"
                    variant=\"outline\"
                    onClick={() => handleSetMonthlyCap(category, suggestedMonthlyCap)}
                    disabled={isProcessing || isLoading}
                    className=\"h-8\"
                  >
                    <Target className=\"h-3 w-3 mr-1\" />
                    Set cap {formatCurrency(suggestedMonthlyCap)}
                    {isProcessing && (
                      <div className=\"ml-2 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent\" />
                    )}
                  </Button>

                  <Button
                    size=\"sm\"
                    variant=\"ghost\"
                    onClick={() => handleAdvancedFunding(category.id)}
                    disabled={isProcessing || isLoading}
                    className=\"h-8\"
                  >
                    Advanced...
                  </Button>
                </div>

                {/* Advanced Funding Options */}
                {isExpanded && (
                  <div className=\"border-t pt-3\">
                    <CategoryFundingPopover
                      categoryName={category.name}
                      transactionAmount={suggestedQuickAmount}
                      categories={allCategories.filter(c => c.id !== category.id)}
                      availableToSpend={availableToSpend}
                      leftToBudget={leftToBudget}
                      onFundingConfirm={async (strategy, monthlyCap) => {
                        await onFundingApplied(category.id, strategy, monthlyCap)
                        setExpandedCategoryId(null)
                      }}
                      onSkipFunding={() => setExpandedCategoryId(null)}
                      isLoading={isProcessing}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}

        {/* Batch Actions */}
        {unfundedCategories.length > 1 && (
          <div className=\"flex justify-between items-center pt-3 border-t border-orange-200\">
            <div className=\"text-sm text-orange-700\">
              {unfundedCategories.length} categories need funding
            </div>
            <div className=\"flex gap-2\">
              <Button
                size=\"sm\"
                variant=\"outline\"
                onClick={async () => {
                  // Batch dismiss all
                  for (const category of unfundedCategories) {
                    await handleDismiss(category.id)
                  }
                }}
                disabled={isLoading}
                className=\"h-8\"
              >
                Ignore all this month
              </Button>
              <Button
                size=\"sm\"
                onClick={async () => {
                  // Batch fund all with smart defaults
                  for (const category of unfundedCategories) {
                    const amount = category.lastTransactionAmount || category.totalDeficit
                    await handleQuickCover(category, amount)
                  }
                }}
                disabled={isLoading}
                className=\"h-8\"
              >
                <CheckCircle className=\"h-3 w-3 mr-1\" />
                Fund all
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}