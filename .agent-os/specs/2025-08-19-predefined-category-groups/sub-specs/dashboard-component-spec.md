# Dashboard Component Specification

This is the dashboard component specification for the spec detailed in @.agent-os/specs/2025-08-19-predefined-category-groups/spec.md

> Created: 2025-08-19
> Version: 1.0.0

## Component Architecture

### Overview
Transform the existing individual category bar chart into a grouped visualization that displays category groups as primary bars with stacked individual categories, maintaining visual clarity while providing enhanced spending insights.

### Design Requirements

#### Visual Hierarchy
- **Primary Focus**: Category groups as main bars with group names and total amounts
- **Secondary Detail**: Individual categories as stacked segments within group bars
- **Color System**: Group colors for bar backgrounds, individual category colors for segments
- **Responsive Layout**: Adaptable to different screen sizes and data volumes

#### Interaction Model
- **Hover States**: Show detailed breakdown on group or category hover
- **Tooltips**: Rich information display with spending amounts and percentages
- **Legend**: Clear identification of groups and categories
- **Accessibility**: Screen reader support and keyboard navigation

## Component Structure

### Updated WaterfallChart Component

```typescript
// Enhanced interfaces for grouped data
interface CategoryGroup {
  id: string;
  name: string;
  color: string;
  description?: string;
  totalAmount: number;
  categories: CategorySpending[];
}

interface CategorySpending {
  id: string;
  name: string;
  color: string;
  amount: number;
  percentage: number; // Percentage within group
  groupPercentage: number; // Percentage of total spending
}

interface GroupedWaterfallData {
  groups: CategoryGroup[];
  totalSpending: number;
  maxGroupAmount: number;
  dateRange: {
    from: Date;
    to: Date;
  };
}

interface GroupedWaterfallChartProps {
  data: GroupedWaterfallData;
  height?: number;
  showGroupLabels?: boolean;
  showCategoryBreakdown?: boolean;
  onGroupClick?: (group: CategoryGroup) => void;
  onCategoryClick?: (category: CategorySpending, group: CategoryGroup) => void;
  className?: string;
}
```

### Chart Implementation

```typescript
const GroupedWaterfallChart: React.FC<GroupedWaterfallChartProps> = ({
  data,
  height = 400,
  showGroupLabels = true,
  showCategoryBreakdown = true,
  onGroupClick,
  onCategoryClick,
  className
}) => {
  // Transform data for Recharts stacked bar format
  const chartData = useMemo(() => {
    return data.groups.map(group => ({
      groupName: group.name,
      groupId: group.id,
      groupColor: group.color,
      totalAmount: group.totalAmount,
      ...group.categories.reduce((acc, category) => ({
        ...acc,
        [category.id]: category.amount
      }), {})
    }));
  }, [data.groups]);

  // Generate category bars dynamically
  const categoryBars = useMemo(() => {
    const allCategories = data.groups.flatMap(group => 
      group.categories.map(cat => ({
        ...cat,
        groupId: group.id,
        dataKey: cat.id
      }))
    );
    
    return allCategories.map(category => (
      <Bar
        key={category.dataKey}
        dataKey={category.dataKey}
        stackId="categories"
        fill={category.color}
        name={category.name}
        onClick={(data, index) => onCategoryClick?.(category, 
          data.groups.find(g => g.id === category.groupId)!
        )}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      />
    ));
  }, [data.groups, onCategoryClick]);

  return (
    <div className={`grouped-waterfall-chart ${className || ''}`}>
      {/* Chart Header */}
      <div className="chart-header mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Spending by Category Groups
        </h3>
        <p className="text-sm text-gray-600">
          {formatDateRange(data.dateRange)} • Total: {formatCurrency(data.totalSpending)}
        </p>
      </div>

      {/* Main Chart */}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          
          <XAxis 
            dataKey="groupName"
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            tick={{ fontSize: 12 }}
            className="text-gray-600"
          />
          
          <YAxis 
            tickFormatter={formatCurrency}
            tick={{ fontSize: 12 }}
            className="text-gray-600"
          />
          
          <Tooltip 
            content={<GroupedChartTooltip />}
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
          />
          
          <Legend 
            content={<GroupedChartLegend />}
            wrapperStyle={{ paddingTop: '20px' }}
          />
          
          {categoryBars}
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      {showCategoryBreakdown && (
        <GroupSpendingSummary 
          groups={data.groups} 
          totalSpending={data.totalSpending} 
        />
      )}
    </div>
  );
};
```

### Custom Tooltip Component

