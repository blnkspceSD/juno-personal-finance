# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-14-category-group-cards/spec.md

> Created: 2025-08-14
> Version: 1.0.0

## Schema Changes

The existing CategoryGroup schema from migration 006 provides a solid foundation. Only minor enhancements are needed to support the enhanced group cards functionality.

### Existing Schema (Already Implemented)

The following schema is already in place from migration `006_enhanced_category_management.sql`:

```sql
-- Category Groups Table (ALREADY EXISTS)
CREATE TABLE category_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    description TEXT CHECK (length(description) <= 500),
    color TEXT DEFAULT '#6366f1' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon TEXT CHECK (length(icon) <= 50),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, name)
);

-- Enhanced Categories Table (ALREADY EXISTS)
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS description TEXT CHECK (length(description) <= 500),
ADD COLUMN IF NOT EXISTS icon TEXT CHECK (length(icon) <= 50);
```

### New Schema Additions Required

#### Enhanced View for Group Cards
```sql
-- Enhanced view for category group cards with progress data
CREATE OR REPLACE VIEW category_groups_with_progress AS
SELECT 
    cg.*,
    COALESCE(group_stats.category_count, 0) as category_count,
    COALESCE(group_stats.total_allocated, 0) as total_allocated,
    COALESCE(group_stats.total_spent, 0) as total_spent,
    COALESCE(group_stats.remaining_budget, 0) as remaining_budget,
    COALESCE(group_stats.overspent_count, 0) as overspent_count,
    CASE 
        WHEN group_stats.total_allocated = 0 THEN 'underfunded'
        WHEN group_stats.overspent_count > 0 THEN 'overspent'
        WHEN group_stats.total_allocated > 0 AND (group_stats.total_spent::DECIMAL / group_stats.total_allocated) > 0.9 THEN 'warning'
        ELSE 'healthy'
    END as health_status,
    CASE 
        WHEN group_stats.total_allocated > 0 
        THEN ROUND((group_stats.total_spent::DECIMAL / group_stats.total_allocated) * 100, 2)
        ELSE 0 
    END as utilization_rate
FROM category_groups cg
LEFT JOIN (
    SELECT 
        c.group_id,
        COUNT(*) as category_count,
        SUM(c.allocated) as total_allocated,
        SUM(c.spent) as total_spent,
        SUM(c.allocated) - SUM(c.spent) as remaining_budget,
        COUNT(CASE WHEN c.spent > c.allocated THEN 1 END) as overspent_count
    FROM categories c
    WHERE c.archived_at IS NULL
    GROUP BY c.group_id
) group_stats ON cg.id = group_stats.group_id;
```

#### Default Group Templates Table
```sql
-- Table for storing default group templates (system-wide defaults)
CREATE TABLE default_group_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    category_types TEXT[], -- Array of category types that typically belong in this group
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default templates
INSERT INTO default_group_templates (name, description, color, icon, sort_order, category_types) VALUES
('Bills & Fixed Expenses', 'Rent, utilities, insurance, and other fixed monthly costs', '#dc2626', '📋', 0, ARRAY['housing', 'utilities', 'insurance', 'loans', 'subscriptions']),
('Core Expenses', 'Essential daily expenses like food, transportation, and healthcare', '#059669', '🛒', 1, ARRAY['food', 'transportation', 'healthcare', 'groceries', 'gas']),
('Fun & Lifestyle', 'Entertainment, dining out, hobbies, and personal enjoyment', '#7c3aed', '🎨', 2, ARRAY['entertainment', 'dining', 'hobbies', 'shopping', 'lifestyle']),
('Savings Goals', 'Emergency fund, vacation fund, and other financial goals', '#2563eb', '🎯', 3, ARRAY['emergency', 'vacation', 'goals', 'investments', 'retirement']),
('Flexible Spending', 'Variable expenses that can be adjusted as needed', '#0891b2', '💰', 4, ARRAY['miscellaneous', 'gifts', 'personal', 'variable', 'other']);
```

#### User Group Preferences
```sql
-- Table for storing user preferences about their category groups
CREATE TABLE user_group_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    default_view TEXT DEFAULT 'cards' CHECK (default_view IN ('cards', 'list', 'compact')),
    show_progress_bars BOOLEAN DEFAULT TRUE,
    show_overspent_first BOOLEAN DEFAULT TRUE,
    auto_assign_new_categories BOOLEAN DEFAULT TRUE,
    preferred_card_size TEXT DEFAULT 'medium' CHECK (preferred_card_size IN ('small', 'medium', 'large')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);
```

### Enhanced Indexes

```sql
-- Performance indexes for group cards
CREATE INDEX IF NOT EXISTS idx_categories_group_spending ON categories(group_id, allocated, spent) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_user_group_active ON categories(user_id, group_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_category_groups_user_sort ON category_groups(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_group_preferences_user ON user_group_preferences(user_id);
```

### Enhanced Functions

