/**
 * Category Creation Dialog
 * Simple, dedicated dialog for creating new categories with budget allocation
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertCircle, Check, Loader2, Palette } from 'lucide-react'
import { CategoryColorPicker } from './CategoryColorPicker'
import { BudgetAllocationStep } from './BudgetAllocationStep'
import { createClient } from '@/lib/supabase/client'
import type { CategoryGroup, CategoryWithGroup, Budget, CreateCategoryForm, CategoryReallocationForm } from '@/lib/types/database'

interface CategoryCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: CategoryWithGroup[]
  categoryGroups: CategoryGroup[]
  currentBudget: Budget
  userId: string
  preselectedGroupId?: string
}

interface FormData {
  name: string
  description: string
  color: string
  icon: string
  group_id: string
  allocated: string
}

interface FormErrors {
  name?: string
  allocated?: string
  general?: string
}

type CreationStep = 'details' | 'funding' | 'success'

export function CategoryCreationDialog({
  open,
  onOpenChange,
  categories,
  categoryGroups,
  currentBudget,
  userId,
  preselectedGroupId
}: CategoryCreationDialogProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [currentStep, setCurrentStep] = useState<CreationStep>('details')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdCategory, setCreatedCategory] = useState<CategoryWithGroup | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: '#6366f1',
    icon: '',
    group_id: preselectedGroupId || '',
    allocated: '0'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep('details')
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
        icon: '',
        group_id: preselectedGroupId || '',
        allocated: '0'
      })
      setErrors({})
      setCreatedCategory(null)
      setIsSubmitting(false)
    }
    onOpenChange(open)
  }

  // Validation
  const validateDetails = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Category name must be 100 characters or less'
    } else if (categories.some(cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase())) {
      newErrors.name = 'A category with this name already exists'
    }

    const allocatedAmount = parseFloat(formData.allocated)
    if (isNaN(allocatedAmount) || allocatedAmount < 0) {
      newErrors.allocated = 'Please enter a valid amount'
    } else if (allocatedAmount > 999999.99) {
      newErrors.allocated = 'Amount is too large'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission for details step
  const handleDetailsSubmit = () => {
    if (validateDetails()) {
      const allocatedAmount = parseFloat(formData.allocated)
      if (allocatedAmount === 0) {
        // Skip funding step if no allocation needed
        handleCreateCategory([])
      } else {
        // Move to funding step
        setCurrentStep('funding')
      }
    }
  }

  // Handle category creation
  const handleCreateCategory = async (reallocationForms: CategoryReallocationForm[]) => {
    setIsSubmitting(true)
    
    try {
      // Create the category
      const categoryData: CreateCategoryForm = {
        name: formData.name.trim(),
        allocated: parseFloat(formData.allocated),
        color: formData.color,
        description: formData.description.trim() || undefined,
        icon: formData.icon.trim() || undefined,
        group_id: formData.group_id || undefined
      }

      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...categoryData,
          budget_id: currentBudget.id
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category')
      }

      const { data: newCategory } = await response.json()

      // Execute budget reallocations if needed
      for (const reallocation of reallocationForms) {
        const reallocationResponse = await fetch('/api/budget/reallocate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...reallocation,
            to_category_id: newCategory.id
          })
        })

        if (!reallocationResponse.ok) {
          const errorData = await reallocationResponse.json()
          throw new Error(`Failed to allocate budget: ${errorData.error}`)
        }
      }

      setCreatedCategory(newCategory)
      setCurrentStep('success')
    } catch (error) {
      console.error('Error creating category:', error)
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
    router.refresh() // Refresh to show new category
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'details' && 'Create New Category'}
            {currentStep === 'funding' && 'Fund Your Category'}
            {currentStep === 'success' && 'Category Created!'}
          </DialogTitle>
          <DialogDescription>
            {currentStep === 'details' && 'Set up your new spending category with a name, color, and initial budget.'}
            {currentStep === 'funding' && `Choose where to allocate $${parseFloat(formData.allocated || '0').toFixed(2)} for "${formData.name}".`}
            {currentStep === 'success' && 'Your category has been created and is ready to use.'}
          </DialogDescription>
        </DialogHeader>

        {/* Details Step */}
        {currentStep === 'details' && (
          <div className="space-y-4">
            {/* Category Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Food & Dining"
                maxLength={100}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.name}
                </div>
              )}
            </div>

            {/* Category Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category..."
                maxLength={500}
                rows={2}
              />
            </div>

            {/* Color and Icon */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color</Label>
                <CategoryColorPicker
                  selectedColor={formData.color}
                  onColorSelect={(color) => setFormData({ ...formData, color })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (Optional)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="🍽️"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Category Group */}
            <div className="space-y-2">
              <Label>Category Group (Optional)</Label>
              <Select
                value={formData.group_id || 'no-group'}
                onValueChange={(value) => setFormData({ ...formData, group_id: value === 'no-group' ? '' : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-group">No Group</SelectItem>
                  {categoryGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      <div className="flex items-center gap-2">
                        {group.icon && <span>{group.icon}</span>}
                        <span>{group.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Initial Allocation */}
            <div className="space-y-2">
              <Label htmlFor="allocated">Initial Budget Allocation</Label>
              <Input
                id="allocated"
                type="number"
                step="0.01"
                min="0"
                max="999999.99"
                value={formData.allocated}
                onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                placeholder="0.00"
                className={errors.allocated ? 'border-red-500' : ''}
              />
              {errors.allocated && (
                <div className="flex items-center text-sm text-red-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  {errors.allocated}
                </div>
              )}
              <p className="text-sm text-gray-600">
                Enter $0 to create an unfunded category
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
                onClick={handleDetailsSubmit}
                disabled={isSubmitting}
                className="flex-1"
              >
                {parseFloat(formData.allocated || '0') === 0 ? 'Create Category' : 'Next: Fund Category'}
              </Button>
            </div>
          </div>
        )}

        {/* Funding Step */}
        {currentStep === 'funding' && (
          <BudgetAllocationStep
            categories={categories}
            currentBudget={currentBudget}
            targetAmount={parseFloat(formData.allocated)}
            targetCategoryName={formData.name}
            onAllocate={handleCreateCategory}
            onCancel={() => setCurrentStep('details')}
            isSubmitting={isSubmitting}
          />
        )}

        {/* Success Step */}
        {currentStep === 'success' && createdCategory && (
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                "{createdCategory.name}" Created!
              </h3>
              <p className="text-gray-600 mt-1">
                Your new category is ready and has been added to your budget.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Initial Allocation:</span>
                <span className="font-semibold">${createdCategory.allocated.toFixed(2)}</span>
              </div>
              {createdCategory.group_id && (
                <div className="flex items-center justify-between text-sm mt-1">
                  <span className="text-gray-600">Group:</span>
                  <span className="font-semibold">
                    {categoryGroups.find(g => g.id === createdCategory.group_id)?.name}
                  </span>
                </div>
              )}
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