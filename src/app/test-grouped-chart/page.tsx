'use client'

import React from 'react'
import { GroupedBarChart } from '@/components/charts/GroupedBarChart'

// Mock data to test the grouped bar chart with category colors
const mockGroupedData = [
  {
    groupName: 'Core',
    groupColor: '#059669',
    groupIcon: '🛒',
    totalSpent: 850,
    totalAllocated: 1000,
    categories: [
      { name: 'Groceries', spent: 420, allocated: 400, color: '#10b981' },
      { name: 'Gas & Transport', spent: 280, allocated: 300, color: '#f59e0b' },
      { name: 'Medical & Health', spent: 150, allocated: 300, color: '#ef4444' }
    ]
  },
  {
    groupName: 'Flexible',
    groupColor: '#7c3aed',
    groupIcon: '🎨',
    totalSpent: 520,
    totalAllocated: 600,
    categories: [
      { name: 'Dining Out', spent: 250, allocated: 200, color: '#8b5cf6' },
      { name: 'Entertainment', spent: 180, allocated: 250, color: '#06b6d4' },
      { name: 'Shopping', spent: 90, allocated: 150, color: '#f59e0b' }
    ]
  },
  {
    groupName: 'Lifestyle',
    groupColor: '#dc2626',
    groupIcon: '📋',
    totalSpent: 1580,
    totalAllocated: 1580,
    categories: [
      { name: 'Rent/Mortgage', spent: 1200, allocated: 1200, color: '#dc2626' },
      { name: 'Utilities', spent: 230, allocated: 200, color: '#059669' },
      { name: 'Phone & Internet', spent: 150, allocated: 180, color: '#3b82f6' }
    ]
  },
  {
    groupName: 'Savings',
    groupColor: '#2563eb',
    groupIcon: '🎯',
    totalSpent: 450,
    totalAllocated: 650,
    categories: [
      { name: 'Emergency Fund', spent: 300, allocated: 300, color: '#2563eb' },
      { name: 'Vacation Fund', spent: 150, allocated: 200, color: '#06b6d4' },
      { name: 'Future Goals', spent: 0, allocated: 150, color: '#8b5cf6' }
    ]
  }
]

export default function TestGroupedChartPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Grouped Bar Chart Test
          </h1>
          <p className="text-gray-600">
            Testing the grouped bar chart with mock data to showcase category colors in stacked bars
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Spending by Category Groups
          </h2>
          
          <GroupedBarChart
            groupedData={mockGroupedData}
            height={500}
            showBudgetComparison={true}
            enableInteraction={true}
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mock Data Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {mockGroupedData.map((group, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: group.groupColor }}
                  />
                  <span className="font-medium">{group.groupName}</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Spent: ${group.totalSpent} / ${group.totalAllocated}
                </div>
                <div className="space-y-1">
                  {group.categories.map((category, catIndex) => (
                    <div key={catIndex} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-2 h-2 rounded"
                          style={{ backgroundColor: category.color }}
                        />
                        <span>{category.name}</span>
                      </div>
                      <span>${category.spent}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}