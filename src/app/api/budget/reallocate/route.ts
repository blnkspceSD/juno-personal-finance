/**
 * Budget Reallocation API
 * Handles moving funds between categories with proper validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import type { CategoryReallocationForm } from '@/lib/types/database'

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
    const body: CategoryReallocationForm = await request.json()

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 })
    }

    if (body.amount > 999999.99) {
      return NextResponse.json({ error: 'Amount is too large' }, { status: 400 })
    }

    // Ensure we have at least one category specified
    if (!body.from_category_id && !body.to_category_id) {
      return NextResponse.json({ error: 'At least one category must be specified' }, { status: 400 })
    }

    // If both categories specified, ensure they're different
    if (body.from_category_id && body.to_category_id && body.from_category_id === body.to_category_id) {
      return NextResponse.json({ error: 'Cannot reallocate funds to the same category' }, { status: 400 })
    }

    // Start a transaction for atomic reallocation
    const { data: reallocationData, error: reallocationError } = await supabase.rpc(
      'reallocate_budget_funds',
      {
        p_user_id: user.id,
        p_amount: body.amount,
        p_from_category_id: body.from_category_id || null,
        p_to_category_id: body.to_category_id || null,
        p_reason: body.reason || null,
        p_allocation_type: body.allocation_type || 'manual'
      }
    )

    if (reallocationError) {
      console.error('Error reallocating budget funds:', reallocationError)
      
      // Handle specific error cases
      if (reallocationError.message?.includes('insufficient funds')) {
        return NextResponse.json({ error: 'Insufficient funds in source category' }, { status: 409 })
      }
      
      if (reallocationError.message?.includes('category not found')) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 })
      }
      
      return NextResponse.json({ error: 'Failed to reallocate budget funds' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      data: reallocationData 
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/budget/reallocate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('category_id')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Build query
    let query = supabase
      .from('budget_allocations')
      .select(`
        *,
        from_category:categories!budget_allocations_from_category_id_fkey(id, name, color),
        to_category:categories!budget_allocations_to_category_id_fkey(id, name, color)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Filter by category if specified
    if (categoryId) {
      query = query.or(`from_category_id.eq.${categoryId},to_category_id.eq.${categoryId}`)
    }

    const { data: allocations, error } = await query

    if (error) {
      console.error('Error fetching budget allocations:', error)
      return NextResponse.json({ error: 'Failed to fetch allocation history' }, { status: 500 })
    }

    return NextResponse.json({ data: allocations || [] })
  } catch (error) {
    console.error('Unexpected error in GET /api/budget/reallocate:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}