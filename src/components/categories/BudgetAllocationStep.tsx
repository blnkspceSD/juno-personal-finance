/**
 * Budget Allocation Step
 * Handle funding allocation for new categories
 */

'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, DollarSign, Loader2, TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CategoryWithGroup, Budget, CategoryReallocationForm, DonorSuggestion } from '@/lib/types/database'

interface BudgetAllocationStepProps {
  categories: CategoryWithGroup[]
  currentBudget: Budget
  targetAmount: number
  targetCategoryName: string
  onAllocate: (reallocations: CategoryReallocationForm[]) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

type FundingStrategy = 'smart' | 'manual' | 'single'

export function BudgetAllocationStep({
  categories,
  currentBudget,
  targetAmount,
  targetCategoryName,
  onAllocate,
  onCancel,
  isSubmitting
}: BudgetAllocationStepProps) {
  const [strategy, setStrategy] = useState<FundingStrategy>('smart')
  const [donorSuggestions, setDonorSuggestions] = useState<DonorSuggestion[]>([])
  const [selectedDonor, setSelectedDonor] = useState<string>('')
  const [manualAllocations, setManualAllocations] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Calculate available categories with headroom
  const availableCategories = useMemo(() => {
    return categories
      .filter(cat => !cat.archived_at && cat.allocated > cat.spent)
      .map(cat => ({
        ...cat,
        headroom: cat.allocated - cat.spent,
        utilizationRate: cat.allocated > 0 ? cat.spent / cat.allocated : 0
      }))
      .sort((a, b) => b.headroom - a.headroom)
  }, [categories])

  // Load donor suggestions on mount
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const response = await fetch(
          `/api/budget/suggestions?budget_id=${currentBudget.id}&amount=${targetAmount}`
        )
        
        if (response.ok) {
          const { data } = await response.json()
          setDonorSuggestions(data.suggested_donors || [])
        } else {
          console.warn('Donor suggestions API failed, using fallback')
          // Use fallback: create simple suggestions from available categories
          const fallbackSuggestions = availableCategories.slice(0, 3).map(cat => ({
            category_id: cat.id,
            category_name: cat.name,
            available_amount: cat.headroom,
            utilization_rate: cat.utilizationRate,
            confidence_score: 0.7,
            reasoning: [`Has ${formatCurrency(cat.headroom)} available`]
          }))
          setDonorSuggestions(fallbackSuggestions)
        }
      } catch (error) {
        console.error('Error loading donor suggestions:', error)
        // Use fallback: create simple suggestions from available categories  
        const fallbackSuggestions = availableCategories.slice(0, 3).map(cat => ({
          category_id: cat.id,
          category_name: cat.name,
          available_amount: cat.headroom,
          utilization_rate: cat.utilizationRate,
          confidence_score: 0.7,
          reasoning: [`Has ${formatCurrency(cat.headroom)} available`]
        }))
        setDonorSuggestions(fallbackSuggestions)
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [currentBudget.id, targetAmount, availableCategories])

  // Calculate total manual allocation
  const totalManualAllocation = useMemo(() => {
    return Object.values(manualAllocations).reduce((sum, amount) => sum + amount, 0)
  }, [manualAllocations])

  // Handle manual allocation change
  const handleManualAllocationChange = (categoryId: string, amount: string) => {
    const numAmount = parseFloat(amount) || 0
    setManualAllocations(prev => ({
      ...prev,
      [categoryId]: numAmount
    }))
  }

