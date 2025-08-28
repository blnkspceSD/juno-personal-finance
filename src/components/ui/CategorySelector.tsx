"use client"

import React, { useState, useCallback, useMemo } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCategories, type Category } from '@/hooks/use-categories'

interface CategorySelectorProps {
  selectedCategoryId: string
  onCategoryChange: (categoryId: string) => void
  disabled?: boolean
  className?: string
}

export function CategorySelector({ 
  selectedCategoryId, 
  onCategoryChange, 
  disabled = false,
  className 
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { categories, isLoading, error } = useCategories()

  const selectedCategory = useMemo(() => 
    categories.find(cat => cat.id === selectedCategoryId),
    [categories, selectedCategoryId]
  )

  const handleCategorySelect = useCallback((categoryId: string) => {
    onCategoryChange(categoryId)
    setIsOpen(false)
  }, [onCategoryChange])

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(prev => !prev)
    }
  }, [disabled])

  if (error) {
    return (
      <div className={cn("p-juno-3 bg-red-50 border border-red-200 rounded-juno-lg text-sm text-red-600", className)}>
        Failed to load categories
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={cn("p-juno-3 bg-juno-surface-100 rounded-juno-lg animate-pulse", className)}>
        <div className="flex items-center space-x-juno-3">
          <div className="w-4 h-4 bg-juno-surface-200 rounded-full" />
          <div className="h-4 bg-juno-surface-200 rounded w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between p-juno-3 bg-juno-surface-50 border border-juno-border rounded-juno-lg",
          "hover:bg-juno-surface-100 focus:ring-2 focus:ring-juno-focus-ring focus:border-transparent",
          "transition-colors duration-150 text-left min-h-[44px]",
          disabled && "opacity-50 cursor-not-allowed hover:bg-juno-surface-50"
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center space-x-juno-3 flex-1 min-w-0">
          {selectedCategory ? (
            <>
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: selectedCategory.color }}
              />
              <span className="text-sm text-juno-text truncate">
                {selectedCategory.name}
              </span>
              {selectedCategory.group_name && (
                <span className="text-xs text-juno-muted-fg">
                  in {selectedCategory.group_name}
                </span>
              )}
            </>
          ) : (
            <>
              <div className="w-4 h-4 bg-juno-surface-200 rounded-full flex-shrink-0" />
              <span className="text-sm text-juno-muted-fg">Select category</span>
            </>
          )}
        </div>
        <ChevronDown 
          className={cn(
            "h-4 w-4 text-juno-muted-fg transition-transform duration-150 flex-shrink-0",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-juno-surface-50 border border-juno-border rounded-juno-lg shadow-lg max-h-60 overflow-auto">
          {categories.length === 0 ? (
            <div className="p-juno-4 text-sm text-juno-muted-fg text-center">
              No categories available
            </div>
          ) : (
            categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => handleCategorySelect(category.id)}
                className={cn(
                  "w-full flex items-center space-x-juno-3 p-juno-3 text-left",
                  "hover:bg-juno-surface-100 focus:bg-juno-surface-100 focus:outline-none",
                  "transition-colors duration-150 first:rounded-t-juno-lg last:rounded-b-juno-lg"
                )}
                role="option"
                aria-selected={category.id === selectedCategoryId}
              >
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: category.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-juno-text truncate">
                    {category.name}
                  </div>
                  {category.group_name && (
                    <div className="text-xs text-juno-muted-fg">
                      in {category.group_name}
                    </div>
                  )}
                </div>
                {category.id === selectedCategoryId && (
                  <Check className="h-4 w-4 text-juno-primary flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  )
}