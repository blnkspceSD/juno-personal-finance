-- Predefined Category Groups and Starter Categories
-- Migration: 008_predefined_category_groups.sql
-- Created: 2025-08-19
-- Description: Add predefined category groups and starter categories for new users

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Default Category Group Templates Table
-- These are the predefined templates that users can choose from
CREATE TABLE default_category_group_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_name TEXT UNIQUE NOT NULL CHECK (length(internal_name) > 0 AND length(internal_name) <= 100),
    display_name TEXT NOT NULL CHECK (length(display_name) > 0 AND length(display_name) <= 100),
    description TEXT NOT NULL CHECK (length(description) <= 500),
    color TEXT NOT NULL DEFAULT '#6366f1' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon TEXT CHECK (length(icon) <= 50),
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    auto_assign_keywords TEXT[] DEFAULT '{}', -- Keywords for auto-assignment
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_default_group_templates_active ON default_category_group_templates(is_active, sort_order);
CREATE INDEX idx_default_group_templates_internal_name ON default_category_group_templates(internal_name);

-- Default Category Templates Table
-- These are the starter categories for each group
CREATE TABLE default_category_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_template_id UUID REFERENCES default_category_group_templates(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL CHECK (length(name) > 0 AND length(name) <= 100),
    description TEXT CHECK (length(description) <= 500),
    color TEXT NOT NULL DEFAULT '#6366f1' CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
    icon TEXT CHECK (length(icon) <= 50),
    suggested_allocation DECIMAL(10,2) DEFAULT 0 CHECK (suggested_allocation >= 0),
    sort_order INTEGER DEFAULT 0,
    is_essential BOOLEAN DEFAULT FALSE, -- For essential categories like rent, groceries
    auto_assign_keywords TEXT[] DEFAULT '{}', -- Keywords for auto-assignment
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_default_category_templates_group ON default_category_templates(group_template_id, sort_order);
CREATE INDEX idx_default_category_templates_active ON default_category_templates(is_active);

-- User Setup Preferences Table
-- Track which groups users have chosen and their setup status
CREATE TABLE user_setup_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    selected_group_templates UUID[] DEFAULT '{}', -- Array of template IDs user selected
    has_completed_group_setup BOOLEAN DEFAULT FALSE,
    has_completed_category_setup BOOLEAN DEFAULT FALSE,
    setup_completed_at TIMESTAMPTZ,
    auto_assign_enabled BOOLEAN DEFAULT TRUE, -- Whether to auto-assign new categories
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_user_setup_preferences_user_id ON user_setup_preferences(user_id);
CREATE INDEX idx_user_setup_preferences_completed ON user_setup_preferences(has_completed_group_setup, has_completed_category_setup);

-- Enable RLS for new tables
ALTER TABLE default_category_group_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE default_category_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_setup_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for default templates (public read access)
CREATE POLICY "Anyone can view default group templates" 
    ON default_category_group_templates FOR SELECT 
    USING (is_active = TRUE);

CREATE POLICY "Anyone can view default category templates" 
    ON default_category_templates FOR SELECT 
    USING (is_active = TRUE);

-- RLS Policies for user setup preferences
CREATE POLICY "Users can view their own setup preferences" 
    ON user_setup_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own setup preferences" 
    ON user_setup_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own setup preferences" 
    ON user_setup_preferences FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_default_group_templates_updated_at 
    BEFORE UPDATE ON default_category_group_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_default_category_templates_updated_at 
    BEFORE UPDATE ON default_category_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_setup_preferences_updated_at 
    BEFORE UPDATE ON user_setup_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert predefined category group templates
INSERT INTO default_category_group_templates (internal_name, display_name, description, color, icon, sort_order, auto_assign_keywords) VALUES
('core-expenses', 'Core', 'Essential daily expenses like food, transportation, and healthcare', '#059669', '🛒', 0, 
 ARRAY['groceries', 'food', 'dining', 'gas', 'fuel', 'transportation', 'medical', 'healthcare', 'doctor', 'pharmacy', 'prescriptions', 'personal', 'household', 'supplies', 'pet', 'care']),

('flexible-lifestyle', 'Flexible', 'Variable necessities and discretionary spending that can be adjusted', '#7c3aed', '🎨', 1,
 ARRAY['entertainment', 'movies', 'bars', 'nightlife', 'hobbies', 'books', 'music', 'clothing', 'fashion', 'electronics', 'gadgets', 'sports', 'recreation', 'social', 'events', 'date', 'personal', 'development', 'miscellaneous', 'misc', 'other', 'gifts', 'donations']),

('lifestyle-bills', 'Lifestyle', 'Fixed monthly costs for lifestyle choices and subscriptions', '#dc2626', '📋', 2,
 ARRAY['rent', 'mortgage', 'utilities', 'electric', 'gas', 'water', 'phone', 'internet', 'insurance', 'loan', 'subscription', 'netflix', 'spotify', 'gym', 'membership', 'cable']),

('savings-goals', 'Savings', 'Emergency fund, vacation fund, and other financial goals', '#2563eb', '🎯', 3,
 ARRAY['emergency', 'vacation', 'travel', 'fund', 'savings', 'goals', 'retirement', 'investment', 'education', 'wedding', 'holiday', 'christmas', 'birthday', 'car', 'replacement', 'down', 'payment', 'future', 'planning']);

-- Insert starter categories for Core group
INSERT INTO default_category_templates (group_template_id, name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords) 
SELECT 
    id as group_template_id,
    name,
    description,
    color,
    icon,
    suggested_allocation,
    sort_order,
    is_essential,
    auto_assign_keywords
FROM (
    SELECT 
        (SELECT id FROM default_category_group_templates WHERE internal_name = 'core-expenses') as id,
        * 
    FROM (VALUES
        ('Groceries', 'Food and household essentials', '#10b981', '🛒', 400.00, 0, true, ARRAY['groceries', 'food', 'supermarket', 'market']),
        ('Gas & Transport', 'Fuel and transportation costs', '#f59e0b', '⛽', 150.00, 1, true, ARRAY['gas', 'fuel', 'transport', 'uber', 'lyft', 'bus', 'metro']),
        ('Medical & Health', 'Healthcare and medical expenses', '#ef4444', '🏥', 100.00, 2, true, ARRAY['medical', 'doctor', 'pharmacy', 'health', 'medicine', 'hospital'])
    ) AS categories(name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
) AS core_categories;

-- Insert starter categories for Flexible group
INSERT INTO default_category_templates (group_template_id, name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
SELECT 
    id as group_template_id,
    name,
    description,
    color,
    icon,
    suggested_allocation,
    sort_order,
    is_essential,
    auto_assign_keywords
FROM (
    SELECT 
        (SELECT id FROM default_category_group_templates WHERE internal_name = 'flexible-lifestyle') as id,
        * 
    FROM (VALUES
        ('Dining Out', 'Restaurants and food delivery', '#8b5cf6', '🍽️', 200.00, 0, false, ARRAY['restaurant', 'dining', 'delivery', 'takeout', 'food']),
        ('Entertainment', 'Movies, events, and fun activities', '#06b6d4', '🎬', 150.00, 1, false, ARRAY['movies', 'entertainment', 'events', 'concert', 'theater']),
        ('Shopping', 'Clothing, electronics, and miscellaneous purchases', '#f59e0b', '🛍️', 100.00, 2, false, ARRAY['shopping', 'clothes', 'clothing', 'electronics', 'amazon'])
    ) AS categories(name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
) AS flexible_categories;

-- Insert starter categories for Lifestyle group  
INSERT INTO default_category_templates (group_template_id, name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
SELECT 
    id as group_template_id,
    name,
    description,
    color,
    icon,
    suggested_allocation,
    sort_order,
    is_essential,
    auto_assign_keywords
FROM (
    SELECT 
        (SELECT id FROM default_category_group_templates WHERE internal_name = 'lifestyle-bills') as id,
        * 
    FROM (VALUES
        ('Rent/Mortgage', 'Monthly housing payment', '#dc2626', '🏠', 1200.00, 0, true, ARRAY['rent', 'mortgage', 'housing']),
        ('Utilities', 'Electric, gas, water, trash', '#059669', '💡', 150.00, 1, true, ARRAY['utilities', 'electric', 'gas', 'water', 'power', 'electricity']),
        ('Phone & Internet', 'Mobile and internet services', '#3b82f6', '📱', 80.00, 2, true, ARRAY['phone', 'internet', 'mobile', 'cell', 'wifi'])
    ) AS categories(name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
) AS lifestyle_categories;

-- Insert starter categories for Savings group
INSERT INTO default_category_templates (group_template_id, name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
SELECT 
    id as group_template_id,
    name,
    description,
    color,
    icon,
    suggested_allocation,
    sort_order,
    is_essential,
    auto_assign_keywords
FROM (
    SELECT 
        (SELECT id FROM default_category_group_templates WHERE internal_name = 'savings-goals') as id,
        * 
    FROM (VALUES
        ('Emergency Fund', 'Emergency savings for unexpected expenses', '#2563eb', '🚨', 300.00, 0, true, ARRAY['emergency', 'savings', 'fund']),
        ('Vacation Fund', 'Savings for travel and vacations', '#06b6d4', '✈️', 150.00, 1, false, ARRAY['vacation', 'travel', 'trip', 'holiday']),
        ('Future Goals', 'Long-term savings and investments', '#8b5cf6', '🎯', 200.00, 2, false, ARRAY['goals', 'investment', 'future', 'retirement'])
    ) AS categories(name, description, color, icon, suggested_allocation, sort_order, is_essential, auto_assign_keywords)
) AS savings_categories;

-- Function to create default groups and categories for a new user
CREATE OR REPLACE FUNCTION create_default_groups_for_user(
    target_user_id UUID,
    selected_template_ids UUID[] DEFAULT NULL -- If NULL, creates all active templates
)
RETURNS TABLE(
    group_id UUID,
    group_name TEXT,
    categories_created INTEGER
) AS $$
DECLARE
    template_record default_category_group_templates%ROWTYPE;
    category_template default_category_templates%ROWTYPE;
    new_group_id UUID;
    new_category_id UUID;
    categories_count INTEGER;
    templates_to_create UUID[];
BEGIN
    -- Use provided template IDs or default to all active templates
    IF selected_template_ids IS NULL THEN
        SELECT ARRAY_AGG(id) INTO templates_to_create
        FROM default_category_group_templates 
        WHERE is_active = TRUE;
    ELSE
        templates_to_create := selected_template_ids;
    END IF;

    -- Loop through each template to create
    FOR template_record IN 
        SELECT * FROM default_category_group_templates 
        WHERE id = ANY(templates_to_create) AND is_active = TRUE
        ORDER BY sort_order
    LOOP
        -- Create the category group
        INSERT INTO category_groups (
            user_id,
            name,
            description,
            color,
            icon,
            sort_order
        ) VALUES (
            target_user_id,
            template_record.display_name,
            template_record.description,
            template_record.color,
            template_record.icon,
            template_record.sort_order
        ) RETURNING id INTO new_group_id;

        -- Count categories created for this group
        categories_count := 0;

        -- Create starter categories for this group
        FOR category_template IN
            SELECT * FROM default_category_templates 
            WHERE group_template_id = template_record.id AND is_active = TRUE
            ORDER BY sort_order
        LOOP
            -- We'll create categories in the budget creation process
            -- This function just creates the groups for now
            categories_count := categories_count + 1;
        END LOOP;

        -- Return group information
        group_id := new_group_id;
        group_name := template_record.display_name;
        categories_created := categories_count;
        RETURN NEXT;
    END LOOP;

    -- Update user setup preferences
    INSERT INTO user_setup_preferences (
        user_id,
        selected_group_templates,
        has_completed_group_setup
    ) VALUES (
        target_user_id,
        templates_to_create,
        TRUE
    ) ON CONFLICT (user_id) DO UPDATE SET
        selected_group_templates = templates_to_create,
        has_completed_group_setup = TRUE,
        updated_at = NOW();

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to auto-assign a category to appropriate group based on name
CREATE OR REPLACE FUNCTION auto_assign_category_to_group(
    category_name TEXT,
    target_user_id UUID
)
RETURNS UUID AS $$
DECLARE
    normalized_name TEXT;
    best_group_id UUID;
    best_score INTEGER := 0;
    group_record RECORD;
    keyword TEXT;
    current_score INTEGER;
BEGIN
    normalized_name := LOWER(TRIM(category_name));
    
    -- Check each user's category group for keyword matches
    FOR group_record IN
        SELECT cg.id, dgt.auto_assign_keywords
        FROM category_groups cg
        JOIN default_category_group_templates dgt ON LOWER(cg.name) = LOWER(dgt.display_name)
        WHERE cg.user_id = target_user_id
    LOOP
        current_score := 0;
        
        -- Count keyword matches
        FOREACH keyword IN ARRAY group_record.auto_assign_keywords
        LOOP
            IF normalized_name LIKE '%' || LOWER(keyword) || '%' THEN
                current_score := current_score + 1;
            END IF;
        END LOOP;
        
        -- Update best match if this is better
        IF current_score > best_score THEN
            best_score := current_score;
            best_group_id := group_record.id;
        END IF;
    END LOOP;
    
    RETURN best_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create starter categories in a budget when groups exist
CREATE OR REPLACE FUNCTION create_starter_categories_for_budget(
    budget_id UUID,
    target_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    group_record RECORD;
    category_template default_category_templates%ROWTYPE;
    categories_created INTEGER := 0;
    template_ids UUID[];
BEGIN
    -- Get user's selected templates
    SELECT selected_group_templates INTO template_ids
    FROM user_setup_preferences
    WHERE user_id = target_user_id;
    
    IF template_ids IS NULL THEN
        RETURN 0;
    END IF;

    -- Loop through user's category groups and create starter categories
    FOR group_record IN
        SELECT cg.id as group_id, dgt.id as template_id
        FROM category_groups cg
        JOIN default_category_group_templates dgt ON LOWER(cg.name) = LOWER(dgt.display_name)
        WHERE cg.user_id = target_user_id
        AND dgt.id = ANY(template_ids)
    LOOP
        -- Create categories for this group from templates
        FOR category_template IN
            SELECT * FROM default_category_templates
            WHERE group_template_id = group_record.template_id AND is_active = TRUE
            ORDER BY sort_order
        LOOP
            INSERT INTO categories (
                user_id,
                budget_id,
                group_id,
                name,
                description,
                allocated,
                spent,
                color,
                icon,
                sort_order
            ) VALUES (
                target_user_id,
                budget_id,
                group_record.group_id,
                category_template.name,
                category_template.description,
                category_template.suggested_allocation,
                0, -- No spending yet
                category_template.color,
                category_template.icon,
                category_template.sort_order
            );
            
            categories_created := categories_created + 1;
        END LOOP;
    END LOOP;

    -- Mark category setup as complete
    UPDATE user_setup_preferences 
    SET 
        has_completed_category_setup = TRUE,
        setup_completed_at = NOW(),
        updated_at = NOW()
    WHERE user_id = target_user_id;

    RETURN categories_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON default_category_group_templates TO authenticated;
GRANT SELECT ON default_category_templates TO authenticated;
GRANT ALL ON user_setup_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION create_default_groups_for_user(UUID, UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION auto_assign_category_to_group(TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_starter_categories_for_budget(UUID, UUID) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE default_category_group_templates IS 'Predefined category group templates for new users';
COMMENT ON TABLE default_category_templates IS 'Starter category templates for each group type';
COMMENT ON TABLE user_setup_preferences IS 'User preferences and setup completion status';
COMMENT ON FUNCTION create_default_groups_for_user IS 'Creates default category groups for a new user';
COMMENT ON FUNCTION auto_assign_category_to_group IS 'Auto-assigns a category to the most appropriate group based on keywords';
COMMENT ON FUNCTION create_starter_categories_for_budget IS 'Creates starter categories when a budget is created';