  // Handle allocation submission
  const handleSubmit = async () => {
    setError('')
    
    try {
      const reallocations: CategoryReallocationForm[] = []
      
      if (strategy === 'smart') {
        // Use the top donor suggestion
        const topDonor = donorSuggestions[0]
        if (topDonor && topDonor.available_amount >= targetAmount) {
          reallocations.push({
            from_category_id: topDonor.category_id,
            amount: targetAmount,
            reason: `Smart allocation to fund "${targetCategoryName}"`,
            allocation_type: 'automatic'
          })
        } else {
          setError('No suitable donor found for smart allocation')
          return
        }
      } else if (strategy === 'single' && selectedDonor) {
        // Single donor allocation
        const donor = availableCategories.find(cat => cat.id === selectedDonor)
        if (donor && donor.headroom >= targetAmount) {
          reallocations.push({
            from_category_id: selectedDonor,
            amount: targetAmount,
            reason: `Single donor allocation to fund "${targetCategoryName}"`,
            allocation_type: 'manual'
          })
        } else {
          setError('Selected donor has insufficient funds')
          return
        }
      } else if (strategy === 'manual') {
        // Manual allocation from multiple sources
        if (Math.abs(totalManualAllocation - targetAmount) > 0.01) {
          setError(`Total allocation (${formatCurrency(totalManualAllocation)}) must equal ${formatCurrency(targetAmount)}`)
          return
        }
        
        Object.entries(manualAllocations).forEach(([categoryId, amount]) => {
          if (amount > 0) {
            reallocations.push({
              from_category_id: categoryId,
              amount,
              reason: `Manual allocation to fund "${targetCategoryName}"`,
              allocation_type: 'manual'
            })
          }
        })
      }

      if (reallocations.length === 0) {
        setError('Please select a funding source')
        return
      }

      await onAllocate(reallocations)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to allocate budget')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <span className="ml-2 text-gray-600">Analyzing budget options...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Funding Amount Summary */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-blue-600" />
          <span className="font-semibold text-blue-900">
            Need to allocate: {formatCurrency(targetAmount)}
          </span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          Choose how to fund your new "{targetCategoryName}" category
        </p>
      </div>

      {/* Funding Strategy Selection */}
      <div className="space-y-4">
        <Label className="text-base font-semibold">Funding Strategy</Label>
        <RadioGroup value={strategy} onValueChange={(value: FundingStrategy) => setStrategy(value)}>
          {/* Smart Allocation */}
          {donorSuggestions.length > 0 && (
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="smart" id="smart" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="smart" className="cursor-pointer">
                  Smart Allocation (Recommended)
                </Label>
                <p className="text-sm text-gray-600 mt-1">
                  Use "{donorSuggestions[0]?.category_name}" which has {formatCurrency(donorSuggestions[0]?.available_amount)} available
                </p>
                <div className="mt-2 p-2 bg-green-50 rounded border border-green-200">
                  <div className="text-sm text-green-800">
                    <TrendingUp className="h-4 w-4 inline mr-1" />
                    {Math.round(donorSuggestions[0]?.confidence_score * 100)}% confidence - {donorSuggestions[0]?.reasoning[0]}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Single Donor */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="single" id="single" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="single" className="cursor-pointer">
                Single Donor
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Choose one category to fund the entire amount
              </p>
              {strategy === 'single' && (
                <div className="mt-3 space-y-2">
                  <Label>Select donor category:</Label>
                  <RadioGroup value={selectedDonor} onValueChange={setSelectedDonor}>
                    {availableCategories
                      .filter(cat => cat.headroom >= targetAmount)
                      .map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-2">
                          <RadioGroupItem value={cat.id} id={cat.id} />
                          <Label htmlFor={cat.id} className="cursor-pointer flex-1">
                            <div className="flex justify-between items-center">
                              <span>{cat.name}</span>
                              <span className="text-sm text-gray-600">
                                {formatCurrency(cat.headroom)} available
                              </span>
                            </div>
                          </Label>
                        </div>
                      ))}
                  </RadioGroup>
                  {availableCategories.filter(cat => cat.headroom >= targetAmount).length === 0 && (
                    <p className="text-sm text-amber-600">
                      No single category has enough available budget
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Manual Allocation */}
          <div className="flex items-start space-x-2">
            <RadioGroupItem value="manual" id="manual" className="mt-1" />
            <div className="flex-1">
              <Label htmlFor="manual" className="cursor-pointer">
                Manual Split
              </Label>
              <p className="text-sm text-gray-600 mt-1">
                Manually allocate amounts from multiple categories
              </p>
              {strategy === 'manual' && (
                <div className="mt-3 space-y-3">
                  {availableCategories.slice(0, 6).map((cat) => (
                    <div key={cat.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Label className="text-sm">{cat.name}</Label>
                        <p className="text-xs text-gray-600">
                          {formatCurrency(cat.headroom)} available
                        </p>
                      </div>
                      <div className="w-24">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          max={cat.headroom}
                          value={manualAllocations[cat.id] || ''}
                          onChange={(e) => handleManualAllocationChange(cat.id, e.target.value)}
                          placeholder="0.00"
                          className="text-sm"
                        />
                      </div>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center text-sm font-semibold">
                    <span>Total:</span>
                    <span className={totalManualAllocation === targetAmount ? 'text-green-600' : 'text-red-600'}>
                      {formatCurrency(totalManualAllocation)} / {formatCurrency(targetAmount)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RadioGroup>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Create & Fund Category'
          )}
        </Button>
      </div>
    </div>
  )
}