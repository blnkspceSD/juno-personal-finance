-- HOTFIX: Remove problematic triggers and function
-- Run this in Supabase SQL Editor to fix the immediate issue

-- Drop all dependent triggers first
DROP TRIGGER IF EXISTS update_category_spent_on_insert ON public.transactions;
DROP TRIGGER IF EXISTS update_category_spent_on_update ON public.transactions;
DROP TRIGGER IF EXISTS update_category_spent_on_delete ON public.transactions;
DROP TRIGGER IF EXISTS trigger_update_category_spent ON public.transactions;

-- Now drop the function with CASCADE to catch any remaining dependencies
DROP FUNCTION IF EXISTS public.update_category_spent() CASCADE;

-- This removes all triggers that are causing the error
-- The category spent amounts will be updated through application logic instead