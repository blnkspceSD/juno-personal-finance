/**
 * Category Funding Dialog
 * Allows users to add budget allocation to existing unfunded categories
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, DollarSign, Loader2 } from 'lucide-react'
import { BudgetAllocationStep } from './BudgetAllocationStep'
import type { CategoryWithGroup, Budget, CategoryReallocationForm } from '@/lib/types/database'

interface CategoryFundingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: CategoryWithGroup | null
  categories: CategoryWithGroup[]
  currentBudget: Budget
}

interface FormErrors {
  amount?: string
  general?: string
}

type FundingStep = 'amount' | 'allocation' | 'success'

export function CategoryFundingDialog({
  open,
  onOpenChange,
  category,
  categories,
  currentBudget
}: CategoryFundingDialogProps) {
  const router = useRouter()
  
  const [currentStep, setCurrentStep] = useState<FundingStep>('amount')
  const [fundingAmount, setFundingAmount] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep('amount')
      setFundingAmount('')
      setErrors({})
      setIsSubmitting(false)
    }
    onOpenChange(open)
  }

  // Validation
  const validateAmount = (): boolean => {
    const newErrors: FormErrors = {}

    const amount = parseFloat(fundingAmount)
    if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0'
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

  // Handle funding completion
  const handleFundingComplete = async (reallocationForms: CategoryReallocationForm[]) => {
    if (!category) return

    setIsSubmitting(true)
    
    try {
      // Execute budget reallocations
      for (const reallocation of reallocationForms) {
        const reallocationResponse = await fetch('/api/budget/reallocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...reallocation,
            to_category_id: category.id
          })
        })

        if (!reallocationResponse.ok) {
          const errorData = await reallocationResponse.json()
          throw new Error(`Failed to allocate budget: ${errorData.error}`)
        }
      }

      setCurrentStep('success')
    } catch (error) {
      console.error('Error funding category:', error)
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
    router.refresh() // Refresh to show updated category
  }

  if (!category) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'amount' && `Fund "${category.name}"`}
            {currentStep === 'allocation' && 'Choose Funding Source'}
            {currentStep === 'success' && 'Funding Complete!'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'amount' && 'How much would you like to allocate to this category?'}
            {currentStep === 'allocation' && `Choose where to allocate $${parseFloat(fundingAmount || '0').toFixed(2)} from.`}
            {currentStep === 'success' && 'Your category has been successfully funded.'}
          </DialogDescription>
        </DialogHeader>

        {/* Amount Step */}
        {currentStep === 'amount' && (
          <div className="space-y-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-900">
                  Current allocation: ${category.allocated.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                This category currently has no budget allocation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Funding Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max="999999.99"
                value={fundingAmount}
                onChange={(e) => setFundingAmount(e.target.value)}
                placeholder="0.00"
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.amount}
                </div>
              )}
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
                Next: Choose Source
              </Button>
            </div>
          </div>
        )}

        {/* Allocation Step */}
        {currentStep === 'allocation' && (
          <BudgetAllocationStep
            categories={categories.filter(cat => cat.id !== category.id)}
            currentBudget={currentBudget}
            targetAmount={parseFloat(fundingAmount)}
            targetCategoryName={category.name}
            onAllocate={handleFundingComplete}
            onCancel={() => setCurrentStep('amount')}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Success Step */}
        {currentStep === 'success' && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Funding Added Successfully!
              </h3>
              <p className="text-gray-600 mt-1">
                "${category.name}" now has ${fundingAmount} allocated to it.
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