/**
 * Category Reallocation Dialog
 * Allows users to move budget allocation from funded categories inline
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, ArrowLeftRight, DollarSign } from 'lucide-react'
import { BudgetAllocationStep } from './BudgetAllocationStep'
import { formatCurrency } from '@/lib/utils/currency'
import type { CategoryWithGroup, Budget, CategoryReallocationForm } from '@/lib/types/database'

interface CategoryReallocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sourceCategory: CategoryWithGroup | null
  categories: CategoryWithGroup[]
  currentBudget: Budget
}

interface FormErrors {
  amount?: string
  general?: string
}

type ReallocationStep = 'amount' | 'allocation' | 'success'

export function CategoryReallocationDialog({
  open,
  onOpenChange,
  sourceCategory,
  categories,
  currentBudget
}: CategoryReallocationDialogProps) {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<ReallocationStep>('amount')
  const [reallocationAmount, setReallocationAmount] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep('amount')
      setReallocationAmount('')
      setErrors({})
      setIsSubmitting(false)
    }
    onOpenChange(open)
  }

  // Validation
  const validateAmount = (): boolean => {
    if (!sourceCategory) return false
    
    const newErrors: FormErrors = {}

    const amount = parseFloat(reallocationAmount)
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
    } else if (amount > sourceCategory.allocated) {
      newErrors.amount = `Amount cannot exceed available budget (${formatCurrency(sourceCategory.allocated)})`
    } else if (amount > 999999.99) {
      newErrors.amount = 'Amount is too large'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle amount step submit
  const handleAmountSubmit = () => {
    if (validateAmount()) {
      setCurrentStep('allocation')
    }
  }

  // Handle reallocation completion
  const handleReallocationComplete = async (reallocationForms: CategoryReallocationForm[]) => {
    if (!sourceCategory) return

    setIsSubmitting(true)
    
    try {
      // Execute budget reallocations - first reduce from source
      const sourceReduction = {
        from_category_id: sourceCategory.id,
        to_category_id: null,
        amount: parseFloat(reallocationAmount),
        reason: `Budget reallocation: reducing "${sourceCategory.name}" allocation`,
        allocation_type: 'manual' as const
      }

      // Send source reduction
      const sourceResponse = await fetch('/api/budget/reallocate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sourceReduction)
      })

      if (!sourceResponse.ok) {
        const errorData = await sourceResponse.json()
        throw new Error(`Failed to reduce source budget: ${errorData.error}`)
      }

      // Then allocate to targets
      for (const reallocation of reallocationForms) {
        const targetResponse = await fetch('/api/budget/reallocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...reallocation,
            from_category_id: null, // Coming from unallocated funds now
            reason: `Budget reallocation: from "${sourceCategory.name}" to target category`
          })
        })

        if (!targetResponse.ok) {
          const errorData = await targetResponse.json()
          throw new Error(`Failed to allocate to target: ${errorData.error}`)
        }
      }

      setCurrentStep('success')
    } catch (error) {
      console.error('Error reallocating budget:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle success completion
  const handleSuccessComplete = () => {
    handleOpenChange(false)
    router.refresh() // Refresh to show updated categories
  }

  if (!sourceCategory) return null

  const availableAmount = sourceCategory.allocated
  const spentAmount = sourceCategory.spent
  const transferableAmount = Math.max(0, availableAmount - spentAmount)

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'amount' && `Move Budget from "${sourceCategory.name}"`}
            {currentStep === 'allocation' && 'Choose Destination'}
            {currentStep === 'success' && 'Reallocation Complete!'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'amount' && 'How much budget would you like to move from this category?'}
            {currentStep === 'allocation' && `Choose where to move $${parseFloat(reallocationAmount || '0').toFixed(2)}.`}
            {currentStep === 'success' && 'Your budget has been successfully reallocated.'}
          </DialogDescription>
        </DialogHeader>

        {/* Amount Step */}
        {currentStep === 'amount' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Total Allocated:</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(availableAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Already Spent:</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(spentAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-2">
                  <span className="text-blue-700">Available to Move:</span>
                  <span className="font-semibold text-blue-900">{formatCurrency(transferableAmount)}</span>
                </div>
              </div>
              {transferableAmount < availableAmount && (
                <p className="text-xs text-blue-600 mt-2">
                  💡 You can move the full allocation, but spent amounts will create an overspent category
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Move</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={availableAmount}
                value={reallocationAmount}
                onChange={(e) => setReallocationAmount(e.target.value)}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </div>
              )}
              <p className="text-sm text-gray-600">
                Recommended: ${transferableAmount.toFixed(2)} (unused portion)
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  {errors.general}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAmountSubmit}
                className="flex-1"
              >
                Next: Choose Destination
              </Button>
            </div>
          </div>
        )}

        {/* Allocation Step */}
        {currentStep === 'allocation' && (
          <BudgetAllocationStep
            categories={categories.filter(cat => cat.id !== sourceCategory.id)}
            currentBudget={currentBudget}
            targetAmount={parseFloat(reallocationAmount)}
            targetCategoryName="selected categories"
            onAllocate={handleReallocationComplete}
            onCancel={() => setCurrentStep('amount')}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <ArrowLeftRight className="h-6 w-6 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Budget Moved Successfully!
              </h3>
              <p className="text-gray-600 mt-1">
                ${reallocationAmount} has been moved from "{sourceCategory.name}" to your selected categories.
              </p>
            </div>

            <Button onClick={handleSuccessComplete} className="w-full">
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}