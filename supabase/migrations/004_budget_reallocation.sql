-- Budget Reallocation System - Database Functions
-- Handles atomic budget transfers between categories

-- Create budget_reallocations table to track all budget movements
CREATE TABLE public.budget_reallocations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
    from_category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
    to_category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for efficient querying
CREATE INDEX idx_budget_reallocations_budget_id ON public.budget_reallocations(budget_id);
CREATE INDEX idx_budget_reallocations_user_id ON public.budget_reallocations(user_id);
CREATE INDEX idx_budget_reallocations_transaction_id ON public.budget_reallocations(transaction_id) WHERE transaction_id IS NOT NULL;
CREATE INDEX idx_budget_reallocations_created_at ON public.budget_reallocations(created_at);

-- Enable RLS
ALTER TABLE public.budget_reallocations ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can manage their own budget reallocations" ON public.budget_reallocations
    FOR ALL USING (user_id = auth.uid());

-- Function to execute budget reallocation atomically
CREATE OR REPLACE FUNCTION public.execute_budget_reallocation(
    p_budget_id UUID,
    p_user_id UUID,
    p_to_category_id UUID,
    p_donors JSONB, -- Array of {categoryId, amount}
    p_reason TEXT,
    p_transaction_id UUID DEFAULT NULL
) RETURNS TABLE(
    reallocation_id UUID,
    from_category_id UUID,
    to_category_id UUID,
    amount DECIMAL(10,2),
    from_category_name TEXT,
    to_category_name TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    donor JSONB;
    donor_category_id UUID;
    donor_amount DECIMAL(10,2);
    current_allocated DECIMAL(10,2);
    current_spent DECIMAL(10,2);
    available_amount DECIMAL(10,2);
    reallocation_record RECORD;
BEGIN
    -- Validate inputs
    IF p_budget_id IS NULL OR p_user_id IS NULL OR p_to_category_id IS NULL THEN
        RAISE EXCEPTION 'Budget ID, User ID, and To Category ID are required';
    END IF;

    -- Verify user owns the budget
    IF NOT EXISTS (
        SELECT 1 FROM public.budgets 
        WHERE id = p_budget_id AND user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Budget not found or access denied';
    END IF;

    -- Verify target category exists and belongs to user
    IF NOT EXISTS (
        SELECT 1 FROM public.categories 
        WHERE id = p_to_category_id AND user_id = p_user_id AND budget_id = p_budget_id
    ) THEN
        RAISE EXCEPTION 'Target category not found or access denied';
    END IF;

    -- Process each donor
    FOR donor IN SELECT * FROM jsonb_array_elements(p_donors)
    LOOP
        donor_category_id := (donor->>'categoryId')::UUID;
        donor_amount := (donor->>'amount')::DECIMAL(10,2);

        -- Skip if amount is zero or negative
        IF donor_amount IS NULL OR donor_amount <= 0 THEN
            CONTINUE;
        END IF;

        -- Verify donor category exists and belongs to user
        IF NOT EXISTS (
            SELECT 1 FROM public.categories 
            WHERE id = donor_category_id AND user_id = p_user_id AND budget_id = p_budget_id
        ) THEN
            RAISE EXCEPTION 'Donor category % not found or access denied', donor_category_id;
        END IF;

        -- Get current allocation and spending for donor category
        SELECT allocated, spent INTO current_allocated, current_spent
        FROM public.categories
        WHERE id = donor_category_id;

        -- Calculate available amount (can't reduce below spent)
        available_amount := current_allocated - current_spent;

        -- Check if donor has enough available budget
        IF available_amount < donor_amount THEN
            RAISE EXCEPTION 'Insufficient available budget in donor category. Available: %, Requested: %', 
                available_amount, donor_amount;
        END IF;

        -- Update donor category (reduce allocation)
        UPDATE public.categories 
        SET 
            allocated = allocated - donor_amount,
            updated_at = NOW()
        WHERE id = donor_category_id;

        -- Update target category (increase allocation)
        UPDATE public.categories 
        SET 
            allocated = allocated + donor_amount,
            updated_at = NOW()
        WHERE id = p_to_category_id;

        -- Record the reallocation
        INSERT INTO public.budget_reallocations (
            user_id, budget_id, from_category_id, to_category_id, 
            amount, reason, transaction_id
        ) VALUES (
            p_user_id, p_budget_id, donor_category_id, p_to_category_id,
            donor_amount, p_reason, p_transaction_id
        );
    END LOOP;

    -- Return the reallocation records with category names
    RETURN QUERY
    SELECT 
        br.id as reallocation_id,
        br.from_category_id,
        br.to_category_id,
        br.amount,
        fc.name as from_category_name,
        tc.name as to_category_name
    FROM public.budget_reallocations br
    LEFT JOIN public.categories fc ON br.from_category_id = fc.id
    JOIN public.categories tc ON br.to_category_id = tc.id
    WHERE br.user_id = p_user_id 
      AND br.budget_id = p_budget_id
      AND br.to_category_id = p_to_category_id
      AND br.reason = p_reason
      AND br.created_at >= NOW() - INTERVAL '1 minute'; -- Recent reallocations
END;
$$;

-- Function to undo budget reallocation
CREATE OR REPLACE FUNCTION public.undo_budget_reallocation(
    p_reallocation_ids UUID[]
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    reallocation RECORD;
BEGIN
    -- Process each reallocation to undo
    FOR reallocation IN 
        SELECT * FROM public.budget_reallocations 
        WHERE id = ANY(p_reallocation_ids) 
          AND user_id = auth.uid()
    LOOP
        -- Restore original allocations (reverse the operation)
        
        -- Add back to donor category (if it exists)
        IF reallocation.from_category_id IS NOT NULL THEN
            UPDATE public.categories 
            SET 
                allocated = allocated + reallocation.amount,
                updated_at = NOW()
            WHERE id = reallocation.from_category_id;
        END IF;

        -- Remove from target category
        UPDATE public.categories 
        SET 
            allocated = allocated - reallocation.amount,
            updated_at = NOW()
        WHERE id = reallocation.to_category_id;

        -- Mark reallocation as undone (soft delete)
        UPDATE public.budget_reallocations 
        SET 
            reason = reason || ' [UNDONE]',
            updated_at = NOW()
        WHERE id = reallocation.id;
    END LOOP;
END;
$$;

-- Function to get budget summary with Available to Spend calculation
CREATE OR REPLACE FUNCTION public.get_budget_summary(p_budget_id UUID)
RETURNS TABLE(
    total_income DECIMAL(10,2),
    total_allocated DECIMAL(10,2),
    total_spent DECIMAL(10,2),
    available_to_spend DECIMAL(10,2),
    left_to_budget DECIMAL(10,2)
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT 
        b.total_income,
        COALESCE(SUM(c.allocated), 0) as total_allocated,
        COALESCE(SUM(c.spent), 0) as total_spent,
        COALESCE(SUM(c.allocated - c.spent), 0) as available_to_spend,
        GREATEST(b.total_income - COALESCE(SUM(c.allocated), 0), 0) as left_to_budget
    FROM public.budgets b
    LEFT JOIN public.categories c ON c.budget_id = b.id
    WHERE b.id = p_budget_id AND b.user_id = auth.uid()
    GROUP BY b.id, b.total_income;
$$;

-- Function to identify categories needing funding
CREATE OR REPLACE FUNCTION public.get_categories_needing_funding(p_budget_id UUID)
RETURNS TABLE(
    category_id UUID,
    category_name TEXT,
    total_transactions BIGINT,
    total_spent DECIMAL(10,2),
    allocated DECIMAL(10,2),
    deficit DECIMAL(10,2)
) LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT 
        c.id as category_id,
        c.name as category_name,
        COUNT(t.id) as total_transactions,
        COALESCE(SUM(t.amount), 0) as total_spent,
        c.allocated,
        GREATEST(COALESCE(SUM(t.amount), 0) - c.allocated, 0) as deficit
    FROM public.categories c
    LEFT JOIN public.transactions t ON t.category_id = c.id
    WHERE c.budget_id = p_budget_id 
      AND c.user_id = auth.uid()
      AND (c.allocated = 0 OR c.allocated < COALESCE(SUM(t.amount), 0))
    GROUP BY c.id, c.name, c.allocated
    HAVING COUNT(t.id) > 0 OR c.allocated = 0;
$$;

-- Trigger to update category spent amounts when transactions change
CREATE OR REPLACE FUNCTION public.update_category_spent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    -- Update spent amount for the affected category
    IF TG_OP = 'DELETE' THEN
        UPDATE public.categories 
        SET 
            spent = COALESCE((
                SELECT SUM(amount) 
                FROM public.transactions 
                WHERE category_id = OLD.category_id
            ), 0),
            updated_at = NOW()
        WHERE id = OLD.category_id;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Update both old and new categories if category changed
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
        
        UPDATE public.categories 
        SET 
            spent = COALESCE((
                SELECT SUM(amount) 
                FROM public.transactions 
                WHERE category_id = NEW.category_id
            ), 0),
            updated_at = NOW()
        WHERE id = NEW.category_id;
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        UPDATE public.categories 
        SET 
            spent = COALESCE((
                SELECT SUM(amount) 
                FROM public.transactions 
                WHERE category_id = NEW.category_id
            ), 0),
            updated_at = NOW()
        WHERE id = NEW.category_id;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$;

-- Create trigger for automatic spent amount updates
DROP TRIGGER IF EXISTS trigger_update_category_spent ON public.transactions;
CREATE TRIGGER trigger_update_category_spent
    AFTER INSERT OR UPDATE OR DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.update_category_spent();