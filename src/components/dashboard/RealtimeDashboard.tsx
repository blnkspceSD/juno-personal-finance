/**
 * Real-time Dashboard Component with live balance updates
 * Provides instant feedback when transactions are added or modified
 */

'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { SpendingOverviewSection } from './SpendingOverviewSection'
import { RecentTransactionsCard } from './RecentTransactionsCard'
import { CategoryGroupCardsView, CategoryGroupCreateDialog } from '@/components/category-groups'
import { RealtimeCategoryTable } from '@/components/tables/RealtimeCategoryTable'
import { TransactionTable, TransactionTableRow } from '@/components/tables/TransactionTable'
import { useRealtimeBalance } from '@/lib/hooks/useRealtimeBalance'
import { useRealtimeContext } from '@/lib/context/RealtimeContext'
import { calculateBudgetSummary } from '@/lib/utils/budget-calculations'
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
    category_color?: string
  }[]
  chartTransactions?: {
    id: string
    description: string
    amount: number
    date: string
    category_id: string
    category_name: string
  }[]
  categoryGroups?: {
    id: string
    user_id: string
    name: string
    description?: string
    color: string
    icon?: string
    sort_order: number
    created_at: string
    updated_at: string
  }[]
  categoriesByGroup?: Record<string, {
    id: string
    name: string
    allocated: number
    spent: number
    color: string
  }[]>
  unassignedCategories?: {
    id: string
    name: string
    allocated: number
    spent: number
    color: string
  }[]
  groupedSpendingData?: {
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
}

export function RealtimeDashboard({ 
  initialBudget, 
  user, 
  monthlySpendingData = [], 
  recentTransactions = [],
  chartTransactions = [],
  categoryGroups = [],
  categoriesByGroup = {},
  unassignedCategories = [],
  groupedSpendingData = []
}: RealtimeDashboardProps) {
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
  }, [currentBudget?.id, setBudget, updateEnvelopes, currentBudget])

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

  // Note: monthlySpendingData still available if needed for other components

  // Current spending metrics - use real budget data
  const currentSpending = budgetSummary?.total_spent || 0
  const budgetLimit = budgetSummary?.total_income || 0
  const spendingProgress = budgetLimit > 0 ? (currentSpending / budgetLimit) * 100 : 0

  // Category groups state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  // Use real recent transactions from Supabase
  const displayTransactions = recentTransactions

  return (
    <div className="min-h-screen bg-juno-surface-200">
      <div className="space-y-juno-6">
        {/* Main Content Layout - Two Column Design */}
        {hasActiveBudget && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-juno-6">
            {/* Left Column: Spending Overview (2/3 width) */}
            <div className="lg:col-span-2">
              <SpendingOverviewSection
                currentSpending={currentSpending}
                budgetLimit={budgetLimit}
                groupedSpendingData={groupedSpendingData}
                chartTransactions={chartTransactions}
                currentBudget={currentBudget}
              />
            </div>
            
            {/* Right Column: Recent Transactions (1/3 width) */}
            <div className="lg:col-span-1">
              <RecentTransactionsCard transactions={displayTransactions} />
            </div>
          </div>
        )}

        {/* Your Envelopes - Category Management Table */}
        {hasActiveBudget && (
          <div className="space-y-juno-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-juno-text">Your Envelopes</h2>
              <div className="flex gap-juno-2">
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
        )}

        {/* Spending Pockets */}
        {hasActiveBudget && (
          <div className="space-y-juno-4 pb-juno-12">
            {categoryGroups.length > 0 ? (
              <CategoryGroupCardsView
                groups={categoryGroups}
                categoriesByGroup={categoriesByGroup}
                onGroupClick={(group) => {
                  console.log('Group clicked:', group)
                }}
                onCreateGroup={() => {
                  setIsCreateDialogOpen(true)
                }}
                onEditGroup={(group) => {
                  console.log('Edit group:', group)
                }}
                onDeleteGroup={(group) => {
                  console.log('Delete group:', group)
                }}
              />
            ) : (
              <Card className="bg-juno-surface-50 rounded-juno-xl shadow-juno-card-with-stroke">
                <CardHeader>
                  <CardTitle className="text-juno-text">Create Your First Spending Pocket</CardTitle>
                  <CardDescription className="text-juno-muted-fg">
                    Group your spending categories into pockets to get better insights into your spending patterns.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-juno-8">
                    <div className="mx-auto h-16 w-16 bg-juno-surface-200 rounded-juno-lg flex items-center justify-center mb-juno-4">
                      <div className="w-8 h-8 bg-juno-muted-fg/20 rounded"></div>
                    </div>
                    <p className="text-juno-muted-fg mb-juno-4">
                      No spending pockets yet. Create your first pocket to organize your spending categories.
                    </p>
                    <Button className="btn--primary" onClick={() => setIsCreateDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add pocket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Recent Transactions Table */}
        <div className="space-y-juno-4 pb-juno-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-juno-text">Recent Transactions</h2>
            <Button className="btn--secondary" asChild>
              <Link href="/dashboard/transactions/new">
                <Plus className="h-4 w-4" />
                Add transaction
              </Link>
            </Button>
          </div>
          
          <TransactionTable 
            data={displayTransactions.slice(0, 10) as TransactionTableRow[]}
            onEdit={(transaction) => {
              console.log('Edit transaction:', transaction)
              // TODO: Implement transaction editing
            }}
            onDelete={(transaction) => {
              console.log('Delete transaction:', transaction)
              // TODO: Implement transaction deletion
            }}
            enablePagination={false}
          />
          
          <div className="flex justify-center pt-juno-4">
            <Button variant="ghost" className="text-juno-text hover:text-juno-text gap-juno-2" asChild>
              <Link href="/dashboard/transactions">
                See all transactions
                <svg className="h-4 w-4 -rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
            </Button>
          </div>
        </div>

        {/* Category Group Create Dialog */}
        <CategoryGroupCreateDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          unassignedCategories={unassignedCategories}
          onSuccess={(newGroup) => {
            console.log('Group created:', newGroup)
            setIsCreateDialogOpen(false)
          }}
        />
      </div>

      {!hasActiveBudget && (
        <>
          {/* Getting Started Section */}
          <Card className="bg-juno-surface-50 rounded-juno-xl shadow-juno-card-with-stroke">
            <CardHeader>
              <CardTitle className="text-juno-text">Create Your First Budget</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-juno-muted-fg mb-juno-6">
                Let&apos;s get started by creating your monthly budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}. 
                You&apos;ll allocate your income into different spending categories (envelopes).
              </p>
              
              <div className="flex flex-col sm:flex-row gap-juno-4">
                <Button className="btn--primary" asChild>
                  <Link href="/dashboard/budget/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Budget for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Envelope Status (Empty State) */}
          <Card className="bg-juno-surface-50 rounded-juno-xl shadow-juno-card-with-stroke">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-juno-text">Your Envelopes</CardTitle>
                <span className="text-sm text-juno-muted-fg">0 envelopes</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-juno-12">
                <div className="mx-auto h-24 w-24 bg-juno-surface-200 rounded-juno-2xl flex items-center justify-center mb-juno-4">
                  <svg className="h-12 w-12 text-juno-muted-fg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-juno-text mb-juno-2">No envelopes yet</h3>
                <p className="text-juno-muted-fg mb-juno-6">
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