/**
 * Budget Visualization Chart
 * Interactive charts for budget allocation visualization
 */

'use client'

import { useMemo } from 'react'
import { formatCurrency } from '@/lib/utils/currency'
import type { CategoryWithGroup } from '@/lib/types/database'

interface BudgetVisualizationChartProps {
  categories: CategoryWithGroup[]
  type: 'pie' | 'bar'
  showSpent?: boolean
  interactive?: boolean
  onCategoryClick?: (categoryId: string) => void
}

interface ChartDataPoint {
  id: string
  name: string
  allocated: number
  spent: number
  color: string
  group_name?: string
  percentage: number
}

export function BudgetVisualizationChart({
  categories,
  type = 'pie',
  showSpent = false,
  interactive = false,
  onCategoryClick
}: BudgetVisualizationChartProps) {
  // Prepare chart data
  const chartData = useMemo((): ChartDataPoint[] => {
    const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocated, 0)
    
    return categories
      .filter(cat => cat.allocated > 0)
      .map(cat => ({
        id: cat.id,
        name: cat.name,
        allocated: cat.allocated,
        spent: cat.spent,
        color: cat.color || '#6366f1',
        group_name: cat.group_name,
        percentage: totalAllocated > 0 ? (cat.allocated / totalAllocated) * 100 : 0
      }))
      .sort((a, b) => b.allocated - a.allocated)
  }, [categories])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <div className="text-gray-500 mb-2">No budget data to display</div>
          <div className="text-sm text-gray-400">Create categories with budget allocations to see charts</div>
        </div>
      </div>
    )
  }

  if (type === 'pie') {
    return <PieChart data={chartData} showSpent={showSpent} interactive={interactive} onCategoryClick={onCategoryClick} />
  }

  return <BarChart data={chartData} showSpent={showSpent} interactive={interactive} onCategoryClick={onCategoryClick} />
}

// Pie Chart Component
function PieChart({ 
  data, 
  showSpent, 
  interactive, 
  onCategoryClick 
}: { 
  data: ChartDataPoint[]
  showSpent: boolean
  interactive: boolean
  onCategoryClick?: (categoryId: string) => void
}) {
  const size = 200
  const center = size / 2
  const radius = 80

  // Calculate pie slices
  const slices = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.allocated, 0)
    let currentAngle = 0

    return data.map(item => {
      const sliceAngle = (item.allocated / total) * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + sliceAngle
      
      // Calculate path for arc
      const startAngleRad = (startAngle - 90) * (Math.PI / 180)
      const endAngleRad = (endAngle - 90) * (Math.PI / 180)
      
      const x1 = center + radius * Math.cos(startAngleRad)
      const y1 = center + radius * Math.sin(startAngleRad)
      const x2 = center + radius * Math.cos(endAngleRad)
      const y2 = center + radius * Math.sin(endAngleRad)
      
      const largeArcFlag = sliceAngle > 180 ? 1 : 0
      
      const pathData = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ')

      currentAngle += sliceAngle

      return {
        ...item,
        pathData,
        startAngle,
        endAngle,
        sliceAngle
      }
    })
  }, [data, center, radius])

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <svg width={size} height={size} className="drop-shadow-sm">
          {slices.map((slice) => (
            <g key={slice.id}>
              <path
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth={2}
                className={interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
                onClick={() => interactive && onCategoryClick?.(slice.id)}
              />
              {/* Show spent portion as inner arc if enabled */}
              {showSpent && slice.spent > 0 && (
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  fillOpacity={0.3}
                  stroke="white"
                  strokeWidth={1}
                  style={{
                    clipPath: `inset(0 ${100 - (slice.spent / slice.allocated) * 100}% 0 0)`
                  }}
                />
              )}
            </g>
          ))}
          
          {/* Center circle */}
          <circle
            cx={center}
            cy={center}
            r={30}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth={2}
          />
          
          {/* Total amount in center */}
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            className="text-xs font-semibold fill-gray-900"
          >
            Total
          </text>
          <text
            x={center}
            y={center + 8}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {formatCurrency(data.reduce((sum, item) => sum + item.allocated, 0))}
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
        {slices.map((slice) => (
          <div 
            key={slice.id}
            className={`flex items-center gap-2 p-2 rounded ${
              interactive ? 'cursor-pointer hover:bg-gray-50' : ''
            }`}
            onClick={() => interactive && onCategoryClick?.(slice.id)}
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{slice.name}</div>
              <div className="text-xs text-gray-600">
                {formatCurrency(slice.allocated)} ({slice.percentage.toFixed(1)}%)
                {showSpent && slice.spent > 0 && (
                  <span className="text-gray-500"> • Spent: {formatCurrency(slice.spent)}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Bar Chart Component
function BarChart({ 
  data, 
  showSpent, 
  interactive, 
  onCategoryClick 
}: { 
  data: ChartDataPoint[]
  showSpent: boolean
  interactive: boolean
  onCategoryClick?: (categoryId: string) => void
}) {
  const maxValue = Math.max(...data.map(item => item.allocated))
  
  return (
    <div className="space-y-3">
      {data.map((item) => {
        const allocatedWidth = maxValue > 0 ? (item.allocated / maxValue) * 100 : 0
        const spentWidth = item.allocated > 0 ? (item.spent / item.allocated) * allocatedWidth : 0
        
        return (
          <div 
            key={item.id}
            className={`space-y-1 ${interactive ? 'cursor-pointer' : ''}`}
            onClick={() => interactive && onCategoryClick?.(item.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="font-medium text-sm">{item.name}</div>
                {item.group_name && (
                  <div className="text-xs text-gray-500">({item.group_name})</div>
                )}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(item.allocated)}
                {showSpent && (
                  <span className="text-gray-500 ml-2">
                    / {formatCurrency(item.spent)} spent
                  </span>
                )}
              </div>
            </div>
            
            <div className="relative">
              {/* Background bar */}
              <div className="w-full h-6 bg-gray-100 rounded-full overflow-hidden">
                {/* Allocated amount bar */}
                <div
                  className={`h-full transition-all duration-300 ${
                    interactive ? 'hover:opacity-80' : ''
                  }`}
                  style={{
                    backgroundColor: item.color,
                    width: `${allocatedWidth}%`
                  }}
                />
                
                {/* Spent amount overlay */}
                {showSpent && item.spent > 0 && (
                  <div
                    className="absolute top-0 left-0 h-full bg-black bg-opacity-20 transition-all duration-300"
                    style={{ width: `${spentWidth}%` }}
                  />
                )}
              </div>
              
              {/* Percentage label */}
              <div className="absolute right-2 top-0 h-6 flex items-center">
                <span className="text-xs font-medium text-white drop-shadow">
                  {item.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )
      })}
      
      {/* Chart summary */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex justify-between text-sm font-medium">
          <span>Total Allocated:</span>
          <span>{formatCurrency(data.reduce((sum, item) => sum + item.allocated, 0))}</span>
        </div>
        {showSpent && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Total Spent:</span>
            <span>{formatCurrency(data.reduce((sum, item) => sum + item.spent, 0))}</span>
          </div>
        )}
      </div>
    </div>
  )
}