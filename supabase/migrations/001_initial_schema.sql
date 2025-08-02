-- Juno Personal Finance - Initial Database Schema
-- Envelope budgeting system with RLS security

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create budgets table for monthly budget periods
CREATE TABLE public.budgets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    month TEXT NOT NULL, -- Format: YYYY-MM
    year INTEGER NOT NULL,
    total_income DECIMAL(10,2) DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    UNIQUE(user_id, month, year)
);

-- Create categories table for budget envelopes
CREATE TABLE public.categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    budget_id UUID REFERENCES public.budgets(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    allocated DECIMAL(10,2) DEFAULT 0 NOT NULL,
    spent DECIMAL(10,2) DEFAULT 0 NOT NULL,
    sort_order INTEGER DEFAULT 0,
    color TEXT DEFAULT '#3B82F6', -- Default blue color
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create transactions table for expense tracking
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can only see their own profile" ON public.users
    FOR ALL USING (auth.uid() = id);

-- Create RLS policies for budgets table
CREATE POLICY "Users can only see their own budgets" ON public.budgets
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for categories table
CREATE POLICY "Users can only see their own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id);

-- Create RLS policies for transactions table
CREATE POLICY "Users can only see their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_budgets_user_id ON public.budgets(user_id);
CREATE INDEX idx_budgets_month_year ON public.budgets(month, year);
CREATE INDEX idx_categories_budget_id ON public.categories(budget_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_date ON public.transactions(date);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update category spent amount when transactions change
CREATE OR REPLACE FUNCTION update_category_spent()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the category's spent amount
    UPDATE public.categories 
    SET spent = (
        SELECT COALESCE(SUM(amount), 0) 
        FROM public.transactions 
        WHERE category_id = COALESCE(NEW.category_id, OLD.category_id)
    )
    WHERE id = COALESCE(NEW.category_id, OLD.category_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update category spent amounts
CREATE TRIGGER update_category_spent_on_insert 
    AFTER INSERT ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_category_spent();

CREATE TRIGGER update_category_spent_on_update 
    AFTER UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_category_spent();

CREATE TRIGGER update_category_spent_on_delete 
    AFTER DELETE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_category_spent();

-- Insert default categories for new budgets (optional)
-- This will be handled by the application logic instead