```typescript
const GroupedChartTooltip: React.FC<TooltipProps<any, any>> = ({ 
  active, 
  payload, 
  label 
}) => {
  if (!active || !payload || payload.length === 0) return null;

  // Find the group data
  const groupData = payload[0]?.payload;
  const group = data.groups.find(g => g.name === label);
  
  if (!group) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
      {/* Group Header */}
      <div className="border-b border-gray-100 pb-2 mb-2">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <div 
            className="w-3 h-3 rounded mr-2" 
            style={{ backgroundColor: group.color }}
          />
          {group.name}
        </h4>
        <p className="text-lg font-bold text-gray-900">
          {formatCurrency(group.totalAmount)}
        </p>
        <p className="text-sm text-gray-600">
          {((group.totalAmount / data.totalSpending) * 100).toFixed(1)}% of total spending
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-1">
        {group.categories
          .filter(cat => cat.amount > 0)
          .sort((a, b) => b.amount - a.amount)
          .slice(0, 5) // Show top 5 categories
          .map(category => (
            <div key={category.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded mr-2" 
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-gray-700 truncate max-w-24">
                  {category.name}
                </span>
              </div>
              <div className="text-right">
                <span className="font-medium text-gray-900">
                  {formatCurrency(category.amount)}
                </span>
                <div className="text-xs text-gray-500">
                  {category.percentage.toFixed(0)}%
                </div>
              </div>
            </div>
          ))}
        
        {group.categories.filter(cat => cat.amount > 0).length > 5 && (
          <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
            +{group.categories.filter(cat => cat.amount > 0).length - 5} more categories
          </div>
        )}
      </div>
    </div>
  );
};
```

### Custom Legend Component

