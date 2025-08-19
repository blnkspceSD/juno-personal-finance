# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-19-predefined-category-groups/spec.md

> Created: 2025-08-19
> Version: 1.0.0

## Technical Requirements

### Database Architecture
- **Category Groups Table**: New table to store predefined and custom category groups
- **Category Relationships**: Foreign key relationship between categories and category_groups
- **Data Integrity**: Constraints to ensure categories belong to valid groups
- **Migration Strategy**: Safe schema changes with rollback capability

### Performance Requirements
- **Dashboard Load Time**: <2s for grouped spending data
- **Chart Rendering**: <500ms for grouped bar chart with 50+ categories
- **Database Queries**: Optimized joins for category-group relationships
- **Memory Usage**: Efficient data structures for grouped calculations

### API Design
- **RESTful Endpoints**: Consistent API patterns for group management
- **Data Filtering**: Support for group-based filtering and aggregation
- **Caching Strategy**: Redis caching for grouped spending calculations
- **Error Handling**: Comprehensive error responses for group operations

## Approach

### 1. Database Schema Design

#### Category Groups Table
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
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_category_groups_user_id ON category_groups(user_id);
CREATE INDEX idx_category_groups_sort_order ON category_groups(user_id, sort_order);
```

#### Categories Table Updates
```sql
-- Add group relationship
ALTER TABLE categories 
ADD COLUMN category_group_id UUID REFERENCES category_groups(id) ON DELETE SET NULL;

CREATE INDEX idx_categories_group_id ON categories(category_group_id);
```

### 2. Data Seeding Strategy

#### Default Groups Configuration
```typescript
const DEFAULT_GROUPS = [
  {
    name: 'Core',
    description: 'Essential, non-negotiable expenses',
    color_hex: '#DC2626', // Red for urgency
    sort_order: 1,
    categories: [
      'Groceries', 'Utilities', 'Rent/Mortgage', 
      'Gas', 'Medical', 'Insurance'
    ]
  },
  {
    name: 'Flexible',
    description: 'Necessary but variable expenses', 
    color_hex: '#F59E0B', // Amber for caution
    sort_order: 2,
    categories: [
      'Dining Out', 'Personal Care', 'Household Items',
      'Transportation', 'Phone/Internet'
    ]
  },
  {
    name: 'Lifestyle',
    description: 'Discretionary, enjoyment-based spending',
    color_hex: '#10B981', // Green for discretionary
    sort_order: 3,
    categories: [
      'Entertainment', 'Hobbies', 'Shopping',
      'Travel', 'Subscriptions'
    ]
  },
  {
    name: 'Savings',
    description: 'Future-focused financial goals',
    color_hex: '#3B82F6', // Blue for savings
    sort_order: 4,
    categories: [
      'Emergency Fund', 'Vacation Fund', 
      'Investments', 'Debt Repayment'
    ]
  }
];
```

### 3. Dashboard Data Processing

#### Grouped Spending Calculation
```typescript
interface GroupedSpending {
  groupId: string;
  groupName: string;
  groupColor: string;
  totalAmount: number;
  categories: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    amount: number;
    percentage: number;
  }[];
}

async function calculateGroupedSpending(
  userId: string, 
  dateRange: DateRange
): Promise<GroupedSpending[]> {
  // Optimized query with joins
  const query = `
    SELECT 
      cg.id as group_id,
      cg.name as group_name,
      cg.color_hex as group_color,
      c.id as category_id,
      c.name as category_name,
      c.color_hex as category_color,
      COALESCE(SUM(t.amount), 0) as amount
    FROM category_groups cg
    LEFT JOIN categories c ON c.category_group_id = cg.id
    LEFT JOIN transactions t ON t.category_id = c.id 
      AND t.date >= $2 AND t.date <= $3
    WHERE cg.user_id = $1
    GROUP BY cg.id, cg.name, cg.color_hex, c.id, c.name, c.color_hex
    ORDER BY cg.sort_order, c.name
  `;
  
  // Process results into grouped structure
  return processGroupedResults(results);
}
```

### 4. Chart Component Architecture

#### Stacked Bar Implementation
```typescript
interface GroupedChartData {
  groups: {
    groupId: string;
    groupName: string;
    groupColor: string;
    totalAmount: number;
    categories: CategoryData[];
  }[];
  maxAmount: number;
  totalSpending: number;
}

const GroupedBarChart: React.FC<{
  data: GroupedChartData;
  height?: number;
  showLabels?: boolean;
}> = ({ data, height = 400, showLabels = true }) => {
  // Use React Recharts for stacked bar visualization
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={transformedData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="groupName" 
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip content={<CustomGroupedTooltip />} />
        <Legend />
        {/* Dynamic category bars */}
        {renderCategoryBars(data)}
      </BarChart>
    </ResponsiveContainer>
  );
};
```

### 5. User Onboarding Integration

#### Onboarding Hook
```typescript
const useDefaultGroupsSetup = () => {
  const setupDefaultGroups = useCallback(async (userId: string) => {
    try {
      // Create groups and categories in transaction
      await supabase.rpc('create_default_groups_and_categories', {
        user_id: userId,
        groups_data: DEFAULT_GROUPS
      });
      
      // Verify creation
      const { data: groups } = await supabase
        .from('category_groups')
        .select('id, name')
        .eq('user_id', userId);
        
      return { success: true, groups };
    } catch (error) {
      console.error('Failed to setup default groups:', error);
      return { success: false, error };
    }
  }, []);
  
  return { setupDefaultGroups };
};
```

## External Dependencies

### Database Dependencies
- **PostgreSQL**: Version 14+ for advanced JSON operations
- **Supabase**: Real-time subscriptions for category changes
- **Database Migrations**: Supabase migration system

### Frontend Dependencies
- **Recharts**: Version 2.8+ for grouped bar charts
- **React**: Version 19.1+ for concurrent features
- **TypeScript**: Version 5+ for advanced type inference
- **Tailwind CSS**: Version 4+ for consistent styling

### Performance Dependencies
- **Redis**: Caching for grouped calculations (optional)
- **React Query**: Client-side caching and synchronization
- **Web Workers**: Background calculations for large datasets

### Development Dependencies
- **Jest**: Unit testing for calculation utilities
- **React Testing Library**: Component testing
- **Playwright**: E2E testing for onboarding flow
- **MSW**: API mocking for development and testing

## Implementation Considerations

### Data Migration Strategy
1. **Schema Changes**: Add new tables without affecting existing data
2. **Backfill Process**: Assign existing categories to appropriate groups
3. **Rollback Plan**: Ability to revert schema changes if needed
4. **Performance Impact**: Minimize downtime during migrations

### Error Handling
- **Database Constraints**: Graceful handling of FK violations
- **API Failures**: Retry mechanisms for critical operations
- **UI Fallbacks**: Degrade gracefully if groups aren't available
- **User Communication**: Clear error messages for group operations

### Security Considerations
- **Row Level Security**: Ensure users only access their groups
- **Input Validation**: Sanitize group names and descriptions
- **API Rate Limiting**: Prevent abuse of group creation endpoints
- **Audit Logging**: Track group and category modifications