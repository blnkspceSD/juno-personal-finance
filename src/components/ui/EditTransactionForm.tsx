"use client"

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { CategorySelector } from '@/components/ui/CategorySelector'
import { Save, X } from 'lucide-react'
import { TransactionWithCategory } from '@/lib/transactions/queries'
import { EditTransactionData, updateTransaction } from '@/lib/transactions/edit-actions'
import { toast } from '@/lib/utils/toast'

interface EditTransactionFormProps {
  transaction: TransactionWithCategory
  onSave: (updatedTransaction: TransactionWithCategory) => void
  onCancel: () => void
}

interface FormErrors {
  description?: string
  amount?: string
  date?: string
  category_id?: string
}

export function EditTransactionForm({ transaction, onSave, onCancel }: EditTransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  // Store as cents (integer) for calculator-style input
  const [amountCents, setAmountCents] = useState(Math.round(Math.abs(transaction.amount) * 100))
  const [formData, setFormData] = useState<EditTransactionData>({
    description: transaction.description,
    amount: Math.abs(transaction.amount), // Always show positive amount for editing
    date: transaction.date,
    category_id: transaction.category_id,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  // Validation function
  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {}

    // Description validation
    if (!formData.description || formData.description.trim().length === 0) {
      newErrors.description = 'Description is required'
    } else if (formData.description.trim().length > 200) {
      newErrors.description = 'Description must be 200 characters or less'
    }

    // Amount validation
    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else if (formData.amount > 999999.99) {
      newErrors.amount = 'Amount cannot exceed $999,999.99'
    }

    // Date validation
    if (!formData.date) {
      newErrors.date = 'Date is required'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      const hundredYearsAgo = new Date()
      hundredYearsAgo.setFullYear(today.getFullYear() - 100)
      
      if (selectedDate > today) {
        newErrors.date = 'Date cannot be in the future'
      } else if (selectedDate < hundredYearsAgo) {
        newErrors.date = 'Date cannot be more than 100 years ago'
      }
    }

    // Category validation
    if (!formData.category_id || formData.category_id.trim().length === 0) {
      newErrors.category_id = 'Category is required'
    }

    return newErrors
  }, [formData])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form
    const validationErrors = validateForm()
    setErrors(validationErrors)
    
    // Don't submit if there are validation errors
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the errors below')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Convert to negative for expenses (keeping it simple - assuming all are expenses for now)
      const finalAmount = transaction.amount < 0 ? -Math.abs(formData.amount) : Math.abs(formData.amount)
      
      const result = await updateTransaction(transaction.id, {
        ...formData,
        amount: finalAmount,
      })
      
      if (result.success) {
        toast.success('Transaction updated successfully')
        setErrors({}) // Clear errors on success
        onSave({
          ...transaction,
          ...formData,
          amount: finalAmount,
        })
      } else {
        toast.error(result.error || 'Failed to update transaction')
      }
    } catch (error) {
      console.error('Update error:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [formData, transaction, onSave, validateForm])

  const handleInputChange = useCallback((field: keyof EditTransactionData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }, [errors])

  // Format cents as currency string with commas
  const formatAmount = useCallback((cents: number) => {
    const dollars = cents / 100
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(dollars)
  }, [])

  // Handle calculator-style input
  const handleAmountKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault() // Prevent default input behavior
    
    if (e.key >= '0' && e.key <= '9') {
      // Add digit: shift left and add new digit
      const newAmountCents = (amountCents * 10) + parseInt(e.key)
      setAmountCents(newAmountCents)
      setFormData(prev => ({ ...prev, amount: newAmountCents / 100 }))
    } else if (e.key === 'Backspace') {
      // Remove last digit: shift right
      const newAmountCents = Math.floor(amountCents / 10)
      setAmountCents(newAmountCents)
      setFormData(prev => ({ ...prev, amount: newAmountCents / 100 }))
    } else if (e.key === 'Delete' || (e.metaKey && e.key === 'a') || (e.ctrlKey && e.key === 'a')) {
      // Clear all
      setAmountCents(0)
      setFormData(prev => ({ ...prev, amount: 0 }))
    }
    
    // Clear amount error when user types
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }))
    }
  }, [amountCents, errors.amount])

  const handleAmountFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    // Always select all on focus for better UX
    e.target.select()
  }, [])

  return (
    <form onSubmit={handleSubmit} className="space-y-juno-4">
      {/* Description */}
      <div className="space-y-juno-2">
        <label htmlFor="description" className="block text-sm font-medium text-juno-text">
          Description
        </label>
        <input
          id="description"
          type="text"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          className={`w-full px-juno-3 py-juno-2 border rounded-juno-md text-juno-text bg-juno-surface-50 focus:ring-2 focus:ring-juno-focus-ring focus:border-transparent ${
            errors.description ? 'border-red-500' : 'border-juno-border'
          }`}
          placeholder="Enter transaction description"
          required
          disabled={isLoading}
          aria-invalid={!!errors.description}
          aria-describedby={errors.description ? 'description-error' : undefined}
        />
        {errors.description && (
          <p id="description-error" className="text-sm text-red-600 mt-1">
            {errors.description}
          </p>
        )}
      </div>

      {/* Amount and Category Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-juno-4">
        {/* Amount */}
        <div className="space-y-juno-2">
          <label htmlFor="amount" className="block text-sm font-medium text-juno-text">
            Amount
          </label>
          <div className="relative">
            <span className="absolute left-juno-3 top-1/2 -translate-y-1/2 text-juno-muted-fg">$</span>
            <input
              id="amount"
              type="text"
              value={formatAmount(amountCents)}
              onKeyDown={handleAmountKeyDown}
              onFocus={handleAmountFocus}
              className={`w-full pl-juno-8 pr-juno-3 py-juno-2 border rounded-juno-md bg-juno-surface-50 focus:ring-2 focus:ring-juno-focus-ring focus:border-transparent ${
                errors.amount ? 'border-red-500' : 'border-juno-border'
              } ${
                amountCents === 0 ? 'text-gray-400' : 'text-juno-text'
              }`}
              placeholder="0.00"
              required
              disabled={isLoading}
              readOnly
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'amount-error' : undefined}
            />
          </div>
          {errors.amount && (
            <p id="amount-error" className="text-sm text-red-600 mt-1">
              {errors.amount}
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-juno-2">
          <label className="block text-sm font-medium text-juno-text">
            Category
          </label>
          <CategorySelector
            selectedCategoryId={formData.category_id}
            onCategoryChange={(categoryId) => handleInputChange('category_id', categoryId)}
            disabled={isLoading}
            className={errors.category_id ? 'ring-2 ring-red-500' : ''}
          />
          {errors.category_id && (
            <p id="category-error" className="text-sm text-red-600 mt-1">
              {errors.category_id}
            </p>
          )}
        </div>
      </div>

      {/* Date */}
      <div className="space-y-juno-2">
        <label htmlFor="date" className="block text-sm font-medium text-juno-text">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => handleInputChange('date', e.target.value)}
          className={`w-full px-juno-3 py-juno-2 border rounded-juno-md text-juno-text bg-juno-surface-50 focus:ring-2 focus:ring-juno-focus-ring focus:border-transparent ${
            errors.date ? 'border-red-500' : 'border-juno-border'
          }`}
          required
          disabled={isLoading}
          aria-invalid={!!errors.date}
          aria-describedby={errors.date ? 'date-error' : undefined}
        />
        {errors.date && (
          <p id="date-error" className="text-sm text-red-600 mt-1">
            {errors.date}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-juno-3 pt-juno-4">
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isLoading}
          loading={isLoading}
          icon={<Save className="h-4 w-4" />}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={onCancel}
          disabled={isLoading}
          icon={<X className="h-4 w-4" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}