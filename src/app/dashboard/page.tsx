import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { getCurrentMonthBudget, calculateBudgetSummary, calculateCategoryStatus } from '@/lib/supabase/queries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get current month budget
  let currentBudget = null
  let budgetSummary = null
  
  try {
    currentBudget = await getCurrentMonthBudget()
    if (currentBudget) {
      budgetSummary = calculateBudgetSummary(currentBudget)
    }
  } catch (error) {
    console.error('Error fetching budget:', error)
  }

  const hasActiveBudget = currentBudget && currentBudget.categories.length > 0

  return (
    <div className="space-y-8">
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
                <p className="text-2xl font-bold text-foreground">
                  ${budgetSummary?.total_income?.toFixed(2) || '0.00'}
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
                <p className="text-2xl font-bold text-foreground">
                  ${budgetSummary?.total_spent?.toFixed(2) || '0.00'}
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
                <p className={`text-2xl font-bold ${
                  (budgetSummary?.available_to_budget || 0) < 0 
                    ? 'text-destructive' 
                    : 'text-foreground'
                }`}>
                  ${budgetSummary?.available_to_budget?.toFixed(2) || '0.00'}
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
          {/* Current Budget Envelopes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Envelopes</CardTitle>
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
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {currentBudget.categories.map((category) => {
                  const status = calculateCategoryStatus(category)
                  return (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{category.name}</h4>
                          <div className="text-sm text-muted-foreground">
                            ${category.spent.toFixed(2)} / ${category.allocated.toFixed(2)}
                          </div>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              status.is_overspent ? 'bg-destructive' : 'bg-primary'
                            }`}
                            style={{
                              width: `${Math.min(status.percentage_used, 100)}%`
                            }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                          <span>{status.percentage_used.toFixed(1)}% used</span>
                          <span className={status.is_overspent ? 'text-destructive' : 'text-muted-foreground'}>
                            ${Math.abs(status.remaining).toFixed(2)} {status.is_overspent ? 'over' : 'remaining'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
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