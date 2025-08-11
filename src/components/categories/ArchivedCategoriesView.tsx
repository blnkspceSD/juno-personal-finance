/**
 * Archived Categories View
 * View and manage archived categories
 */

'use client'

import { CategoryWithGroup, CategoryGroup } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/currency'
import { RotateCcw, Trash2 } from 'lucide-react'

interface ArchivedCategoriesViewProps {
  archivedCategories: CategoryWithGroup[]
  categoryGroups: CategoryGroup[]
  userId: string
}

export function ArchivedCategoriesView({
  archivedCategories,
  categoryGroups,
  userId
}: ArchivedCategoriesViewProps) {
  const handleRestore = async (categoryId: string) => {
    try {
      const response = await fetch('/api/categories/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_id: categoryId })
      })

      if (!response.ok) {
        throw new Error('Failed to restore category')
      }

      // Refresh the page to show updated state
      window.location.reload()
    } catch (error) {
      console.error('Error restoring category:', error)
      // You might want to show a toast notification here
    }
  }

  const handlePermanentDelete = async (categoryId: string) => {
    if (!confirm('Are you sure you want to permanently delete this category? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Failed to delete category')
      }

      // Refresh the page to show updated state
      window.location.reload()
    } catch (error) {
      console.error('Error deleting category:', error)
      // You might want to show a toast notification here
    }
  }

  if (archivedCategories.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No archived categories</h3>
        <p className="text-gray-600">
          Categories you archive will appear here and can be restored if needed.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {archivedCategories.length} archived {archivedCategories.length === 1 ? 'category' : 'categories'}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {archivedCategories.map((category) => {
          const archivedDate = category.archived_at ? new Date(category.archived_at).toLocaleDateString() : 'Unknown'
          const hasTransactions = category.spent > 0

          return (
            <Card key={category.id} className="opacity-75 hover:opacity-100 transition-opacity">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300 opacity-50"
                    style={{ backgroundColor: category.color }}
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-600">{category.name}</h3>
                    {category.group_name && (
                      <p className="text-xs text-gray-500">{category.group_name}</p>
                    )}
                  </div>
                  {category.icon && (
                    <span className="text-lg opacity-50">{category.icon}</span>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Final Balance:</span>
                    <span className="text-gray-600">{formatCurrency(category.allocated - category.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Spent:</span>
                    <span className="text-gray-600">{formatCurrency(category.spent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Archived:</span>
                    <span className="text-gray-500">{archivedDate}</span>
                  </div>
                </div>

                {/* Status badges */}
                <div className="flex gap-2 mb-4">
                  <Badge variant="secondary" className="text-xs">
                    Archived
                  </Badge>
                  {hasTransactions && (
                    <Badge variant="outline" className="text-xs">
                      Has History
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRestore(category.id)}
                    className="flex-1 flex items-center gap-2"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePermanentDelete(category.id)}
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-800">
          <strong>Note:</strong> Archived categories are hidden from your active budget but retain all transaction history. 
          You can restore them at any time or permanently delete them if no longer needed.
        </p>
      </div>
    </div>
  )
}