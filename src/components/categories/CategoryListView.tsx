/**
 * Category List View
 * Simple list view of all categories with basic operations
 */

'use client'

import { useState } from 'react'
import { CategoryWithGroup, Budget, CategoryGroup } from '@/lib/types/database'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSign, ArrowLeftRight } from 'lucide-react'
import { CategoryFundingDialog } from './CategoryFundingDialog'
import { CategoryReallocationDialog } from './CategoryReallocationDialog'
import { formatCurrency } from '@/lib/utils/currency'

interface CategoryListViewProps {
  categories: CategoryWithGroup[]
  categoryGroups: CategoryGroup[]
  currentBudget: Budget
  selectedCategories: string[]
  onCategorySelect: (categoryIds: string[]) => void
  userId: string
}

export function CategoryListView({
  categories,
  categoryGroups,
  currentBudget,
  selectedCategories,
  onCategorySelect,
  userId
}: CategoryListViewProps) {
  const [fundingCategory, setFundingCategory] = useState<CategoryWithGroup | null>(null)
  const [reallocationCategory, setReallocationCategory] = useState<CategoryWithGroup | null>(null)
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
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
                    {category.group_name && (
                      <p className="text-xs text-gray-500">{category.group_name}</p>
                    )}
                  </div>
                  {category.icon && (
                    <span className="text-lg">{category.icon}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Allocated:</span>
                    <span className="font-medium">{formatCurrency(category.allocated)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Spent:</span>
                    <span className={isOverspent ? 'text-red-600 font-medium' : 'text-gray-900'}>
                      {formatCurrency(category.spent)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Remaining:</span>
                    <span className={isOverspent ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {isOverspent ? '-' : ''}{formatCurrency(Math.abs(remaining))}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        isOverspent ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(utilizationRate, 100)}%` }}
                    />
                  </div>

                  {/* Status badges and actions */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      {isOverspent && (
                        <Badge variant="destructive" className="text-xs">
                          Overspent
                        </Badge>
                      )}
                      {utilizationRate < 10 && category.allocated > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          Unused
                        </Badge>
                      )}
                      {category.allocated === 0 && (
                        <Badge variant="outline" className="text-xs">
                          Unfunded
                        </Badge>
                      )}
                    </div>
                    
                    {/* Action buttons based on category state */}
                    {category.allocated === 0 ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFundingCategory(category)}
                        className="text-xs px-2 py-1 h-6"
                      >
                        <DollarSign className="h-3 w-3 mr-1" />
                        Fund
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReallocationCategory(category)}
                        className="text-xs px-2 py-1 h-6"
                      >
                        <ArrowLeftRight className="h-3 w-3 mr-1" />
                        Move
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories yet</h3>
          <p className="text-gray-600 mb-4">Create your first spending category to get started</p>
        </div>
      )}
      
      {/* Category Funding Dialog */}
      <CategoryFundingDialog
        open={!!fundingCategory}
        onOpenChange={(open) => !open && setFundingCategory(null)}
        category={fundingCategory}
        categories={categories}
        currentBudget={currentBudget}
      />

      {/* Category Reallocation Dialog */}
      <CategoryReallocationDialog
        open={!!reallocationCategory}
        onOpenChange={(open) => !open && setReallocationCategory(null)}
        sourceCategory={reallocationCategory}
        categories={categories}
        currentBudget={currentBudget}
      />
    </div>
  )
}