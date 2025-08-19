# Component Design Specification

This is the component design specification for the spec detailed in @.agent-os/specs/2025-08-14-category-group-cards/spec.md

> Created: 2025-08-14
> Version: 1.0.0

## Component Architecture

### Primary Component: CategoryGroupCardsView

```typescript
// Enhanced CategoryGroupCardsView.tsx
'use client'

import { CategoryGroup, CategoryWithGroup, Budget } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { GroupCard } from './GroupCard'
import { GroupManagementModal } from './GroupManagementModal'
import { DefaultGroupSetupWizard } from './DefaultGroupSetupWizard'
import { useState } from 'react'

interface CategoryGroupCardsViewProps {
  groups: CategoryGroupWithProgress[]
  ungroupedCategories: CategoryWithGroup[]
  currentBudget: Budget
  userId: string
  onGroupUpdate: (groupId: string, updates: Partial<CategoryGroup>) => void
  onCategoryReassign: (categoryId: string, newGroupId: string | null) => void
}

export function CategoryGroupCardsView({
  groups,
  ungroupedCategories,
  currentBudget,
  userId,
  onGroupUpdate,
  onCategoryReassign
}: CategoryGroupCardsViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [managementMode, setManagementMode] = useState<'view' | 'edit' | 'setup'>('view')
  const [showSetupWizard, setShowSetupWizard] = useState(groups.length === 0)

  // Sort groups by health status and sort order
  const sortedGroups = [...groups].sort((a, b) => {
    // Prioritize overspent and warning groups
    const statusPriority = { 'overspent': 0, 'warning': 1, 'healthy': 2, 'underfunded': 3 }
    const statusDiff = statusPriority[a.summary.healthStatus] - statusPriority[b.summary.healthStatus]
    
    if (statusDiff !== 0) return statusDiff
    return a.sort_order - b.sort_order
  })

  if (showSetupWizard) {
    return (
      <DefaultGroupSetupWizard
        userId={userId}
        existingCategories={ungroupedCategories}
        onComplete={() => setShowSetupWizard(false)}
      />
    )
  }

  return (
    <div className="space-y-juno-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-juno-fs-lg font-semibold text-juno-text">
            Category Groups
          </h2>
          <p className="text-juno-fs-sm text-juno-muted-fg">
            {groups.length} groups organizing {groups.reduce((sum, g) => sum + g.summary.categoryCount, 0)} categories
          </p>
        </div>
        
        <div className="flex items-center gap-juno-2">
          <Button 
            variant="juno-secondary" 
            size="sm"
            onClick={() => setManagementMode('edit')}
          >
            Manage Groups
          </Button>
          <Button 
            variant="juno-primary" 
            size="sm"
            onClick={() => setShowSetupWizard(true)}
          >
            Add Group
          </Button>
        </div>
      </div>

      {/* Group cards grid */}
      <div className="grid gap-juno-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sortedGroups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            isManagementMode={managementMode === 'edit'}
            onEdit={() => setSelectedGroup(group.id)}
            onCardClick={() => setSelectedGroup(group.id)}
          />
        ))}
      </div>

      {/* Ungrouped categories section */}
      {ungroupedCategories.length > 0 && (
        <UngroupedCategoriesSection
          categories={ungroupedCategories}
          onCategoryReassign={onCategoryReassign}
          isManagementMode={managementMode === 'edit'}
        />
      )}

      {/* Management modal */}
      {selectedGroup && (
        <GroupManagementModal
          groupId={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onUpdate={onGroupUpdate}
        />
      )}
    </div>
  )
}
```

### Core Component: GroupCard

