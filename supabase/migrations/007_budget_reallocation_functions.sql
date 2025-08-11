-- Budget Reallocation Functions
-- Migration: 007_budget_reallocation_functions.sql
-- Created: 2025-08-10
-- Description: Create functions for atomic budget reallocation operations

-- Function to reallocate budget funds between categories
-- This ensures atomic operations and proper validation
CREATE OR REPLACE FUNCTION reallocate_budget_funds(
    p_user_id UUID,
    p_amount DECIMAL(10,2),
    p_from_category_id UUID DEFAULT NULL,
    p_to_category_id UUID DEFAULT NULL,
    p_reason TEXT DEFAULT NULL,
    p_allocation_type TEXT DEFAULT 'manual'
) RETURNS JSON AS $$
DECLARE
    v_from_category categories%ROWTYPE;
    v_to_category categories%ROWTYPE;
    v_allocation_id UUID;
    v_result JSON;
BEGIN
    -- Validate parameters
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Amount must be greater than 0';
    END IF;
    
    IF p_from_category_id IS NULL AND p_to_category_id IS NULL THEN
        RAISE EXCEPTION 'At least one category must be specified';
    END IF;
    
    IF p_from_category_id IS NOT NULL AND p_to_category_id IS NOT NULL AND p_from_category_id = p_to_category_id THEN
        RAISE EXCEPTION 'Cannot reallocate funds to the same category';
    END IF;

    -- If taking from a category, validate it exists and has sufficient funds
    IF p_from_category_id IS NOT NULL THEN
        SELECT * INTO v_from_category 
        FROM categories 
        WHERE id = p_from_category_id AND user_id = p_user_id AND archived_at IS NULL;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Source category not found or archived';
        END IF;
        
        -- Check if category has sufficient allocated funds
        IF v_from_category.allocated < p_amount THEN
            RAISE EXCEPTION 'Insufficient funds in source category (available: %, requested: %)', 
                v_from_category.allocated, p_amount;
        END IF;
        
        -- Update source category (reduce allocated amount)
        UPDATE categories 
        SET allocated = allocated - p_amount, updated_at = NOW()
        WHERE id = p_from_category_id AND user_id = p_user_id;
    END IF;

    -- If allocating to a category, validate it exists
    IF p_to_category_id IS NOT NULL THEN
        SELECT * INTO v_to_category 
        FROM categories 
        WHERE id = p_to_category_id AND user_id = p_user_id AND archived_at IS NULL;
        
        IF NOT FOUND THEN
            RAISE EXCEPTION 'Target category not found or archived';
        END IF;
        
        -- Update target category (increase allocated amount)
        UPDATE categories 
        SET allocated = allocated + p_amount, updated_at = NOW()
        WHERE id = p_to_category_id AND user_id = p_user_id;
    END IF;

    -- Create allocation record for audit trail
    INSERT INTO budget_allocations (
        user_id,
        from_category_id,
        to_category_id,
        amount,
        reason,
        allocation_type
    ) VALUES (
        p_user_id,
        p_from_category_id,
        p_to_category_id,
        p_amount,
        p_reason,
        p_allocation_type
    ) RETURNING id INTO v_allocation_id;

    -- Return success result with allocation details
    v_result := json_build_object(
        'allocation_id', v_allocation_id,
        'from_category_id', p_from_category_id,
        'to_category_id', p_to_category_id,
        'amount', p_amount,
        'reason', p_reason,
        'allocation_type', p_allocation_type,
        'created_at', NOW()
    );

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get smart donor suggestions for budget reallocation
-- This analyzes categories to suggest optimal funding sources
CREATE OR REPLACE FUNCTION get_donor_suggestions(
    p_user_id UUID,
    p_budget_id UUID,
    p_amount DECIMAL(10,2) DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_suggestions JSON;
    v_total_available DECIMAL(10,2) := 0;
BEGIN
    -- Get categories with available headroom, ordered by utilization rate
    -- Lower utilization = better donor candidate
    WITH category_metrics AS (
        SELECT 
            c.id,
            c.name,
            c.color,
            c.allocated,
            c.spent,
            (c.allocated - c.spent) as available_amount,
            CASE 
                WHEN c.allocated = 0 THEN 0
                ELSE (c.spent::DECIMAL / c.allocated::DECIMAL)
            END as utilization_rate,
            -- Calculate confidence score based on multiple factors
            CASE 
                WHEN c.allocated - c.spent > 50 AND c.spent::DECIMAL / c.allocated::DECIMAL < 0.8 THEN 0.9
                WHEN c.allocated - c.spent > 20 AND c.spent::DECIMAL / c.allocated::DECIMAL < 0.9 THEN 0.7
                WHEN c.allocated - c.spent > 10 THEN 0.5
                ELSE 0.2
            END as confidence_score
        FROM categories c
        WHERE c.user_id = p_user_id
            AND c.budget_id = p_budget_id
            AND c.archived_at IS NULL
            AND (c.allocated - c.spent) > 0 -- Only categories with available funds
    ),
    suggestions_with_reasoning AS (
        SELECT 
            cm.*,
            ARRAY[
                CASE WHEN cm.available_amount > 100 THEN 'Has significant headroom ($' || cm.available_amount || ')' 
                     ELSE 'Has some headroom ($' || cm.available_amount || ')' END,
                CASE WHEN cm.utilization_rate < 0.5 THEN 'Low utilization (' || ROUND(cm.utilization_rate * 100) || '%)'
                     WHEN cm.utilization_rate < 0.8 THEN 'Moderate utilization (' || ROUND(cm.utilization_rate * 100) || '%)'
                     ELSE 'High utilization (' || ROUND(cm.utilization_rate * 100) || '%)' END,
                CASE WHEN p_amount IS NOT NULL AND cm.available_amount >= p_amount 
                     THEN 'Can fully fund the requested amount'
                     WHEN p_amount IS NOT NULL AND cm.available_amount >= (p_amount * 0.5)
                     THEN 'Can partially fund the requested amount'
                     ELSE 'Limited funding capacity' END
            ] as reasoning
        FROM category_metrics cm
        WHERE cm.confidence_score > 0.2 -- Filter out very low-confidence suggestions
    )
    SELECT json_build_object(
        'suggested_donors', COALESCE(json_agg(
            json_build_object(
                'category_id', s.id,
                'category_name', s.name,
                'category_color', s.color,
                'available_amount', s.available_amount,
                'utilization_rate', s.utilization_rate,
                'confidence_score', s.confidence_score,
                'reasoning', s.reasoning
            ) ORDER BY s.confidence_score DESC, s.available_amount DESC
        ), '[]'::json),
        'total_available', COALESCE(SUM(s.available_amount), 0),
        'recommended_allocation', 
            CASE 
                WHEN p_amount IS NOT NULL THEN
                    (SELECT json_agg(
                        json_build_object(
                            'category_id', sub.id,
                            'amount', LEAST(sub.available_amount, p_amount)
                        )
                    ) FROM (
                        SELECT id, available_amount 
                        FROM suggestions_with_reasoning 
                        WHERE available_amount >= p_amount
                        ORDER BY confidence_score DESC
                        LIMIT 1
                    ) sub)
                ELSE '[]'::json
            END
    ) INTO v_suggestions
    FROM suggestions_with_reasoning s;

    RETURN COALESCE(v_suggestions, '{"suggested_donors": [], "total_available": 0, "recommended_allocation": []}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk archive categories
CREATE OR REPLACE FUNCTION bulk_archive_categories(
    p_user_id UUID,
    p_category_ids UUID[],
    p_reason TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_archived_count INTEGER := 0;
    v_skipped_count INTEGER := 0;
    v_errors TEXT[] := '{}';
    v_category_id UUID;
    v_category categories%ROWTYPE;
BEGIN
    -- Process each category
    FOREACH v_category_id IN ARRAY p_category_ids
    LOOP
        BEGIN
            -- Check if category exists and user owns it
            SELECT * INTO v_category 
            FROM categories 
            WHERE id = v_category_id AND user_id = p_user_id AND archived_at IS NULL;
            
            IF NOT FOUND THEN
                v_errors := array_append(v_errors, 'Category ' || v_category_id || ' not found or already archived');
                v_skipped_count := v_skipped_count + 1;
                CONTINUE;
            END IF;
            
            -- Check if category has remaining budget
            IF v_category.allocated - v_category.spent > 0 THEN
                v_errors := array_append(v_errors, 'Category "' || v_category.name || '" has remaining budget');
                v_skipped_count := v_skipped_count + 1;
                CONTINUE;
            END IF;
            
            -- Archive the category
            UPDATE categories 
            SET archived_at = NOW(), updated_at = NOW()
            WHERE id = v_category_id AND user_id = p_user_id;
            
            -- Log the archival
            INSERT INTO budget_allocations (
                user_id, 
                from_category_id, 
                amount, 
                reason, 
                allocation_type
            ) VALUES (
                p_user_id,
                v_category_id,
                0,
                COALESCE(p_reason, 'Bulk archive operation'),
                'system'
            );
            
            v_archived_count := v_archived_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error archiving ' || v_category_id || ': ' || SQLERRM);
            v_skipped_count := v_skipped_count + 1;
        END;
    END LOOP;

    RETURN json_build_object(
        'archived_count', v_archived_count,
        'skipped_count', v_skipped_count,
        'errors', v_errors
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to bulk restore categories
CREATE OR REPLACE FUNCTION bulk_restore_categories(
    p_user_id UUID,
    p_category_ids UUID[]
) RETURNS JSON AS $$
DECLARE
    v_restored_count INTEGER := 0;
    v_skipped_count INTEGER := 0;
    v_errors TEXT[] := '{}';
    v_category_id UUID;
    v_category categories%ROWTYPE;
BEGIN
    -- Process each category
    FOREACH v_category_id IN ARRAY p_category_ids
    LOOP
        BEGIN
            -- Check if category exists, is archived, and user owns it
            SELECT * INTO v_category 
            FROM categories 
            WHERE id = v_category_id AND user_id = p_user_id AND archived_at IS NOT NULL;
            
            IF NOT FOUND THEN
                v_errors := array_append(v_errors, 'Category ' || v_category_id || ' not found or not archived');
                v_skipped_count := v_skipped_count + 1;
                CONTINUE;
            END IF;
            
            -- Restore the category
            UPDATE categories 
            SET archived_at = NULL, updated_at = NOW()
            WHERE id = v_category_id AND user_id = p_user_id;
            
            -- Log the restoration
            INSERT INTO budget_allocations (
                user_id, 
                to_category_id, 
                amount, 
                reason, 
                allocation_type
            ) VALUES (
                p_user_id,
                v_category_id,
                0,
                'Bulk restore operation',
                'system'
            );
            
            v_restored_count := v_restored_count + 1;
            
        EXCEPTION WHEN OTHERS THEN
            v_errors := array_append(v_errors, 'Error restoring ' || v_category_id || ': ' || SQLERRM);
            v_skipped_count := v_skipped_count + 1;
        END;
    END LOOP;

    RETURN json_build_object(
        'restored_count', v_restored_count,
        'skipped_count', v_skipped_count,
        'errors', v_errors
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION reallocate_budget_funds TO authenticated;
GRANT EXECUTE ON FUNCTION get_donor_suggestions TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_archive_categories TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_restore_categories TO authenticated;

-- Comments for documentation
COMMENT ON FUNCTION reallocate_budget_funds IS 'Atomically reallocate budget funds between categories with full validation';
COMMENT ON FUNCTION get_donor_suggestions IS 'Analyze categories to provide smart donor suggestions for budget reallocation';
COMMENT ON FUNCTION bulk_archive_categories IS 'Safely archive multiple categories with validation and audit logging';
COMMENT ON FUNCTION bulk_restore_categories IS 'Restore multiple archived categories with audit logging';