/**
 * Category Groups API
 * Handles CRUD operations for category groups
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { CreateCategoryGroupForm, CategoryGroup, UpdateCategoryGroupForm } from '@/lib/types/database'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all category groups for the user
    const { data: categoryGroups, error } = await supabase
      .from('category_groups')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching category groups:', error)
      return NextResponse.json({ error: 'Failed to fetch category groups' }, { status: 500 })
    }

    return NextResponse.json({ data: categoryGroups || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/category-groups:', error)
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
    const body: CreateCategoryGroupForm = await request.json()

    // Validate required fields
    if (!body.name || body.name.trim().length === 0) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    if (body.name.trim().length > 100) {
      return NextResponse.json({ error: 'Group name must be 100 characters or less' }, { status: 400 })
    }

    // Check for duplicate group names
    const { data: existingGroups, error: checkError } = await supabase
      .from('category_groups')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', body.name.trim())
      .maybeSingle()

    if (checkError) {
      console.error('Error checking for duplicate group names:', checkError)
      return NextResponse.json({ error: 'Failed to validate group name' }, { status: 500 })
    }

    if (existingGroups) {
      return NextResponse.json({ error: 'A group with this name already exists' }, { status: 409 })
    }

    // Get the highest sort_order for new group positioning
    const { data: lastGroup } = await supabase
      .from('category_groups')
      .select('sort_order')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: false })
      .limit(1)
      .maybeSingle()

    const newSortOrder = body.sort_order ?? ((lastGroup?.sort_order ?? -1) + 1)

    // Create the category group
    const insertData = {
      user_id: user.id,
      name: body.name.trim(),
      description: body.description?.trim() || null,
      color: body.color || '#6366f1',
      icon: body.icon?.trim() || null,
      sort_order: newSortOrder
    }

    const { data: newGroup, error: insertError } = await supabase
      .from('category_groups')
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating category group:', insertError)
      return NextResponse.json({ error: 'Failed to create category group' }, { status: 500 })
    }

    return NextResponse.json({ data: newGroup }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error in POST /api/category-groups:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}