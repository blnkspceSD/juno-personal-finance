/**
 * Category Group by ID API
 * Handles individual category group operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { UpdateCategoryGroupForm } from '@/lib/types/database'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch the specific category group
    const { data: categoryGroup, error } = await supabase
      .from('category_groups')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category group not found' }, { status: 404 })
      }
      console.error('Error fetching category group:', error)
      return NextResponse.json({ error: 'Failed to fetch category group' }, { status: 500 })
    }

    return NextResponse.json({ data: categoryGroup })
  } catch (error) {
    console.error('Unexpected error in GET /api/category-groups/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse request body
    const body: Omit<UpdateCategoryGroupForm, 'id'> = await request.json()

    // Validate name if provided
    if (body.name !== undefined) {
      if (!body.name || body.name.trim().length === 0) {
        return NextResponse.json({ error: 'Group name cannot be empty' }, { status: 400 })
      }

      if (body.name.trim().length > 100) {
        return NextResponse.json({ error: 'Group name must be 100 characters or less' }, { status: 400 })
      }

      // Check for duplicate group names (excluding current group)
      const { data: existingGroups, error: checkError } = await supabase
        .from('category_groups')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', body.name.trim())
        .neq('id', params.id)
        .maybeSingle()

      if (checkError) {
        console.error('Error checking for duplicate group names:', checkError)
        return NextResponse.json({ error: 'Failed to validate group name' }, { status: 500 })
      }

      if (existingGroups) {
        return NextResponse.json({ error: 'A group with this name already exists' }, { status: 409 })
      }
    }

    // Build update data
    const updateData: Record<string, any> = {}
    if (body.name !== undefined) updateData.name = body.name.trim()
    if (body.description !== undefined) updateData.description = body.description?.trim() || null
    if (body.color !== undefined) updateData.color = body.color
    if (body.icon !== undefined) updateData.icon = body.icon?.trim() || null
    if (body.sort_order !== undefined) updateData.sort_order = body.sort_order

    // Update the category group
    const { data: updatedGroup, error: updateError } = await supabase
      .from('category_groups')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Category group not found' }, { status: 404 })
      }
      console.error('Error updating category group:', updateError)
      return NextResponse.json({ error: 'Failed to update category group' }, { status: 500 })
    }

    return NextResponse.json({ data: updatedGroup })
  } catch (error) {
    console.error('Unexpected error in PATCH /api/category-groups/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if group has any categories assigned to it
    const { data: categoriesInGroup, error: categoriesError } = await supabase
      .from('categories')
      .select('id')
      .eq('group_id', params.id)
      .eq('user_id', user.id)
      .limit(1)

    if (categoriesError) {
      console.error('Error checking categories in group:', categoriesError)
      return NextResponse.json({ error: 'Failed to check group usage' }, { status: 500 })
    }

    if (categoriesInGroup && categoriesInGroup.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete group that contains categories. Please move or delete categories first.' 
      }, { status: 409 })
    }

    // Delete the category group
    const { error: deleteError } = await supabase
      .from('category_groups')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting category group:', deleteError)
      return NextResponse.json({ error: 'Failed to delete category group' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error in DELETE /api/category-groups/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}