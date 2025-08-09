/**
 * Enhanced Transaction Form Component
 * Provides improved validation, input types, visual feedback, and form state management
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { formatCurrency, getCurrencyClasses } from '@/lib/utils/currency'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import { useFormPersistence } from '@/lib/hooks/useFormPersistence'
import { Tooltip } from '@/components/ui/tooltip'
import { SmartCategoryDropdown } from '@/components/forms/SmartCategoryDropdown'
import type { Category, CreateTransactionForm } from '@/lib/types/database'

interface FormErrors {
  amount?: string
  description?: string
  category_id?: string
  date?: string
  general?: string
}

interface TransactionFormProps {
  categories: Category[]
  onSubmit: (data: CreateTransactionForm) => Promise<void>
  onCancel?: () => void
  initialData?: Partial<CreateTransactionForm>
  loading?: boolean
  submitLabel?: string
  showNotes?: boolean
  autoFocus?: boolean
  persistenceKey?: string
  enablePersistence?: boolean
  userId?: string
  onCategoryCreate?: (name: string) => Promise<string | null>
  allowCategoryCreation?: boolean
}

interface FormState {
  amount: string
  description: string
  category_id: string
  date: string
  notes: string
}

const initialFormState: FormState = {
  amount: '',
  description: '',
  category_id: '',
  date: new Date().toISOString().split('T')[0],
  notes: ''
}

export function TransactionForm({
  categories,
  onSubmit,
  onCancel,
  initialData,
  loading = false,
  submitLabel = 'Add Transaction',
  showNotes = false,
  autoFocus = true,
  persistenceKey = 'transaction-form',
  enablePersistence = true,
  userId,
  onCategoryCreate,
  allowCategoryCreation = false
}: TransactionFormProps) {
  const [formData, setFormData] = useState<FormState>(() => ({
    ...initialFormState,
    ...initialData,
    amount: initialData?.amount?.toString() || '',
    date: initialData?.date || new Date().toISOString().split('T')[0]
  }))
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form persistence
  const {
    hasUnsavedChanges,
    isAutoSaving,
    lastSaved,
    saveForm,
    clearForm,
    resetForm,
    undo,
    redo,
    canUndo,
    canRedo
  } = useFormPersistence(formData, setFormData, {
    key: persistenceKey,
    enabled: enablePersistence,
    autoSaveDelay: 3000,
    maxHistorySteps: 20,
    exclude: [] // Don't exclude any fields for now
  })

  // Refs for focus management
  const amountRef = useRef<HTMLInputElement>(null)
  const descriptionRef = useRef<HTMLInputElement>(null)
  const categoryRef = useRef<HTMLSelectElement>(null)
  const dateRef = useRef<HTMLInputElement>(null)
  const notesRef = useRef<HTMLInputElement>(null)

  // Auto-focus first field on mount
  useEffect(() => {
    if (autoFocus && amountRef.current) {
      amountRef.current.focus()
    }
  }, [autoFocus])

  // Set default category if none selected
  useEffect(() => {
    if (categories.length > 0 && !formData.category_id) {
      setFormData(prev => ({
        ...prev,
        category_id: categories[0].id
      }))
    }
  }, [categories, formData.category_id])

  // Handle page refresh/navigation warnings
  useEffect(() => {
    if (!enablePersistence) return

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?'
        return e.returnValue
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [enablePersistence, hasUnsavedChanges])

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

      case 'notes':
        if (value.length > 1000) return 'Notes must be 1000 characters or less'
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

    // Real-time validation for amount (with debounce effect via touched state)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (loading || isSubmitting) return
    
    // Mark all fields as touched for error display
    setTouched({
      amount: true,
      description: true,
      category_id: true,
      date: true,
      notes: true
    })

    if (!validateForm()) {
      // Focus first field with error
      const fieldOrder = ['amount', 'description', 'category_id', 'date', 'notes']
      for (const fieldName of fieldOrder) {
        if (errors[fieldName as keyof FormErrors]) {
          const ref = {
            amount: amountRef,
            description: descriptionRef,
            category_id: categoryRef,
            date: dateRef,
            notes: notesRef
          }[fieldName]
          ref?.current?.focus()
          break
        }
      }
      return
    }

    setIsSubmitting(true)
    
    try {
      const submitData: CreateTransactionForm = {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        category_id: formData.category_id,
        date: formData.date
      }

      await onSubmit(submitData)
      
      // Clear form persistence on successful submission
      if (enablePersistence) {
        clearForm()
        setErrors({})
        setTouched({})
      }
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find(c => c.id === formData.category_id)
  const remaining = selectedCategory ? selectedCategory.allocated - selectedCategory.spent : 0
  const wouldOverspend = selectedCategory && parseFloat(formData.amount || '0') > remaining

  const isFormDisabled = loading || isSubmitting

  // Keyboard shortcut handlers
  const handleKeyboardSave = useCallback(async (event: KeyboardEvent) => {
    // Only trigger if we're not in a text input or if Ctrl/Cmd+S is pressed
    const target = event.target as HTMLElement
    const isInTextInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'
    
    if (event.key === 's' && (event.ctrlKey || event.metaKey)) {
      // Ctrl/Cmd+S always saves
      event.preventDefault()
      if (!isFormDisabled && validateForm()) {
        const submitEvent = new Event('submit', { cancelable: true, bubbles: true }) as any
        submitEvent.preventDefault = () => {}
        await handleSubmit(submitEvent)
      }
    } else if (event.key === 'Enter' && !isInTextInput) {
      // Enter saves only when not in an input field
      event.preventDefault()
      if (!isFormDisabled && validateForm()) {
        const submitEvent = new Event('submit', { cancelable: true, bubbles: true }) as any
        submitEvent.preventDefault = () => {}
        await handleSubmit(submitEvent)
      }
    }
  }, [isFormDisabled, validateForm, handleSubmit])

  const handleKeyboardCancel = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (onCancel) {
        onCancel()
      } else {
        // Clear the form using persistence hook
        clearForm()
        setErrors({})
        setTouched({})
        // Focus first field
        if (amountRef.current) {
          amountRef.current.focus()
        }
      }
    }
  }, [onCancel, clearForm])

  const handleKeyboardUndo = useCallback((event: KeyboardEvent) => {
    if ((event.key === 'z' || event.key === 'Z') && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      if (event.shiftKey) {
        // Ctrl/Cmd+Shift+Z = Redo
        if (canRedo) {
          redo()
        }
      } else {
        // Ctrl/Cmd+Z = Undo
        if (canUndo) {
          undo()
        }
      }
    }
  }, [canUndo, canRedo, undo, redo])

  // Register keyboard shortcuts
  useKeyboardShortcuts([
    { key: 's', ctrlKey: true },
    { key: 's', metaKey: true },
    { key: 'Enter' },
    { key: 'Escape' },
    { key: 'z', ctrlKey: true },
    { key: 'z', metaKey: true },
    { key: 'Z', ctrlKey: true, shiftKey: true },
    { key: 'Z', metaKey: true, shiftKey: true }
  ], {
    's': handleKeyboardSave,
    'Enter': handleKeyboardSave,
    'Escape': handleKeyboardCancel,
    'z': handleKeyboardUndo,
    'Z': handleKeyboardUndo
  }, {
    context: 'transaction-form',
    priority: 100,
    enabled: true,
    preventDefault: false // We handle preventDefault in the handlers
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Transaction</CardTitle>
        <CardDescription>
          Add a new expense and assign it to a category. All fields are required except notes.
          <div className="mt-2 text-xs text-gray-500">
            💡 <strong>Keyboard shortcuts:</strong> Enter to move between fields, Ctrl/⌘+S to save, Escape to cancel, Ctrl/⌘+Z to undo
          </div>
          {enablePersistence && (
            <div className="mt-2 text-xs text-gray-600 flex items-center gap-2">
              {isAutoSaving && (
                <span className="flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Auto-saving...
                </span>
              )}
              {hasUnsavedChanges && !isAutoSaving && (
                <span className="text-orange-600">
                  • Unsaved changes
                </span>
              )}
              {lastSaved && !hasUnsavedChanges && (
                <span className="text-green-600">
                  ✓ Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
              {(canUndo || canRedo) && (
                <span className="text-blue-600">
                  ({canUndo ? 'Undo' : ''}{canUndo && canRedo ? ', ' : ''}{canRedo ? 'Redo' : ''} available)
                </span>
              )}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Field */}
          <div>
            <Label htmlFor="amount" className="text-sm font-medium">
              Amount *
            </Label>
            <div className="relative mt-1">
              <Input
                ref={amountRef}
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max="999999.99"
                value={formData.amount}
                onChange={(e) => handleFieldChange('amount', e.target.value)}
                onBlur={() => handleFieldBlur('amount')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    descriptionRef.current?.focus()
                  }
                }}
                placeholder="0.00"
                className={`${getCurrencyClasses()} ${errors.amount ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                disabled={isFormDisabled}
                inputMode="decimal"
                autoComplete="transaction-amount"
                tabIndex={1}
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

          {/* Description Field */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Description *
            </Label>
            <div className="relative mt-1">
              <Input
                ref={descriptionRef}
                id="description"
                type="text"
                maxLength={255}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => handleFieldBlur('description')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    categoryRef.current?.focus()
                  }
                }}
                placeholder="e.g., Grocery shopping at Whole Foods"
                className={errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                disabled={isFormDisabled}
                autoComplete="off"
                tabIndex={2}
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
            <div className="mt-1 text-xs text-gray-500">
              {formData.description.length}/255 characters
            </div>
          </div>

          {/* Category Field */}
          <div>
            <Label htmlFor="category" className="text-sm font-medium">
              Category *
            </Label>
            <div className="relative mt-1">
              <SmartCategoryDropdown
                categories={categories}
                selectedCategoryId={formData.category_id}
                onCategorySelect={(categoryId) => {
                  handleFieldChange('category_id', categoryId)
                  // Auto-advance to next field after selection
                  setTimeout(() => {
                    dateRef.current?.focus()
                  }, 100)
                }}
                onCategoryCreate={onCategoryCreate}
                userId={userId || ''}
                transactionDescription={formData.description}
                transactionAmount={parseFloat(formData.amount) || undefined}
                transactionDate={formData.date ? new Date(formData.date) : undefined}
                disabled={isFormDisabled}
                allowCreate={allowCategoryCreation}
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
                This transaction would exceed the category budget by {formatCurrency(parseFloat(formData.amount || '0') - remaining)}
              </div>
            )}
          </div>

          {/* Date Field */}
          <div>
            <Label htmlFor="date" className="text-sm font-medium">
              Date *
            </Label>
            <div className="relative mt-1">
              <Input
                ref={dateRef}
                id="date"
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.date}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                onBlur={() => handleFieldBlur('date')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (showNotes && notesRef.current) {
                      notesRef.current.focus()
                    } else {
                      // Submit form if no notes field
                      if (!isFormDisabled && validateForm()) {
                        const submitEvent = { preventDefault: () => {} } as React.FormEvent
                        submitEvent.preventDefault = () => {}
                        handleSubmit(submitEvent)
                      }
                    }
                  }
                }}
                className={errors.date ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                disabled={isFormDisabled}
                tabIndex={4}
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

          {/* Optional Notes Field */}
          {showNotes && (
            <div>
              <Label htmlFor="notes" className="text-sm font-medium">
                Notes
              </Label>
              <div className="relative mt-1">
                <Input
                  ref={notesRef}
                  id="notes"
                  type="text"
                  maxLength={1000}
                  value={formData.notes}
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  onBlur={() => handleFieldBlur('notes')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      // Submit form from notes field
                      if (!isFormDisabled && validateForm()) {
                        const submitEvent = { preventDefault: () => {} } as React.FormEvent
                        submitEvent.preventDefault = () => {}
                        handleSubmit(submitEvent)
                      }
                    }
                  }}
                  placeholder="Additional details (optional)"
                  className={errors.notes ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
                  disabled={isFormDisabled}
                  tabIndex={5}
                />
              </div>
              {touched.notes && errors.notes && (
                <div className="flex items-center mt-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.notes}
                </div>
              )}
              <div className="mt-1 text-xs text-gray-500">
                {formData.notes.length}/1000 characters
              </div>
            </div>
          )}

          {/* General Error Message */}
          {errors.general && (
            <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {errors.general}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="space-y-3 pt-4">
            {/* Quick Actions */}
            {enablePersistence && (canUndo || canRedo || hasUnsavedChanges) && (
              <div className="flex gap-2 justify-end">
                {canUndo && (
                  <Tooltip content="Ctrl/⌘+Z to undo" side="top">
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={undo}
                      disabled={isFormDisabled}
                    >
                      ↶ Undo
                    </Button>
                  </Tooltip>
                )}
                {canRedo && (
                  <Tooltip content="Ctrl/⌘+Shift+Z to redo" side="top">
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={redo}
                      disabled={isFormDisabled}
                    >
                      ↷ Redo
                    </Button>
                  </Tooltip>
                )}
                {hasUnsavedChanges && (
                  <Tooltip content="Reset to last saved state" side="top">
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={resetForm}
                      disabled={isFormDisabled}
                    >
                      ↺ Reset
                    </Button>
                  </Tooltip>
                )}
              </div>
            )}

            {/* Main Actions */}
            <div className="flex gap-3">
              <Tooltip content="Ctrl/⌘+S or Enter to save" side="top">
                <Button 
                  type="submit" 
                  disabled={isFormDisabled || Object.keys(errors).length > 0}
                  className="flex-1"
                  tabIndex={showNotes ? 6 : 5}
                >
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {loading && !isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isSubmitting ? 'Saving...' : submitLabel}
                </Button>
              </Tooltip>
              {onCancel && (
                <Tooltip content="Escape to cancel" side="top">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel} 
                    disabled={isFormDisabled}
                    tabIndex={showNotes ? 7 : 6}
                  >
                    Cancel
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}