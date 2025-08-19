/**
 * Treemap Chart Component for Growing Data Stage
 * Proportional spending visualization using Nivo ResponsiveTreeMap
 */

'use client'

import React, { useMemo, useState } from 'react'
import { ResponsiveTreeMap } from '@nivo/treemap'
import { getTreemapColor, getFallbackColor } from '@/lib/utils/chart-colors'
import type { DataMaturityAnalysis, Transaction, BudgetData, CategoryData } from '@/lib/types/chart-progression'

interface TreemapChartProps {
  transactions: Transaction[]
  budget?: BudgetData
  categories: CategoryData[]
  dataAnalysis: DataMaturityAnalysis
  height?: number
  className?: string
  enableDrillDown?: boolean
  showHierarchy?: boolean
  isTransitioning?: boolean
  onEducationRequest?: () => void
  onDataInsight?: (insight: any) => void
}

export function TreemapChart({
  transactions,
  budget,
  categories,
  dataAnalysis,
  height = 300,
  className = '',
  enableDrillDown = true,
  showHierarchy = true,
  isTransitioning = false
}: TreemapChartProps) {
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  
  // Transform data for Nivo treemap
  const treemapData = useMemo(() => {
    // Group transactions by category
    const categoryTotals = new Map<string, number>()
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryTotals.get(transaction.categoryId) || 0
        categoryTotals.set(transaction.categoryId, current + Math.abs(transaction.amount))
      }
    })
    
    // Classify categories as essential vs discretionary
    const essentialKeywords = ['groceries', 'rent', 'mortgage', 'utilities', 'insurance', 'gas', 'fuel', 'bills', 'transport']
    
    const categorizeSpending = (categoryName: string) => {
      const name = categoryName.toLowerCase()
      return essentialKeywords.some(keyword => name.includes(keyword)) ? 'essentials' : 'discretionary'
    }
    
    // Group categories by type
    const essentialCategories: any[] = []
    const discretionaryCategories: any[] = []
    
    categories.forEach(category => {
      const spent = categoryTotals.get(category.id) || 0
      if (spent > 0) {
        const categoryData = {
          name: category.name,
          value: spent,
          color: category.color,
          categoryId: category.id,
          allocated: category.allocated || 0,
          percentage: 0 // Will be calculated below
        }
        
        if (categorizeSpending(category.name) === 'essentials') {
          essentialCategories.push(categoryData)
        } else {
          discretionaryCategories.push(categoryData)
        }
      }
    })
    
    // Calculate percentages
    const totalSpent = [...essentialCategories, ...discretionaryCategories].reduce((sum, cat) => sum + cat.value, 0)
    const updatePercentages = (cats: any[]) => 
      cats.map(cat => ({ ...cat, percentage: ((cat.value / totalSpent) * 100).toFixed(1) }))
    
    const updatedEssentials = updatePercentages(essentialCategories)
    const updatedDiscretionary = updatePercentages(discretionaryCategories)
    
    if (showHierarchy && (updatedEssentials.length > 0 || updatedDiscretionary.length > 0)) {
      // Hierarchical structure
      const hierarchicalData = {
        name: 'spending',
        children: []
      }
      
      if (updatedEssentials.length > 0) {
        hierarchicalData.children.push({
          name: 'Essentials',
          color: '#ef4444',
          children: updatedEssentials.sort((a, b) => b.value - a.value)
        })
      }
      
      if (updatedDiscretionary.length > 0) {
        hierarchicalData.children.push({
          name: 'Discretionary',
          color: '#3b82f6',
          children: updatedDiscretionary.sort((a, b) => b.value - a.value)
        })
      }
      
      return hierarchicalData
    } else {
      // Flat structure for simpler data
      return {
        name: 'spending',
        children: [...updatedEssentials, ...updatedDiscretionary].sort((a, b) => b.value - a.value)
      }
    }
  }, [transactions, categories, showHierarchy])
  
  // Color scheme
  const getNodeColor = (node: any) => {
    // Use actual category colors for leaf nodes
    if (node.data.categoryId) {
      const category = categories.find(cat => cat.id === node.data.categoryId)
      return category?.color || getFallbackColor(categories.findIndex(cat => cat.id === node.data.categoryId))
    }
    
    // Use semantic colors for group nodes
    if (node.data.name === 'Essentials') return '#ef4444'
    if (node.data.name === 'Discretionary') return '#3b82f6'
    
    // Fallback color
    return '#6b7280'
  }
  
  // Handle node clicks for drill-down
  const handleNodeClick = (node: any) => {
    if (!enableDrillDown) return
    
    if (node.data.children) {
      // Clicking on parent node - drill down
      setSelectedNode(selectedNode === node.data.name ? null : node.data.name)
    }
  }
  
  if (!treemapData.children || treemapData.children.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">Not enough data for proportional view</div>
          <div className="text-sm text-gray-400">Add more transactions to unlock treemap visualization</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`treemap-chart-container ${className}`}>
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Proportional Spending Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Visualizing {dataAnalysis.transactionCount} transactions by category size and type
        </p>
      </div>
      
      {/* Chart */}
      <div style={{ height }} className="w-full">
        <ResponsiveTreeMap
          data={treemapData}
          identity="name"
          value="value"
          valueFormat=".0f"
          margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
          labelSkipSize={12}
          labelTextColor="#ffffff"
          parentLabelPosition="left"
          parentLabelTextColor="#ffffff"
          parentLabelSize={16}
          parentLabelPadding={6}
          borderColor="#ffffff"
          borderWidth={2}
          colors={getNodeColor}
          nodeOpacity={0.9}
          isInteractive={true}
          animate={!isTransitioning}
          motionConfig="gentle"
          onClick={handleNodeClick}
          tooltip={({ node }) => {
            const data = node.data
            const hasChildren = data.children && data.children.length > 0
            
            return (
              <div className="bg-white p-3 rounded-lg shadow-lg border max-w-64">
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: getNodeColor(node) }}
                  />
                  <span className="font-medium">{data.name}</span>
                </div>
                
                <div className="text-sm space-y-1">
                  <div className="font-semibold text-lg">
                    ${data.value?.toLocaleString() || 0}
                  </div>
                  
                  {data.percentage && (
                    <div className="text-gray-600">
                      {data.percentage}% of total spending
                    </div>
                  )}
                  
                  {data.allocated && data.allocated > 0 && (
                    <div className="text-sm text-gray-500">
                      Budget: ${data.allocated.toLocaleString()}
                      <div className={`text-xs ${
                        data.value > data.allocated ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {data.value > data.allocated 
                          ? `$${(data.value - data.allocated).toLocaleString()} over budget`
                          : `$${(data.allocated - data.value).toLocaleString()} remaining`
                        }
                      </div>
                    </div>
                  )}
                  
                  {hasChildren && enableDrillDown && (
                    <div className="text-xs text-blue-600 border-t pt-1 mt-2">
                      Click to {selectedNode === data.name ? 'collapse' : 'drill down'}
                    </div>
                  )}
                </div>
              </div>
            )
          }}
          theme={{
            tooltip: {
              container: {
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }
            }
          }}
        />
      </div>
      
      {/* Legend */}
      {showHierarchy && (
        <div className="mt-4 flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded" />
            <span className="text-sm text-gray-600">Essentials</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            <span className="text-sm text-gray-600">Discretionary</span>
          </div>
        </div>
      )}
      
      {/* Summary Insights */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">LARGEST CATEGORY</div>
          <div className="text-sm font-semibold text-blue-900">
            {(() => {
              const allCategories = treemapData.children.flatMap((child: any) => 
                child.children || [child]
              )
              const largest = allCategories.reduce((max: any, cat: any) => 
                cat.value > (max?.value || 0) ? cat : max, null
              )
              return largest ? `${largest.name} ($${largest.value.toLocaleString()})` : 'N/A'
            })()}
          </div>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600 mb-1">CATEGORY DIVERSITY</div>
          <div className="text-sm font-semibold text-green-900">
            {dataAnalysis.categoryCount} categories
            <div className="text-xs text-green-600 mt-1">
              {dataAnalysis.categoryDistribution > 0.7 ? 'Well distributed' : 
               dataAnalysis.categoryDistribution > 0.4 ? 'Moderately distributed' : 
               'Concentrated spending'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive hint */}
      {enableDrillDown && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          💡 Click on category groups to drill down into details
        </div>
      )}
    </div>
  )
}