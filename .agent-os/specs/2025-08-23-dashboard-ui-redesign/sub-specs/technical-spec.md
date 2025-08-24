# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-23-dashboard-ui-redesign/spec.md

> Created: 2025-08-23
> Version: 1.0.0

## Technical Requirements

### Database-First Component Architecture

**CRITICAL: All components must fetch and display real data from Supabase. No hardcoded examples or placeholder values are acceptable.**

**Primary Components to Modify/Create:**

1. **RealtimeDashboard.tsx** (Modify)
   - Update main layout to two-column grid consuming real database data
   - Remove tab navigation system
   - Integrate new SpendingOverviewSection and EnhancedRecentTransactionsCard with actual data
   - Maintain real-time data flow from existing Supabase subscriptions
   - Handle data loading states and error conditions for real database queries

2. **SpendingOverviewSection.tsx** (New)
   - Display spending header and amounts calculated from actual `budgets.total_income` and aggregated `transactions.amount`
   - Integrate StackedCategoryChart with real category group data from database
   - Handle loading/error states for actual data fetching scenarios
   - Responsive design implementation that adapts to varying data content
   - Calculate spending progress from real budget utilization: `(total_spent / total_income) * 100`

3. **StackedCategoryChart.tsx** (New)
   - Horizontal stacked bar chart visualization using actual `category_groups` data
   - Category group color mapping from actual `category_groups.color` database fields
   - Interactive hover states showing real spending amounts from aggregated transactions
   - Data aggregation logic that handles real-world edge cases (no groups, empty categories, etc.)
   - Chart sizing that adapts to actual number of category groups

4. **EnhancedRecentTransactionsCard.tsx** (New)
   - Compact transaction list display from actual `transactions` table records
   - Category color indicators using real `categories.color` or fallback to `category_groups.color`
   - Action buttons integration with existing navigation
   - Scrollable content area handling variable transaction list lengths
   - Handle empty states when user has no recent transactions

### Database-Driven Data Flow Architecture

```typescript
// Existing data flow (maintain and enhance)
Dashboard Page → RealtimeDashboard → useRealtimeBalance (real Supabase data)
                                 → useRealtimeContext (real subscriptions)

// New data transformations needed for real database data
BudgetWithCategories → SpendingOverviewData (calculated from real budget/transaction data)
CategoryGroup[] + Categories[] → StackedChartData (aggregated from real category spending)
Transaction[] → EnhancedTransactionDisplay (formatted real transaction data)
```

### TypeScript Interfaces for Real Data

```typescript
// Updated interfaces reflecting actual database structure
interface SpendingOverviewData {
  currentSpending: number // Calculated from actual transactions
  budgetLimit: number // From budgets.total_income
  spendingProgress: number // Calculated: (currentSpending / budgetLimit) * 100
  periodLabel: string // Dynamic based on current budget period
  isLoading: boolean
  error: string | null
}

interface StackedChartSegment {
  groupId: string // From category_groups.id
  groupName: string // From category_groups.name
  color: string // From category_groups.color
  amount: number // Aggregated from real transaction amounts
  percentage: number // Calculated from real spending data
  categoryCount: number // Number of categories in this group
}

interface EnhancedTransaction {
  id: string // From transactions.id
  description: string // From transactions.description
  amount: number // From transactions.amount (actual value)
  date: string // From transactions.date (ISO string)
  categoryColor: string // From categories.color or category_groups.color
  categoryName: string // From categories.name
  formattedDate: string // Computed: formatted transactions.date
  formattedAmount: string // Computed: formatted transactions.amount with user preferences
}

// Real database aggregation types
interface CategoryGroupSpending {
  groupId: string
  groupName: string
  groupColor: string
  totalSpent: number // Sum of actual transaction amounts
  totalAllocated: number // Sum of categories.allocated in group
  categoryCount: number
  categories: CategorySpending[]
}

interface CategorySpending {
  categoryId: string
  categoryName: string
  spent: number // From categories.spent or calculated from transactions
  allocated: number // From categories.allocated
  color: string // From categories.color
}
```

### Database Query Requirements

