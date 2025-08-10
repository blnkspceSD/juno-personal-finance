"use client"

/**
 * ExplainChip - Educational Component for Juno
 * 
 * Interactive chip that provides explanations for financial terms and numbers
 * Part of the "educational-first" approach in Juno's design system
 */

import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ExplainChipProps {
  /** The explanation text to display */
  explanation: string
  /** Optional title for the explanation */
  title?: string
  /** Position of the tooltip relative to the chip */
  position?: 'top' | 'bottom' | 'left' | 'right'
  /** Size variant of the chip */
  size?: 'sm' | 'default' | 'lg'
  /** Additional CSS classes */
  className?: string
  /** Callback when explanation is shown */
  onExplain?: () => void
  /** Whether to show in teach mode (always visible) */
  teachMode?: boolean
  /** Custom trigger element - if not provided, uses default ? icon */
  children?: React.ReactNode
}

const ExplainChip = React.forwardRef<HTMLButtonElement, ExplainChipProps>(
  ({ 
    explanation, 
    title, 
    position = 'top', 
    size = 'default', 
    className,
    onExplain,
    teachMode = false,
    children,
    ...props 
  }, ref) => {
    const [isVisible, setIsVisible] = useState(false)
    const [actualPosition, setActualPosition] = useState(position)
    const tooltipRef = useRef<HTMLDivElement>(null)
    const chipRef = useRef<HTMLButtonElement>(null)

    // Auto-position tooltip to stay in viewport
    useEffect(() => {
      if (isVisible && tooltipRef.current && chipRef.current) {
        const tooltip = tooltipRef.current
        const chip = chipRef.current
        const rect = chip.getBoundingClientRect()
        const tooltipRect = tooltip.getBoundingClientRect()
        const viewport = {
          width: window.innerWidth,
          height: window.innerHeight
        }

        let newPosition = position

        // Check if tooltip would overflow viewport
        switch (position) {
          case 'top':
            if (rect.top - tooltipRect.height < 0) {
              newPosition = 'bottom'
            }
            break
          case 'bottom':
            if (rect.bottom + tooltipRect.height > viewport.height) {
              newPosition = 'top'
            }
            break
          case 'left':
            if (rect.left - tooltipRect.width < 0) {
              newPosition = 'right'
            }
            break
          case 'right':
            if (rect.right + tooltipRect.width > viewport.width) {
              newPosition = 'left'
            }
            break
        }

        setActualPosition(newPosition)
      }
    }, [isVisible, position])

    const handleClick = () => {
      setIsVisible(!isVisible)
      onExplain?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
      if (e.key === 'Escape') {
        setIsVisible(false)
      }
    }

    // Close on click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
          setIsVisible(false)
        }
      }

      if (isVisible) {
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isVisible])

    // Size variants
    const sizeClasses = {
      sm: 'w-5 h-5 text-xs',
      default: 'w-6 h-6 text-sm',
      lg: 'w-7 h-7 text-base'
    }

    // Position classes for tooltip
    const positionClasses = {
      top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    }

    // Arrow classes for tooltip
    const arrowClasses = {
      top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-juno-neutral-800',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-juno-neutral-800',
      left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-juno-neutral-800',
      right: 'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-juno-neutral-800'
    }

    return (
      <div className="relative inline-block">
        <button
          ref={chipRef}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={cn(
            // Base styles
            'inline-flex items-center justify-center rounded-full',
            'bg-juno-surface-200 text-juno-muted-fg',
            'border border-juno-border',
            'hover:bg-juno-surface-300 hover:text-juno-text',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0',
            'transition-colors duration-200',
            'cursor-help',
            // Size variants
            sizeClasses[size],
            // Teach mode styling
            teachMode && 'bg-juno-info-bg text-juno-info-fg border-juno-info animate-pulse',
            className
          )}
          aria-label={`Explain: ${title || 'More information'}`}
          aria-expanded={isVisible}
          aria-haspopup="dialog"
          {...props}
        >
          {children || (
            <span className="font-medium select-none">
              ?
            </span>
          )}
        </button>

        {/* Tooltip */}
        {(isVisible || teachMode) && (
          <div
            ref={tooltipRef}
            className={cn(
              'absolute z-50 w-80 max-w-sm',
              'bg-juno-neutral-800 text-juno-surface-50',
              'border border-juno-neutral-700 rounded-lg shadow-xl',
              'p-4 space-y-2',
              'animate-in fade-in-0 zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
              positionClasses[actualPosition]
            )}
            role="dialog"
            aria-labelledby="explain-title"
            aria-describedby="explain-description"
          >
            {/* Arrow */}
            <div
              className={cn(
                'absolute w-0 h-0 border-4',
                arrowClasses[actualPosition]
              )}
            />

            {/* Content */}
            {title && (
              <h4 
                id="explain-title" 
                className="font-semibold text-juno-surface-50 text-sm"
              >
                {title}
              </h4>
            )}
            <p 
              id="explain-description"
              className="text-juno-surface-100 text-sm leading-relaxed"
            >
              {explanation}
            </p>

            {/* Close hint */}
            <div className="pt-2 border-t border-juno-neutral-700">
              <p className="text-xs text-juno-surface-200 opacity-75">
                Press ESC or click outside to close
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }
)

ExplainChip.displayName = 'ExplainChip'

export { ExplainChip, type ExplainChipProps }