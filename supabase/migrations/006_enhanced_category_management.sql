-- Enhanced Category Management Schema
-- Migration: 006_enhanced_category_management.sql
-- Created: 2025-08-10
-- Description: Add category groups, enhanced category features, and budget allocation tracking

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Category Groups Table
-- Groups allow users to organize categories (e.g., "Bills", "Lifestyle", "Goals")
CREATE TABLE category_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    description TEXT CHECK (length(description) <= 500),
    color TEXT DEFAULT '#6366f1' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon TEXT CHECK (length(icon) <= 50), -- Emoji or icon identifier
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure unique group names per user
    UNIQUE(user_id, name)
);

-- Add indexes for performance
CREATE INDEX idx_category_groups_user_id ON category_groups(user_id);
CREATE INDEX idx_category_groups_sort_order ON category_groups(user_id, sort_order);

-- Enable RLS
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for category_groups
CREATE POLICY "Users can view their own category groups" 
    ON category_groups FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own category groups" 
    ON category_groups FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own category groups" 
    ON category_groups FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own category groups" 
    ON category_groups FOR DELETE 
    USING (auth.uid() = user_id);

-- Enhance Categories Table
-- Add new columns for grouping, archiving, and organization
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT CHECK (length(description) <= 500),
ADD COLUMN IF NOT EXISTS icon TEXT CHECK (length(icon) <= 50); -- Emoji or icon identifier

