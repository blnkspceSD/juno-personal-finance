'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { CustomGroupedBarChart } from '@/components/charts/CustomGroupedBarChart'
import { ProgressiveChart } from '@/components/charts/ProgressiveChart'
import NumberFlow from '@number-flow/react'
import type { BudgetWithCategories } from '@/lib/types/database'

interface SpendingOverviewSectionProps {
  currentSpending: number
  budgetLimit: number
  groupedSpendingData: {
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
  }[]
  chartTransactions: {
    id: string
    description: string
    amount: number
    date: string
    category_id: string
    category_name: string
  }[]
  currentBudget: BudgetWithCategories | null
}

export function SpendingOverviewSection({
  currentSpending,
  budgetLimit,
  groupedSpendingData,
  chartTransactions,
  currentBudget
}: SpendingOverviewSectionProps) {
  const [animatedSpending, setAnimatedSpending] = useState(0)
  const [animatedBudget, setAnimatedBudget] = useState(0)

  useEffect(() => {
    // Start from 0 and animate to actual values to show the animation
    const timer1 = setTimeout(() => setAnimatedSpending(currentSpending), 100)
    const timer2 = setTimeout(() => setAnimatedBudget(budgetLimit), 200)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [currentSpending, budgetLimit])


  return (
    <Card className="bg-juno-surface-50 rounded-juno-xl shadow-juno-card-with-stroke">
      <CardHeader className="pb-juno-4">
        <div className="space-y-juno-2">
          <p className="text-sm text-gray-400 font-medium tracking-wider">SPENDING THIS MONTH</p>
          <div className="flex items-baseline space-x-juno-2">
            <span className="text-4xl font-medium text-juno-text tracking-tight font-mono">
              <NumberFlow 
                value={animatedSpending}
                prefix="RM "
                format={{
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }}
                transformTiming={{
                  duration: 500,
                  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                spinTiming={{
                  duration: 600,
                  easing: 'cubic-bezier(0, 0, 0.2, 1)'
                }}
                opacityTiming={{
                  duration: 300,
                  easing: 'ease-out'
                }}
                style={{
                  fontVariantNumeric: 'tabular-nums'
                }}
              />
            </span>
            <span className="text-lg text-juno-muted-fg font-mono">
              / <NumberFlow 
                value={animatedBudget}
                prefix="RM "
                format={{
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                }}
                transformTiming={{
                  duration: 500,
                  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                spinTiming={{
                  duration: 600,
                  easing: 'cubic-bezier(0, 0, 0.2, 1)'
                }}
                opacityTiming={{
                  duration: 300,
                  easing: 'ease-out'
                }}
                style={{
                  fontVariantNumeric: 'tabular-nums'
                }}
              />
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Chart - Grouped or Progressive */}
        <div className="px-juno-6 pb-juno-6">
          {groupedSpendingData.length > 0 ? (
            <CustomGroupedBarChart
              groupedData={groupedSpendingData}
              height={400}
              className="w-full"
              showBudgetComparison={true}
              animate={true}
            />
          ) : (
            <ProgressiveChart
                transactions={chartTransactions.map(transaction => ({
                  id: transaction.id,
                  amount: Math.abs(transaction.amount),
                  date: transaction.date,
                  categoryId: transaction.category_id,
                  categoryName: transaction.category_name,
                  description: transaction.description,
                  type: transaction.amount > 0 ? 'income' : 'expense'
                }))}
                budget={currentBudget ? {
                  id: currentBudget.id,
                  totalIncome: currentBudget.total_income,
                  period: new Date().toISOString().slice(0, 7),
                  categories: currentBudget.categories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    allocated: cat.allocated,
                    spent: cat.spent,
                    color: cat.color,
                    type: 'expense' as const,
                    isEssential: ['groceries', 'rent', 'utilities', 'insurance'].some(keyword => 
                      cat.name.toLowerCase().includes(keyword)
                    )
                  }))
                } : undefined}
                categories={currentBudget?.categories.map(cat => ({
                  id: cat.id,
                  name: cat.name,
                  allocated: cat.allocated,
                  spent: cat.spent,
                  color: cat.color,
                  type: 'expense' as const,
                  isEssential: ['groceries', 'rent', 'utilities', 'insurance'].some(keyword => 
                    cat.name.toLowerCase().includes(keyword)
                  )
                })) || []}
                height={400}
                className="w-full"
              />
          )}
        </div>
      </CardContent>
    </Card>
  )
}