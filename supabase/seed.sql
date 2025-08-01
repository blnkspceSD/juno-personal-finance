-- Seed data for development and testing
-- This file provides sample data for the envelope budgeting system

-- Insert sample user (this would normally be handled by Supabase Auth)
-- You'll need to replace the UUID with an actual user ID from your auth.users table

-- Sample budget for December 2025
INSERT INTO public.budgets (id, user_id, name, month, year, total_income) 
VALUES (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'your-user-id-here'::uuid, -- Replace with actual user ID
    'December 2025 Budget',
    '2025-12',
    2025,
    5000.00
);

-- Sample budget categories (envelopes)
INSERT INTO public.categories (id, user_id, budget_id, name, allocated, sort_order) VALUES
    ('550e8400-e29b-41d4-a716-446655440011'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Housing', 1500.00, 1),
    ('550e8400-e29b-41d4-a716-446655440012'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Transportation', 600.00, 2),
    ('550e8400-e29b-41d4-a716-446655440013'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Food & Dining', 500.00, 3),
    ('550e8400-e29b-41d4-a716-446655440014'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Utilities', 300.00, 4),
    ('550e8400-e29b-41d4-a716-446655440015'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Entertainment', 200.00, 5),
    ('550e8400-e29b-41d4-a716-446655440016'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Shopping', 300.00, 6),
    ('550e8400-e29b-41d4-a716-446655440017'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Healthcare', 200.00, 7),
    ('550e8400-e29b-41d4-a716-446655440018'::uuid, 'your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'Emergency Fund', 400.00, 8);

-- Sample transactions
INSERT INTO public.transactions (user_id, category_id, amount, description, date) VALUES
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440011'::uuid, 1200.00, 'Monthly Rent', '2025-12-01'),
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440013'::uuid, 85.50, 'Grocery Shopping - Whole Foods', '2025-12-02'),
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440012'::uuid, 45.00, 'Gas Station Fill-up', '2025-12-02'),
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440015'::uuid, 15.99, 'Netflix Subscription', '2025-12-03'),
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440013'::uuid, 28.75, 'Coffee Shop - Starbucks', '2025-12-04'),
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440016'::uuid, 67.89, 'Amazon Purchase - Household Items', '2025-12-05'),
    ('your-user-id-here'::uuid, '550e8400-e29b-41d4-a716-446655440014'::uuid, 125.00, 'Electricity Bill', '2025-12-06');