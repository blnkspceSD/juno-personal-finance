/**
 * Real-time Dashboard Component with live balance updates
 * Provides instant feedback when transactions are added or modified
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown, DollarSign, Wifi, WifiOff } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useRealtimeBalance } from '@/lib/hooks/useRealtimeBalance'
import { useRealtimeContext } from '@/lib/context/RealtimeContext'
import { calculateBudgetSummary } from '@/lib/utils/budget-calculations'
import { formatCurrency, getCurrencyClasses } from '@/lib/utils/currency'
import { RealtimeCategoryTable } from '@/components/tables/RealtimeCategoryTable'
import { TransactionTable, TransactionTableRow } from '@/components/tables/TransactionTable'
import type { BudgetWithCategories } from '@/lib/types/database'

interface RealtimeDashboardProps {
  initialBudget: BudgetWithCategories | null
  user: {
    id: string
    email?: string
    user_metadata?: {
      name?: string
    }
  } | null
  monthlySpendingData?: {
    month: string
    actual: number
    estimated: number
  }[]
  recentTransactions?: {
    id: string
    description: string
    amount: number
    date: string
    category_id: string
    category_name: string
  }[]
}

export function RealtimeDashboard({ initialBudget, user, monthlySpendingData = [], recentTransactions = [] }: RealtimeDashboardProps) {
  const [currentBudget, setCurrentBudget] = useState<BudgetWithCategories | null>(initialBudget)
  const { setBudget } = useRealtimeContext()
  const initializedRef = useRef<string | null>(null)
  
  // Set up real-time balance updates for current budget
  const {
    envelopes,
    isConnected,
    isReconnecting,
    hasError,
    updateEnvelopes
  } = useRealtimeBalance(currentBudget?.id || '')

  // Initialize realtime context with budget data (only once per budget)
  useEffect(() => {
    if (currentBudget && initializedRef.current !== currentBudget.id) {
      initializedRef.current = currentBudget.id
      setBudget(currentBudget.id, currentBudget)
      updateEnvelopes(currentBudget.categories)
    }
  }, [currentBudget?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Update budget when envelopes change
  useEffect(() => {
    if (currentBudget && envelopes.length > 0) {
      // Only update if envelopes actually changed to prevent unnecessary re-renders
      const hasChanges = envelopes.some(envelope => {
        const existingCategory = currentBudget.categories.find(c => c.id === envelope.id)
        return !existingCategory || 
               existingCategory.spent !== (envelope.total_spent || envelope.spent) ||
               existingCategory.allocated !== envelope.allocated
      })

      if (hasChanges) {
        setCurrentBudget(prevBudget => {
          if (!prevBudget) return prevBudget
          
          return {
            ...prevBudget,
            categories: envelopes.map(envelope => ({
              id: envelope.id,
              user_id: envelope.user_id,
              budget_id: envelope.budget_id,
              name: envelope.name,
              allocated: envelope.allocated,
              spent: envelope.total_spent || envelope.spent,
              sort_order: envelope.sort_order,
              color: envelope.color,
              created_at: envelope.created_at,
              updated_at: envelope.updated_at,
              transactions: [] // Add empty transactions array to match CategoryWithTransactions type
            }))
          }
        })
      }
    }
  }, [envelopes]) // Only depend on envelopes to break circular loop

  const hasActiveBudget = currentBudget && currentBudget.categories.length > 0
  const budgetSummary = currentBudget ? calculateBudgetSummary(currentBudget) : null

  // Use real spending data from database or fall back to empty array
  const spendingChartData = monthlySpendingData.length > 0 ? monthlySpendingData : [
    // Fallback data if no real data available
    { month: "No data", actual: 0, estimated: 0 }
  ]

  const chartConfig = {
    actual: {
      label: "Actual Spending",
      color: "var(--chart-1)",
    },
    estimated: {
      label: "Estimated Spending", 
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig

  // Current spending metrics - use real budget data
  const currentSpending = budgetSummary?.total_spent || 0
  const budgetLimit = budgetSummary?.total_income || 0
  const spendingProgress = budgetLimit > 0 ? (currentSpending / budgetLimit) * 100 : 0

  // Tab state
  const [activeTab, setActiveTab] = useState('spending')

  // Use real recent transactions or show empty state
  const displayTransactions = recentTransactions.length > 0 ? recentTransactions : []

  return (
    <div className="space-y-8">
      {/* Connection Status Indicator */}
      {hasActiveBudget && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isConnected ? (
              <>
                <Wifi className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Live updates active</span>
              </>
            ) : isReconnecting ? (
              <>
                <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-blue-600">Reconnecting...</span>
              </>
            ) : hasError ? (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Connection lost</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Connecting...</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'spending', label: 'Spending' },
          { id: 'networth', label: 'Net worth' },
          { id: 'investments', label: 'Investments' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Spending Metric Display */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground font-medium">SPENDING THIS MONTH</p>
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-bold tracking-tight">
            ${currentSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xl text-muted-foreground">
            / ${budgetLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-foreground h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(spendingProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Spending Chart */}
      <div className="space-y-4">
        <div className="h-[400px]">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={spendingChartData} margin={{ top: 20, left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dashed" />}
              />
              <Bar dataKey="estimated" fill="var(--color-estimated)" radius={4} />
              <Bar dataKey="actual" fill="var(--color-actual)" radius={4} />
            </BarChart>
          </ChartContainer>
        </div>
        <div className="flex items-center justify-end gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-chart-1"></div>
            <span className="text-sm text-muted-foreground">Current Period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-chart-2"></div>
            <span className="text-sm text-muted-foreground">Last Period</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Button className="btn--secondary">
            <Plus className="h-4 w-4" />
            Add transaction
          </Button>
        </div>
        
        <TransactionTable 
          data={displayTransactions as TransactionTableRow[]}
          onEdit={(transaction) => {
            console.log('Edit transaction:', transaction)
            // TODO: Implement transaction editing
          }}
          onDelete={(transaction) => {
            console.log('Delete transaction:', transaction)
            // TODO: Implement transaction deletion
          }}
        />
      </div>

      {hasActiveBudget ? (
        <>
          {/* Category Management Table */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">Your Envelopes</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/transactions/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/budget/${currentBudget.id}`}>
                    Edit Budget
                  </Link>
                </Button>
              </div>
            </div>
            
            <RealtimeCategoryTable
              budgetId={currentBudget.id}
              initialCategories={currentBudget.categories}
              onEdit={(category) => {
                // TODO: Implement category editing
                console.log('Edit category:', category)
              }}
              onDelete={(category) => {
                // TODO: Implement category deletion
                console.log('Delete category:', category)
              }}
              onAllocate={(category) => {
                // TODO: Implement allocation editing
                console.log('Allocate category:', category)
              }}
            />
          </div>
        </>
      ) : (
        <>
          {/* Getting Started Section */}
          <Card>
            <CardHeader>
              <CardTitle>Create Your First Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Let&apos;s get started by creating your monthly budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. 
                You&apos;ll allocate your income into different spending categories (envelopes).
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild>
                  <Link href="/dashboard/budget/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Envelope Status (Empty State) */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Envelopes</CardTitle>
                <span className="text-sm text-muted-foreground">0 envelopes</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="mx-auto h-24 w-24 bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <svg className="h-12 w-12 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">No envelopes yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first budget to start organizing your money into envelopes.
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}