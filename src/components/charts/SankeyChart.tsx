/**
 * Sankey Chart Component for Mature Data Stage
 * Complete cash flow visualization using Nivo ResponsiveSankey
 */

'use client'

import React, { useMemo, useState } from 'react'
import { ResponsiveSankey } from '@nivo/sankey'
import { getFallbackColor } from '@/lib/utils/chart-colors'
import type { DataMaturityAnalysis, Transaction, BudgetData, CategoryData } from '@/lib/types/chart-progression'

interface SankeyChartProps {
  transactions: Transaction[]
  budget?: BudgetData
  categories: CategoryData[]
  dataAnalysis: DataMaturityAnalysis
  height?: number
  className?: string
  showFlowAnimation?: boolean
  enableAdvancedFeatures?: boolean
  isTransitioning?: boolean
  onEducationRequest?: () => void
  onDataInsight?: (insight: any) => void
}

export function SankeyChart({
  transactions,
  budget,
  categories,
  dataAnalysis,
  height = 400,
  className = '',
  showFlowAnimation = true,
  enableAdvancedFeatures = true,
  isTransitioning = false
}: SankeyChartProps) {
  
  const [highlightedFlow, setHighlightedFlow] = useState<string | null>(null)
  
  // Transform data for Nivo sankey
  const sankeyData = useMemo(() => {
    // Calculate income and expenses
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    // Group expenses by category
    const categoryTotals = new Map<string, number>()
    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        const current = categoryTotals.get(transaction.categoryId) || 0
        categoryTotals.set(transaction.categoryId, current + Math.abs(transaction.amount))
      }
    })
    
    // Calculate total expenses
    const totalExpenses = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0)
    const netFlow = income - totalExpenses
    
    // Create nodes
    const nodes = [
      { id: 'income', nodeColor: '#10b981' },
      { id: 'savings', nodeColor: '#059669' },
      { id: 'debt-payment', nodeColor: '#dc2626' }
    ]
    
    // Add expense category nodes
    categories.forEach(category => {
      const spent = categoryTotals.get(category.id) || 0
      if (spent > 0) {
        nodes.push({
          id: category.name.toLowerCase().replace(/\s+/g, '-'),
          nodeColor: category.color || '#6b7280'
        })
      }
    })
    
    // Create links (flows)
    const links: any[] = []
    
    // Income to categories
    categories.forEach(category => {
      const spent = categoryTotals.get(category.id) || 0
      if (spent > 0) {
        links.push({
          source: 'income',
          target: category.name.toLowerCase().replace(/\s+/g, '-'),
          value: spent
        })
      }
    })
    
    // Income to savings (if positive net flow)
    if (netFlow > 0) {
      links.push({
        source: 'income',
        target: 'savings',
        value: netFlow
      })
    }
    
    // If there's debt or negative flow, show it
    if (netFlow < 0) {
      links.push({
        source: 'debt-payment',
        target: 'income',
        value: Math.abs(netFlow)
      })
    }
    
    return { nodes, links }
  }, [transactions, categories])
  
  // Calculate flow efficiency metrics
  const flowMetrics = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0
    const expenseRatio = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0
    
    return {
      totalIncome,
      totalExpenses,
      netFlow: totalIncome - totalExpenses,
      savingsRate,
      expenseRatio
    }
  }, [transactions])
  
  // Handle flow highlighting
  const handleLinkHover = (link: any) => {
    if (enableAdvancedFeatures) {
      setHighlightedFlow(link ? `${link.source.id}-${link.target.id}` : null)
    }
  }
  
  // Color scheme using actual category colors
  const getNodeColor = (node: any) => {
    // Find the category for this node
    const category = categories.find(cat => 
      cat.name.toLowerCase().replace(/\s+/g, '-') === node.id ||
      cat.name === node.id
    )
    
    if (category) {
      return category.color
    }
    
    // Special colors for income and savings nodes
    if (node.id === 'income') return '#10b981' // Green for income
    if (node.id === 'savings') return '#8b5cf6' // Purple for savings
    
    // Fallback color
    return getFallbackColor(0)
  }
  
  if (sankeyData.links.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-50 rounded-lg border ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 mb-2">Insufficient data for cash flow analysis</div>
          <div className="text-sm text-gray-400">Continue tracking to unlock advanced flow visualization</div>
        </div>
      </div>
    )
  }
  
  return (
    <div className={`sankey-chart-container ${className}`}>
      {/* Chart Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Complete Cash Flow Analysis
        </h3>
        <p className="text-sm text-gray-600">
          Visualizing money flow from income through {dataAnalysis.categoryCount} expense categories
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-green-600 mb-1">INCOME</div>
          <div className="text-lg font-semibold text-green-900">
            ${flowMetrics.totalIncome.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="text-xs text-red-600 mb-1">EXPENSES</div>
          <div className="text-lg font-semibold text-red-900">
            ${flowMetrics.totalExpenses.toLocaleString()}
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${
          flowMetrics.netFlow >= 0 ? 'bg-blue-50' : 'bg-orange-50'
        }`}>
          <div className={`text-xs mb-1 ${
            flowMetrics.netFlow >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            NET FLOW
          </div>
          <div className={`text-lg font-semibold ${
            flowMetrics.netFlow >= 0 ? 'text-blue-900' : 'text-orange-900'
          }`}>
            {flowMetrics.netFlow >= 0 ? '+' : ''}${flowMetrics.netFlow.toLocaleString()}
          </div>
        </div>
        
        <div className={`p-3 rounded-lg ${
          flowMetrics.savingsRate >= 20 ? 'bg-emerald-50' : 
          flowMetrics.savingsRate >= 10 ? 'bg-yellow-50' : 'bg-red-50'
        }`}>
          <div className={`text-xs mb-1 ${
            flowMetrics.savingsRate >= 20 ? 'text-emerald-600' : 
            flowMetrics.savingsRate >= 10 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            SAVINGS RATE
          </div>
          <div className={`text-lg font-semibold ${
            flowMetrics.savingsRate >= 20 ? 'text-emerald-900' : 
            flowMetrics.savingsRate >= 10 ? 'text-yellow-900' : 'text-red-900'
          }`}>
            {flowMetrics.savingsRate.toFixed(1)}%
          </div>
        </div>
      </div>
      
      {/* Chart */}
      <div style={{ height }} className="w-full">
        <ResponsiveSankey
          data={sankeyData}
          margin={{ top: 20, right: 120, bottom: 20, left: 120 }}
          align="justify"
          colors={getNodeColor}
          nodeOpacity={1}
          nodeHoverOthersOpacity={0.35}
          nodeThickness={18}
          nodeSpacing={24}
          nodeBorderWidth={0}
          nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.8]] }}
          nodeBorderRadius={3}
          linkOpacity={0.5}
          linkHoverOpacity={0.8}
          linkHoverOthersOpacity={0.1}
          linkContract={3}
          enableLinkGradient={true}
          labelPosition="outside"
          labelOrientation="vertical"
          labelPadding={16}
          labelTextColor="#374151"
          animate={showFlowAnimation && !isTransitioning}
          motionConfig="gentle"
          onLinkMouseEnter={handleLinkHover}
          onLinkMouseLeave={() => handleLinkHover(null)}
          tooltip={({ node, link }) => {
            if (link) {
              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                  <div className="font-medium mb-2">
                    {link.source.id} → {link.target.id}
                  </div>
                  <div className="text-lg font-semibold">
                    ${link.value.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((link.value / flowMetrics.totalIncome) * 100).toFixed(1)}% of income
                  </div>
                </div>
              )
            }
            
            if (node) {
              const nodeValue = node.value || 0
              return (
                <div className="bg-white p-3 rounded-lg shadow-lg border">
                  <div className="font-medium mb-2">{node.id}</div>
                  <div className="text-lg font-semibold">
                    ${nodeValue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((nodeValue / flowMetrics.totalIncome) * 100).toFixed(1)}% of income
                  </div>
                </div>
              )
            }
            
            return null
          }}
          theme={{
            labels: {
              text: {
                fontSize: 12,
                fontWeight: 600
              }
            }
          }}
        />
      </div>
      
      {/* Flow Analysis Insights */}
      {enableAdvancedFeatures && (
        <div className="mt-4 space-y-4">
          {/* Flow Efficiency Score */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold mb-3">Flow Efficiency Analysis</h4>
            <div className="space-y-2">
              {flowMetrics.savingsRate >= 20 && (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Excellent savings rate - you're building wealth effectively
                </div>
              )}
              
              {flowMetrics.savingsRate < 10 && flowMetrics.savingsRate >= 0 && (
                <div className="flex items-center gap-2 text-sm text-yellow-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  Consider increasing your savings rate to 10-20%
                </div>
              )}
              
              {flowMetrics.savingsRate < 0 && (
                <div className="flex items-center gap-2 text-sm text-red-700">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Spending exceeds income - review expense categories
                </div>
              )}
              
              {dataAnalysis.categoryDistribution > 0.7 && (
                <div className="flex items-center gap-2 text-sm text-blue-700">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  Well-diversified spending across categories
                </div>
              )}
            </div>
          </div>
          
          {/* Optimization Suggestions */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-900 mb-3">Optimization Opportunities</h4>
            <div className="space-y-2 text-sm text-blue-800">
              {/* Find largest expense category */}
              {(() => {
                const largestExpense = sankeyData.links
                  .filter(link => link.source === 'income' && link.target !== 'savings')
                  .reduce((max, link) => link.value > (max?.value || 0) ? link : max, null)
                
                if (largestExpense) {
                  return (
                    <div>• Your largest expense is {largestExpense.target} (${largestExpense.value.toLocaleString()})</div>
                  )
                }
                return null
              })()}
              
              {flowMetrics.savingsRate < 15 && (
                <div>• Target a 15-20% savings rate for long-term financial health</div>
              )}
              
              {dataAnalysis.categoryCount > 8 && (
                <div>• Consider consolidating some expense categories for simpler tracking</div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Interactive hint */}
      <div className="mt-2 text-xs text-gray-500 text-center">
        💡 Hover over flows to see detailed money movement patterns
      </div>
    </div>
  )
}