/**
 * Real-time Transaction Form with optimistic updates
 * Provides instant UI feedback when adding transactions
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRealtimeContext } from '@/lib/context/RealtimeContext'
import { useRealtimeBalance } from '@/lib/hooks/useRealtimeBalance'
import type { Category } from '@/lib/types/database'

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
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  useEffect(() => {
    setCategories(initialCategories)
  }, [initialCategories])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      const transactionAmount = parseFloat(amount)
      if (!transactionAmount || transactionAmount <= 0) {
        throw new Error('Please enter a valid amount')
      }

      if (!selectedCategoryId) {
        throw new Error('Please select a category')
      }

      if (!description.trim()) {
        throw new Error('Please enter a description')
      }

      // Add optimistic update immediately for instant UI feedback
      addOptimisticTransaction({
        category_id: selectedCategoryId,
        amount: transactionAmount,
        description: description.trim(),
        date
      })

      // Mark category as having pending update
      addPendingUpdate(selectedCategoryId)

      // Insert transaction into database
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          category_id: selectedCategoryId,
          amount: transactionAmount,
          description: description.trim(),
          date
        })

      if (transactionError) {
        throw new Error(`Failed to add transaction: ${transactionError.message}`)
      }

      // Redirect back to dashboard (optimistic update will be replaced by real-time update)
      router.push('/dashboard')
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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
        <Card>
          <CardHeader>
            <CardTitle>Record Expense</CardTitle>
            <CardDescription>
              Add a new expense and assign it to an envelope category. Updates will appear instantly on your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g., 24.99"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Grocery shopping at Whole Foods"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category (Envelope)</Label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name} (${(category.allocated - category.spent).toFixed(2)} remaining)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Adding Transaction...' : 'Add Transaction'}
                </Button>
                <Link href="/dashboard">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}