# Database Schema

This is the database schema implementation for the spec detailed in @.agent-os/specs/2025-08-19-predefined-category-groups/spec.md

> Created: 2025-08-19
> Version: 1.0.0

## Schema Changes

### New Tables

#### category_groups
Primary table for storing category group definitions.

```sql
CREATE TABLE category_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color_hex VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT category_groups_name_check CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT category_groups_color_check CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT category_groups_sort_order_check CHECK (sort_order >= 0)
);

-- Indexes for performance
CREATE INDEX idx_category_groups_user_id ON category_groups(user_id);
CREATE INDEX idx_category_groups_sort_order ON category_groups(user_id, sort_order);
CREATE INDEX idx_category_groups_name ON category_groups(user_id, name);

-- Unique constraint for user-specific group names
CREATE UNIQUE INDEX idx_category_groups_user_name_unique 
ON category_groups(user_id, LOWER(TRIM(name)));

-- Row Level Security
ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own category groups" 
ON category_groups FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
```

### Table Modifications

#### categories
Add foreign key relationship to category_groups.

```sql
-- Add group relationship column
ALTER TABLE categories 
ADD COLUMN category_group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL;

-- Add index for performance
CREATE INDEX idx_categories_group_id ON categories(category_group_id);

-- Add index for user + group queries
CREATE INDEX idx_categories_user_group ON categories(user_id, category_group_id);

-- Update RLS policy to include group access
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;

CREATE POLICY "Users can manage their own categories and group relationships" 
ON categories FOR ALL 
USING (
  auth.uid() = user_id AND 
  (category_group_id IS NULL OR 
   EXISTS (
     SELECT 1 FROM category_groups 
     WHERE id = categories.category_group_id 
     AND user_id = auth.uid()
   ))
) 
WITH CHECK (
  auth.uid() = user_id AND 
  (category_group_id IS NULL OR 
   EXISTS (
     SELECT 1 FROM category_groups 
     WHERE id = categories.category_group_id 
     AND user_id = auth.uid()
   ))
);
```

### Views for Enhanced Queries

#### category_groups_with_stats
View combining groups with spending statistics.

```sql
CREATE OR REPLACE VIEW category_groups_with_stats AS
SELECT 
  cg.id,
  cg.user_id,
  cg.name,
  cg.description,
  cg.color_hex,
  cg.sort_order,
  cg.is_default,
  cg.created_at,
  cg.updated_at,
  COUNT(c.id) as category_count,
  COUNT(CASE WHEN c.id IS NOT NULL THEN 1 END) as active_category_count,
  COALESCE(SUM(
    CASE WHEN t.date >= CURRENT_DATE - INTERVAL '30 days' 
    THEN t.amount ELSE 0 END
  ), 0) as spending_30_days,
  COALESCE(SUM(
    CASE WHEN t.date >= date_trunc('month', CURRENT_DATE)
    THEN t.amount ELSE 0 END
  ), 0) as spending_current_month
FROM category_groups cg
LEFT JOIN categories c ON c.category_group_id = cg.id
LEFT JOIN transactions t ON t.category_id = c.id
GROUP BY cg.id, cg.user_id, cg.name, cg.description, cg.color_hex, 
         cg.sort_order, cg.is_default, cg.created_at, cg.updated_at;
```

#### categories_with_groups
Simplified view for category queries with group information.

```sql
CREATE OR REPLACE VIEW categories_with_groups AS
SELECT 
  c.id,
  c.user_id,
  c.name as category_name,
  c.color_hex as category_color,
  c.created_at,
  c.updated_at,
  cg.id as group_id,
  cg.name as group_name,
  cg.color_hex as group_color,
  cg.sort_order as group_sort_order,
  cg.description as group_description
FROM categories c
LEFT JOIN category_groups cg ON cg.id = c.category_group_id;
```

### Functions and Procedures

#### create_default_groups_and_categories
Stored procedure for creating default groups and categories during onboarding.

