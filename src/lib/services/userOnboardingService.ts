/**
 * User Onboarding Service
 * Handles automatic setup of default groups and categories for new users
 */

import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { 
  createDefaultGroupsForUser, 
  createStarterCategoriesForBudget,
  hasUserCompletedSetup,
  autoAssignCategoryToGroup
} from './defaultGroupsService'

/**
 * Setup default groups for a new user
 * Called when user first accesses the dashboard
 */
export async function setupDefaultGroupsForNewUser(userId: string): Promise<{
  groupsCreated: number
  success: boolean
  message: string
}> {
  try {
    // Check if user has already completed setup
    const setupStatus = await hasUserCompletedSetup(userId)
    if (setupStatus.groupSetup) {
      return {
        groupsCreated: 0,
        success: true,
        message: 'User has already completed group setup'
      }
    }

    // Create default groups (Core, Flexible, Lifestyle, Savings)
    const groupsResult = await createDefaultGroupsForUser(userId)
    
    return {
      groupsCreated: groupsResult.length,
      success: true,
      message: `Successfully created ${groupsResult.length} default category groups`
    }
  } catch (error) {
    console.error('Error setting up default groups:', error)
    return {
      groupsCreated: 0,
      success: false,
      message: `Failed to setup default groups: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Setup starter categories when a budget is created
 * Called during budget creation process
 */
export async function setupStarterCategoriesForBudget(
  budgetId: string, 
  userId: string
): Promise<{
  categoriesCreated: number
  success: boolean
  message: string
}> {
  try {
    // Check if user has groups set up
    const setupStatus = await hasUserCompletedSetup(userId)
    if (!setupStatus.groupSetup) {
      // Setup groups first if they don't exist
      await setupDefaultGroupsForNewUser(userId)
    }

    // Create starter categories for the budget
    const categoriesCreated = await createStarterCategoriesForBudget(budgetId, userId)
    
    return {
      categoriesCreated,
      success: true,
      message: `Successfully created ${categoriesCreated} starter categories`
    }
  } catch (error) {
    console.error('Error setting up starter categories:', error)
    return {
      categoriesCreated: 0,
      success: false,
      message: `Failed to setup starter categories: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Auto-assign a new category to appropriate group
 * Called when user creates a new category
 */
export async function autoAssignNewCategory(
  categoryId: string,
  categoryName: string,
  userId: string
): Promise<{
  assigned: boolean
  groupId: string | null
  groupName: string | null
  message: string
}> {
  try {
    // Get the appropriate group for this category
    const groupId = await autoAssignCategoryToGroup(categoryName, userId)
    
    if (!groupId) {
      return {
        assigned: false,
        groupId: null,
        groupName: null,
        message: 'No suitable group found for auto-assignment'
      }
    }

    // Update the category with the group assignment
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { error: updateError } = await supabase
      .from('categories')
      .update({ group_id: groupId })
      .eq('id', categoryId)
      .eq('user_id', userId)

    if (updateError) {
      throw updateError
    }

    // Get the group name for the response
    const { data: groupData, error: groupError } = await supabase
      .from('category_groups')
      .select('name')
      .eq('id', groupId)
      .single()

    if (groupError) {
      throw groupError
    }

    return {
      assigned: true,
      groupId,
      groupName: groupData.name,
      message: `Successfully assigned "${categoryName}" to "${groupData.name}" group`
    }
  } catch (error) {
    console.error('Error auto-assigning category:', error)
    return {
      assigned: false,
      groupId: null,
      groupName: null,
      message: `Failed to auto-assign category: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Check if user needs onboarding and perform setup
 * Called from dashboard page to ensure user has proper setup
 */
export async function ensureUserHasDefaultSetup(userId: string): Promise<{
  setupPerformed: boolean
  groupsCreated: number
  message: string
}> {
  try {
    const setupStatus = await hasUserCompletedSetup(userId)
    
    if (setupStatus.isComplete) {
      return {
        setupPerformed: false,
        groupsCreated: 0,
        message: 'User setup is already complete'
      }
    }

    // Perform setup if needed
    const setupResult = await setupDefaultGroupsForNewUser(userId)
    
    return {
      setupPerformed: setupResult.success,
      groupsCreated: setupResult.groupsCreated,
      message: setupResult.message
    }
  } catch (error) {
    console.error('Error ensuring user setup:', error)
    return {
      setupPerformed: false,
      groupsCreated: 0,
      message: `Failed to ensure user setup: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}

/**
 * Get onboarding status for user
 */
export async function getUserOnboardingStatus(userId: string): Promise<{
  needsGroupSetup: boolean
  needsCategorySetup: boolean
  hasCategories: boolean
  hasBudget: boolean
  recommendations: string[]
}> {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const setupStatus = await hasUserCompletedSetup(userId)
    
    // Check if user has any budget
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (budgetError) throw budgetError

    // Check if user has any categories
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .is('archived_at', null)
      .limit(1)

    if (categoryError) throw categoryError

    const hasBudget = (budgets?.length || 0) > 0
    const hasCategories = (categories?.length || 0) > 0

    const recommendations: string[] = []
    
    if (!setupStatus.groupSetup) {
      recommendations.push('Set up category groups to organize your spending')
    }
    
    if (!hasBudget) {
      recommendations.push('Create your first budget to start tracking expenses')
    }
    
    if (!hasCategories && hasBudget) {
      recommendations.push('Add spending categories to your budget')
    }

    return {
      needsGroupSetup: !setupStatus.groupSetup,
      needsCategorySetup: !setupStatus.categorySetup,
      hasCategories,
      hasBudget,
      recommendations
    }
  } catch (error) {
    console.error('Error getting onboarding status:', error)
    return {
      needsGroupSetup: true,
      needsCategorySetup: true,
      hasCategories: false,
      hasBudget: false,
      recommendations: ['Complete the onboarding process to get started']
    }
  }
}