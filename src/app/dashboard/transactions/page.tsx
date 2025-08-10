'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { RealtimeEditableTransactionTable } from '@/components/tables/RealtimeEditableTransactionTable'
import { Button } from '@/components/ui/button'
import { Plus, Grid, List } from 'lucide-react'
import Link from 'next/link'
import type { Transaction, Category, User, UpdateTransactionForm } from '@/lib/types/database'
import type { SimpleEditableTransactionRow } from '@/components/tables/SimpleEditableTransactionTable'

export default function TransactionsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [budgetId, setBudgetId] = useState('')
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        router.push('/auth/login')
        return
      }

      setUser({
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || null,
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString()
      })

      // Get current month budget
      const currentDate = new Date()
      const currentMonth = currentDate.toISOString().slice(0, 7)
      const currentYear = currentDate.getFullYear()

      try {
        // Get current budget and its categories
        const { data: budgets, error: budgetError } = await supabase
          .from('budgets')
          .select(`
            id,
            categories (*)
          `)
          .eq('month', currentMonth)
          .eq('year', currentYear)
          .single()

        if (budgetError) {
          console.error('Failed to fetch budget:', budgetError.message)
        } else if (budgets) {
          setCategories(budgets.categories || [])
          setBudgetId(budgets.id)

          // Get transactions for this budget
          const { data: transactionData, error: transactionError } = await supabase
            .from('transactions')
            .select('*')
            .in('category_id', (budgets.categories || []).map((c: Category) => c.id))
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })

          if (transactionError) {
            console.error('Failed to fetch transactions:', transactionError.message)
          } else {
            setTransactions(transactionData || [])
          }
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const currentDate = new Date()

  const handleEdit = (transaction: SimpleEditableTransactionRow) => {
    // TODO: Could open full edit modal if needed
    console.log('Edit transaction:', transaction)
  }

  const handleDelete = async (transaction: SimpleEditableTransactionRow) => {
    // Deletion is handled optimistically by the RealtimeEditableTransactionTable
    console.log('Delete transaction:', transaction)
  }

  const handleBulkDelete = async (transactions: SimpleEditableTransactionRow[]) => {
    // Bulk deletion is handled optimistically by the RealtimeEditableTransactionTable
    console.log('Bulk delete transactions:', transactions)
  }

  const handleCategoryCreate = async (name: string): Promise<string | null> => {
    if (!user || !budgetId) return null

    try {
      const { data: newCategory, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          budget_id: budgetId,
          name: name.trim(),
          allocated: 0,
          spent: 0,
          sort_order: categories.length,
          color: '#6366f1' // Default color
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating category:', error)
        return null
      }

      // Update categories list
      setCategories(prev => [...prev, newCategory])
      
      return newCategory.id
    } catch (error) {
      console.error('Error creating category:', error)
      return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Transactions</h1>
          <p className="text-muted-foreground">
            Manage and view all your transactions for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="h-8 px-2"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-2"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          <Button asChild>
            <Link href="/dashboard/transactions/new">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Link>
          </Button>
        </div>
      </div>

      {/* Enhanced Transaction Table with Inline Editing */}
      {budgetId && user ? (
        <RealtimeEditableTransactionTable
          budgetId={budgetId}
          initialTransactions={transactions}
          categories={categories}
          userId={user.id}
          viewMode={viewMode}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onCategoryCreate={handleCategoryCreate}
          allowInlineEditing={true}
          allowCategoryCreation={true}
        />
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-muted rounded-2xl flex items-center justify-center mb-4">
            <Plus className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No budget found</h3>
          <p className="text-muted-foreground mb-6">
            Create a budget first to start tracking transactions.
          </p>
          <Button asChild>
            <Link href="/dashboard/budget/new">
              Create Budget
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}