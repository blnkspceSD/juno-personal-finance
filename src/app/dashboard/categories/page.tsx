/**
 * Category Management Page
 * Main page for creating, organizing, and managing spending categories
 */

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CategoryManagementLayout } from '@/components/categories/CategoryManagementLayout'
import type { CategoryGroup, CategoryWithGroup } from '@/lib/types/database'

export const metadata = {
  title: 'Category Management | Juno',
  description: 'Create, organize, and manage your spending categories'
}

interface CategoryManagementPageProps {
  searchParams: {
    view?: 'list' | 'groups' | 'archived'
    group?: string
  }
}

export default async function CategoryManagementPage({ 
  searchParams 
}: CategoryManagementPageProps) {
  const supabase = await createClient()
  
  // Check authentication
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect('/auth/signin')
  }

  // Get current budget - we'll need this for category operations
  const { data: currentBudget } = await supabase
    .from('budgets')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!currentBudget) {
    redirect('/dashboard/budget/new')
  }

  // Fetch category groups
  const { data: categoryGroups, error: groupsError } = await supabase
    .from('category_groups')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (groupsError) {
    console.error('Error fetching category groups:', groupsError)
  }

  // Fetch all categories with group information
  const { data: categoriesData, error: categoriesError } = await supabase
    .from('active_categories_with_groups')
    .select('*')
    .eq('user_id', user.id)

  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
  }

  // Fetch archived categories if viewing archived tab
  let archivedCategories: CategoryWithGroup[] = []
  if (searchParams.view === 'archived') {
    const { data: archived } = await supabase
      .from('categories')
      .select(`
        *,
        group:category_groups(*)
      `)
      .eq('user_id', user.id)
      .not('archived_at', 'is', null)
      .order('archived_at', { ascending: false })

    archivedCategories = archived || []
  }

  // Transform the data for the component
  const categories: CategoryWithGroup[] = (categoriesData || []).map(cat => ({
    id: cat.id,
    user_id: cat.user_id,
    budget_id: cat.budget_id,
    name: cat.name,
    allocated: cat.allocated,
    spent: cat.spent,
    sort_order: cat.sort_order,
    color: cat.color,
    group_id: cat.group_id,
    archived_at: cat.archived_at,
    description: cat.description,
    icon: cat.icon,
    created_at: cat.created_at,
    updated_at: cat.updated_at,
    group_name: cat.group_name,
    group_color: cat.group_color,
    group_icon: cat.group_icon
  }))

  const groups: CategoryGroup[] = categoryGroups || []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">
            Organize your spending categories and manage your budget allocation
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{categories.length}</div>
            <div className="text-sm text-gray-600">Active Categories</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{groups.length}</div>
            <div className="text-sm text-gray-600">Category Groups</div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{archivedCategories.length}</div>
            <div className="text-sm text-gray-600">Archived</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <CategoryManagementLayout
        categories={categories}
        categoryGroups={groups}
        archivedCategories={archivedCategories}
        currentBudget={currentBudget}
        currentView={searchParams.view || 'list'}
        selectedGroup={searchParams.group}
        userId={user.id}
      />
    </div>
  )
}