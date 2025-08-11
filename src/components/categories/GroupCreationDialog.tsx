/**
 * Group Creation Dialog
 * Simple dialog for creating category groups
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, Check, Loader2 } from 'lucide-react'
import { CategoryColorPicker } from './CategoryColorPicker'
import type { CategoryGroup, CreateCategoryGroupForm } from '@/lib/types/database'

interface GroupCreationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  existingGroups: CategoryGroup[]
  userId: string
}

interface FormData {
  name: string
  description: string
  color: string
  icon: string
}

interface FormErrors {
  name?: string
  general?: string
}

export function GroupCreationDialog({
  open,
  onOpenChange,
  existingGroups,
  userId
}: GroupCreationDialogProps) {
  const router = useRouter()
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    color: '#6366f1',
    icon: ''
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens/closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setFormData({
        name: '',
        description: '',
        color: '#6366f1',
        icon: ''
      })
      setErrors({})
      setIsSubmitting(false)
    }
    onOpenChange(open)
  }

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Group name must be 100 characters or less'
    } else if (existingGroups.some(group => group.name.toLowerCase() === formData.name.trim().toLowerCase())) {
      newErrors.name = 'A group with this name already exists'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm() || isSubmitting) return

    setIsSubmitting(true)
    
    try {
      const groupData: CreateCategoryGroupForm = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        color: formData.color,
        icon: formData.icon.trim() || undefined
      }

      const response = await fetch('/api/category-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create category group')
      }

      // Success - close dialog and refresh
      handleOpenChange(false)
      router.refresh()
    } catch (error) {
      console.error('Error creating category group:', error)
      setErrors({
        general: error instanceof Error ? error.message : 'An unexpected error occurred'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create Category Group</DialogTitle>
          <DialogDescription>
            Organize your categories by creating groups like "Bills", "Lifestyle", or "Goals".
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bills, Lifestyle, Goals"
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

          {/* Group Description */}
          <div className="space-y-2">
            <Label htmlFor="groupDescription">Description (Optional)</Label>
            <Textarea
              id="groupDescription"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this group..."
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
              <Label htmlFor="groupIcon">Icon (Optional)</Label>
              <Input
                id="groupIcon"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                placeholder="📋"
                maxLength={10}
              />
            </div>
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
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
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
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}