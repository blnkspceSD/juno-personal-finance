DROP TRIGGER IF EXISTS update_category_spent_on_insert ON public.transactions;
DROP TRIGGER IF EXISTS update_category_spent_on_update ON public.transactions;
DROP TRIGGER IF EXISTS update_category_spent_on_delete ON public.transactions;
DROP TRIGGER IF EXISTS trigger_update_category_spent ON public.transactions;
DROP FUNCTION IF EXISTS public.update_category_spent() CASCADE;