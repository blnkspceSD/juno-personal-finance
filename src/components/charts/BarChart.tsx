/**
 * Bar Chart Component for Early Stage Users
 * Simple budget vs actual comparison using Nivo ResponsiveBar
 */

'use client'

import React from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { getBarChartColor } from '@/lib/utils/chart-colors'
import { useCachedChartData, ChartPerformanceMonitor } from '@/lib/utils/chart-cache'
import type { DataMaturityAnalysis, Transaction, BudgetData, CategoryData } from '@/lib/types/chart-progression'

interface BarChartProps {
  transactions: Transaction[]
  budget?: BudgetData
  categories: CategoryData[]
  dataAnalysis: DataMaturityAnalysis
  height?: number
  className?: string
  showBudgetComparison?: boolean
  enableInteraction?: boolean
  isTransitioning?: boolean
  onEducationRequest?: () => void
  onDataInsight?: (insight: any) => void
}

export const BarChart = React.memo(function BarChart({
  transactions,
  budget,
  categories,
  dataAnalysis,
  height = 800,
  className = '',
  showBudgetComparison = true,
  enableInteraction = true,
  isTransitioning = false
}: BarChartProps) {
  
  // Transform data for Nivo bar chart with caching
  const chartData = useCachedChartData(
    'bar-chart-data',
    [transactions, categories],
    () => {
      const endMeasurement = ChartPerformanceMonitor.startMeasurement('bar-chart-data-transform')
      
      // Group transactions by category
      const categoryTotals = new Map<string, number>()
      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          const current = categoryTotals.get(transaction.categoryId) || 0
          categoryTotals.set(transaction.categoryId, current + Math.abs(transaction.amount))
        }
      })
      
      // Create stacked bar data structure - spending within budget
      const data = categories
        .filter(category => category.type === 'expense')
        .map(category => {
          const spent = categoryTotals.get(category.id) || 0
          const allocated = category.allocated || 0
          const remaining = Math.max(0, allocated - spent)
          const overspent = Math.max(0, spent - allocated)
          
          return {
            category: category.name,
            // For stacked bars: spending portion within budget
            spent: Math.min(spent, allocated), // Spending capped at budget
            remaining: remaining, // Unspent budget
            overspent: overspent, // Amount over budget (if any)
            // Keep original values for tooltips/calculations
            totalSpent: spent,
            totalAllocated: allocated,
            color: category.color,
            categoryId: category.id
          }
        })
        .filter(item => item.totalSpent > 0 || item.totalAllocated > 0) // Only show categories with data
        .sort((a, b) => b.totalSpent - a.totalSpent) // Sort by spending (most spent first)
        .slice(0, 5) // Show only top 5 categories by spending
      
      const duration = endMeasurement()
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Bar chart data transform: ${duration.toFixed(2)}ms`)
      }
      
      return data
    }
  )
  
  // Chart color scheme using actual category colors
  const getColor = (bar: any) => {
    return getBarChartColor(bar, categories, chartData)
  }
  
  // Chart keys for stacked bars: spending within budget
  const chartKeys = showBudgetComparison 
    ? ['spent', 'remaining', 'overspent'].filter(key => 
        chartData.some(item => (item as any)[key] > 0)
      )
    : ['spent']
  
  if (chartData.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">No expense data available</div>
          <div className="text-sm text-gray-400">Add some transactions to see your spending breakdown</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`bar-chart-container p-4 ${className}`}>

      {/* Chart */}
      <div style={{ height }} className="w-full">
        <ResponsiveBar
          data={chartData}
          keys={chartKeys}
          indexBy="category"
          margin={{ top: 30, right: 20, bottom: 50, left: 20 }}
          padding={0.2}
          groupMode="stacked"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={getColor}
          borderRadius={4}
          borderWidth={0}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 5,
            tickPadding: 20,
            tickRotation: 0,
            legend: null,
            legendPosition: 'middle',
            legendOffset: 0
          }}
          axisLeft={null}
          enableLabel={false}
          tooltip={({ id, value, indexValue, color }) => {
            const categoryData = chartData.find(item => item.category === indexValue)
            if (!categoryData) return null
            
            const isSpent = id === 'spent'
            const isRemaining = id === 'remaining' 
            const isOverspent = id === 'overspent'
            
            const percentage = isSpent && categoryData.totalAllocated > 0
              ? ((categoryData.totalSpent / categoryData.totalAllocated) * 100).toFixed(1)
              : '100'
            
            return (
              <div className="bg-white p-4 rounded-lg shadow-lg border min-w-[200px]">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium text-gray-900">{indexValue}</span>
                </div>
                
                <div className="text-lg font-semibold text-gray-900 mb-1">
                  ${value.toLocaleString()}
                </div>
                
                {showBudgetComparison && (
                  <div>
                    {isSpent && (
                      <div className="text-sm text-gray-600 mb-2">
                        Spent
                      </div>
                    )}
                    {isRemaining && (
                      <div className="text-sm text-gray-600 mb-2">
                        Budget remaining
                      </div>
                    )}
                    {isOverspent && (
                      <div className="text-sm text-red-600 font-medium mb-2">
                        Over budget
                      </div>
                    )}
                    
                    <div className="pt-2 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Total: ${categoryData.totalSpent.toLocaleString()} / ${categoryData.totalAllocated.toLocaleString()}
                      </div>
                      {isSpent && (
                        <div className="text-xs text-gray-500 mt-1">
                          {percentage}% of budget used
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          }}
          animate={!isTransitioning}
          motionConfig="gentle"
          theme={{
            axis: {
              ticks: {
                text: { fontSize: 12 }
              },
              legend: {
                text: { fontSize: 14, fontWeight: 600 }
              }
            },
            grid: {
              line: {
                stroke: '#f3f4f6',
                strokeWidth: 1
              }
            }
          }}
        />
      </div>
      
      {/* Chart Insights */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-600 mb-1">TOTAL SPENT</div>
          <div className="text-lg font-semibold text-blue-900">
            ${chartData.reduce((sum, item) => sum + item.totalSpent, 0).toLocaleString()}
          </div>
        </div>
        
        {showBudgetComparison && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">TOTAL BUDGET</div>
            <div className="text-lg font-semibold text-gray-900">
              ${chartData.reduce((sum, item) => sum + item.totalAllocated, 0).toLocaleString()}
            </div>
          </div>
        )}
        
        <div className={`p-3 rounded-lg ${
          chartData.some(item => item.overspent > 0) 
            ? 'bg-red-50' 
            : 'bg-green-50'
        }`}>
          <div className={`text-xs mb-1 ${
            chartData.some(item => item.overspent > 0)
              ? 'text-red-600'
              : 'text-green-600'
          }`}>
            STATUS
          </div>
          <div className={`text-lg font-semibold ${
            chartData.some(item => item.overspent > 0)
              ? 'text-red-900'
              : 'text-green-900'
          }`}>
            {chartData.some(item => item.overspent > 0) ? 'Over Budget' : 'On Track'}
          </div>
        </div>
      </div>
    </div>
  )
})