/**
 * Category Management Layout
 * Main layout component for category management with tabs and views
 */

'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, BarChart3, PieChart } from 'lucide-react'
import { CategoryListView } from './CategoryListView'
import { CategoryCreationDialog } from './CategoryCreationDialog'
import { BudgetVisualizationChart } from './BudgetVisualizationChart'
import type { CategoryGroup, CategoryWithGroup, Budget } from '@/lib/types/database'

interface CategoryManagementLayoutProps {
  categories: CategoryWithGroup[]
  categoryGroups: CategoryGroup[]
  archivedCategories: CategoryWithGroup[]
  currentBudget: Budget
  currentView: 'list' | 'groups' | 'archived'
  selectedGroup?: string
  userId: string
}

export function CategoryManagementLayout({
  categories,
  categoryGroups,
  archivedCategories,
  currentBudget,
  currentView,
  selectedGroup,
  userId
}: CategoryManagementLayoutProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showCategoryDialog, setShowCategoryDialog] = useState(false)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('list')
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie')

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
    const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
    const overspentCategories = categories.filter(cat => cat.spent > cat.allocated).length
    
    return {
      totalAllocated,
      totalSpent,
      remaining: totalAllocated - totalSpent,
      overspentCategories,
      utilizationRate: totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0
    }
  }, [categories])

  // Handle tab changes
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', value)
    if (value !== 'groups') {
      params.delete('group')
    }
    router.push(`/dashboard/categories?${params.toString()}`)
  }

  // Handle group selection
  const handleGroupSelect = (groupId: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (groupId) {
      params.set('group', groupId)
    } else {
      params.delete('group')
    }
    router.push(`/dashboard/categories?${params.toString()}`)
  }

  // Filter categories by group if needed
  const filteredCategories = useMemo(() => {
    if (currentView === 'groups' && selectedGroup) {
      return categories.filter(cat => cat.group_id === selectedGroup)
    }
    return categories
  }, [categories, currentView, selectedGroup])


  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <div className="text-2xl font-bold text-green-600">
              ${stats.totalAllocated.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Allocated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.totalSpent.toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Spent</div>
          </div>
          <div>
            <div className={`text-2xl font-bold ${stats.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(stats.remaining).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {stats.remaining >= 0 ? 'Remaining' : 'Overspent'}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {stats.utilizationRate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Utilization</div>
          </div>
        </div>
        
        {stats.overspentCategories > 0 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-700">
              ⚠️ {stats.overspentCategories} {stats.overspentCategories === 1 ? 'category is' : 'categories are'} over budget
            </div>
          </div>
        )}
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="charts" className="flex items-center gap-2">
              {chartType === 'pie' ? <PieChart className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              Charts
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            {activeTab === 'charts' && (
              <div className="flex items-center gap-1">
                <Button
                  variant={chartType === 'pie' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('pie')}
                >
                  <PieChart className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('bar')}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            )}
            <Button
              onClick={() => setShowCategoryDialog(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Category
            </Button>
          </div>
        </div>

        {/* Category List Tab */}
        <TabsContent value="list" className="space-y-6">
          <CategoryListView
            categories={categories}
            categoryGroups={categoryGroups}
            currentBudget={currentBudget}
            selectedCategories={selectedCategories}
            onCategorySelect={setSelectedCategories}
            userId={userId}
          />
        </TabsContent>

        {/* Charts Tab */}
        <TabsContent value="charts" className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Budget Visualization - {chartType === 'pie' ? 'Pie Chart' : 'Bar Chart'}
            </h3>
            <BudgetVisualizationChart
              categories={categories}
              type={chartType}
              showSpent={true}
              interactive={true}
            />
          </div>
        </TabsContent>

      </Tabs>

      {/* Dialogs */}
      <CategoryCreationDialog
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        categories={categories}
        categoryGroups={categoryGroups}
        currentBudget={currentBudget}
        userId={userId}
      />
    </div>
  )
}