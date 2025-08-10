/**
 * Real-time Transaction Form with optimistic updates
 * Provides instant UI feedback when adding transactions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRealtimeContext } from '@/lib/context/RealtimeContext'
import { useRealtimeBalance } from '@/lib/hooks/useRealtimeBalance'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { categorySpentService } from '@/lib/services/categorySpentService'
import type { Category, CreateTransactionForm } from '@/lib/types/database'

interface RealtimeTransactionFormProps {
  initialCategories: Category[]
  budgetId: string
}

export function RealtimeTransactionForm({ initialCategories, budgetId }: RealtimeTransactionFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const { addPendingUpdate } = useRealtimeContext()
  const { addOptimisticTransaction } = useRealtimeBalance(budgetId)
  
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const handleSubmit = async (data: CreateTransactionForm) => {
    setLoading(true)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Add optimistic update immediately for instant UI feedback
      addOptimisticTransaction({
        category_id: data.category_id,
        amount: data.amount,
        description: data.description,
        date: data.date
      })

      // Mark category as having pending update
      addPendingUpdate(data.category_id)

      // Insert transaction into database (with minimal required fields)
      const insertData = {
        user_id: user.id,
        category_id: data.category_id,
        amount: data.amount,
        description: data.description,
        date: data.date
      }
      
      console.log('Attempting to insert transaction:', insertData)
      
      const { data: insertedTransaction, error: transactionError } = await supabase
        .from('transactions')
        .insert(insertData)
        .select()
        .single()

      if (transactionError) {
        console.error('Transaction insertion error:', transactionError)
        throw new Error(`Failed to add transaction: ${transactionError.message}`)
      }
      
      console.log('Transaction inserted successfully:', insertedTransaction)
      
      // Update category spent amounts manually (since we removed the automatic trigger)
      try {
        await categorySpentService.handleTransactionChange(
          'insert',
          { category_id: data.category_id }
        )
      } catch (spentUpdateError) {
        console.warn('Failed to update category spent amount:', spentUpdateError)
        // Don't fail the transaction for this
      }

      // Redirect back to dashboard (optimistic update will be replaced by real-time update)
      router.push('/dashboard')
      
    } catch (err) {
      throw err // Let the form component handle error display
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/dashboard')
  }

  // DISABLED: Category creation removed to prevent state management issues
  const handleCategoryCreate = async (name: string): Promise<string | null> => {
    console.warn('Category creation disabled in transaction form')
    return null
    
    /* REMOVED:
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // For now, we'll create a basic category without a specific budget
      // In a real implementation, this would need to be associated with the current budget
      const categoryData = {
        user_id: user.id,
        budget_id: budgetId,
        name: name.trim(),
        allocated: 0,
        spent: 0,
        sort_order: categories.length,
        color: '#6366f1'
      }
      
      console.log('Attempting to create category:', categoryData)
      
      const { data: newCategory, error: createError } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single()

      if (createError) {
        console.error('Error creating category:', createError)
        return null
      }

      console.log('Category created successfully:', newCategory)

      // Update categories list and wait for state update
      setCategories(prev => {
        const updated = [...prev, newCategory]
        console.log('Updated categories:', updated.length)
        return updated
      })
      
      // Wait a bit for the state update to propagate
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return newCategory.id
    } catch (error) {
      console.error('Error creating category:', error)
      return null
    }
    */
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Add Transaction</h1>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Budget Found</CardTitle>
            <CardDescription>
              You need to create a budget before adding transactions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/dashboard/budget/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TransactionForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onCategoryCreate={undefined}
          loading={loading}
          submitLabel="Add Transaction"
          showNotes={false}
          autoFocus={true}
          allowCategoryCreation={false}
          userId={categories[0]?.user_id}
        />
      )}
    </div>
  )
}