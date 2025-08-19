/**
 * Progressive Chart Demo Wrapper
 * Demonstrates the new progressive chart system alongside the old waterfall chart
 */

'use client'

import React, { useMemo } from 'react'
import { ProgressiveChart } from './ProgressiveChart'
import { ChartErrorBoundary } from './ChartErrorBoundary'
import type { Transaction, BudgetData, CategoryData } from '@/lib/types/chart-progression'
import type { BudgetWithCategories } from '@/lib/types/database'

interface ProgressiveChartDemoProps {
  currentBudget?: BudgetWithCategories | null
  recentTransactions?: {
    id: string
    description: string
    amount: number
    date: string
    category_id: string
    category_name: string
  }[]
  height?: number
  className?: string
  isLoading?: boolean
}

export function ProgressiveChartDemo({
  currentBudget,
  recentTransactions = [],
  height = 800,
  className = '',
  isLoading = false
}: ProgressiveChartDemoProps) {
  
  // Convert real transaction data to progressive chart format
  const { transactions, budget, categories } = useMemo(() => {
    if (!currentBudget) {
      return {
        transactions: [],
        budget: undefined,
        categories: []
      }
    }
    
    // Convert real transactions to progressive chart format
    const realTransactions: Transaction[] = recentTransactions.map(transaction => ({
      id: transaction.id,
      amount: Math.abs(transaction.amount), // Ensure positive for amount
      date: transaction.date,
      categoryId: transaction.category_id,
      categoryName: transaction.category_name,
      description: transaction.description,
      type: transaction.amount > 0 ? 'income' : 'expense'
    }))
    
    // If we have a budget but no recent transactions, we need to fetch more data
    // For now, we'll use the recent transactions but also add some demo data if needed
    let allTransactions = [...realTransactions]
    
    // Add supplemental transactions from category spent amounts if we don't have enough real data
    if (realTransactions.length < 5 && currentBudget.categories.some(cat => cat.spent > 0)) {
      const supplementalTransactions: Transaction[] = currentBudget.categories.flatMap(category => {
        if (category.spent <= 0) return []
        
        // Only add supplemental if we don't have real transactions for this category
        const hasRealTransactions = realTransactions.some(t => t.categoryId === category.id)
        if (hasRealTransactions) return []
        
        // Create one representative transaction per category with spending
        return [{
          id: `supplemental-${category.id}`,
          amount: category.spent,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          categoryId: category.id,
          categoryName: category.name,
          description: `Spending in ${category.name}`,
          type: 'expense' as const
        }]
      })
      
      allTransactions = [...realTransactions, ...supplementalTransactions]
    }
    
    // Convert budget
    const budgetData: BudgetData = {
      id: currentBudget.id,
      totalIncome: currentBudget.total_income,
      period: new Date().toISOString().slice(0, 7), // YYYY-MM format
      categories: currentBudget.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        allocated: cat.allocated,
        spent: cat.spent,
        color: cat.color,
        type: 'expense' as const,
        isEssential: isEssentialCategory(cat.name)
      }))
    }
    
    // Convert categories
    const categoryData: CategoryData[] = currentBudget.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      allocated: cat.allocated,
      spent: cat.spent,
      color: cat.color,
      type: 'expense' as const,
      isEssential: isEssentialCategory(cat.name)
    }))
    
    return {
      transactions: allTransactions,
      budget: budgetData,
      categories: categoryData
    }
  }, [currentBudget, recentTransactions])
  
  // Handle chart stage changes
  const handleStageChange = (newStage: any, analysis: any) => {
    console.log('📊 Progressive Chart Stage Change:', { 
      newStage, 
      confidence: analysis.confidence,
      dataRichness: analysis.dataRichness,
      transactionCount: analysis.transactionCount
    })
  }
  
  // Handle education requests
  const handleEducationRequest = (stage: any) => {
    console.log('📚 Education requested for stage:', stage)
    // In a real implementation, this would open a help modal or tutorial
  }
  
  // Handle data insights
  const handleDataInsight = (insight: any) => {
    console.log('💡 Data insight:', insight)
    // In a real implementation, this would display insights to the user
  }
  
  return (
    <div className={`progressive-chart-demo ${className}`}>
      
      {/* Progressive Chart */}
      <ChartErrorBoundary 
        chartTitle="Progressive Chart System"
        height={height}
        onError={(error, errorInfo) => {
          console.error('Progressive Chart Error:', { error, errorInfo, transactions: transactions.length })
        }}
      >
        <ProgressiveChart
          transactions={transactions}
          budget={budget}
          categories={categories}
          height={height}
          isLoading={isLoading}
          onStageChange={handleStageChange}
          onEducationRequest={handleEducationRequest}
          onDataInsight={handleDataInsight}
          className="border rounded-lg p-4"
        />
      </ChartErrorBoundary>
      
    </div>
  )
}

/**
 * Helper function to determine if a category is essential
 */
function isEssentialCategory(categoryName: string): boolean {
  const essentialKeywords = [
    'groceries', 'food', 'rent', 'mortgage', 'utilities', 'insurance', 
    'gas', 'fuel', 'bills', 'transport', 'healthcare', 'medicine'
  ]
  
  const name = categoryName.toLowerCase()
  return essentialKeywords.some(keyword => name.includes(keyword))
}

export default ProgressiveChartDemo