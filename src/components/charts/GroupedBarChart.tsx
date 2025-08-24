/**
 * Grouped Bar Chart Component - Figma Design Recreation
 * Recreated from scratch with proper spacing and layout
 */

'use client'

import React from 'react'
import { ResponsiveBar } from '@nivo/bar'

interface GroupedSpendingData {
  groupName: string
  groupColor: string
  groupIcon?: string
  totalSpent: number
  totalAllocated: number
  categories: {
    name: string
    spent: number
    allocated: number
    color: string
  }[]
}

interface GroupedBarChartProps {
  groupedData: GroupedSpendingData[]
  height?: number
  className?: string
  showBudgetComparison?: boolean
  enableInteraction?: boolean
}

export const GroupedBarChart = React.memo(function GroupedBarChart({
  groupedData,
  height = 400,
  className = '',
  showBudgetComparison = true,
  enableInteraction = true
}: GroupedBarChartProps) {
  
  // Define gradients for Figma design
  const gradientDefs = [
    {
      id: 'spentGradient',
      type: 'linearGradient',
      colors: [
        { offset: 0, color: '#DBF3FF' },
        { offset: 100, color: '#FAFDFF' }
      ]
    },
    {
      id: 'overspentGradient', 
      type: 'linearGradient',
      colors: [
        { offset: 0, color: '#FF6B85' },
        { offset: 100, color: '#FFEBEF' }
      ]
    }
  ]
  
  // Transform data following Figma design pattern
  const chartData = groupedData.map(group => {
    const remaining = Math.max(0, group.totalAllocated - group.totalSpent)
    const overspent = Math.max(0, group.totalSpent - group.totalAllocated)
    
    return {
      group: group.groupName,
      spent: Math.min(group.totalSpent, group.totalAllocated),
      remaining: remaining,
      overspent: overspent,
      groupColor: group.groupColor
    }
  })
  
  // Chart keys for stacked bars
  const chartKeys = showBudgetComparison 
    ? ['spent', 'remaining', 'overspent'].filter(key => 
        chartData.some(item => (item as any)[key] > 0)
      )
    : ['spent']
  
  // Color mapping with gradients following Figma design
  const getColor = (bar: any) => {
    const { id } = bar
    
    if (id === 'spent') {
      return 'url(#spentGradient)' // Light blue gradient
    } else if (id === 'remaining') {
      return '#E5E7EB' // Light gray for remaining budget
    } else if (id === 'overspent') {
      return 'url(#overspentGradient)' // Red gradient for overspending
    }
    
    return '#E5E7EB'
  }

  if (chartData.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center text-gray-500">
          <div>No spending data available</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`${className}`}>
      <div style={{ height }} className="w-full">
        <ResponsiveBar
          data={chartData}
          keys={chartKeys}
          indexBy="group"
          margin={{ top: 40, right: 40, bottom: 120, left: 40 }}
          padding={0.3}
          groupMode="stacked"
          valueScale={{ type: 'linear' }}
          indexScale={{ type: 'band', round: true }}
          colors={getColor}
          defs={gradientDefs}
          borderRadius={0}
          borderWidth={2}
          borderColor={(bar: any) => {
            if (bar.id === 'spent') return '#86D6FF'
            if (bar.id === 'overspent') return '#FF6B85'
            return 'rgba(0,0,0,0)'
          }}
          axisTop={null}
          axisRight={null}
          axisBottom={{
            tickSize: 0,
            tickPadding: 32,
            tickRotation: 0,
            legend: null,
            format: (value) => value
          }}
          axisLeft={null}
          enableLabel={false}
          enableGridY={true}
          gridYValues={4}
          tooltip={({ id, value, indexValue }) => {
            const label = id === 'spent' ? 'Spent' : id === 'remaining' ? 'Remaining' : 'Overspent'
            return (
            <div 
              style={{
                background: 'white',
                padding: '12px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '14px'
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px', color: '#1f2937' }}>
                {indexValue} - {label}
              </div>
              <div style={{ color: '#6b7280' }}>
                ${value.toLocaleString()}
              </div>
            </div>
            )
          }}
          animate={enableInteraction}
          motionConfig="gentle"
          theme={{
            background: 'transparent',
            text: {
              fontSize: 14,
              fontWeight: 500,
              fill: '#374151'
            },
            grid: {
              line: {
                stroke: '#f3f4f6',
                strokeWidth: 1
              }
            },
            axis: {
              domain: {
                line: {
                  stroke: 'transparent'
                }
              },
              ticks: {
                line: {
                  stroke: 'transparent'
                },
                text: {
                  fontSize: 14,
                  fontWeight: 500,
                  fill: '#374151'
                }
              }
            }
          }}
        />
      </div>
    </div>
  )
})

export default GroupedBarChart