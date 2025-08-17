/**
 * Budget Allocation Chart using Nivo ResponsiveBar
 * Shows horizontal stacked bar chart of budget category allocation
 * Styled to match the current WaterfallChart implementation
 */

'use client'

import React from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { patternLinesDef } from '@nivo/core'
import { formatWaterfallCurrency } from '@/lib/utils/waterfall-calculations'
import { getMockBudgetAllocation, type BudgetCategoryData } from '@/lib/utils/budget-mock-data'

interface BudgetAllocationChartProps {
  data?: BudgetCategoryData[]
  height?: number
  className?: string
  title?: string
}

export function BudgetAllocationChart({
  data,
  height = 160,
  className,
  title = "Budget Allocation"
}: BudgetAllocationChartProps) {
  
  // Use mock data if no data provided
  const budgetData = data || getMockBudgetAllocation()
  
  if (!budgetData || budgetData.length === 0) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-sm text-gray-500">No budget data available</div>
      </div>
    )
  }

  // Calculate total budget
  const totalBudget = budgetData.reduce((sum, item) => sum + item.allocated, 0)
  
  // Calculate dynamic max value based on actual data for appropriate axis intervals
  const dynamicMax = Math.ceil(totalBudget * 1.1 / 100) * 100 // 10% padding, round to nearest 100

  // Transform data for Nivo (matching WaterfallChart structure)
  const chartKeys = budgetData.map(item => item.categoryName)
  
  const budgetRow = {
    category: 'Budget',
    ...budgetData.reduce((acc, item) => ({
      ...acc,
      [item.categoryName]: item.allocated
    }), {})
  }

  const nivoData = [budgetRow]

  // Color mapping function (matches WaterfallChart approach)
  const getCategoryColor = (categoryId: string) => {
    const category = budgetData.find(item => item.categoryName === categoryId)
    return category?.color || '#c5c5c5'
  }

  // Function to mute colors by adding neutral-500 overlay (20% opacity) - matches WaterfallChart
  const getMutedCategoryColor = (categoryId: string) => {
    const originalColor = getCategoryColor(categoryId)
    if (originalColor === '#c5c5c5') {
      return originalColor
    }
    
    // Convert hex to RGB
    const hex = originalColor.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    
    // Neutral-500 gray RGB values: #6b7280 = rgb(107, 114, 128)
    const neutralR = 107
    const neutralG = 114
    const neutralB = 128
    
    // Apply 20% neutral-500 overlay: newColor = originalColor * 0.8 + neutral * 0.2
    const mutedR = Math.round(r * 0.8 + neutralR * 0.2)
    const mutedG = Math.round(g * 0.8 + neutralG * 0.2)
    const mutedB = Math.round(b * 0.8 + neutralB * 0.2)
    
    return `rgb(${mutedR}, ${mutedG}, ${mutedB})`
  }

  // Define line patterns for stripes - exactly like WaterfallChart
  const linePatterns = budgetData.map(item => 
    patternLinesDef(`${item.categoryId}-lines`, {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor(item.categoryName),
      color: 'rgba(0, 0, 0, 0.05)'
    })
  )

  // Define the fill patterns for stripes - exactly like WaterfallChart
  const fillPatterns = budgetData.map(item => ({
    match: { id: item.categoryName },
    id: `${item.categoryId}-lines`
  }))

  return (
    <div className={className}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--juno-text)' }}>
          {title}
        </h3>
        <p className="text-sm" style={{ color: 'var(--juno-muted-fg)' }}>
          Total budgeted: {formatWaterfallCurrency(totalBudget)}
        </p>
      </div>

      {/* Nivo Chart - Matching WaterfallChart styling exactly */}
      <div className="w-full" style={{ height: `${height}px` }}>
        <ResponsiveBar
          data={nivoData}
          keys={chartKeys}
          indexBy="category"
          layout="horizontal"
          margin={{ 
            top: 40, 
            right: 140, // Same as WaterfallChart
            left: 140,  // Same as WaterfallChart
            bottom: 60 
          }}
          groupMode="stacked"
          valueScale={{ 
            type: 'linear',
            min: 0,
            max: dynamicMax // Dynamic max based on actual data
          }}
          indexScale={{ type: 'band', round: true }}
          colors={({ id }) => getMutedCategoryColor(id as string)}
          defs={linePatterns}
          fill={fillPatterns}
          theme={{
            grid: {
              line: {
                stroke: '#e2e8f0',
                strokeWidth: 1,
                strokeDasharray: '3 3'
              }
            },
            axis: {
              ticks: {
                text: {
                  fontSize: 14
                }
              },
              legend: {
                text: {
                  fontSize: 14
                }
              }
            },
            tooltip: {
              container: {
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }
            }
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 5,
            tickRotation: 0,
            legend: null,
            legendPosition: 'middle',
            legendOffset: 32,
            // Match WaterfallChart formatting
            format: value => {
              if (value >= 1000) {
                return `RM${(value / 1000).toFixed(1)}k`
              } else {
                return `RM${value}`
              }
            }
          }}
          axisLeft={{
            tickSize: 0,
            tickPadding: 29, // Same as WaterfallChart
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: -40
          }}
          enableLabel={false}
          tooltip={({ id, value }) => {
            const percentage = ((value / totalBudget) * 100).toFixed(1)
            const correctColor = getCategoryColor(id as string)
            
            return (
              <div className="bg-white rounded-lg p-3 border shadow-lg">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: correctColor }}
                  />
                  <span className="font-medium">{id}</span>
                </div>
                <div className="text-sm mt-1 space-y-1">
                  <div className="font-medium text-lg">
                    {formatWaterfallCurrency(value)}
                  </div>
                  <div className="text-gray-600">
                    {percentage}% of budget
                  </div>
                </div>
              </div>
            )
          }}
          enableGridY={false}
          enableGridX={true}
          animate={true}
          motionConfig="gentle"
          borderRadius={12}
          padding={0.4}
          innerPadding={2}
        />
      </div>
    </div>
  )
}

export default BudgetAllocationChart