#### Function to Calculate Group Progress Data
```sql
-- Function to get detailed progress data for a category group
CREATE OR REPLACE FUNCTION get_group_progress_data(group_id_param UUID, user_id_param UUID)
RETURNS TABLE (
    category_id UUID,
    category_name TEXT,
    category_color TEXT,
    category_icon TEXT,
    allocated DECIMAL(10,2),
    spent DECIMAL(10,2),
    percentage DECIMAL(5,2),
    is_overspent BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    WITH group_total AS (
        SELECT COALESCE(SUM(c.allocated), 0) as total_budget
        FROM categories c
        WHERE c.group_id = group_id_param 
        AND c.user_id = user_id_param 
        AND c.archived_at IS NULL
    )
    SELECT 
        c.id,
        c.name,
        c.color,
        c.icon,
        c.allocated,
        c.spent,
        CASE 
            WHEN gt.total_budget > 0 
            THEN ROUND((c.allocated::DECIMAL / gt.total_budget) * 100, 2)
            ELSE 0 
        END as percentage,
        (c.spent > c.allocated) as is_overspent
    FROM categories c
    CROSS JOIN group_total gt
    WHERE c.group_id = group_id_param 
    AND c.user_id = user_id_param 
    AND c.archived_at IS NULL
    ORDER BY c.allocated DESC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Function to Auto-Assign Categories to Groups
```sql
-- Function to intelligently assign categories to appropriate groups based on name patterns
CREATE OR REPLACE FUNCTION auto_assign_categories_to_groups(user_id_param UUID)
RETURNS TABLE (
    category_id UUID,
    old_group_id UUID,
    new_group_id UUID,
    assignment_reason TEXT
) AS $$
DECLARE
    group_mapping RECORD;
    category_record RECORD;
    assigned_count INTEGER := 0;
BEGIN
    -- Create a mapping of keywords to group IDs for this user
    FOR group_mapping IN 
        SELECT cg.id as group_id, cg.name as group_name, dgt.category_types
        FROM category_groups cg
        JOIN default_group_templates dgt ON LOWER(cg.name) LIKE '%' || LOWER(SPLIT_PART(dgt.name, ' ', 1)) || '%'
        WHERE cg.user_id = user_id_param
    LOOP
        -- Find categories that should be assigned to this group
        FOR category_record IN
            SELECT c.id, c.name, c.group_id as current_group_id
            FROM categories c
            WHERE c.user_id = user_id_param
            AND c.archived_at IS NULL
            AND c.group_id IS NULL -- Only assign ungrouped categories
            AND (
                -- Match by category name patterns
                EXISTS (
                    SELECT 1 FROM unnest(group_mapping.category_types) AS keyword
                    WHERE LOWER(c.name) LIKE '%' || keyword || '%'
                )
            )
        LOOP
            -- Update the category
            UPDATE categories 
            SET group_id = group_mapping.group_id, updated_at = NOW()
            WHERE id = category_record.id;
            
            -- Return the assignment info
            RETURN QUERY SELECT 
                category_record.id,
                category_record.current_group_id,
                group_mapping.group_id,
                'Auto-assigned based on category name pattern'::TEXT;
            
            assigned_count := assigned_count + 1;
        END LOOP;
    END LOOP;
    
    RAISE NOTICE 'Auto-assigned % categories to groups', assigned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Function to Setup Default Groups for New Users
```sql
-- Function to create default category groups for a new user
CREATE OR REPLACE FUNCTION setup_default_category_groups(
    user_id_param UUID,
    include_templates TEXT[] DEFAULT NULL
)
RETURNS TABLE (
    group_id UUID,
    group_name TEXT,
    categories_assigned INTEGER
) AS $$
DECLARE
    template_record RECORD;
    new_group_id UUID;
    assigned_count INTEGER;
BEGIN
    -- Create default groups based on templates
    FOR template_record IN 
        SELECT * FROM default_group_templates dgt
        WHERE dgt.is_active = TRUE
        AND (include_templates IS NULL OR dgt.name = ANY(include_templates))
        ORDER BY dgt.sort_order
    LOOP
        -- Insert the new group
        INSERT INTO category_groups (
            user_id, name, description, color, icon, sort_order
        ) VALUES (
            user_id_param,
            template_record.name,
            template_record.description,
            template_record.color,
            template_record.icon,
            template_record.sort_order
        ) RETURNING id INTO new_group_id;
        
        -- Count categories that could be assigned to this group
        SELECT COUNT(*) INTO assigned_count
        FROM categories c
        WHERE c.user_id = user_id_param
        AND c.archived_at IS NULL
        AND c.group_id IS NULL
        AND EXISTS (
            SELECT 1 FROM unnest(template_record.category_types) AS keyword
            WHERE LOWER(c.name) LIKE '%' || keyword || '%'
        );
        
        -- Return group info
        RETURN QUERY SELECT new_group_id, template_record.name, assigned_count;
    END LOOP;
    
    -- Auto-assign categories to the newly created groups
    PERFORM auto_assign_categories_to_groups(user_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Migrations

### Migration: 007_enhanced_group_cards_support.sql

```sql
-- Enhanced Category Group Cards Support
-- Migration: 007_enhanced_group_cards_support.sql
-- Created: 2025-08-14
-- Description: Add views, functions, and tables to support enhanced category group cards