```typescript
// GroupCard.tsx - Individual group card with progress visualization
'use client'

import { CategoryGroupWithProgress } from '@/lib/types/database'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { ProgressBar } from './ProgressBar'
import { GroupHealthIndicator } from './GroupHealthIndicator'
import { cn } from '@/lib/utils'

interface GroupCardProps {
  group: CategoryGroupWithProgress
  isManagementMode?: boolean
  onEdit: () => void
  onCardClick: () => void
}

export function GroupCard({ 
  group, 
  isManagementMode = false, 
  onEdit, 
  onCardClick 
}: GroupCardProps) {
  const { summary, progressSegments } = group

  return (
    <Card 
      className={cn(
        'hover:shadow-juno-btn-secondary-hover transition-all duration-200 cursor-pointer',
        'bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke',
        summary.healthStatus === 'overspent' && 'border-juno-danger-bg',
        summary.healthStatus === 'warning' && 'border-juno-warning-bg'
      )}
      onClick={isManagementMode ? onEdit : onCardClick}
    >
      <CardHeader className="pb-juno-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-juno-3 flex-1">
            {group.icon && (
              <span className="text-juno-fs-lg">{group.icon}</span>
            )}
            <div className="flex-1 min-w-0">
              <h3 
                className="font-semibold text-juno-fs-md text-juno-text truncate"
                style={{ color: group.color }}
              >
                {group.name}
              </h3>
              {group.description && (
                <p className="text-juno-fs-sm text-juno-muted-fg truncate mt-juno-1">
                  {group.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-juno-1">
            <GroupHealthIndicator status={summary.healthStatus} />
            <Badge variant="secondary" className="text-juno-fs-xs">
              {summary.categoryCount} {summary.categoryCount === 1 ? 'category' : 'categories'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-juno-4">
        {/* Budget summary */}
        <div className="space-y-juno-2">
          <div className="flex justify-between text-juno-fs-sm">
            <span className="text-juno-muted-fg">Allocated:</span>
            <span className="font-medium text-juno-text">
              {formatCurrency(summary.totalAllocated)}
            </span>
          </div>
          
          <div className="flex justify-between text-juno-fs-sm">
            <span className="text-juno-muted-fg">Spent:</span>
            <span className="font-medium text-juno-text">
              {formatCurrency(summary.totalSpent)}
            </span>
          </div>
          
          <div className="flex justify-between text-juno-fs-sm">
            <span className="text-juno-muted-fg">Remaining:</span>
            <span className={cn(
              'font-medium',
              summary.remainingBudget >= 0 ? 'text-juno-success-fg' : 'text-juno-danger-fg'
            )}>
              {summary.remainingBudget >= 0 ? '' : '-'}
              {formatCurrency(Math.abs(summary.remainingBudget))}
            </span>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="space-y-juno-2">
          <div className="flex justify-between items-center">
            <span className="text-juno-fs-sm text-juno-muted-fg">Progress</span>
            <span className="text-juno-fs-sm font-medium text-juno-text">
              {Math.round(summary.utilizationRate)}%
            </span>
          </div>
          
          <ProgressBar
            segments={progressSegments}
            totalBudget={summary.totalAllocated}
            className="h-juno-3"
          />
        </div>

        {/* Overspent warning */}
        {summary.overspentCount > 0 && (
          <Badge variant="destructive" className="text-juno-fs-xs">
            {summary.overspentCount} overspent
          </Badge>
        )}
      </CardContent>
    </Card>
  )
}
```

### Progress Visualization: ProgressBar

```typescript
// ProgressBar.tsx - Multi-segment progress bar component
'use client'

import { CategoryProgressSegment } from '@/lib/types/database'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  segments: CategoryProgressSegment[]
  totalBudget: number
  className?: string
  showTooltips?: boolean
}

export function ProgressBar({ 
  segments, 
  totalBudget, 
  className,
  showTooltips = true 
}: ProgressBarProps) {
  // Calculate visual segments for the progress bar
  const visualSegments = segments.map(segment => {
    const spentAmount = Math.min(segment.spent, segment.allocated)
    const widthPercentage = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0
    
    return {
      ...segment,
      widthPercentage: Math.max(widthPercentage, 1), // Minimum 1% for visibility
      isVisible: widthPercentage > 0
    }
  }).filter(segment => segment.isVisible)

  if (totalBudget === 0 || visualSegments.length === 0) {
    return (
      <div className={cn('bg-juno-surface-200 rounded-full', className)}>
        <div className="h-full w-full bg-juno-neutral-300 rounded-full opacity-50" />
      </div>
    )
  }

  return (
    <div 
      className={cn(
        'relative bg-juno-surface-200 rounded-full overflow-hidden',
        className
      )}
    >
      <div className="flex h-full">
        {visualSegments.map((segment, index) => (
          <div
            key={segment.categoryId}
            className={cn(
              'transition-all duration-300 relative group',
              segment.isOverspent && 'animate-pulse'
            )}
            style={{
              width: `${segment.widthPercentage}%`,
              backgroundColor: segment.color,
              opacity: segment.isOverspent ? 0.8 : 1
            }}
          >
            {/* Tooltip on hover */}
            {showTooltips && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-juno-2 px-juno-2 py-juno-1 bg-juno-neutral-800 text-juno-surface-50 text-juno-fs-xs rounded-juno-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                <div className="font-medium">{segment.categoryName}</div>
                <div>
                  ${segment.spent.toFixed(0)} of ${segment.allocated.toFixed(0)}
                  {segment.isOverspent && ' (Overspent)'}
                </div>
                {/* Arrow */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-juno-neutral-800" />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Overspent indicator overlay */}
      {segments.some(s => s.isOverspent) && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-juno-danger-bg/20 to-juno-danger-bg/40 pointer-events-none" />
      )}
    </div>
  )
}
```

