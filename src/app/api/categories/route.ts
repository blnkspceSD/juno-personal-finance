/**
 * Categories API
 * Handles CRUD operations for categories
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { CreateCategoryForm, Category } from '@/lib/types/database'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all categories for the user
    const { data: categories, error } = await supabase
      .from('active_categories_with_groups')
      .select('*')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching categories:', error)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    return NextResponse.json({ data: categories || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const categoryData: CreateCategoryForm & { budget_id: string } = body

    // Validate required fields
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 })
    }

    if (!categoryData.budget_id) {
      return NextResponse.json({ error: 'Budget ID is required' }, { status: 400 })
    }

    if (categoryData.name.trim().length > 100) {
      return NextResponse.json({ error: 'Category name must be 100 characters or less' }, { status: 400 })
    }

    if (typeof categoryData.allocated !== 'number' || categoryData.allocated < 0) {
      return NextResponse.json({ error: 'Allocated amount must be a non-negative number' }, { status: 400 })
    }

    if (categoryData.allocated > 999999.99) {
      return NextResponse.json({ error: 'Allocated amount is too large' }, { status: 400 })
    }

    // Check for duplicate category names within the same budget
    const { data: existingCategories, error: checkError } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', user.id)
      .eq('budget_id', categoryData.budget_id)
      .eq('name', categoryData.name.trim())
      .is('archived_at', null)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for duplicate category names:', checkError)
      return NextResponse.json({ error: 'Failed to validate category name' }, { status: 500 })
    }

    if (existingCategories) {
      return NextResponse.json({ error: 'A category with this name already exists' }, { status: 409 })
    }

    // Get the highest sort_order for new category positioning
    const { data: lastCategory } = await supabase
      .from('categories')
      .select('sort_order')
      .eq('user_id', user.id)
      .eq('budget_id', categoryData.budget_id)
      .is('archived_at', null)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const newSortOrder = categoryData.sort_order ?? ((lastCategory?.sort_order ?? -1) + 1)

    // Create the category
    const insertData = {
      user_id: user.id,
      budget_id: categoryData.budget_id,
      name: categoryData.name.trim(),
      allocated: categoryData.allocated,
      spent: 0, // New categories start with zero spent
      color: categoryData.color || '#6366f1',
      group_id: categoryData.group_id || null,
      description: categoryData.description?.trim() || null,
      icon: categoryData.icon?.trim() || null,
      sort_order: newSortOrder
    }

    const { data: newCategory, error: insertError } = await supabase
      .from('categories')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating category:', insertError)
      return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
    }

    return NextResponse.json({ data: newCategory }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}