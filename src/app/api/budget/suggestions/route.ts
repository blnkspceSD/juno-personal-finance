/**
 * Budget Suggestions API
 * Provides smart donor suggestions for budget reallocation
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

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
    const budgetId = searchParams.get('budget_id')
    const amount = searchParams.get('amount')

    if (!budgetId) {
      return NextResponse.json({ error: 'budget_id parameter is required' }, { status: 400 })
    }

    // Validate amount if provided
    const parsedAmount = amount ? parseFloat(amount) : null
    if (amount && (isNaN(parsedAmount!) || parsedAmount! <= 0)) {
      return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 })
    }

    // Call the database function to get donor suggestions
    const { data: suggestions, error } = await supabase.rpc(
      'get_donor_suggestions',
      {
        p_user_id: user.id,
        p_budget_id: budgetId,
        p_amount: parsedAmount
      }
    )

    if (error) {
      console.error('Error fetching donor suggestions:', error)
      return NextResponse.json({ error: 'Failed to fetch donor suggestions' }, { status: 500 })
    }

    // Parse the JSON response from the database function
    const suggestionData = suggestions || {
      suggested_donors: [],
      total_available: 0,
      recommended_allocation: []
    }

    return NextResponse.json({ data: suggestionData })
  } catch (error) {
    console.error('Unexpected error in GET /api/budget/suggestions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}