-- Enhanced view for category group cards with progress data
CREATE OR REPLACE VIEW category_groups_with_progress AS
SELECT 
    cg.*,
    COALESCE(group_stats.category_count, 0) as category_count,
    COALESCE(group_stats.total_allocated, 0) as total_allocated,
    COALESCE(group_stats.total_spent, 0) as total_spent,
    COALESCE(group_stats.remaining_budget, 0) as remaining_budget,
    COALESCE(group_stats.overspent_count, 0) as overspent_count,
    CASE 
        WHEN group_stats.total_allocated = 0 THEN 'underfunded'
        WHEN group_stats.overspent_count > 0 THEN 'overspent'
        WHEN group_stats.total_allocated > 0 AND (group_stats.total_spent::DECIMAL / group_stats.total_allocated) > 0.9 THEN 'warning'
        ELSE 'healthy'
    END as health_status,
    CASE 
        WHEN group_stats.total_allocated > 0 
        THEN ROUND((group_stats.total_spent::DECIMAL / group_stats.total_allocated) * 100, 2)
        ELSE 0 
    END as utilization_rate
FROM category_groups cg
LEFT JOIN (
    SELECT 
        c.group_id,
        COUNT(*) as category_count,
        SUM(c.allocated) as total_allocated,
        SUM(c.spent) as total_spent,
        SUM(c.allocated) - SUM(c.spent) as remaining_budget,
        COUNT(CASE WHEN c.spent > c.allocated THEN 1 END) as overspent_count
    FROM categories c
    WHERE c.archived_at IS NULL
    GROUP BY c.group_id
) group_stats ON cg.id = group_stats.group_id;

-- Default group templates table
CREATE TABLE default_group_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    color TEXT NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    category_types TEXT[],
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User group preferences
CREATE TABLE user_group_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    default_view TEXT DEFAULT 'cards' CHECK (default_view IN ('cards', 'list', 'compact')),
    show_progress_bars BOOLEAN DEFAULT TRUE,
    show_overspent_first BOOLEAN DEFAULT TRUE,
    auto_assign_new_categories BOOLEAN DEFAULT TRUE,
    preferred_card_size TEXT DEFAULT 'medium' CHECK (preferred_card_size IN ('small', 'medium', 'large')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Insert default templates
INSERT INTO default_group_templates (name, description, color, icon, sort_order, category_types) VALUES
('Bills & Fixed Expenses', 'Rent, utilities, insurance, and other fixed monthly costs', '#dc2626', '📋', 0, ARRAY['housing', 'utilities', 'insurance', 'loans', 'subscriptions']),
('Core Expenses', 'Essential daily expenses like food, transportation, and healthcare', '#059669', '🛒', 1, ARRAY['food', 'transportation', 'healthcare', 'groceries', 'gas']),
('Fun & Lifestyle', 'Entertainment, dining out, hobbies, and personal enjoyment', '#7c3aed', '🎨', 2, ARRAY['entertainment', 'dining', 'hobbies', 'shopping', 'lifestyle']),
('Savings Goals', 'Emergency fund, vacation fund, and other financial goals', '#2563eb', '🎯', 3, ARRAY['emergency', 'vacation', 'goals', 'investments', 'retirement']),
('Flexible Spending', 'Variable expenses that can be adjusted as needed', '#0891b2', '💰', 4, ARRAY['miscellaneous', 'gifts', 'personal', 'variable', 'other']);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_categories_group_spending ON categories(group_id, allocated, spent) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_categories_user_group_active ON categories(user_id, group_id) WHERE archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_category_groups_user_sort ON category_groups(user_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_user_group_preferences_user ON user_group_preferences(user_id);

-- Add functions
[Functions from above sections would be included here]

-- Enable RLS for new tables
ALTER TABLE default_group_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_group_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Default templates are readable by all authenticated users" 
    ON default_group_templates FOR SELECT 
    TO authenticated
    USING (true);

CREATE POLICY "Users can view their own preferences" 
    ON user_group_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
    ON user_group_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
    ON user_group_preferences FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant permissions
GRANT SELECT ON category_groups_with_progress TO authenticated;
GRANT SELECT ON default_group_templates TO authenticated;
GRANT ALL ON user_group_preferences TO authenticated;

-- Comments
COMMENT ON VIEW category_groups_with_progress IS 'Enhanced view for category group cards with calculated progress metrics';
COMMENT ON TABLE default_group_templates IS 'System-wide templates for creating default category groups';
COMMENT ON TABLE user_group_preferences IS 'User preferences for category group display and behavior';
```