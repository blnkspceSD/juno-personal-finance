-- Real-time Balance Updates Migration
-- Enhances existing triggers to support real-time notifications and optimized performance

-- Enable realtime for required tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;

-- Create enhanced function for real-time balance updates with notifications
CREATE OR REPLACE FUNCTION notify_envelope_balance_change()
RETURNS TRIGGER AS $$
DECLARE
    affected_category_id UUID;
    old_spent DECIMAL(10,2);
    new_spent DECIMAL(10,2);
    category_info RECORD;
BEGIN
    -- Determine which category was affected
    affected_category_id := COALESCE(NEW.category_id, OLD.category_id);
    
    -- Get current spent amount before update
    SELECT spent INTO old_spent 
    FROM public.categories 
    WHERE id = affected_category_id;
    
    -- Update the category's spent amount
    UPDATE public.categories 
    SET spent = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.transactions 
        WHERE category_id = affected_category_id
    ),
    updated_at = NOW()
    WHERE id = affected_category_id;
    
    -- Get updated category information
    SELECT spent, allocated, name, budget_id 
    INTO category_info
    FROM public.categories 
    WHERE id = affected_category_id;
    
    -- Send real-time notification with balance change details
    PERFORM pg_notify(
        'envelope_balance_changed',
        json_build_object(
            'category_id', affected_category_id,
            'budget_id', category_info.budget_id,
            'category_name', category_info.name,
            'old_spent', old_spent,
            'new_spent', category_info.spent,
            'allocated', category_info.allocated,
            'remaining', category_info.allocated - category_info.spent,
            'is_overspent', category_info.spent > category_info.allocated,
            'timestamp', extract(epoch from now()),
            'transaction_id', COALESCE(NEW.id, OLD.id),
            'operation', TG_OP
        )::text
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Replace existing triggers with enhanced notification function
DROP TRIGGER IF EXISTS update_category_spent_on_insert ON public.transactions;
DROP TRIGGER IF EXISTS update_category_spent_on_update ON public.transactions;
DROP TRIGGER IF EXISTS update_category_spent_on_delete ON public.transactions;

-- Create new triggers with real-time notifications
CREATE TRIGGER notify_balance_change_on_insert 
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION notify_envelope_balance_change();

CREATE TRIGGER notify_balance_change_on_update 
    AFTER UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION notify_envelope_balance_change();

CREATE TRIGGER notify_balance_change_on_delete 
    AFTER DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION notify_envelope_balance_change();

-- Create index for better performance on real-time queries
CREATE INDEX IF NOT EXISTS idx_transactions_category_amount 
    ON public.transactions(category_id, amount);

-- Create function to get real-time category status
CREATE OR REPLACE FUNCTION get_category_status(p_category_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', id,
        'name', name,
        'allocated', allocated,
        'spent', spent,
        'remaining', allocated - spent,
        'percentage_used', CASE 
            WHEN allocated > 0 THEN (spent / allocated) * 100 
            ELSE 0 
        END,
        'is_overspent', spent > allocated,
        'updated_at', updated_at
    ) INTO result
    FROM public.categories
    WHERE id = p_category_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create function to get all envelope statuses for a budget
CREATE OR REPLACE FUNCTION get_budget_envelope_statuses(p_budget_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', id,
            'name', name,
            'allocated', allocated,
            'spent', spent,
            'remaining', allocated - spent,
            'percentage_used', CASE 
                WHEN allocated > 0 THEN (spent / allocated) * 100 
                ELSE 0 
            END,
            'is_overspent', spent > allocated,
            'sort_order', sort_order
        ) ORDER BY sort_order
    ) INTO result
    FROM public.categories
    WHERE budget_id = p_budget_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions for real-time subscriptions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.transactions TO anon, authenticated;

-- Note: RLS policies already exist from initial migration and will apply to realtime subscriptions