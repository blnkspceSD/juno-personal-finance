/**
 * Real-time Dashboard Component with live balance updates
 * Provides instant feedback when transactions are added or modified
 */

'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown, DollarSign, Wifi, WifiOff } from 'lucide-react'
import { useRealtimeBalance } from '@/lib/hooks/useRealtimeBalance'
import { useRealtimeContext } from '@/lib/context/RealtimeContext'
import { calculateBudgetSummary } from '@/lib/utils/budget-calculations'
import { formatCurrency, getCurrencyClasses } from '@/lib/utils/currency'
import { RealtimeCategoryTable } from '@/components/tables/RealtimeCategoryTable'
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
}

export function RealtimeDashboard({ initialBudget, user }: RealtimeDashboardProps) {
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

      {/* Welcome Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {user?.user_metadata?.name || 'there'}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                {hasActiveBudget 
                  ? `Managing your ${currentBudget.name}` 
                  : "Let's take control of your finances with envelope budgeting"
                }
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center">
                <svg className="h-8 w-8 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Income</p>
                <p className={getCurrencyClasses("text-2xl font-bold text-foreground")}>
                  {formatCurrency(budgetSummary?.total_income || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
                <p className={getCurrencyClasses("text-2xl font-bold text-foreground")}>
                  {formatCurrency(budgetSummary?.total_spent || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available to Budget</p>
                <p className={getCurrencyClasses(`text-2xl font-bold ${
                  (budgetSummary?.available_to_budget || 0) < 0 
                    ? 'text-red-600' 
                    : 'text-foreground'
                }`)}>
                  {formatCurrency(budgetSummary?.available_to_budget || 0)}
                </p>
              </div>
              <div className="h-12 w-12 bg-muted rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
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