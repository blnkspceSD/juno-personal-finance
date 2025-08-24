/**
 * Default Category Groups Service
 * Handles predefined category groups and starter categories
 */

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Types for default templates
export interface DefaultGroupTemplate {
  id: string
  internal_name: string
  display_name: string
  description: string
  color: string
  icon?: string
  sort_order: number
  is_active: boolean
  auto_assign_keywords: string[]
}

export interface DefaultCategoryTemplate {
  id: string
  group_template_id: string
  name: string
  description?: string
  color: string
  icon?: string
  suggested_allocation: number
  sort_order: number
  is_essential: boolean
  auto_assign_keywords: string[]
  is_active: boolean
}

export interface UserSetupPreferences {
  id: string
  user_id: string
  selected_group_templates: string[]
  has_completed_group_setup: boolean
  has_completed_category_setup: boolean
  setup_completed_at?: string
  auto_assign_enabled: boolean
}

/**
 * Get all available default group templates
 */
export async function getDefaultGroupTemplates(): Promise<DefaultGroupTemplate[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('default_category_group_templates')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch default group templates: ${error.message}`)
  }

  return data || []
}

/**
 * Get default category templates for specific group templates
 */
export async function getDefaultCategoryTemplates(
  groupTemplateIds?: string[]
): Promise<DefaultCategoryTemplate[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  let query = supabase
    .from('default_category_templates')
    .select('*')
    .eq('is_active', true)

  if (groupTemplateIds && groupTemplateIds.length > 0) {
    query = query.in('group_template_id', groupTemplateIds)
  }

  const { data, error } = await query.order('sort_order')

  if (error) {
    throw new Error(`Failed to fetch default category templates: ${error.message}`)
  }

  return data || []
}

/**
 * Get user's setup preferences
 */
export async function getUserSetupPreferences(userId: string): Promise<UserSetupPreferences | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('user_setup_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw new Error(`Failed to fetch user setup preferences: ${error.message}`)
  }

  return data
}

/**
 * Create default category groups for a user
 */
export async function createDefaultGroupsForUser(
  userId: string,
  selectedTemplateIds?: string[]
): Promise<{ group_id: string; group_name: string; categories_created: number }[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase.rpc('create_default_groups_for_user', {
    target_user_id: userId,
    selected_template_ids: selectedTemplateIds || null
  })

  if (error) {
    throw new Error(`Failed to create default groups: ${error.message}`)
  }

  return data || []
}

/**
 * Auto-assign a category to the most appropriate group
 */
export async function autoAssignCategoryToGroup(
  categoryName: string,
  userId: string
): Promise<string | null> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase.rpc('auto_assign_category_to_group', {
    category_name: categoryName,
    target_user_id: userId
  })

  if (error) {
    throw new Error(`Failed to auto-assign category: ${error.message}`)
  }

  return data
}

/**
 * Create starter categories for a budget
 */
export async function createStarterCategoriesForBudget(
  budgetId: string,
  userId: string
): Promise<number> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase.rpc('create_starter_categories_for_budget', {
    budget_id: budgetId,
    target_user_id: userId
  })

  if (error) {
    throw new Error(`Failed to create starter categories: ${error.message}`)
  }

  return data || 0
}

/**
 * Update user setup preferences
 */
export async function updateUserSetupPreferences(
  userId: string,
  preferences: Partial<Omit<UserSetupPreferences, 'id' | 'user_id'>>
): Promise<UserSetupPreferences> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  const { data, error } = await supabase
    .from('user_setup_preferences')
    .upsert({
      user_id: userId,
      ...preferences,
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update setup preferences: ${error.message}`)
  }

  return data
}

/**
 * Check if user has completed onboarding setup
 */
export async function hasUserCompletedSetup(userId: string): Promise<{
  groupSetup: boolean
  categorySetup: boolean
  isComplete: boolean
}> {
  const preferences = await getUserSetupPreferences(userId)
  
  if (!preferences) {
    return {
      groupSetup: false,
      categorySetup: false,
      isComplete: false
    }
  }

  return {
    groupSetup: preferences.has_completed_group_setup,
    categorySetup: preferences.has_completed_category_setup,
    isComplete: preferences.has_completed_group_setup && preferences.has_completed_category_setup
  }
}

/**
 * Get grouped category spending data for dashboard
 */
export async function getGroupedCategorySpending(userId: string): Promise<{
  groupId: string
  groupName: string
  groupColor: string
  groupIcon?: string
  totalAllocated: number
  totalSpent: number
  categories: {
    id: string
    name: string
    allocated: number
    spent: number
    color: string
  }[]
}[]> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  
  // Get current month budget
  const currentDate = new Date()
  const currentMonth = currentDate.toISOString().slice(0, 7)
  const currentYear = currentDate.getFullYear()

  const { data: budget, error: budgetError } = await supabase
    .from('budgets')
    .select('id')
    .eq('user_id', userId)
    .eq('month', currentMonth)
    .eq('year', currentYear)
    .single()

  if (budgetError || !budget) {
    return []
  }

  // Get grouped spending data
  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      allocated,
      spent,
      color,
      group_id,
      category_groups (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('budget_id', budget.id)
    .eq('user_id', userId)
    .is('archived_at', null)
    .order('spent', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch grouped spending data: ${error.message}`)
  }

  // Group categories by their groups
  const groupMap = new Map<string, {
    groupId: string
    groupName: string
    groupColor: string
    groupIcon?: string
    totalAllocated: number
    totalSpent: number
    categories: {
      id: string
      name: string
      allocated: number
      spent: number
      color: string
    }[]
  }>()

  // Handle ungrouped categories
  const ungroupedCategories: {
    id: string
    name: string
    allocated: number
    spent: number
    color: string
  }[] = []

  data?.forEach(category => {
    if (category.group_id && category.category_groups) {
      const groupId = category.group_id
      const group = category.category_groups

      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          groupId: groupId,
          groupName: group.name,
          groupColor: group.color,
          groupIcon: group.icon,
          totalAllocated: 0,
          totalSpent: 0,
          categories: []
        })
      }

      const groupData = groupMap.get(groupId)!
      groupData.totalAllocated += category.allocated || 0
      groupData.totalSpent += category.spent || 0
      groupData.categories.push({
        id: category.id,
        name: category.name,
        allocated: category.allocated || 0,
        spent: category.spent || 0,
        color: category.color
      })
    } else {
      // Handle ungrouped categories
      ungroupedCategories.push({
        id: category.id,
        name: category.name,
        allocated: category.allocated || 0,
        spent: category.spent || 0,
        color: category.color
      })
    }
  })

  const result = Array.from(groupMap.values())

  // Add ungrouped categories as a separate "group" if they exist
  if (ungroupedCategories.length > 0) {
    const ungroupedTotal = ungroupedCategories.reduce(
      (acc, cat) => ({
        allocated: acc.allocated + cat.allocated,
        spent: acc.spent + cat.spent
      }),
      { allocated: 0, spent: 0 }
    )

    result.push({
      groupId: 'ungrouped',
      groupName: 'Other',
      groupColor: '#6b7280',
      groupIcon: '📂',
      totalAllocated: ungroupedTotal.allocated,
      totalSpent: ungroupedTotal.spent,
      categories: ungroupedCategories
    })
  }

  // Sort by total spending (highest first)
  return result.sort((a, b) => b.totalSpent - a.totalSpent)
}