```typescript
// Required queries for real data integration
const getCurrentMonthSpendingData = async (): Promise<SpendingOverviewData> => {
  const budget = await getCurrentMonthBudget() // Existing query
  const totalSpent = budget?.categories.reduce((sum, cat) => 
    sum + cat.transactions.reduce((catSum, trans) => catSum + Math.abs(trans.amount), 0), 0
  ) || 0
  
  return {
    currentSpending: totalSpent,
    budgetLimit: budget?.total_income || 0,
    spendingProgress: budget?.total_income > 0 ? (totalSpent / budget.total_income) * 100 : 0,
    periodLabel: `SPENDING THIS MONTH`
  }
}

const getCategoryGroupSpending = async (): Promise<CategoryGroupSpending[]> => {
  // Query category groups with categories and their transactions
  // Aggregate real transaction amounts by group
  // Handle categories without groups (create "Other" group)
}

const getRecentTransactionsWithCategories = async (limit: number = 10): Promise<EnhancedTransaction[]> => {
  // Fetch recent transactions with category information
  // Join with categories table for color and name
  // Handle transactions with deleted/archived categories
}
```

### CSS Grid Layout Implementation

```css
/* Main dashboard grid - responsive to content */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  min-height: 500px; /* Ensure content visibility even with minimal data */
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* Spending overview section - adapts to data content */
.spending-overview {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: 300px; /* Prevent layout shift during loading */
}

/* Transactions card - handles variable content lengths */
.transactions-card {
  min-height: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

/* Chart container - responsive to actual data */
.chart-container {
  min-height: 120px;
  max-height: 200px;
  width: 100%;
}
```

## Approach

### 1. Database-First Layout Restructuring

**Current Structure:**
```
RealtimeDashboard
├── Tab Navigation
├── Main Content (conditional)
│   ├── Spending Metric Display (some hardcoded examples)
│   ├── Chart (GroupedBarChart or ProgressiveChart)
│   └── Transaction Card (sidebar)
└── Additional Sections (envelopes, category groups, etc.)
```

**New Database-Driven Structure:**
```
RealtimeDashboard
├── Data Loading States
├── Two-Column Grid Layout (real data)
│   ├── Left Column: SpendingOverviewSection
│   │   ├── Real Spending Header & Amounts (from database)
│   │   └── StackedCategoryChart (real category group data)
│   └── Right Column: EnhancedRecentTransactionsCard
│       ├── Transactions Header
│       ├── Real Transaction List (from transactions table)
│       └── Action Buttons
├── Error States for Data Failures
└── Additional Sections (maintain existing with real data)
```

### 2. Database Integration Strategy

**Phase 1: Data Layer Enhancement**
- Enhance existing queries to fetch category group relationships
- Add aggregation queries for category group spending calculations
- Implement proper error handling for missing or malformed data
- Add loading states for all database operations

**Phase 2: Component Creation with Real Data**
- Build SpendingOverviewSection consuming real budget and transaction data
- Create StackedCategoryChart with actual category group aggregations
- Develop EnhancedRecentTransactionsCard displaying real transaction records
- Implement proper empty states for scenarios with no data

**Phase 3: Real-Time Integration**
- Connect components to existing Supabase real-time subscriptions
- Ensure components update when underlying data changes
- Handle concurrent user actions and data updates
- Test with actual user data scenarios

### 3. Real Data Transformation Logic

**Spending Overview Calculations from Database:**
```typescript
const calculateSpendingOverview = async (userId: string): Promise<SpendingOverviewData> => {
  const budget = await getCurrentMonthBudget()
  
  if (!budget) {
    return {
      currentSpending: 0,
      budgetLimit: 0,
      spendingProgress: 0,
      periodLabel: 'SPENDING THIS MONTH',
      isLoading: false,
      error: 'No budget found for current month'
    }
  }

  // Calculate from real transaction data
  const currentSpending = budget.categories.reduce((sum, category) => {
    const categorySpent = category.transactions.reduce((catSum, transaction) => {
      return catSum + Math.abs(transaction.amount) // Handle negative amounts
    }, 0)
    return sum + categorySpent
  }, 0)

  const budgetLimit = budget.total_income
  const spendingProgress = budgetLimit > 0 ? (currentSpending / budgetLimit) * 100 : 0
  
  return {
    currentSpending,
    budgetLimit,
    spendingProgress,
    periodLabel: 'SPENDING THIS MONTH',
    isLoading: false,
    error: null
  }
}
```