### Health Status: GroupHealthIndicator

```typescript
// GroupHealthIndicator.tsx - Visual health status indicator
'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  DollarSign 
} from 'lucide-react'

type HealthStatus = 'healthy' | 'warning' | 'overspent' | 'underfunded'

interface GroupHealthIndicatorProps {
  status: HealthStatus
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    label: 'Healthy',
    bgColor: 'bg-juno-success-bg',
    textColor: 'text-juno-success-fg',
    iconColor: 'text-juno-success-fg'
  },
  warning: {
    icon: AlertTriangle,
    label: 'Warning',
    bgColor: 'bg-juno-warning-bg',
    textColor: 'text-juno-warning-fg',
    iconColor: 'text-juno-warning-fg'
  },
  overspent: {
    icon: XCircle,
    label: 'Overspent',
    bgColor: 'bg-juno-danger-bg',
    textColor: 'text-juno-danger-fg',
    iconColor: 'text-juno-danger-fg'
  },
  underfunded: {
    icon: DollarSign,
    label: 'Underfunded',
    bgColor: 'bg-juno-info-bg',
    textColor: 'text-juno-info-fg',
    iconColor: 'text-juno-info-fg'
  }
}

export function GroupHealthIndicator({ 
  status, 
  size = 'sm',
  showLabel = false 
}: GroupHealthIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  if (showLabel) {
    return (
      <Badge 
        variant="secondary"
        className={cn(
          'flex items-center gap-juno-1',
          config.bgColor,
          config.textColor
        )}
      >
        <Icon className={sizeClasses[size]} />
        <span className="text-juno-fs-xs font-medium">
          {config.label}
        </span>
      </Badge>
    )
  }

  return (
    <div className={cn('rounded-full p-juno-1', config.bgColor)}>
      <Icon className={cn(sizeClasses[size], config.iconColor)} />
    </div>
  )
}
```

### Management Interface: GroupManagementModal

```typescript
// GroupManagementModal.tsx - Modal for editing group properties
'use client'

import { useState, useEffect } from 'react'
import { CategoryGroup, CategoryWithGroup } from '@/lib/types/database'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'

interface GroupManagementModalProps {
  groupId: string
  onClose: () => void
  onUpdate: (groupId: string, updates: Partial<CategoryGroup>) => void
}

export function GroupManagementModal({
  groupId,
  onClose,
  onUpdate
}: GroupManagementModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#6366f1',
    icon: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load group data
  useEffect(() => {
    const loadGroup = async () => {
      try {
        const response = await fetch(`/api/category-groups/${groupId}`)
        const { data: group } = await response.json()
        
        setFormData({
          name: group.name || '',
          description: group.description || '',
          color: group.color || '#6366f1',
          icon: group.icon || ''
        })
      } catch (error) {
        console.error('Failed to load group:', error)
      }
    }

    loadGroup()
  }, [groupId])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Group name is required'
    } else if (formData.name.length > 100) {
      newErrors.name = 'Group name must be 100 characters or less'
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color)) {
      newErrors.color = 'Invalid color format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    try {
      await onUpdate(groupId, formData)
      onClose()
    } catch (error) {
      console.error('Failed to update group:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-juno-surface-100 rounded-juno-xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-juno-text">Edit Category Group</DialogTitle>
          <DialogDescription className="text-juno-muted-fg">
            Update the group name, appearance, and organization settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-juno-6">
          <div className="grid grid-cols-2 gap-juno-4">
            <div className="col-span-2">
              <Label htmlFor="name" className="text-juno-text">
                Group Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Bills & Fixed Expenses"
                className={errors.name ? 'border-juno-danger-bg' : ''}
              />
              {errors.name && (
                <p className="text-juno-danger-fg text-juno-fs-sm mt-juno-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="description" className="text-juno-text">
                Description (Optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of what categories belong in this group"
                rows={3}
                className={errors.description ? 'border-juno-danger-bg' : ''}
              />
              {errors.description && (
                <p className="text-juno-danger-fg text-juno-fs-sm mt-juno-1">
                  {errors.description}
                </p>
              )}
            </div>

            <div>
              <Label className="text-juno-text">Color</Label>
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
              />
            </div>

            <div>
              <Label className="text-juno-text">Icon</Label>
              <IconPicker
                value={formData.icon}
                onChange={(icon) => setFormData({ ...formData, icon })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="juno-secondary" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="juno-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

## Mobile Optimizations

### Touch Interactions

```typescript
// useTouchGestures.ts - Custom hook for mobile touch interactions
import { useState, useRef, useCallback } from 'react'

