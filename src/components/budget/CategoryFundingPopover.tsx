/**
 * Category Funding Popover Component
 * Provides inline budget reallocation when creating new categories
 * Implements "Create + Rebalance" flow to maintain zero-sum budgeting
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, Info, Lock, AlertTriangle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { formatCurrency } from '@/lib/utils/currency'
import type { Category } from '@/lib/types/database'

interface DonorSuggestion {
  category: Category
  suggestedAmount: number
  headroom: number
  reason: string
}

interface FundingStrategy {
  type: 'single' | 'smart_split' | 'manual'
  donors: { categoryId: string; amount: number }[]
  totalAmount: number
}

interface CategoryFundingPopoverProps {
  /** The new category name being created */
  categoryName: string
  /** Transaction amount to prefill funding amount */
  transactionAmount: number
  /** Available categories that can donate budget */
  categories: Category[]
  /** Callback when funding strategy is confirmed */
  onFundingConfirm: (strategy: FundingStrategy, setMonthlyCap?: number) => Promise<void>
  /** Callback when user chooses to skip funding */
  onSkipFunding: () => void
  /** Loading state */
  isLoading?: boolean
  /** Available to spend amount for impact messaging */
  availableToSpend: number
  /** Left to budget amount (if any new income exists) */
  leftToBudget?: number
}