**Category Group Data Aggregation from Real Database:**
```typescript
const aggregateCategoryGroupSpending = async (userId: string): Promise<CategoryGroupSpending[]> => {
  const budget = await getCurrentMonthBudget()
  const categoryGroups = await getCategoryGroups(userId)
  
  const groupedData: Map<string, CategoryGroupSpending> = new Map()
  
  // Handle categories with groups
  budget?.categories.forEach(category => {
    const groupId = category.group_id || 'ungrouped'
    const group = categoryGroups.find(g => g.id === groupId) || {
      id: 'ungrouped',
      name: 'Other',
      color: '#6b7280'
    }
    
    if (!groupedData.has(groupId)) {
      groupedData.set(groupId, {
        groupId: group.id,
        groupName: group.name,
        groupColor: group.color,
        totalSpent: 0,
        totalAllocated: 0,
        categoryCount: 0,
        categories: []
      })
    }
    
    const groupData = groupedData.get(groupId)!
    const categorySpent = category.transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    groupData.totalSpent += categorySpent
    groupData.totalAllocated += category.allocated
    groupData.categoryCount += 1
    groupData.categories.push({
      categoryId: category.id,
      categoryName: category.name,
      spent: categorySpent,
      allocated: category.allocated,
      color: category.color
    })
  })
  
  return Array.from(groupedData.values()).filter(group => group.categoryCount > 0)
}
```

### 4. Chart Implementation with Real Data

**Chart Library Integration:**
- Continue using existing chart infrastructure (Nivo or custom)
- Create horizontal stacked bar chart component consuming real category group data
- Implement proper color mapping from actual database color fields
- Add interactive states showing real spending amounts and category details
- Handle edge cases: no spending, single category group, many groups

**Chart Specifications for Real Data:**
- Horizontal orientation adapting to actual number of groups
- Stacked segments sized proportionally to real spending amounts
- Colors sourced from actual `category_groups.color` fields
- Proportional segment sizing based on real spending ratios
- Hover states displaying actual spending amounts from database
- Empty state when user has no spending data

### 5. Responsive Design for Variable Data

**Breakpoint System with Content Adaptation:**
```css
/* Mobile: < 768px - Single column, compact data display */
/* Tablet: 768px - 1024px - Single column with optimized data presentation */  
/* Desktop: > 1024px - Two column grid showing full data detail */
```

**Mobile Adaptations for Real Data:**
- Stack layout vertically regardless of data volume
- Adjust chart height based on actual number of category groups
- Optimize touch targets for actual transaction list lengths
- Handle scrolling for variable transaction counts
- Compress spending display for mobile while maintaining readability

### 6. Error Handling for Real Data Scenarios

**Database Error States:**
- Handle Supabase connection failures
- Manage scenarios where user has no budget set up
- Display appropriate messages for empty transaction history
- Handle category/group relationship inconsistencies
- Provide fallback colors when database colors are missing

**Data Validation:**
- Validate transaction amounts are numbers
- Handle malformed date strings
- Provide fallbacks for missing category names
- Ensure color values are valid CSS colors
- Handle negative transaction amounts appropriately

## External Dependencies

### Existing Dependencies (Maintain)
- Next.js 15.4.5 App Router
- React 19.1.0
- TypeScript with strict config
- Tailwind CSS v4
- Supabase client and real-time subscriptions
- Lucide React icons

### Chart Dependencies (Existing)
- @nivo/bar (if using Nivo charts)
- Chart utilities and custom chart components
- Color utility functions

### Database Dependencies (Critical)
- Supabase PostgreSQL queries for real data
- Real-time subscription management
- Database connection pooling and error handling
- Data validation and sanitization utilities

### No New Dependencies Required
- Implementation uses existing tech stack
- Leverages current design system components
- Utilizes existing data fetching and real-time infrastructure
- Builds on current Supabase integration

### Internal Dependencies
- Juno Design System components and utilities
- Enhanced Supabase queries for category group aggregation
- Current real-time update infrastructure
- Budget calculation utilities with real data
- Currency formatting functions respecting user preferences
- Database type definitions from existing schema