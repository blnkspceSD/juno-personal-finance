# Data Structure Specification

This is the data structure implementation for the spec detailed in @.agent-os/specs/2025-08-16-waterfall-chart-component/spec.md

> Created: 2025-08-16
> Version: 1.0.0

## Schema Changes

### TypeScript Interface Definitions

**Core Waterfall Data Types**
```typescript
// Main waterfall chart data point interface
export interface WaterfallDataPoint {
  category: string
  value: number           // Absolute value for bar height
  cumulative: number      // Cumulative total for positioning
  type: 'income' | 'expense' | 'net'
  color: string          // Hex color code for bar
  description?: string   // Optional category description
  percentage?: number    // Percentage of total income
}

// Complete dataset for waterfall chart
export interface WaterfallChartData {
  dataPoints: WaterfallDataPoint[]
  totalIncome: number
  totalExpenses: number
  netResult: number
  month: string
  currency: string
}

// Category aggregation before waterfall transformation
export interface CategoryTotal {
  categoryId: string
  categoryName: string
  totalAmount: number
  transactionCount: number
  type: 'income' | 'expense'
  description?: string
  color?: string
}

// Tooltip data structure for interactive features
export interface WaterfallTooltipData {
  category: string
  amount: number
  formattedAmount: string
  percentage: number
  description: string
  transactionCount: number
  type: 'income' | 'expense' | 'net'
}
```

**Chart Configuration Types**
```typescript
export interface WaterfallChartConfig {
  height?: number
  showTooltip?: boolean
  showConnectors?: boolean
  animationDuration?: number
  colorScheme?: 'default' | 'colorBlind' | 'highContrast'
  sortBy?: 'magnitude' | 'alphabetical' | 'custom'
}

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Color mapping for different category types
export interface CategoryColorScheme {
  income: string
  essentialExpense: string
  discretionaryExpense: string
  netPositive: string
  netNegative: string
}
```

### Data Transformation Pipeline

**Input Data Structure (from Supabase)**
```typescript
// Raw transaction data from database
export interface Transaction {
  id: string
  amount: number
  category_id: string
  category_name: string
  description: string
  date: string
  type: 'income' | 'expense'
  user_id: string
}

// Category information from database
export interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
  description?: string
  color?: string
  is_essential?: boolean
  user_id: string
}
```

**Transformation Steps**
```typescript
// Step 1: Aggregate transactions by category
function aggregateTransactionsByCategory(
  transactions: Transaction[]
): CategoryTotal[] {
  const categoryMap = new Map<string, CategoryTotal>()
  
  transactions.forEach(transaction => {
    const key = transaction.category_id
    const existing = categoryMap.get(key)
    
    if (existing) {
      existing.totalAmount += transaction.amount
      existing.transactionCount += 1
    } else {
      categoryMap.set(key, {
        categoryId: transaction.category_id,
        categoryName: transaction.category_name,
        totalAmount: transaction.amount,
        transactionCount: 1,
        type: transaction.type,
        description: transaction.description
      })
    }
  })
  
  return Array.from(categoryMap.values())
}

// Step 2: Calculate cumulative values for waterfall positioning
function calculateWaterfallPositions(
  categories: CategoryTotal[]
): WaterfallDataPoint[] {
  // Sort categories: income first, then expenses by magnitude
  const sortedCategories = [
    ...categories.filter(c => c.type === 'income'),
    ...categories
      .filter(c => c.type === 'expense')
      .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount))
  ]
  
  let cumulative = 0
  const totalIncome = categories
    .filter(c => c.type === 'income')
    .reduce((sum, c) => sum + c.totalAmount, 0)
  
  return sortedCategories.map((category, index) => {
    const startPosition = cumulative
    cumulative += category.totalAmount
    
    return {
      category: category.categoryName,
      value: Math.abs(category.totalAmount),
      cumulative: startPosition,
      type: category.type,
      color: getColorForCategory(category, totalIncome),
      description: category.description,
      percentage: (Math.abs(category.totalAmount) / totalIncome) * 100
    }
  })
}

// Step 3: Add net result calculation
function addNetResultToWaterfall(
  dataPoints: WaterfallDataPoint[],
  totalIncome: number,
  totalExpenses: number
): WaterfallDataPoint[] {
  const netResult = totalIncome - Math.abs(totalExpenses)
  
  return [
    ...dataPoints,
    {
      category: 'Net Result',
      value: Math.abs(netResult),
      cumulative: totalIncome - Math.abs(totalExpenses),
      type: 'net' as const,
      color: netResult >= 0 ? '#10B981' : '#EF4444', // Green/Red
      description: netResult >= 0 ? 'Monthly surplus' : 'Monthly deficit',
      percentage: (Math.abs(netResult) / totalIncome) * 100
    }
  ]
}
```

### Mock Data for Development