export function CategoryFundingPopover({
  categoryName,
  transactionAmount,
  categories,
  onFundingConfirm,
  onSkipFunding,
  isLoading = false,
  availableToSpend,
  leftToBudget = 0
}: CategoryFundingPopoverProps) {
  const [fundingAmount, setFundingAmount] = useState(transactionAmount)
  const [fundingMode, setFundingMode] = useState<'transaction' | 'monthly_cap'>('transaction')
  const [monthlyCap, setMonthlyCap] = useState(Math.ceil(transactionAmount / 10) * 10) // Round up to nearest 10
  const [strategyType, setStrategyType] = useState<'smart_split' | 'single' | 'manual' | 'ltb'>('smart_split')
  const [selectedDonor, setSelectedDonor] = useState<string>('')
  const [manualSplits, setManualSplits] = useState<Record<string, number>>({})
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Calculate donor suggestions based on headroom and flexibility
  const donorSuggestions = useMemo(() => {
    const suggestions: DonorSuggestion[] = categories
      .map(category => {
        const headroom = category.allocated - category.spent
        const utilizationRate = category.spent / category.allocated
        
        return {
          category,
          headroom,
          suggestedAmount: 0, // Will be calculated based on strategy
          reason: headroom > fundingAmount ? 'Large headroom' : 
                 utilizationRate < 0.5 ? 'Underutilized' : 
                 headroom > 0 ? 'Has space' : 'No space'
        }
      })
      .filter(suggestion => suggestion.headroom > 0) // Only categories with available budget
      .sort((a, b) => {
        // Sort by headroom desc, then by utilization rate asc (prefer underutilized)
        if (b.headroom !== a.headroom) return b.headroom - a.headroom
        const aUtil = a.category.spent / a.category.allocated
        const bUtil = b.category.spent / b.category.allocated
        return aUtil - bUtil
      })

    return suggestions
  }, [categories, fundingAmount])

  // Calculate smart split suggestions
  const smartSplitSuggestions = useMemo(() => {
    if (donorSuggestions.length === 0) return []

    const eligibleDonors = donorSuggestions.slice(0, 4) // Top 4 candidates
    const totalHeadroom = eligibleDonors.reduce((sum, d) => sum + d.headroom, 0)
    
    if (totalHeadroom < fundingAmount) {
      // Not enough headroom, distribute proportionally but cap at headroom
      return eligibleDonors.map(donor => ({
        ...donor,
        suggestedAmount: Math.min(donor.headroom, Math.floor(fundingAmount * (donor.headroom / totalHeadroom)))
      }))
    }

    // Enough headroom, distribute proportionally
    return eligibleDonors.map(donor => ({
      ...donor,
      suggestedAmount: Math.floor(fundingAmount * (donor.headroom / totalHeadroom))
    })).filter(d => d.suggestedAmount > 0)
  }, [donorSuggestions, fundingAmount])

  // Get top single donor suggestion
  const topDonorSuggestion = donorSuggestions[0]

  // Calculate current strategy
  const currentStrategy: FundingStrategy = useMemo(() => {
    switch (strategyType) {
      case 'ltb':
        return {
          type: 'single',
          donors: [], // No donors needed, using left to budget
          totalAmount: Math.min(fundingAmount, leftToBudget)
        }
      case 'single':
        if (!selectedDonor || !topDonorSuggestion) {
          return { type: 'single', donors: [], totalAmount: 0 }
        }
        const donor = categories.find(c => c.id === selectedDonor) || topDonorSuggestion.category
        return {
          type: 'single',
          donors: [{ categoryId: donor.id, amount: Math.min(fundingAmount, donor.allocated - donor.spent) }],
          totalAmount: Math.min(fundingAmount, donor.allocated - donor.spent)
        }
      case 'manual':
        const donors = Object.entries(manualSplits)
          .filter(([_, amount]) => amount > 0)
          .map(([categoryId, amount]) => ({ categoryId, amount }))
        return {
          type: 'manual',
          donors,
          totalAmount: donors.reduce((sum, d) => sum + d.amount, 0)
        }
      case 'smart_split':
      default:
        return {
          type: 'smart_split',
          donors: smartSplitSuggestions.map(s => ({ categoryId: s.category.id, amount: s.suggestedAmount })),
          totalAmount: smartSplitSuggestions.reduce((sum, s) => sum + s.suggestedAmount, 0)
        }
    }
  }, [strategyType, selectedDonor, manualSplits, smartSplitSuggestions, topDonorSuggestion, categories, fundingAmount, leftToBudget])

  // Initialize manual splits when switching to manual mode
  useEffect(() => {
    if (strategyType === 'manual' && Object.keys(manualSplits).length === 0) {
      const splits: Record<string, number> = {}
      smartSplitSuggestions.forEach(suggestion => {
        splits[suggestion.category.id] = suggestion.suggestedAmount
      })
      setManualSplits(splits)
    }
  }, [strategyType, smartSplitSuggestions, manualSplits])

  // Auto-select top donor when switching to single mode
  useEffect(() => {
    if (strategyType === 'single' && !selectedDonor && topDonorSuggestion) {
      setSelectedDonor(topDonorSuggestion.category.id)
    }
  }, [strategyType, selectedDonor, topDonorSuggestion])

  const handleFundingAmountChange = (value: string) => {
    const amount = parseFloat(value) || 0
    setFundingAmount(amount)
    if (fundingMode === 'monthly_cap') {
      setMonthlyCap(Math.max(amount, monthlyCap))
    }
  }

  const handleConfirm = async () => {
    const finalMonthlyCap = fundingMode === 'monthly_cap' ? monthlyCap : undefined
    await onFundingConfirm(currentStrategy, finalMonthlyCap)
  }

  const canConfirm = currentStrategy.totalAmount > 0 && currentStrategy.totalAmount >= Math.min(fundingAmount, transactionAmount)

  return (
    <div className=\"space-y-6 p-6 max-w-lg\">
      {/* Header */}
      <div>
        <h3 className=\"text-lg font-semibold text-foreground mb-2\">
          New category: {categoryName}
        </h3>
        <p className=\"text-sm text-muted-foreground\">
          Set up budget allocation to cover this transaction
        </p>
      </div>

      {/* Amount to Fund */}
      <div className=\"space-y-3\">
        <Label htmlFor=\"funding-amount\" className=\"text-sm font-medium\">
          Amount to fund
        </Label>
        
        {/* Quick amount selection */}
        <div className=\"flex gap-2 flex-wrap\">
          <Button
            variant={fundingMode === 'transaction' ? 'default' : 'outline'}
            size=\"sm\"
            onClick={() => {
              setFundingMode('transaction')
              setFundingAmount(transactionAmount)
            }}
            className=\"h-8\"
          >
            Cover {formatCurrency(transactionAmount)}
          </Button>
          <Button
            variant={fundingMode === 'monthly_cap' ? 'default' : 'outline'}
            size=\"sm\"
            onClick={() => {
              setFundingMode('monthly_cap')
              setFundingAmount(monthlyCap)
            }}
            className=\"h-8\"
          >
            Set monthly cap {formatCurrency(monthlyCap)}
          </Button>
        </div>

        <Input
          id=\"funding-amount\"
          type=\"number\"
          step=\"0.01\"
          min=\"0.01\"
          value={fundingAmount}
          onChange={(e) => handleFundingAmountChange(e.target.value)}
          className=\"w-full\"
        />

        {fundingMode === 'monthly_cap' && (
          <div className=\"space-y-2\">
            <Label htmlFor=\"monthly-cap\" className=\"text-sm font-medium\">
              Monthly cap (optional)
            </Label>
            <Input
              id=\"monthly-cap\"
              type=\"number\"
              step=\"0.01\"
              min={transactionAmount}
              value={monthlyCap}
              onChange={(e) => setMonthlyCap(parseFloat(e.target.value) || transactionAmount)}
              className=\"w-full\"
            />
          </div>
        )}
      </div>

      {/* Funding Sources */}
      <div className=\"space-y-4\">
        <div className=\"flex items-center gap-2\">
          <Label className=\"text-sm font-medium\">Take money from</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className=\"h-4 w-4 text-muted-foreground\" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Moving budget between categories keeps your total Available to Spend unchanged</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Strategy Options */}
        <div className=\"space-y-3\">
          {/* Left to Budget (if available) */}
          {leftToBudget > 0 && (
            <div className=\"border rounded-lg p-4\">
              <label className=\"flex items-start gap-3 cursor-pointer\">
                <input
                  type=\"radio\"
                  name=\"funding-strategy\"
                  value=\"ltb\"
                  checked={strategyType === 'ltb'}
                  onChange={(e) => e.target.checked && setStrategyType('ltb')}
                  className=\"mt-1\"
                />
                <div className=\"flex-1\">
                  <div className=\"font-medium text-foreground\">
                    Use Left to budget ({formatCurrency(leftToBudget)}) first
                  </div>
                  <div className=\"text-sm text-muted-foreground mt-1\">
                    Recent income that hasn't been allocated yet
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Smart Split (Recommended) */}
          <div className=\"border rounded-lg p-4\">
            <label className=\"flex items-start gap-3 cursor-pointer\">
              <input
                type=\"radio\"
                name=\"funding-strategy\"
                value=\"smart_split\"
                checked={strategyType === 'smart_split'}
                onChange={(e) => e.target.checked && setStrategyType('smart_split')}
                className=\"mt-1\"
              />
              <div className=\"flex-1\">
                <div className=\"flex items-center gap-2\">
                  <span className=\"font-medium text-foreground\">
                    Split from flexible categories
                  </span>
                  <Badge variant=\"secondary\" className=\"text-xs\">Recommended</Badge>
                </div>
                {smartSplitSuggestions.length > 0 && (
                  <div className=\"text-sm text-muted-foreground mt-2 space-y-1\">
                    {smartSplitSuggestions.slice(0, 3).map(suggestion => (
                      <div key={suggestion.category.id} className=\"flex items-center justify-between\">
                        <span>{suggestion.category.name}</span>
                        <span className=\"font-mono\">-{formatCurrency(suggestion.suggestedAmount)}</span>
                      </div>
                    ))}
                    {smartSplitSuggestions.length > 3 && (
                      <div className=\"text-xs text-muted-foreground\">
                        +{smartSplitSuggestions.length - 3} more categories
                      </div>
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className=\"text-xs text-blue-600 hover:text-blue-700 cursor-help\">
                          Why these? ↗
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Chosen for largest headroom and lower priority this month</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Single Category */}
          <div className=\"border rounded-lg p-4\">
            <label className=\"flex items-start gap-3 cursor-pointer\">
              <input
                type=\"radio\"
                name=\"funding-strategy\"
                value=\"single\"
                checked={strategyType === 'single'}
                onChange={(e) => e.target.checked && setStrategyType('single')}
                className=\"mt-1\"
              />
              <div className=\"flex-1\">
                <div className=\"font-medium text-foreground mb-2\">
                  Choose one category…
                </div>
                {strategyType === 'single' && (
                  <div className=\"space-y-2 max-h-32 overflow-y-auto\">
                    {donorSuggestions.map(suggestion => {
                      const headroom = suggestion.headroom
                      return (
                        <label
                          key={suggestion.category.id}
                          className=\"flex items-center gap-2 p-2 rounded border hover:bg-muted/50 cursor-pointer\"
                        >
                          <input
                            type=\"radio\"
                            name=\"single-donor\"
                            value={suggestion.category.id}
                            checked={selectedDonor === suggestion.category.id}
                            onChange={(e) => setSelectedDonor(e.target.value)}
                          />
                          <span className=\"flex-1\">{suggestion.category.name}</span>
                          <Badge variant=\"outline\" className=\"text-xs\">
                            {formatCurrency(headroom)} headroom
                          </Badge>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Manual Split */}
          <div className=\"border rounded-lg p-4\">
            <label className=\"flex items-start gap-3 cursor-pointer\">
              <input
                type=\"radio\"
                name=\"funding-strategy\"
                value=\"manual\"
                checked={strategyType === 'manual'}
                onChange={(e) => e.target.checked && setStrategyType('manual')}
                className=\"mt-1\"
              />
              <div className=\"flex-1\">
                <div className=\"font-medium text-foreground mb-2\">
                  Choose multiple…
                </div>
                {strategyType === 'manual' && (
                  <div className=\"space-y-3\">
                    <div className=\"max-h-32 overflow-y-auto space-y-2\">
                      {donorSuggestions.map(suggestion => {
                        const currentAmount = manualSplits[suggestion.category.id] || 0
                        const maxAmount = suggestion.headroom
                        return (
                          <div key={suggestion.category.id} className=\"flex items-center gap-2 p-2 rounded border\">
                            <Checkbox
                              checked={currentAmount > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  const suggestedAmount = Math.min(maxAmount, fundingAmount - Object.values(manualSplits).reduce((a, b) => a + b, 0))
                                  setManualSplits(prev => ({
                                    ...prev,
                                    [suggestion.category.id]: suggestedAmount
                                  }))
                                } else {
                                  setManualSplits(prev => {
                                    const newSplits = { ...prev }
                                    delete newSplits[suggestion.category.id]
                                    return newSplits
                                  })
                                }
                              }}
                            />
                            <span className=\"flex-1 text-sm\">{suggestion.category.name}</span>
                            <Input
                              type=\"number\"
                              step=\"0.01\"
                              min=\"0\"
                              max={maxAmount}
                              value={currentAmount}
                              onChange={(e) => {
                                const amount = Math.min(parseFloat(e.target.value) || 0, maxAmount)
                                setManualSplits(prev => ({
                                  ...prev,
                                  [suggestion.category.id]: amount
                                }))
                              }}
                              className=\"w-20 h-8 text-xs\"
                              disabled={currentAmount === 0}
                            />
                            <span className=\"text-xs text-muted-foreground w-16\">
                              /{formatCurrency(maxAmount)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className=\"flex justify-between text-sm\">
                      <span>Total allocated:</span>
                      <span className=\"font-mono\">{formatCurrency(currentStrategy.totalAmount)}</span>
                    </div>
                    <div className=\"flex justify-between text-sm text-muted-foreground\">
                      <span>Remaining to allocate:</span>
                      <span className=\"font-mono\">{formatCurrency(Math.max(0, fundingAmount - currentStrategy.totalAmount))}</span>
                    </div>
                  </div>
                )}
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Impact Message */}
      <div className=\"p-3 bg-blue-50 border border-blue-200 rounded-lg\">
        <div className=\"flex items-start gap-2\">
          <Info className=\"h-4 w-4 text-blue-600 mt-0.5 shrink-0\" />
          <div className=\"text-sm\">
            <div className=\"font-medium text-blue-800 mb-1\">Impact</div>
            <div className=\"text-blue-700\">
              Total Available to Spend stays {formatCurrency(availableToSpend)}. 
              {currentStrategy.totalAmount > 0 && (
                <span> We'll move {formatCurrency(currentStrategy.totalAmount)} to <strong>{categoryName}</strong>.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className=\"flex gap-3\">
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm || isLoading}
          className=\"flex-1\"
        >
          Create & reallocate
        </Button>
        <Button
          variant=\"outline\"
          onClick={onSkipFunding}
          disabled={isLoading}
        >
          Skip for now
        </Button>
      </div>
    </div>
  )
}