interface TouchPoint {
  x: number
  y: number
  time: number
}

interface TouchGestureHandlers {
  onTap?: () => void
  onLongPress?: () => void
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

export function useTouchGestures(handlers: TouchGestureHandlers) {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  const longPressTimer = useRef<NodeJS.Timeout>()

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    })

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true)
      if (handlers.onLongPress) {
        handlers.onLongPress()
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50)
        }
      }
    }, 500)
  }, [handlers])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }

    if (!touchStart) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = touch.clientY - touchStart.y
    const deltaTime = Date.now() - touchStart.time

    // Reset state
    const wasLongPress = isLongPress
    setTouchStart(null)
    setIsLongPress(false)

    // Skip other gestures if this was a long press
    if (wasLongPress) return

    // Swipe detection
    const isSwipe = Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50 && deltaTime < 300
    if (isSwipe) {
      if (deltaX > 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight()
      } else if (deltaX < 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft()
      }
      return
    }

    // Tap detection
    const isTap = Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300
    if (isTap && handlers.onTap) {
      handlers.onTap()
    }
  }, [touchStart, isLongPress, handlers])

  return {
    handleTouchStart,
    handleTouchEnd,
    isLongPress
  }
}
```

### Responsive Grid System

```scss
// _group-cards.scss - Responsive grid styling
.category-group-cards {
  display: grid;
  gap: var(--juno-space-4);
  
  // Mobile: Single column with full width cards
  grid-template-columns: 1fr;
  
  // Small tablets: Two columns
  @media (min-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--juno-space-6);
  }
  
  // Large tablets: Three columns
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  // Desktop: Auto-fill with minimum card width
  @media (min-width: 1280px) {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    max-width: 1400px;
  }
  
  // Individual card styling
  .group-card {
    min-height: 200px;
    transition: all 0.2s ease;
    
    // Touch-optimized sizing
    @media (max-width: 640px) {
      min-height: 180px;
    }
    
    // Hover effects (desktop only)
    @media (hover: hover) {
      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--juno-shadow-button-secondary-hover);
      }
    }
    
    // Active state for touch devices
    &:active {
      transform: scale(0.98);
      transition: transform 0.1s ease;
    }
  }
}

// Tailwind CSS utility class for hover shadow
@layer utilities {
  .hover\:shadow-juno-btn-secondary-hover:hover {
    box-shadow: var(--juno-shadow-button-secondary-hover);
  }
}
```

## Accessibility Features

### Keyboard Navigation

```typescript
// KeyboardNavigation.tsx - Keyboard accessibility for group cards
'use client'

import { useEffect, useRef } from 'react'

interface KeyboardNavigationProps {
  items: any[]
  selectedIndex: number
  onSelectionChange: (index: number) => void
  onActivateItem: (index: number) => void
}

export function useKeyboardNavigation({
  items,
  selectedIndex,
  onSelectionChange,
  onActivateItem
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          onSelectionChange(Math.min(selectedIndex + 1, items.length - 1))
          break
          
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault()
          onSelectionChange(Math.max(selectedIndex - 1, 0))
          break
          
        case 'Enter':
        case ' ':
          e.preventDefault()
          onActivateItem(selectedIndex)
          break
          
        case 'Home':
          e.preventDefault()
          onSelectionChange(0)
          break
          
        case 'End':
          e.preventDefault()
          onSelectionChange(items.length - 1)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, items.length, onSelectionChange, onActivateItem])

  return containerRef
}
```

### Screen Reader Support

```typescript
// Accessibility attributes for GroupCard
export function GroupCard({ group, ...props }: GroupCardProps) {
  return (
    <Card 
      role="button"
      tabIndex={0}
      aria-label={`${group.name} category group. ${group.summary.categoryCount} categories. ${formatCurrency(group.summary.remainingBudget)} remaining budget. Status: ${group.summary.healthStatus}`}
      aria-describedby={`group-${group.id}-details`}
      className="group-card"
      {...props}
    >
      {/* Card content */}
      
      {/* Hidden description for screen readers */}
      <div 
        id={`group-${group.id}-details`}
        className="sr-only"
      >
        Budget allocated: {formatCurrency(group.summary.totalAllocated)}.
        Amount spent: {formatCurrency(group.summary.totalSpent)}.
        {group.summary.overspentCount > 0 && 
          `${group.summary.overspentCount} categories are overspent.`
        }
        Press Enter to view details or manage this group.
      </div>
    </Card>
  )
}
```