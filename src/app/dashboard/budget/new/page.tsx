'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface CategoryForm {
  id: string
  name: string
  allocated: string
}

export default function CreateBudgetPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7) // YYYY-MM format
  
  const [budgetName, setBudgetName] = useState(`${currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Budget`)
  const [totalIncome, setTotalIncome] = useState('')
  const [categories, setCategories] = useState<CategoryForm[]>([
    { id: '1', name: 'Groceries', allocated: '' },
    { id: '2', name: 'Rent/Mortgage', allocated: '' },
    { id: '3', name: 'Transportation', allocated: '' },
    { id: '4', name: 'Utilities', allocated: '' },
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addCategory = () => {
    const newId = (categories.length + 1).toString()
    setCategories([...categories, { id: newId, name: '', allocated: '' }])
  }

  const removeCategory = (id: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter(cat => cat.id !== id))
    }
  }

  const updateCategory = (id: string, field: 'name' | 'allocated', value: string) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, [field]: value } : cat
    ))
  }

  const calculateTotalAllocated = () => {
    return categories.reduce((sum, cat) => {
      const amount = parseFloat(cat.allocated) || 0
      return sum + amount
    }, 0)
  }

  const calculateRemaining = () => {
    const income = parseFloat(totalIncome) || 0
    const allocated = calculateTotalAllocated()
    return income - allocated
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    console.log('🚀 Budget creation started...')

    try {
      // Get current user
      console.log('📝 Getting authenticated user...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('👤 User data:', { 
        user: user ? { id: user.id, email: user.email } : null, 
        userError 
      })
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      // Validate form
      console.log('✅ Validating form data...')
      const income = parseFloat(totalIncome)
      console.log('💰 Income:', income)
      
      if (!income || income <= 0) {
        throw new Error('Please enter a valid income amount')
      }

      const validCategories = categories.filter(cat => cat.name.trim() && cat.allocated.trim())
      console.log('📂 Valid categories:', validCategories)
      
      if (validCategories.length === 0) {
        throw new Error('Please add at least one category with a name and amount')
      }

      // Check allocation balance
      const totalAllocated = validCategories.reduce((sum, cat) => sum + parseFloat(cat.allocated), 0)
      console.log('💸 Total allocated:', totalAllocated, 'vs Income:', income)
      
      if (Math.abs(totalAllocated - income) > 0.01) {
        throw new Error(`Budget is not balanced. Income: $${income}, Allocated: $${totalAllocated}`)
      }

      // Check if user profile exists, create if not
      console.log('👥 Checking user profile...')
      const { data: existingUser, error: profileCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      console.log('👥 Profile check result:', { existingUser, profileCheckError })

      if (!existingUser) {
        console.log('👥 Creating user profile...')
        const profileData = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || null
        }
        console.log('👥 Profile data to insert:', profileData)
        
        const { error: profileError } = await supabase
          .from('users')
          .insert(profileData)
        
        if (profileError) {
          console.error('❌ Profile creation error:', profileError)
          throw new Error(`Failed to create user profile: ${profileError.message}`)
        }
        console.log('✅ User profile created successfully')
      } else {
        console.log('✅ User profile already exists')
      }

      // Create budget
      console.log('📊 Creating budget...')
      const budgetData = {
        user_id: user.id,
        name: budgetName,
        month: currentMonth,
        year: currentDate.getFullYear(),
        total_income: income
      }
      console.log('📊 Budget data to insert:', budgetData)

      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .insert(budgetData)
        .select()
        .single()

      console.log('📊 Budget creation result:', { budget, budgetError })

      if (budgetError) {
        throw new Error(`Failed to create budget: ${budgetError.message}`)
      }

      console.log('✅ Budget created successfully:', budget)

      // Create categories
      console.log('📂 Creating categories...')
      const categoryInserts = validCategories.map(cat => ({
        user_id: user.id,
        budget_id: budget.id,
        name: cat.name.trim(),
        allocated: parseFloat(cat.allocated),
        spent: 0,
        sort_order: categories.indexOf(cat)
      }))

      console.log('📂 Category data to insert:', categoryInserts)

      const { data: createdCategories, error: categoriesError } = await supabase
        .from('categories')
        .insert(categoryInserts)
        .select()

      console.log('📂 Categories creation result:', { createdCategories, categoriesError })

      if (categoriesError) {
        throw new Error(`Failed to create categories: ${categoriesError.message}`)
      }

      console.log('✅ Categories created successfully:', createdCategories)
      console.log('🎉 Budget creation completed successfully!')

      // Small delay to ensure data is committed
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to dashboard
      console.log('🔄 Redirecting to dashboard...')
      router.push('/dashboard')
      
    } catch (err) {
      console.error('❌ Budget creation error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const remaining = calculateRemaining()

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
        <h1 className="text-2xl font-bold">Create Your Budget</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Budget Details */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Details</CardTitle>
            <CardDescription>
              Set up your monthly budget for {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="budgetName">Budget Name</Label>
              <Input
                id="budgetName"
                value={budgetName}
                onChange={(e) => setBudgetName(e.target.value)}
                placeholder="e.g., January 2025 Budget"
                required
              />
            </div>
            <div>
              <Label htmlFor="totalIncome">Monthly Income</Label>
              <Input
                id="totalIncome"
                type="number"
                step="0.01"
                min="0"
                value={totalIncome}
                onChange={(e) => setTotalIncome(e.target.value)}
                placeholder="e.g., 5000.00"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Categories/Envelopes */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Categories (Envelopes)</CardTitle>
            <CardDescription>
              Allocate your income into spending categories. Each category is like an envelope with a specific amount.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categories.map((category, index) => (
              <div key={category.id} className="flex gap-3 items-end">
                <div className="flex-1">
                  <Label htmlFor={`category-name-${category.id}`}>
                    Category {index + 1}
                  </Label>
                  <Input
                    id={`category-name-${category.id}`}
                    value={category.name}
                    onChange={(e) => updateCategory(category.id, 'name', e.target.value)}
                    placeholder="e.g., Groceries"
                    required
                  />
                </div>
                <div className="w-32">
                  <Label htmlFor={`category-amount-${category.id}`}>
                    Amount
                  </Label>
                  <Input
                    id={`category-amount-${category.id}`}
                    type="number"
                    step="0.01"
                    min="0"
                    value={category.allocated}
                    onChange={(e) => updateCategory(category.id, 'allocated', e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCategory(category.id)}
                  disabled={categories.length <= 1}
                  className="mb-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addCategory}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Income:</span>
                <span className="font-medium">${parseFloat(totalIncome) || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Allocated:</span>
                <span className="font-medium">${calculateTotalAllocated().toFixed(2)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Remaining to Allocate:</span>
                  <span className={remaining < 0 ? 'text-red-600' : remaining > 0 ? 'text-amber-600' : 'text-green-600'}>
                    ${remaining.toFixed(2)}
                  </span>
                </div>
                {remaining < 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    You've allocated more than your income!
                  </p>
                )}
                {remaining > 0 && (
                  <p className="text-sm text-amber-600 mt-1">
                    You still have money to allocate to categories.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="p-4 rounded-lg bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card>
          <CardFooter className="flex gap-3">
            <Button type="submit" disabled={loading || remaining !== 0} className="flex-1">
              {loading ? 'Creating Budget...' : 'Create Budget'}
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}