**Sample Waterfall Data**
```typescript
export const mockWaterfallData: WaterfallChartData = {
  dataPoints: [
    {
      category: 'Salary',
      value: 5000,
      cumulative: 0,
      type: 'income',
      color: '#10B981',
      description: 'Monthly salary income',
      percentage: 100
    },
    {
      category: 'Income Tax',
      value: 1000,
      cumulative: 5000,
      type: 'expense',
      color: '#EF4444',
      description: 'Federal and state income tax',
      percentage: 20
    },
    {
      category: 'Pension',
      value: 300,
      cumulative: 4000,
      type: 'expense',
      color: '#F59E0B',
      description: 'Retirement savings contribution',
      percentage: 6
    },
    {
      category: 'Rent',
      value: 1200,
      cumulative: 3700,
      type: 'expense',
      color: '#EF4444',
      description: 'Monthly housing rent',
      percentage: 24
    },
    {
      category: 'Council Tax',
      value: 150,
      cumulative: 2500,
      type: 'expense',
      color: '#F59E0B',
      description: 'Local government tax',
      percentage: 3
    },
    {
      category: 'Transport',
      value: 200,
      cumulative: 2350,
      type: 'expense',
      color: '#F59E0B',
      description: 'Public transport and fuel',
      percentage: 4
    },
    {
      category: 'Food',
      value: 400,
      cumulative: 2150,
      type: 'expense',
      color: '#8B5CF6',
      description: 'Groceries and dining',
      percentage: 8
    },
    {
      category: 'Bills',
      value: 250,
      cumulative: 1750,
      type: 'expense',
      color: '#F59E0B',
      description: 'Utilities and services',
      percentage: 5
    },
    {
      category: 'Personal',
      value: 300,
      cumulative: 1500,
      type: 'expense',
      color: '#8B5CF6',
      description: 'Personal spending and entertainment',
      percentage: 6
    },
    {
      category: 'Charity',
      value: 100,
      cumulative: 1200,
      type: 'expense',
      color: '#8B5CF6',
      description: 'Charitable donations',
      percentage: 2
    },
    {
      category: 'Net Result',
      value: 1100,
      cumulative: 1100,
      type: 'net',
      color: '#10B981',
      description: 'Monthly surplus',
      percentage: 22
    }
  ],
  totalIncome: 5000,
  totalExpenses: 3900,
  netResult: 1100,
  month: '2025-08',
  currency: 'GBP'
}

export const mockEmptyWaterfallData: WaterfallChartData = {
  dataPoints: [],
  totalIncome: 0,
  totalExpenses: 0,
  netResult: 0,
  month: '2025-08',
  currency: 'GBP'
}

export const mockLoadingState = {
  isLoading: true,
  error: null,
  data: null
}

export const mockErrorState = {
  isLoading: false,
  error: 'Failed to fetch transaction data',
  data: null
}
```

### Category Color Assignment Logic

**Color Assignment Function**
```typescript
export function getColorForCategory(
  category: CategoryTotal,
  totalIncome: number
): string {
  const percentage = (Math.abs(category.totalAmount) / totalIncome) * 100
  
  if (category.type === 'income') {
    return '#10B981' // Juno success green
  }
  
  if (category.type === 'expense') {
    // Essential expenses (>10% of income) - Red
    if (percentage > 10) {
      return '#EF4444' // Juno danger red
    }
    // Moderate expenses (5-10% of income) - Orange
    else if (percentage > 5) {
      return '#F59E0B' // Juno warning orange
    }
    // Small expenses (<5% of income) - Purple
    else {
      return '#8B5CF6' // Juno accent purple
    }
  }
  
  return '#6B7280' // Default neutral gray
}

// Alternative color scheme for accessibility
export const colorBlindFriendlyScheme: CategoryColorScheme = {
  income: '#0EA5E9',      // Blue
  essentialExpense: '#DC2626',    // Red
  discretionaryExpense: '#F59E0B', // Orange
  netPositive: '#059669',  // Green
  netNegative: '#B91C1C'   // Dark red
}

export const highContrastScheme: CategoryColorScheme = {
  income: '#000000',       // Black
  essentialExpense: '#FF0000',     // Pure red
  discretionaryExpense: '#FF8800', // Orange
  netPositive: '#008800',  // Green
  netNegative: '#CC0000'   // Dark red
}
```

## Migrations

### Database Schema Updates

**No database schema changes required** - the waterfall chart component uses existing transaction and category data structures. All data transformation occurs in the frontend application layer.

### Existing Data Compatibility

**Transaction Data Structure**
- Uses existing `transactions` table with `amount`, `category_id`, `date`, `type` fields
- Uses existing `categories` table with `name`, `type`, `description` fields
- No migration scripts needed

**Query Optimization Considerations**
```sql
-- Potential index optimization for waterfall chart queries
-- (Only if performance testing reveals slow aggregation queries)

-- Index for efficient category aggregation by date range
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_category_date 
ON transactions (category_id, date DESC, type);

-- Index for efficient monthly aggregation
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_transactions_monthly_aggregation 
ON transactions (date_trunc('month', date), category_id, type);
```

### Data Validation

**Input Data Validation**
```typescript
export function validateTransactionData(transactions: Transaction[]): boolean {
  return transactions.every(transaction => 
    transaction.amount !== undefined &&
    transaction.category_id !== undefined &&
    transaction.date !== undefined &&
    transaction.type !== undefined &&
    ['income', 'expense'].includes(transaction.type)
  )
}

export function validateCategoryData(categories: Category[]): boolean {
  return categories.every(category =>
    category.id !== undefined &&
    category.name !== undefined &&
    category.type !== undefined &&
    ['income', 'expense'].includes(category.type)
  )
}
```

### Error Handling for Data Issues

**Graceful Degradation Strategies**
```typescript
export function sanitizeWaterfallData(
  data: WaterfallDataPoint[]
): WaterfallDataPoint[] {
  return data
    .filter(point => 
      point.value !== undefined && 
      point.value !== null && 
      !isNaN(point.value)
    )
    .map(point => ({
      ...point,
      value: Math.max(0, Math.abs(point.value)), // Ensure positive values
      percentage: Math.min(100, Math.max(0, point.percentage || 0)) // Clamp percentages
    }))
}

export function handleMissingCategoryData(
  transactions: Transaction[]
): Transaction[] {
  return transactions.map(transaction => ({
    ...transaction,
    category_name: transaction.category_name || 'Uncategorized',
    category_id: transaction.category_id || 'uncategorized'
  }))
}
```

This data structure specification ensures robust data handling for the waterfall chart component while maintaining compatibility with existing Juno database schema and providing comprehensive type safety throughout the data transformation pipeline.