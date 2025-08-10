/**
 * Inline Transaction Editor Component
 * Compact version of TransactionForm optimized for table/card contexts
 * Supports inline editing with smart category suggestions and real-time validation
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AlertCircle, Check, Loader2, X, Save } from 'lucide-react'
import { formatCurrency, getCurrencyClasses } from '@/lib/utils/currency'
import { SmartCategoryDropdown } from '@/components/forms/SmartCategoryDropdown'
import type { Category, Transaction, UpdateTransactionForm } from '@/lib/types/database'

interface FormErrors {
  amount?: string
  description?: string
  category_id?: string
  date?: string
  general?: string
}

interface InlineTransactionEditorProps {
  transaction: Transaction & { category: Category }
  categories: Category[]
  onSave: (data: UpdateTransactionForm) => Promise<void>
  onCancel: () => void
  onCategoryCreate?: (name: string) => Promise<string | null>
  userId?: string
  autoFocus?: boolean
  compact?: boolean
  allowCategoryCreation?: boolean
}

interface FormState {
  amount: string
  description: string
  category_id: string
  date: string
}

export function InlineTransactionEditor({
  transaction,
  categories,
  onSave,
  onCancel,
  onCategoryCreate,
  userId,
  autoFocus = true,
  compact = false,
  allowCategoryCreation = false
}: InlineTransactionEditorProps) {
  const [formData, setFormData] = useState<FormState>({
    amount: transaction.amount.toString(),
    description: transaction.description,
    category_id: transaction.category_id,
    date: transaction.date
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs for focus management
  const amountRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)

  // Auto-focus first field on mount
  useEffect(() => {
    if (autoFocus && amountRef.current) {
      amountRef.current.focus()
      amountRef.current.select()
    }
  }, [autoFocus])

  // Handle Escape key to cancel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onCancel])

  const validateField = (name: keyof FormState, value: string): string | undefined => {
    switch (name) {
      case 'amount':
        const numValue = parseFloat(value)
        if (!value.trim()) return 'Amount is required'
        if (isNaN(numValue)) return 'Please enter a valid number'
        if (numValue <= 0) return 'Amount must be greater than 0'
        if (numValue > 999999.99) return 'Amount is too large'
        if (!/^\d+(\.\d{1,2})?$/.test(value)) return 'Amount must have at most 2 decimal places'
        return undefined

      case 'description':
        if (!value.trim()) return 'Description is required'
        if (value.length > 255) return 'Description must be 255 characters or less'
        return undefined

      case 'category_id':
        if (!value) return 'Please select a category'
        if (!categories.find(c => c.id === value)) return 'Invalid category selected'
        return undefined

      case 'date':
        if (!value) return 'Date is required'
        const date = new Date(value)
        const now = new Date()
        if (isNaN(date.getTime())) return 'Please enter a valid date'
        if (date > now) return 'Date cannot be in the future'
        return undefined

      default:
        return undefined
    }
  }

  const handleFieldChange = (name: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Real-time validation for amount
    if (name === 'amount' && touched.amount) {
      const error = validateField(name, value)
      if (error) {
        setErrors(prev => ({ ...prev, [name]: error }))
      }
    }
  }

  const handleFieldBlur = (name: keyof FormState) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    const value = formData[name]
    const error = validateField(name, value)
    
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      const fieldName = key as keyof FormState
      const error = validateField(fieldName, formData[fieldName])
      if (error) {
        newErrors[fieldName] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (isSubmitting) return
    
    // Mark all fields as touched for error display
    setTouched({
      amount: true,
      description: true,
      category_id: true,
      date: true
    })

    if (!validateForm()) {
      // Focus first field with error
      const fieldOrder = ['amount', 'description', 'category_id', 'date']
      for (const fieldName of fieldOrder) {
        if (errors[fieldName as keyof FormErrors]) {
          const ref = {
            amount: amountRef,
            description: descriptionRef,
            date: dateRef
          }[fieldName]
          ref?.current?.focus()
          break
        }
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      const saveData: UpdateTransactionForm = {
        id: transaction.id,
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category_id: formData.category_id,
        date: formData.date
      }

      await onSave(saveData)
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === formData.category_id)
  const remaining = selectedCategory ? selectedCategory.allocated - selectedCategory.spent : 0
  const wouldOverspend = selectedCategory && parseFloat(formData.amount || '0') > remaining

  const isFormDisabled = isSubmitting

  // Handle Enter key navigation and save
  const handleKeyDown = (e: React.KeyboardEvent, currentField: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      
      switch (currentField) {
        case 'amount':
          descriptionRef.current?.focus()
          break
        case 'description':
          // Focus will be handled by category dropdown
          break
        case 'date':
          handleSave()
          break
        default:
          break
      }
    }
  }

  if (compact) {
    // Compact table row layout
    return (
      <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
        {/* Amount */}
        <div className="w-24">
          <Input
            ref={amountRef}
            type="number"
            step="0.01"
            min="0.01"
            max="999999.99"
            value={formData.amount}
            onChange={(e) => handleFieldChange('amount', e.target.value)}
            onBlur={() => handleFieldBlur('amount')}
            onKeyDown={(e) => handleKeyDown(e, 'amount')}
            className={`text-sm ${getCurrencyClasses()} ${errors.amount ? 'border-red-500' : ''}`}
            disabled={isFormDisabled}
          />
        </div>

        {/* Description */}
        <div className="flex-1 min-w-32">
          <Input
            ref={descriptionRef}
            type="text"
            maxLength={255}
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => handleFieldBlur('description')}
            onKeyDown={(e) => handleKeyDown(e, 'description')}
            placeholder="Description"
            className={`text-sm ${errors.description ? 'border-red-500' : ''}`}
            disabled={isFormDisabled}
          />
        </div>

        {/* Category */}
        <div className="w-40">
          <SmartCategoryDropdown
            categories={categories}
            selectedCategoryId={formData.category_id}
            onCategorySelect={(categoryId) => {
              handleFieldChange('category_id', categoryId)
              setTimeout(() => dateRef.current?.focus(), 100)
            }}
            allowInlineFunding={false}
            onCategoryCreate={undefined}
            userId={userId || ''}
            transactionDescription={formData.description}
            transactionAmount={parseFloat(formData.amount) || undefined}
            transactionDate={formData.date ? new Date(formData.date) : undefined}
            disabled={isFormDisabled}
            allowCreate={false}
            showUsageStats={false}
            placeholder="Category..."
            error={touched.category_id ? errors.category_id : undefined}
            className="text-sm"
          />
        </div>

        {/* Date */}
        <div className="w-32">
          <Input
            ref={dateRef}
            type="date"
            max={new Date().toISOString().split('T')[0]}
            value={formData.date}
            onChange={(e) => handleFieldChange('date', e.target.value)}
            onBlur={() => handleFieldBlur('date')}
            onKeyDown={(e) => handleKeyDown(e, 'date')}
            className={`text-sm ${errors.date ? 'border-red-500' : ''}`}
            disabled={isFormDisabled}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isFormDisabled || Object.keys(errors).length > 0}
            className="h-8 w-8 p-0"
          >
            {isSubmitting ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={onCancel}
            disabled={isFormDisabled}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Error indicator */}
        {Object.keys(errors).length > 0 && (
          <div className="text-red-500">
            <AlertCircle className="h-4 w-4" />
          </div>
        )}
      </div>
    )
  }

  // Full card layout for cards
  return (
    <div className="space-y-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      {/* First Row: Amount and Date */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Amount
          </label>
          <div className="relative">
            <Input
              ref={amountRef}
              type="number"
              step="0.01"
              min="0.01"
              max="999999.99"
              value={formData.amount}
              onChange={(e) => handleFieldChange('amount', e.target.value)}
              onBlur={() => handleFieldBlur('amount')}
              onKeyDown={(e) => handleKeyDown(e, 'amount')}
              className={`${getCurrencyClasses()} ${errors.amount ? 'border-red-500' : ''}`}
              disabled={isFormDisabled}
            />
            {touched.amount && !errors.amount && formData.amount && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {touched.amount && errors.amount && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.amount}
            </div>
          )}
        </div>

        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Date
          </label>
          <div className="relative">
            <Input
              ref={dateRef}
              type="date"
              max={new Date().toISOString().split('T')[0]}
              value={formData.date}
              onChange={(e) => handleFieldChange('date', e.target.value)}
              onBlur={() => handleFieldBlur('date')}
              onKeyDown={(e) => handleKeyDown(e, 'date')}
              className={errors.date ? 'border-red-500' : ''}
              disabled={isFormDisabled}
            />
            {touched.date && !errors.date && formData.date && (
              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
            )}
          </div>
          {touched.date && errors.date && (
            <div className="flex items-center mt-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errors.date}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Description
        </label>
        <div className="relative">
          <Input
            ref={descriptionRef}
            type="text"
            maxLength={255}
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            onBlur={() => handleFieldBlur('description')}
            onKeyDown={(e) => handleKeyDown(e, 'description')}
            placeholder="Transaction description"
            className={errors.description ? 'border-red-500' : ''}
            disabled={isFormDisabled}
          />
          {touched.description && !errors.description && formData.description && (
            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        {touched.description && errors.description && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.description}
          </div>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-medium text-gray-700 mb-1 block">
          Category
        </label>
        <div className="relative">
          <SmartCategoryDropdown
            categories={categories}
            selectedCategoryId={formData.category_id}
            onCategorySelect={(categoryId) => handleFieldChange('category_id', categoryId)}
            allowInlineFunding={false}
            onCategoryCreate={undefined}
            userId={userId || ''}
            transactionDescription={formData.description}
            transactionAmount={parseFloat(formData.amount) || undefined}
            transactionDate={formData.date ? new Date(formData.date) : undefined}
            disabled={isFormDisabled}
            allowCreate={false}
            showUsageStats={true}
            error={touched.category_id ? errors.category_id : undefined}
            className="w-full"
          />
          {touched.category_id && !errors.category_id && formData.category_id && (
            <Check className="absolute right-8 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />
          )}
        </div>
        {touched.category_id && errors.category_id && (
          <div className="flex items-center mt-1 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            {errors.category_id}
          </div>
        )}
        {/* Budget warning */}
        {wouldOverspend && (
          <div className="flex items-center mt-1 text-sm text-orange-600">
            <AlertCircle className="h-4 w-4 mr-1" />
            This would exceed the category budget by {formatCurrency(parseFloat(formData.amount || '0') - remaining)}
          </div>
        )}
      </div>

      {/* General Error Message */}
      {errors.general && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {errors.general}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSave}
          disabled={isFormDisabled || Object.keys(errors).length > 0}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isFormDisabled}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  )
}