```typescript
const GroupedChartLegend: React.FC<LegendProps> = ({ payload }) => {
  if (!payload) return null;

  // Group categories by their group
  const groupedLegend = data.groups.map(group => ({
    group,
    categories: group.categories.filter(cat => cat.amount > 0)
  }));

  return (
    <div className="chart-legend">
      <div className="flex flex-wrap gap-4 justify-center">
        {groupedLegend.map(({ group, categories }) => (
          <div key={group.id} className="legend-group">
            {/* Group Header */}
            <div className="flex items-center mb-1">
              <div 
                className="w-3 h-3 rounded mr-2" 
                style={{ backgroundColor: group.color }}
              />
              <span className="font-medium text-sm text-gray-900">
                {group.name}
              </span>
              <span className="text-xs text-gray-500 ml-1">
                ({formatCurrency(group.totalAmount)})
              </span>
            </div>
            
            {/* Category Pills */}
            <div className="flex flex-wrap gap-1 ml-5">
              {categories.slice(0, 3).map(category => (
                <span
                  key={category.id}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-1" 
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </span>
              ))}
              {categories.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  +{categories.length - 3} more
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

### Group Spending Summary Component

```typescript
const GroupSpendingSummary: React.FC<{
  groups: CategoryGroup[];
  totalSpending: number;
}> = ({ groups, totalSpending }) => {
  const sortedGroups = useMemo(() => 
    [...groups].sort((a, b) => b.totalAmount - a.totalAmount),
    [groups]
  );

  return (
    <div className="group-spending-summary mt-6 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Spending Breakdown</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedGroups.map(group => (
          <div key={group.id} className="group-summary-card bg-white p-3 rounded border">
            {/* Group Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded mr-2" 
                  style={{ backgroundColor: group.color }}
                />
                <span className="font-medium text-gray-900">{group.name}</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-gray-900">
                  {formatCurrency(group.totalAmount)}
                </div>
                <div className="text-xs text-gray-500">
                  {((group.totalAmount / totalSpending) * 100).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: group.color,
                    width: `${(group.totalAmount / totalSpending) * 100}%`
                  }}
                />
              </div>
            </div>

            {/* Top Categories */}
            <div className="space-y-1">
              {group.categories
                .filter(cat => cat.amount > 0)
                .sort((a, b) => b.amount - a.amount)
                .slice(0, 3)
                .map(category => (
                  <div key={category.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center">
                      <div 
                        className="w-1.5 h-1.5 rounded-full mr-2" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </span>
                    <span className="text-gray-900 font-medium">
                      {formatCurrency(category.amount)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Integration with Existing Components

### RealtimeDashboard Updates

```typescript
// Update RealtimeDashboard to use grouped data
const RealtimeDashboard: React.FC = () => {
  const [groupedSpending, setGroupedSpending] = useState<GroupedWaterfallData | null>(null);
  const [viewMode, setViewMode] = useState<'grouped' | 'individual'>('grouped');

  // Fetch grouped spending data
  const { data: spendingData, isLoading } = useQuery({
    queryKey: ['grouped-spending', dateRange],
    queryFn: () => fetchGroupedSpending(dateRange),
    refetchInterval: 30000, // Real-time updates
  });

  // Transform data for chart
  const chartData = useMemo(() => {
    if (!spendingData) return null;
    return transformToGroupedWaterfallData(spendingData);
  }, [spendingData]);

  return (
    <div className="dashboard-container">
      {/* Dashboard Header with View Toggle */}
      <div className="dashboard-header flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Spending Overview</h2>
        
        <div className="view-toggle">
          <button
            className={`px-3 py-1 rounded-l-md ${viewMode === 'grouped' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('grouped')}
          >
            By Groups
          </button>
          <button
            className={`px-3 py-1 rounded-r-md ${viewMode === 'individual' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700'}`}
            onClick={() => setViewMode('individual')}
          >
            Individual
          </button>
        </div>
      </div>

      {/* Chart Display */}
      {isLoading ? (
        <ChartLoadingState />
      ) : chartData ? (
        viewMode === 'grouped' ? (
          <GroupedWaterfallChart
            data={chartData}
            height={400}
            onGroupClick={handleGroupClick}
            onCategoryClick={handleCategoryClick}
          />
        ) : (
          <WaterfallChart data={transformToIndividualData(chartData)} />
        )
      ) : (
        <EmptyStateChart message="No spending data available" />
      )}

      {/* Additional dashboard components */}
      <div className="dashboard-grid mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryGroupCards groups={chartData?.groups || []} />
        <SpendingInsights data={chartData} />
      </div>
    </div>
  );
};
```

### Data Fetching Updates

```typescript
// Updated API functions for grouped data
export const fetchGroupedSpending = async (
  dateRange: DateRange
): Promise<GroupedSpending[]> => {
  const { data, error } = await supabase.rpc('get_grouped_spending', {
    user_id_param: (await supabase.auth.getUser()).data.user?.id,
    date_from: dateRange.from.toISOString().split('T')[0],
    date_to: dateRange.to.toISOString().split('T')[0]
  });

  if (error) throw error;
  return data || [];
};

// Transform raw data to chart format
export const transformToGroupedWaterfallData = (
  rawData: GroupedSpending[]
): GroupedWaterfallData => {
  const groupsMap = new Map<string, CategoryGroup>();
  let totalSpending = 0;

  // Process raw data into groups
  rawData.forEach(row => {
    if (!groupsMap.has(row.group_id)) {
      groupsMap.set(row.group_id, {
        id: row.group_id,
        name: row.group_name,
        color: row.group_color,
        totalAmount: 0,
        categories: []
      });
    }

    const group = groupsMap.get(row.group_id)!;
    
    if (row.category_id && row.amount > 0) {
      group.categories.push({
        id: row.category_id,
        name: row.category_name,
        color: row.category_color,
        amount: Number(row.amount),
        percentage: 0, // Calculate after processing
        groupPercentage: 0 // Calculate after processing
      });
      
      group.totalAmount += Number(row.amount);
      totalSpending += Number(row.amount);
    }
  });

  // Calculate percentages
  const groups = Array.from(groupsMap.values());
  groups.forEach(group => {
    group.categories.forEach(category => {
      category.percentage = (category.amount / group.totalAmount) * 100;
      category.groupPercentage = (category.amount / totalSpending) * 100;
    });
  });

  return {
    groups: groups.sort((a, b) => b.totalAmount - a.totalAmount),
    totalSpending,
    maxGroupAmount: Math.max(...groups.map(g => g.totalAmount)),
    dateRange: {
      from: new Date(),
      to: new Date()
    }
  };
};
```

## Performance Optimizations

### Rendering Optimizations
- **Memoization**: Use `useMemo` for expensive data transformations
- **Virtual Scrolling**: For large category lists in tooltips and summaries
- **Progressive Loading**: Load chart first, then detailed breakdowns
- **Debounced Interactions**: Prevent excessive re-renders on hover

### Data Optimizations
- **Query Efficiency**: Single database call for all grouped data
- **Caching Strategy**: Cache transformed chart data for 5 minutes
- **Lazy Loading**: Load detailed category information on demand
- **Background Updates**: Real-time updates without disrupting user interaction

### Accessibility Features
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Focus management for interactive elements
- **Color Accessibility**: High contrast mode support
- **Alternative Text**: Text descriptions for visual chart elements