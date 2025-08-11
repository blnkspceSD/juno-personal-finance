/**
 * Category Group View
 * Organized view of categories grouped by category groups
 */

'use client'

import { CategoryGroup, CategoryWithGroup, Budget } from '@/lib/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils/currency'
import { ChevronRight, Folder } from 'lucide-react'

interface CategoryGroupViewProps {
  categories: CategoryWithGroup[]
  categoryGroups: CategoryGroup[]
  currentBudget: Budget
  selectedGroup?: string
  onGroupSelect: (groupId: string | null) => void
  userId: string
}

export function CategoryGroupView({
  categories,
  categoryGroups,
  currentBudget,
  selectedGroup,
  onGroupSelect,
  userId
}: CategoryGroupViewProps) {
  // Group categories
  const groupedCategories = categoryGroups.reduce((acc, group) => {
    acc[group.id] = categories.filter(cat => cat.group_id === group.id)
    return acc
  }, {} as Record<string, CategoryWithGroup[]>)

  // Ungrouped categories
  const ungroupedCategories = categories.filter(cat => !cat.group_id)

  // Calculate group summaries
  const getGroupSummary = (cats: CategoryWithGroup[]) => {
    const totalAllocated = cats.reduce((sum, cat) => sum + cat.allocated, 0)
    const totalSpent = cats.reduce((sum, cat) => sum + cat.spent, 0)
    const overspentCount = cats.filter(cat => cat.spent > cat.allocated).length
    return { totalAllocated, totalSpent, remaining: totalAllocated - totalSpent, overspentCount }
  }

  if (selectedGroup) {
    // Show specific group details
    const group = categoryGroups.find(g => g.id === selectedGroup)
    const groupCategories = groupedCategories[selectedGroup] || []
    
    if (!group) return <div>Group not found</div>

    return (
      <div className="space-y-6">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => onGroupSelect(null)}
          className="flex items-center gap-2"
        >
          <ChevronRight className="h-4 w-4 rotate-180" />
          Back to Groups
        </Button>

        {/* Group header */}
        <div className="flex items-center gap-3">
          {group.icon && <span className="text-2xl">{group.icon}</span>}
          <div>
            <h2 className="text-2xl font-bold" style={{ color: group.color }}>
              {group.name}
            </h2>
            {group.description && (
              <p className="text-gray-600">{group.description}</p>
            )}
          </div>
        </div>

        {/* Group categories */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groupCategories.map((category) => {
            const remaining = category.allocated - category.spent
            const isOverspent = category.spent > category.allocated
            const utilizationRate = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0

            return (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    </div>
                    {category.icon && (
                      <span className="text-lg">{category.icon}</span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={isOverspent ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {isOverspent ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          isOverspent ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {groupCategories.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories in this group</h3>
            <p className="text-gray-600">Create categories and assign them to this group</p>
          </div>
        )}
      </div>
    )
  }

  // Show all groups overview
  return (
    <div className="space-y-6">
      {/* Category Groups */}
      {categoryGroups.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categoryGroups.map((group) => {
            const groupCats = groupedCategories[group.id] || []
            const summary = getGroupSummary(groupCats)

            return (
              <Card 
                key={group.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => onGroupSelect(group.id)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-3">
                    {group.icon && <span className="text-xl">{group.icon}</span>}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span style={{ color: group.color }}>{group.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          {groupCats.length}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </CardTitle>
                  {group.description && (
                    <p className="text-sm text-gray-600">{group.description}</p>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Allocated:</span>
                      <span className="font-medium">{formatCurrency(summary.totalAllocated)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={summary.remaining < 0 ? 'text-red-600' : 'text-green-600'}>
                        {summary.remaining < 0 ? '-' : ''}{formatCurrency(Math.abs(summary.remaining))}
                      </span>
                    </div>
                    {summary.overspentCount > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {summary.overspentCount} overspent
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Ungrouped Categories */}
      {ungroupedCategories.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Ungrouped Categories</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ungroupedCategories.map((category) => {
              const remaining = category.allocated - category.spent
              const isOverspent = category.spent > category.allocated

              return (
                <Card key={category.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      </div>
                      {category.icon && (
                        <span className="text-lg">{category.icon}</span>
                      )}
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={isOverspent ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                        {isOverspent ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {categoryGroups.length === 0 && ungroupedCategories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories or groups yet</h3>
          <p className="text-gray-600">Create your first category group to organize your spending</p>
        </div>
      )}
    </div>
  )
}