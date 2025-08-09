/**
 * Smart Category Dropdown Component
 * Provides intelligent category suggestions with search, keyboard navigation, and usage analytics
 */

'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronDown, Search, Star, Clock, Zap, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Tooltip } from '@/components/ui/tooltip'
import { CategoryService } from '@/lib/services/categoryService'
import { formatCurrency } from '@/lib/utils/currency'
import type { 
  Category, 
  CategorySuggestion, 
  CategorySuggestionGroup 
} from '@/lib/types/database'

interface SmartCategoryDropdownProps {
  categories: Category[]
  selectedCategoryId: string
  onCategorySelect: (categoryId: string) => void
  onCategoryCreate?: (name: string) => Promise<string | null>
  placeholder?: string
  disabled?: boolean
  userId: string
  transactionDescription?: string
  transactionAmount?: number
  transactionDate?: Date
  showUsageStats?: boolean
  allowCreate?: boolean
  error?: string
  className?: string
}

export function SmartCategoryDropdown({
  categories,
  selectedCategoryId,
  onCategorySelect,
  onCategoryCreate,
  placeholder = 'Select or search categories...',
  disabled = false,
  userId,
  transactionDescription,
  transactionAmount,
  transactionDate,
  showUsageStats = true,
  allowCreate = false,
  error,
  className
}: SmartCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [suggestions, setSuggestions] = useState<CategorySuggestionGroup[]>([])
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateOption, setShowCreateOption] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const categoryService = useRef(new CategoryService())

  const selectedCategory = categories.find(c => c.id === selectedCategoryId)

  // Load suggestions when dropdown opens or transaction details change
  useEffect(() => {
    if (isOpen) {
      loadSuggestions()
    }
  }, [isOpen, transactionDescription, transactionAmount, transactionDate, userId])

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
        setShowCreateOption(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const loadSuggestions = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const suggestionGroups = await categoryService.current.getCategorySuggestions(
        userId,
        transactionDescription,
        transactionAmount,
        transactionDate
      )
      setSuggestions(suggestionGroups)
    } catch (error) {
      console.error('Error loading category suggestions:', error)
      setSuggestions([])
    } finally {
      setIsLoading(false)
    }
  }, [userId, transactionDescription, transactionAmount, transactionDate])

  // Filter suggestions based on search query
  const filteredSuggestions = useCallback(() => {
    if (!searchQuery.trim()) {
      return suggestions
    }

    const query = searchQuery.toLowerCase()
    return suggestions
      .map(group => ({
        ...group,
        categories: group.categories.filter(cat =>
          cat.category_name.toLowerCase().includes(query)
        )
      }))
      .filter(group => group.categories.length > 0)
  }, [suggestions, searchQuery])

  // Get all selectable items (for keyboard navigation)
  const getAllSelectableItems = useCallback(() => {
    const items: Array<{ type: 'category'; categoryId: string; groupTitle: string } | { type: 'create'; name: string }> = []
    
    filteredSuggestions().forEach(group => {
      group.categories.forEach(cat => {
        items.push({
          type: 'category',
          categoryId: cat.category_id,
          groupTitle: group.title
        })
      })
    })

    if (showCreateOption && searchQuery.trim()) {
      items.push({
        type: 'create',
        name: searchQuery.trim()
      })
    }

    return items
  }, [filteredSuggestions, showCreateOption, searchQuery])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = getAllSelectableItems()

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev < items.length - 1 ? prev + 1 : 0
        )
        break

      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : items.length - 1
        )
        break

      case 'Enter':
        e.preventDefault()
        if (highlightedIndex >= 0 && items[highlightedIndex]) {
          const item = items[highlightedIndex]
          if (item.type === 'category') {
            handleCategorySelect(item.categoryId)
          } else if (item.type === 'create') {
            handleCreateCategory(item.name)
          }
        }
        break

      case 'Escape':
        e.preventDefault()
        setIsOpen(false)
        setSearchQuery('')
        setShowCreateOption(false)
        setHighlightedIndex(-1)
        break

      case 'Tab':
        setIsOpen(false)
        setSearchQuery('')
        setShowCreateOption(false)
        break
    }
  }

  const handleCategorySelect = async (categoryId: string) => {
    onCategorySelect(categoryId)
    
    // Track the selection for future suggestions
    if (transactionDescription) {
      try {
        await categoryService.current.trackCategoryUsage(
          userId,
          categoryId,
          transactionDescription
        )
      } catch (error) {
        console.error('Error tracking category usage:', error)
      }
    }

    setIsOpen(false)
    setSearchQuery('')
    setShowCreateOption(false)
    setHighlightedIndex(-1)
  }

  const handleCreateCategory = async (name: string) => {
    if (!onCategoryCreate) return

    try {
      const newCategoryId = await onCategoryCreate(name)
      if (newCategoryId) {
        handleCategorySelect(newCategoryId)
      }
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setHighlightedIndex(-1)
    
    // Show create option if query doesn't match any existing categories
    const hasExactMatch = categories.some(cat => 
      cat.name.toLowerCase() === value.toLowerCase()
    )
    setShowCreateOption(allowCreate && value.trim().length > 0 && !hasExactMatch)
  }

  const getSuggestionIcon = (suggestion: CategorySuggestion) => {
    switch (suggestion.suggestion_type) {
      case 'frequent':
        return <Star className="h-3 w-3 text-yellow-500" />
      case 'recent':
        return <Clock className="h-3 w-3 text-blue-500" />
      case 'ai':
        return <Zap className="h-3 w-3 text-purple-500" />
      default:
        return suggestion.icon ? <span className="text-sm">{suggestion.icon}</span> : null
    }
  }

  const getSuggestionBadge = (suggestion: CategorySuggestion) => {
    if (!suggestion.badge) return null

    const badgeClasses = {
      recommended: 'bg-green-100 text-green-700 border-green-200',
      popular: 'bg-blue-100 text-blue-700 border-blue-200',
      new: 'bg-orange-100 text-orange-700 border-orange-200'
    }

    return (
      <span className={`px-1.5 py-0.5 text-xs rounded border ${badgeClasses[suggestion.badge]}`}>
        {suggestion.badge}
      </span>
    )
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full px-3 py-2 text-left border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent flex items-center justify-between ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white hover:border-gray-400'}`}
      >
        <span className={selectedCategory ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategory ? selectedCategory.name : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search categories..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="p-4 text-center text-gray-500">
              Loading suggestions...
            </div>
          )}

          {/* Suggestions */}
          {!isLoading && (
            <div className="max-h-64 overflow-y-auto">
              {filteredSuggestions().map((group, groupIndex) => (
                <div key={group.title}>
                  {/* Group Header */}
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                    {group.title}
                    {group.max_display > 0 && group.categories.length > group.max_display && (
                      <span className="ml-2 text-gray-400">
                        (showing {group.max_display} of {group.categories.length})
                      </span>
                    )}
                  </div>

                  {/* Categories */}
                  {group.categories
                    .slice(0, group.max_display > 0 ? group.max_display : undefined)
                    .map((suggestion, index) => {
                      const category = categories.find(c => c.id === suggestion.category_id)
                      if (!category) return null

                      const globalIndex = getAllSelectableItems().findIndex(
                        item => item.type === 'category' && item.categoryId === suggestion.category_id
                      )

                      return (
                        <div
                          key={suggestion.category_id}
                          onClick={() => handleCategorySelect(suggestion.category_id)}
                          className={`px-3 py-2 cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                            highlightedIndex === globalIndex ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            {getSuggestionIcon(suggestion)}
                            <span className="font-medium">{category.name}</span>
                            {getSuggestionBadge(suggestion)}
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            {showUsageStats && suggestion.confidence_score > 0.1 && (
                              <Tooltip content={suggestion.reasoning.join(', ')}>
                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                  {Math.round(suggestion.confidence_score * 100)}%
                                </span>
                              </Tooltip>
                            )}
                            
                            {/* Budget remaining */}
                            <span className="text-xs text-gray-400">
                              {formatCurrency(category.allocated - category.spent)} left
                            </span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              ))}

              {/* Create New Category Option */}
              {showCreateOption && (
                <div>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100">
                    Create New
                  </div>
                  <div
                    onClick={() => handleCreateCategory(searchQuery.trim())}
                    className={`px-3 py-2 cursor-pointer hover:bg-green-50 flex items-center gap-2 ${
                      highlightedIndex === getAllSelectableItems().length - 1 ? 'bg-green-50' : ''
                    }`}
                  >
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="text-green-600">Create &quot;{searchQuery.trim()}&quot;</span>
                  </div>
                </div>
              )}

              {/* No Results */}
              {!isLoading && filteredSuggestions().length === 0 && !showCreateOption && (
                <div className="p-4 text-center text-gray-500">
                  {searchQuery ? 'No categories match your search' : 'No categories available'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}