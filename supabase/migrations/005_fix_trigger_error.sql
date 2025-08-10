-- Fix trigger error for category spent updates
-- Remove the problematic trigger and replace with a safer version

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_category_spent ON public.transactions;

-- Drop the function
DROP FUNCTION IF EXISTS public.update_category_spent();

-- Create a safer trigger function that doesn't assume field existence
CREATE OR REPLACE FUNCTION public.update_category_spent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    target_category_id UUID;
BEGIN
    -- Handle different trigger operations
    IF TG_OP = 'DELETE' THEN
        target_category_id := OLD.category_id;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update old category if category changed
        IF OLD.category_id != NEW.category_id THEN
            UPDATE public.categories 
            SET 
                spent = COALESCE((
                    SELECT SUM(amount) 
                    FROM public.transactions 
                    WHERE category_id = OLD.category_id
                ), 0),
                updated_at = NOW()
            WHERE id = OLD.category_id;
        END IF;
        target_category_id := NEW.category_id;
    ELSIF TG_OP = 'INSERT' THEN
        target_category_id := NEW.category_id;
    END IF;

    -- Update the target category's spent amount
    IF target_category_id IS NOT NULL THEN
        UPDATE public.categories 
        SET 
            spent = COALESCE((
                SELECT SUM(amount) 
                FROM public.transactions 
                WHERE category_id = target_category_id
            ), 0),
            updated_at = NOW()
        WHERE id = target_category_id;
    END IF;

    -- Return appropriate record
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_category_spent
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_category_spent();