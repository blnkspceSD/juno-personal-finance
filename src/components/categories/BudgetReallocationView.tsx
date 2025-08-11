/**
 * Budget Reallocation View
 * Visual interface for reallocating budget between categories
 */

'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, ArrowLeftRight, DollarSign, Undo2, Redo2, Save, RotateCcw } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CategoryWithGroup, Budget, BudgetReallocation } from '@/lib/types/database'

interface BudgetReallocationViewProps {
  categories: CategoryWithGroup[]
  currentBudget: Budget
  onSaveReallocations: (reallocations: BudgetReallocation[]) => Promise<void>
  onCancel: () => void
}

interface CategoryAllocation {
  id: string
  name: string
  originalAmount: number
  currentAmount: number
  color: string
  group_name?: string
}

interface ReallocationHistory {
  allocations: CategoryAllocation[]
  timestamp: number
}

export function BudgetReallocationView({
  categories,
  onSaveReallocations,
  onCancel
}: BudgetReallocationViewProps) {
  // Initialize category allocations
  const initialAllocations = useMemo((): CategoryAllocation[] => {
    return categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      originalAmount: cat.allocated,
      currentAmount: cat.allocated,
      color: cat.color || '#6366f1',
      group_name: cat.group_name
    }))
  }, [categories])

  const [allocations, setAllocations] = useState<CategoryAllocation[]>(initialAllocations)
  const [history, setHistory] = useState<ReallocationHistory[]>([
    { allocations: initialAllocations, timestamp: Date.now() }
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [selectedFromCategory, setSelectedFromCategory] = useState<string>('')
  const [selectedToCategory, setSelectedToCategory] = useState<string>('')
  const [transferAmount, setTransferAmount] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')

  // Calculate totals and changes
  const totals = useMemo(() => {
    const originalTotal = allocations.reduce((sum, cat) => sum + cat.originalAmount, 0)
    const currentTotal = allocations.reduce((sum, cat) => sum + cat.currentAmount, 0)
    const totalChanges = allocations.filter(cat => 
      Math.abs(cat.currentAmount - cat.originalAmount) > 0.01
    ).length

    return {
      originalTotal,
      currentTotal,
      difference: currentTotal - originalTotal,
      hasChanges: totalChanges > 0,
      isBalanced: Math.abs(currentTotal - originalTotal) < 0.01
    }
  }, [allocations])

  // Get categories with available funds for transfer
  const availableFromCategories = useMemo(() => {
    return allocations.filter(cat => cat.currentAmount > 0.01)
  }, [allocations])

  // Get categories that can receive funds
  const availableToCategories = useMemo(() => {
    return allocations.filter(cat => cat.id !== selectedFromCategory)
  }, [allocations, selectedFromCategory])

  // Add to history
  const addToHistory = (newAllocations: CategoryAllocation[]) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ allocations: [...newAllocations], timestamp: Date.now() })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  // Handle amount change for a category
  const handleAmountChange = (categoryId: string, newAmount: string) => {
    const amount = parseFloat(newAmount) || 0
    if (amount < 0) return

    const newAllocations = allocations.map(cat =>
      cat.id === categoryId ? { ...cat, currentAmount: amount } : cat
    )
    setAllocations(newAllocations)
  }

  // Handle quick transfer
  const handleQuickTransfer = () => {
    if (!selectedFromCategory || !selectedToCategory || !transferAmount) {
      setError('Please select source category, target category, and transfer amount')
      return
    }

    const amount = parseFloat(transferAmount)
    if (amount <= 0) {
      setError('Transfer amount must be greater than 0')
      return
    }

    const fromCategory = allocations.find(cat => cat.id === selectedFromCategory)
    if (!fromCategory || fromCategory.currentAmount < amount) {
      setError('Source category has insufficient funds')
      return
    }

    setError('')

    const newAllocations = allocations.map(cat => {
      if (cat.id === selectedFromCategory) {
        return { ...cat, currentAmount: cat.currentAmount - amount }
      }
      if (cat.id === selectedToCategory) {
        return { ...cat, currentAmount: cat.currentAmount + amount }
      }
      return cat
    })

    setAllocations(newAllocations)
    addToHistory(newAllocations)
    
    // Reset transfer form
    setSelectedFromCategory('')
    setSelectedToCategory('')
    setTransferAmount('')
  }

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setAllocations([...history[newIndex].allocations])
      setHistoryIndex(newIndex)
      setError('')
    }
  }

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setAllocations([...history[newIndex].allocations])
      setHistoryIndex(newIndex)
      setError('')
    }
  }

  // Reset to original
  const handleReset = () => {
    setAllocations([...initialAllocations])
    setHistory([{ allocations: initialAllocations, timestamp: Date.now() }])
    setHistoryIndex(0)
    setError('')
    setSelectedFromCategory('')
    setSelectedToCategory('')
    setTransferAmount('')
  }

  // Save changes
  const handleSave = async () => {
    if (!totals.isBalanced) {
      setError('Budget must be balanced before saving')
      return
    }

    if (!totals.hasChanges) {
      setError('No changes to save')
      return
    }

    setIsSaving(true)
    setError('')

    try {
      const reallocations: BudgetReallocation[] = []

      // Create reallocations for changed categories
      allocations.forEach(cat => {
        const change = cat.currentAmount - cat.originalAmount
        if (Math.abs(change) > 0.01) {
          if (change > 0) {
            // Category received funds - this will be handled as part of donor transfers
          } else {
            // Category lost funds - create reallocation record
            reallocations.push({
              from_category_id: cat.id,
              to_category_id: null, // Will be distributed to recipients
              amount: Math.abs(change),
              reason: `Visual budget reallocation: reduced from ${formatCurrency(cat.originalAmount)} to ${formatCurrency(cat.currentAmount)}`,
              allocation_type: 'manual'
            })
          }
        }
      })

      await onSaveReallocations(reallocations)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save budget changes')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Balance Status */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Budget Reallocation</h3>
          <p className="text-sm text-gray-600">
            Visually adjust budget allocations between categories
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          totals.isBalanced 
            ? 'bg-green-100 text-green-700' 
            : 'bg-red-100 text-red-700'
        }`}>
          {totals.isBalanced ? '✓ Balanced' : `${totals.difference > 0 ? '+' : ''}${formatCurrency(totals.difference)}`}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleUndo}
          disabled={historyIndex <= 0}
        >
          <Undo2 className="h-4 w-4 mr-1" />
          Undo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRedo}
          disabled={historyIndex >= history.length - 1}
        >
          <Redo2 className="h-4 w-4 mr-1" />
          Redo
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={!totals.hasChanges}
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* Quick Transfer Section */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <h4 className="font-medium text-gray-900 mb-3">Quick Transfer</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs">From Category</Label>
            <select
              value={selectedFromCategory}
              onChange={(e) => setSelectedFromCategory(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="">Select source...</option>
              {availableFromCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({formatCurrency(cat.currentAmount)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">To Category</Label>
            <select
              value={selectedToCategory}
              onChange={(e) => setSelectedToCategory(e.target.value)}
              className="w-full px-2 py-1 text-sm border rounded"
            >
              <option value="">Select target...</option>
              {availableToCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label className="text-xs">Amount</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={transferAmount}
              onChange={(e) => setTransferAmount(e.target.value)}
              placeholder="0.00"
              className="text-sm"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleQuickTransfer}
              disabled={!selectedFromCategory || !selectedToCategory || !transferAmount}
              className="w-full"
              size="sm"
            >
              <ArrowLeftRight className="h-4 w-4 mr-1" />
              Transfer
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* Category List with Editable Amounts */}
      <div className="space-y-2">
        <h4 className="font-medium text-gray-900">Category Allocations</h4>
        <div className="grid gap-2">
          {allocations.map((cat) => {
            const hasChanged = Math.abs(cat.currentAmount - cat.originalAmount) > 0.01
            const change = cat.currentAmount - cat.originalAmount
            
            return (
              <div
                key={cat.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  hasChanged ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <div>
                    <div className="font-medium text-sm">{cat.name}</div>
                    {cat.group_name && (
                      <div className="text-xs text-gray-500">{cat.group_name}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {hasChanged && (
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      change > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {change > 0 ? '+' : ''}{formatCurrency(change)}
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-gray-400" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cat.currentAmount.toFixed(2)}
                      onChange={(e) => handleAmountChange(cat.id, e.target.value)}
                      className="w-24 text-sm text-right"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex justify-between items-center text-sm">
          <span>Original Total:</span>
          <span className="font-mono">{formatCurrency(totals.originalTotal)}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span>Current Total:</span>
          <span className={`font-mono ${totals.isBalanced ? 'text-gray-900' : 'text-red-600'}`}>
            {formatCurrency(totals.currentTotal)}
          </span>
        </div>
        {!totals.isBalanced && (
          <div className="flex justify-between items-center text-sm mt-1 font-medium text-red-600">
            <span>Difference:</span>
            <span className="font-mono">
              {totals.difference > 0 ? '+' : ''}{formatCurrency(totals.difference)}
            </span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            {error}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!totals.hasChanges || !totals.isBalanced || isSaving}
          className="flex-1"
        >
          {isSaving ? (
            <>
              <DollarSign className="h-4 w-4 mr-2 animate-pulse" />
              Saving Changes...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Budget Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}