```sql
CREATE OR REPLACE FUNCTION create_default_groups_and_categories(
  user_id_param UUID,
  groups_data JSONB
) RETURNS JSONB AS $$
DECLARE
  group_record RECORD;
  category_name TEXT;
  created_group_id UUID;
  created_groups JSONB := '[]'::JSONB;
  created_categories JSONB := '[]'::JSONB;
BEGIN
  -- Check if user already has groups
  IF EXISTS (SELECT 1 FROM category_groups WHERE user_id = user_id_param) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already has category groups'
    );
  END IF;

  -- Create groups and categories
  FOR group_record IN 
    SELECT * FROM jsonb_to_recordset(groups_data) AS x(
      name TEXT, 
      description TEXT, 
      color_hex TEXT, 
      sort_order INTEGER, 
      categories TEXT[]
    )
  LOOP
    -- Create the group
    INSERT INTO category_groups (
      user_id, name, description, color_hex, sort_order, is_default
    ) VALUES (
      user_id_param, 
      group_record.name, 
      group_record.description, 
      group_record.color_hex, 
      group_record.sort_order, 
      true
    ) RETURNING id INTO created_group_id;

    -- Add to created groups tracking
    created_groups := created_groups || jsonb_build_object(
      'id', created_group_id,
      'name', group_record.name
    );

    -- Create categories for this group
    IF group_record.categories IS NOT NULL THEN
      FOR category_name IN SELECT unnest(group_record.categories)
      LOOP
        INSERT INTO categories (user_id, name, category_group_id)
        VALUES (user_id_param, category_name, created_group_id);
        
        created_categories := created_categories || jsonb_build_object(
          'name', category_name,
          'group_id', created_group_id
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'groups_created', created_groups,
    'categories_created', created_categories
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### get_grouped_spending
Function for efficient grouped spending calculations.

```sql
CREATE OR REPLACE FUNCTION get_grouped_spending(
  user_id_param UUID,
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  group_id UUID,
  group_name TEXT,
  group_color TEXT,
  group_sort_order INTEGER,
  category_id UUID,
  category_name TEXT,
  category_color TEXT,
  amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cg.id as group_id,
    cg.name as group_name,
    cg.color_hex as group_color,
    cg.sort_order as group_sort_order,
    c.id as category_id,
    c.name as category_name,
    c.color_hex as category_color,
    COALESCE(SUM(t.amount), 0)::DECIMAL as amount
  FROM category_groups cg
  LEFT JOIN categories c ON c.category_group_id = cg.id
  LEFT JOIN transactions t ON t.category_id = c.id 
    AND t.date >= date_from 
    AND t.date <= date_to
    AND t.user_id = user_id_param
  WHERE cg.user_id = user_id_param
  GROUP BY cg.id, cg.name, cg.color_hex, cg.sort_order, 
           c.id, c.name, c.color_hex
  ORDER BY cg.sort_order, c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Migrations

### Migration 001: Create category_groups table

```sql
-- Migration: 20250819_001_create_category_groups.sql
BEGIN;

CREATE TABLE IF NOT EXISTS category_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color_hex VARCHAR(7) NOT NULL DEFAULT '#6B7280',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT category_groups_name_check CHECK (LENGTH(TRIM(name)) > 0),
  CONSTRAINT category_groups_color_check CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT category_groups_sort_order_check CHECK (sort_order >= 0)
);

CREATE INDEX idx_category_groups_user_id ON category_groups(user_id);
CREATE INDEX idx_category_groups_sort_order ON category_groups(user_id, sort_order);
CREATE INDEX idx_category_groups_name ON category_groups(user_id, name);

CREATE UNIQUE INDEX idx_category_groups_user_name_unique 
ON category_groups(user_id, LOWER(TRIM(name)));

ALTER TABLE category_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own category groups" 
ON category_groups FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

COMMIT;
```

### Migration 002: Add group relationship to categories

```sql
-- Migration: 20250819_002_add_category_groups_relationship.sql
BEGIN;

ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS category_group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_categories_group_id ON categories(category_group_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_group ON categories(user_id, category_group_id);

-- Update RLS policy
DROP POLICY IF EXISTS "Users can manage their own categories" ON categories;

CREATE POLICY "Users can manage their own categories and group relationships" 
ON categories FOR ALL 
USING (
  auth.uid() = user_id AND 
  (category_group_id IS NULL OR 
   EXISTS (
     SELECT 1 FROM category_groups 
     WHERE id = categories.category_group_id 
     AND user_id = auth.uid()
   ))
) 
WITH CHECK (
  auth.uid() = user_id AND 
  (category_group_id IS NULL OR 
   EXISTS (
     SELECT 1 FROM category_groups 
     WHERE id = categories.category_group_id 
     AND user_id = auth.uid()
   ))
);

COMMIT;
```

### Migration 003: Create views and functions

```sql
-- Migration: 20250819_003_create_views_and_functions.sql
BEGIN;

-- Create views
CREATE OR REPLACE VIEW category_groups_with_stats AS
SELECT 
  cg.id,
  cg.user_id,
  cg.name,
  cg.description,
  cg.color_hex,
  cg.sort_order,
  cg.is_default,
  cg.created_at,
  cg.updated_at,
  COUNT(c.id) as category_count,
  COUNT(CASE WHEN c.id IS NOT NULL THEN 1 END) as active_category_count,
  COALESCE(SUM(
    CASE WHEN t.date >= CURRENT_DATE - INTERVAL '30 days' 
    THEN t.amount ELSE 0 END
  ), 0) as spending_30_days,
  COALESCE(SUM(
    CASE WHEN t.date >= date_trunc('month', CURRENT_DATE)
    THEN t.amount ELSE 0 END
  ), 0) as spending_current_month
FROM category_groups cg
LEFT JOIN categories c ON c.category_group_id = cg.id
LEFT JOIN transactions t ON t.category_id = c.id
GROUP BY cg.id, cg.user_id, cg.name, cg.description, cg.color_hex, 
         cg.sort_order, cg.is_default, cg.created_at, cg.updated_at;

CREATE OR REPLACE VIEW categories_with_groups AS
SELECT 
  c.id,
  c.user_id,
  c.name as category_name,
  c.color_hex as category_color,
  c.created_at,
  c.updated_at,
  cg.id as group_id,
  cg.name as group_name,
  cg.color_hex as group_color,
  cg.sort_order as group_sort_order,
  cg.description as group_description
FROM categories c
LEFT JOIN category_groups cg ON cg.id = c.category_group_id;

-- Create functions
CREATE OR REPLACE FUNCTION create_default_groups_and_categories(
  user_id_param UUID,
  groups_data JSONB
) RETURNS JSONB AS $$
DECLARE
  group_record RECORD;
  category_name TEXT;
  created_group_id UUID;
  created_groups JSONB := '[]'::JSONB;
  created_categories JSONB := '[]'::JSONB;
BEGIN
  IF EXISTS (SELECT 1 FROM category_groups WHERE user_id = user_id_param) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User already has category groups'
    );
  END IF;

  FOR group_record IN 
    SELECT * FROM jsonb_to_recordset(groups_data) AS x(
      name TEXT, 
      description TEXT, 
      color_hex TEXT, 
      sort_order INTEGER, 
      categories TEXT[]
    )
  LOOP
    INSERT INTO category_groups (
      user_id, name, description, color_hex, sort_order, is_default
    ) VALUES (
      user_id_param, 
      group_record.name, 
      group_record.description, 
      group_record.color_hex, 
      group_record.sort_order, 
      true
    ) RETURNING id INTO created_group_id;

    created_groups := created_groups || jsonb_build_object(
      'id', created_group_id,
      'name', group_record.name
    );

    IF group_record.categories IS NOT NULL THEN
      FOR category_name IN SELECT unnest(group_record.categories)
      LOOP
        INSERT INTO categories (user_id, name, category_group_id)
        VALUES (user_id_param, category_name, created_group_id);
        
        created_categories := created_categories || jsonb_build_object(
          'name', category_name,
          'group_id', created_group_id
        );
      END LOOP;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'groups_created', created_groups,
    'categories_created', created_categories
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_grouped_spending(
  user_id_param UUID,
  date_from DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  date_to DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  group_id UUID,
  group_name TEXT,
  group_color TEXT,
  group_sort_order INTEGER,
  category_id UUID,
  category_name TEXT,
  category_color TEXT,
  amount DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cg.id as group_id,
    cg.name as group_name,
    cg.color_hex as group_color,
    cg.sort_order as group_sort_order,
    c.id as category_id,
    c.name as category_name,
    c.color_hex as category_color,
    COALESCE(SUM(t.amount), 0)::DECIMAL as amount
  FROM category_groups cg
  LEFT JOIN categories c ON c.category_group_id = cg.id
  LEFT JOIN transactions t ON t.category_id = c.id 
    AND t.date >= date_from 
    AND t.date <= date_to
    AND t.user_id = user_id_param
  WHERE cg.user_id = user_id_param
  GROUP BY cg.id, cg.name, cg.color_hex, cg.sort_order, 
           c.id, c.name, c.color_hex
  ORDER BY cg.sort_order, c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
```

### Rollback Scripts

#### Rollback Migration 003
```sql
DROP FUNCTION IF EXISTS get_grouped_spending(UUID, DATE, DATE);
DROP FUNCTION IF EXISTS create_default_groups_and_categories(UUID, JSONB);
DROP VIEW IF EXISTS categories_with_groups;
DROP VIEW IF EXISTS category_groups_with_stats;
```

#### Rollback Migration 002
```sql
DROP POLICY IF EXISTS "Users can manage their own categories and group relationships" ON categories;
DROP INDEX IF EXISTS idx_categories_user_group;
DROP INDEX IF EXISTS idx_categories_group_id;
ALTER TABLE categories DROP COLUMN IF EXISTS category_group_id;

CREATE POLICY "Users can manage their own categories" 
ON categories FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);
```

#### Rollback Migration 001
```sql
DROP TABLE IF EXISTS category_groups CASCADE;
```