-- Add indexes for new category columns
CREATE INDEX IF NOT EXISTS idx_categories_group_id ON categories(group_id);
CREATE INDEX IF NOT EXISTS idx_categories_archived_at ON categories(archived_at);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON categories(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(user_id) WHERE archived_at IS NULL;

-- Budget Allocation History Table
-- Track all budget reallocations for audit and analytics
CREATE TABLE budget_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    from_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    to_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    reason TEXT CHECK (length(reason) <= 1000), -- User-provided reason for allocation
    allocation_type TEXT DEFAULT 'manual' CHECK (allocation_type IN ('manual', 'automatic', 'system')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure at least one category is specified (for new category funding)
    CONSTRAINT check_category_specified CHECK (
        from_category_id IS NOT NULL OR to_category_id IS NOT NULL
    )
);

-- Add indexes for budget allocations
CREATE INDEX idx_budget_allocations_user_id ON budget_allocations(user_id);
CREATE INDEX idx_budget_allocations_from_category ON budget_allocations(from_category_id);
CREATE INDEX idx_budget_allocations_to_category ON budget_allocations(to_category_id);
CREATE INDEX idx_budget_allocations_created_at ON budget_allocations(user_id, created_at DESC);

-- Enable RLS for budget_allocations
ALTER TABLE budget_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for budget_allocations
CREATE POLICY "Users can view their own budget allocations" 
    ON budget_allocations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budget allocations" 
    ON budget_allocations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Budget allocations are immutable once created (no UPDATE or DELETE policies)
-- This maintains audit trail integrity

-- Update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at trigger to category_groups
CREATE TRIGGER update_category_groups_updated_at 
    BEFORE UPDATE ON category_groups 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger to categories if it doesn't exist
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Default Category Groups
-- Create some default category groups for new users to help with onboarding
-- This will be handled by the application layer, not in the migration

-- Helper Views for Category Management

-- View for active categories with group information
CREATE OR REPLACE VIEW active_categories_with_groups AS
SELECT 
    c.*,
    cg.name as group_name,
    cg.color as group_color,
    cg.icon as group_icon
FROM categories c
LEFT JOIN category_groups cg ON c.group_id = cg.id
WHERE c.archived_at IS NULL
ORDER BY 
    cg.sort_order ASC NULLS LAST, 
    c.sort_order ASC, 
    c.name ASC;

-- View for category allocation summary
CREATE OR REPLACE VIEW category_allocation_summary AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    c.allocated,
    c.spent,
    c.allocated - c.spent as remaining,
    COALESCE(incoming.total_incoming, 0) as total_allocated_in,
    COALESCE(outgoing.total_outgoing, 0) as total_allocated_out,
    COUNT(DISTINCT ba_all.id) as allocation_count
FROM categories c
LEFT JOIN (
    SELECT 
        to_category_id,
        SUM(amount) as total_incoming
    FROM budget_allocations 
    WHERE to_category_id IS NOT NULL
    GROUP BY to_category_id
) incoming ON c.id = incoming.to_category_id
LEFT JOIN (
    SELECT 
        from_category_id,
        SUM(amount) as total_outgoing
    FROM budget_allocations 
    WHERE from_category_id IS NOT NULL
    GROUP BY from_category_id
) outgoing ON c.id = outgoing.from_category_id
LEFT JOIN budget_allocations ba_all ON (c.id = ba_all.from_category_id OR c.id = ba_all.to_category_id)
WHERE c.archived_at IS NULL
GROUP BY 
    c.id, c.name, c.allocated, c.spent, 
    incoming.total_incoming, outgoing.total_outgoing
ORDER BY c.sort_order ASC, c.name ASC;

-- Function to safely archive a category
-- This function ensures proper cleanup when archiving categories
CREATE OR REPLACE FUNCTION archive_category(category_id UUID, archive_reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    category_record categories%ROWTYPE;
    user_owns_category BOOLEAN;
BEGIN
    -- Check if user owns this category
    SELECT * INTO category_record 
    FROM categories 
    WHERE id = category_id AND user_id = auth.uid();
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Category not found or access denied';
    END IF;
    
    -- Don't archive if category has remaining budget
    IF category_record.allocated - category_record.spent > 0 THEN
        RAISE EXCEPTION 'Cannot archive category with remaining budget. Please reallocate funds first.';
    END IF;
    
    -- Archive the category
    UPDATE categories 
    SET 
        archived_at = NOW(),
        updated_at = NOW()
    WHERE id = category_id AND user_id = auth.uid();
    
    -- Log the archival in budget_allocations for audit trail
    INSERT INTO budget_allocations (
        user_id, 
        from_category_id, 
        amount, 
        reason, 
        allocation_type
    ) VALUES (
        auth.uid(),
        category_id,
        0, -- Zero amount indicates archival
        COALESCE(archive_reason, 'Category archived'),
        'system'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore an archived category
CREATE OR REPLACE FUNCTION restore_category(category_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    category_record categories%ROWTYPE;
BEGIN
    -- Check if user owns this category and it's archived
    SELECT * INTO category_record 
    FROM categories 
    WHERE id = category_id AND user_id = auth.uid() AND archived_at IS NOT NULL;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived category not found or access denied';
    END IF;
    
    -- Restore the category
    UPDATE categories 
    SET 
        archived_at = NULL,
        updated_at = NOW()
    WHERE id = category_id AND user_id = auth.uid();
    
    -- Log the restoration
    INSERT INTO budget_allocations (
        user_id, 
        to_category_id, 
        amount, 
        reason, 
        allocation_type
    ) VALUES (
        auth.uid(),
        category_id,
        0, -- Zero amount indicates restoration
        'Category restored from archive',
        'system'
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON category_groups TO authenticated;
GRANT ALL ON budget_allocations TO authenticated;
GRANT SELECT ON active_categories_with_groups TO authenticated;
GRANT SELECT ON category_allocation_summary TO authenticated;
GRANT EXECUTE ON FUNCTION archive_category(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_category(UUID) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE category_groups IS 'Groups for organizing categories (Bills, Lifestyle, Goals, etc.)';
COMMENT ON TABLE budget_allocations IS 'Audit trail of all budget reallocations between categories';
COMMENT ON VIEW active_categories_with_groups IS 'Active categories with their group information for easy display';
COMMENT ON VIEW category_allocation_summary IS 'Summary of category budgets and allocation history';
COMMENT ON FUNCTION archive_category IS 'Safely archive a category after ensuring no remaining budget';
COMMENT ON FUNCTION restore_category IS 'Restore an archived category';