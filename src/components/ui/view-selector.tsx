/**
 * ViewSelector Component for Time Period Selection
 * Provides a button-group interface for switching between Day, Week, Month, and Custom views
 */

'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export type TimeViewPeriod = 'day' | 'week' | 'month' | 'custom'

export interface ViewSelectorProps {
  selectedView: TimeViewPeriod
  onViewChange: (view: TimeViewPeriod) => void
  disabled?: TimeViewPeriod[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  showLabels?: boolean
  enabledViews?: TimeViewPeriod[]
}

const VIEW_OPTIONS: Array<{
  value: TimeViewPeriod
  label: string
  shortLabel: string
}> = [
  { value: 'day', label: 'Day', shortLabel: 'D' },
  { value: 'week', label: 'Week', shortLabel: 'W' },
  { value: 'month', label: 'Month', shortLabel: 'M' },
  { value: 'custom', label: 'Custom', shortLabel: '⋯' }
]

export function ViewSelector({
  selectedView,
  onViewChange,
  disabled = ['custom'], // Custom disabled by default
  className,
  size = 'md',
  orientation = 'horizontal',
  showLabels = true,
  enabledViews = ['day', 'week', 'month', 'custom']
}: ViewSelectorProps) {
  // Filter options based on enabledViews
  const availableOptions = VIEW_OPTIONS.filter(option => 
    enabledViews.includes(option.value)
  )

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  }

  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col'
  }

  return (
    <div 
      className={cn(
        'inline-flex border rounded-md overflow-hidden',
        'shadow-sm bg-white',
        orientationClasses[orientation],
        className
      )}
      style={{
        borderColor: 'var(--juno-border)',
        boxShadow: 'var(--juno-shadow-soft)'
      }}
      role="radiogroup"
      aria-label="Time period view selector"
    >
      {availableOptions.map((option, index) => {
        const isSelected = selectedView === option.value
        const isDisabled = disabled.includes(option.value)
        const isFirst = index === 0
        const isLast = index === availableOptions.length - 1

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isDisabled}
            className={cn(
              // Base styles
              'font-medium transition-all duration-200 ease-in-out',
              'border-0 focus:outline-none focus:ring-2 focus:ring-offset-0',
              'relative z-0',
              sizeClasses[size],
              
              // Border handling for button group
              orientation === 'horizontal' && !isFirst && 'border-l',
              orientation === 'vertical' && !isFirst && 'border-t',
              
              // Selected state
              isSelected && [
                'z-10 relative',
                'text-white font-semibold',
                'shadow-sm'
              ],
              
              // Default state
              !isSelected && !isDisabled && [
                'hover:brightness-95',
                'active:brightness-90'
              ],
              
              // Disabled state
              isDisabled && [
                'cursor-not-allowed opacity-60'
              ]
            )}
            style={{
              backgroundColor: isSelected 
                ? 'var(--juno-neutral-600)' // Darker neutral for selected state
                : isDisabled 
                ? 'var(--juno-surface-50)'
                : 'var(--juno-surface-100)',
              color: isSelected 
                ? 'white' // White text for better contrast on dark neutral
                : isDisabled 
                ? 'var(--juno-muted-fg)'
                : 'var(--juno-text)',
              borderColor: 'var(--juno-border)',
              focusRingColor: 'var(--juno-focus)'
            }}
            onClick={() => !isDisabled && onViewChange(option.value)}
            title={isDisabled ? 'Coming soon' : `Switch to ${option.label} view`}
            onFocus={(e) => {
              e.target.style.outline = '2px solid var(--juno-focus)'
              e.target.style.outlineOffset = '2px'
              e.target.style.zIndex = '20'
            }}
            onBlur={(e) => {
              e.target.style.outline = 'none'
              e.target.style.outlineOffset = '0'
              e.target.style.zIndex = isSelected ? '10' : '0'
            }}
          >
            {showLabels ? option.label : option.shortLabel}
          </button>
        )
      })}
    </div>
  )
}

// Helper hook for managing view state with localStorage persistence
export function useViewSelector(defaultView: TimeViewPeriod = 'month') {
  const [selectedView, setSelectedView] = React.useState<TimeViewPeriod>(() => {
    if (typeof window === 'undefined') return defaultView
    
    const saved = localStorage.getItem('juno_waterfall_view_preference')
    return (saved as TimeViewPeriod) || defaultView
  })

  const handleViewChange = React.useCallback((view: TimeViewPeriod) => {
    setSelectedView(view)
    if (typeof window !== 'undefined') {
      localStorage.setItem('juno_waterfall_view_preference', view)
    }
  }, [])

  return {
    selectedView,
    onViewChange: handleViewChange
  }
}

export default ViewSelector