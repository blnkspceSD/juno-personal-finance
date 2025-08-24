# Component Specification

This is the component specification for the spec detailed in @.agent-os/specs/2025-08-23-dashboard-ui-redesign/spec.md

> Created: 2025-08-23
> Version: 1.0.0

## Component Architecture Overview

The dashboard redesign involves creating three new components and modifying the existing RealtimeDashboard component to implement the Figma design.

## Component Specifications

### 1. SpendingOverviewSection Component

**Location:** `src/components/dashboard/SpendingOverviewSection.tsx`

**Purpose:** Display the left column spending overview with header, amounts, and stacked chart.

**Props Interface:**
```typescript
interface SpendingOverviewSectionProps {
  currentSpending: number
  budgetLimit: number
  spendingProgress: number
  groupedSpendingData: GroupedSpendingData[]
  isLoading?: boolean
  className?: string
}
```

**Component Structure:**
```tsx
<div className={cn("space-y-6", className)}>
  {/* Header */}
  <div className="space-y-2">
    <p className="text-sm text-muted-foreground font-medium tracking-wide">
      SPENDING THIS MONTH
    </p>
    <div className="flex items-baseline space-x-2">
      <span className="text-4xl font-bold tracking-tight">
        ${currentSpending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
      <span className="text-xl text-muted-foreground">
        / ${budgetLimit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </span>
    </div>
  </div>
  
  {/* Stacked Chart */}
  <StackedCategoryChart 
    data={groupedSpendingData}
    height={120}
    className="w-full"
  />
</div>
```

**Styling Requirements:**
- Use Juno Design System typography tokens
- Implement proper spacing hierarchy
- Ensure responsive text scaling
- Add loading states with skeleton UI

### 2. StackedCategoryChart Component

**Location:** `src/components/charts/StackedCategoryChart.tsx`

**Purpose:** Display horizontal stacked bar chart showing category group spending proportions.

**Props Interface:**
```typescript
interface StackedCategoryChartProps {
  data: GroupedSpendingData[]
  height?: number
  className?: string
  showTooltip?: boolean
  interactive?: boolean
}

interface GroupedSpendingData {
  groupName: string
  groupColor: string
  groupIcon?: string
  totalSpent: number
  totalAllocated: number
  categories: {
    name: string
    spent: number
    allocated: number
    color: string
  }[]
}
```

**Chart Specifications:**
```typescript
// Chart data transformation
const chartData = data.map(group => ({
  id: group.groupName,
  label: group.groupName,
  value: group.totalSpent,
  color: group.groupColor,
  percentage: (group.totalSpent / totalSpending) * 100
}))
```

**Component Features:**
- Horizontal stacked bar layout
- Proportional segment sizing based on spending
- Group colors from database
- Hover states with spending amounts
- Responsive width scaling
- Loading and empty states

**Visual Specifications:**
- Bar height: 32px
- Rounded corners: 8px
- Segment spacing: 1px gap between segments
- Hover effect: Slight opacity change and tooltip
- Empty state: Gray placeholder bar

### 3. EnhancedRecentTransactionsCard Component

**Location:** `src/components/dashboard/EnhancedRecentTransactionsCard.tsx`

**Purpose:** Display recent transactions in a compact, modern card format.

**Props Interface:**
```typescript
interface EnhancedRecentTransactionsCardProps {
  transactions: EnhancedTransaction[]
  isLoading?: boolean
  onAddTransaction: () => void
  onViewAll: () => void
  className?: string
}

interface EnhancedTransaction {
  id: string
  description: string
  amount: number
  date: string
  categoryColor: string
  categoryName: string
}
```

**Component Structure:**
```tsx
<Card className={cn("h-full flex flex-col", className)}>
  <CardHeader className="pb-3">
    <CardTitle className="text-lg tracking-wide">
      RECENT TRANSACTIONS
    </CardTitle>
  </CardHeader>
  
  <CardContent className="flex-1 overflow-hidden p-0">
    <div className="px-6 pb-6 h-full flex flex-col">
      {/* Transaction List - Scrollable */}
      <div className="flex-1 overflow-y-auto space-y-1 -mx-2">
        {transactions.map(transaction => (
          <TransactionRow key={transaction.id} transaction={transaction} />
        ))}
      </div>
      
      {/* Action Buttons */}
      <div className="flex gap-2 pt-4 border-t">
        <Button 
          variant="default" 
          size="sm" 
          onClick={onAddTransaction}
          className="flex-1"
        >
          Add transaction
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onViewAll}
          className="flex-1"
        >
          View all
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

**TransactionRow Subcomponent:**
```tsx
<div className="flex items-center gap-3 px-2 py-2 hover:bg-muted/50 rounded-lg transition-colors">
  {/* Category Color Indicator */}
  <div 
    className="w-1 h-10 rounded-full flex-shrink-0"
    style={{ backgroundColor: transaction.categoryColor }}
  />
  
  {/* Transaction Info */}
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium truncate">
      {transaction.description}
    </p>
    <p className="text-xs text-muted-foreground">
      {formatTransactionDate(transaction.date)}
    </p>
  </div>
  
  {/* Amount */}
  <div className="text-sm font-medium">
    {formatCurrency(Math.abs(transaction.amount))}
  </div>
</div>
```

**Formatting Functions:**
```typescript
const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    day: 'numeric',
    month: 'short'
  }) // Returns "16 Aug"
}

const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US', { 
    minimumFractionDigits: 2,
    maximumFractionDigits: 2 
  })}`
}
```

### 4. Modified RealtimeDashboard Component

**Location:** `src/components/dashboard/RealtimeDashboard.tsx`

**Changes Required:**

**Layout Modification:**
```tsx
// Replace existing main content layout with:
<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  {/* Left Column - Spending Overview (2/3 width) */}
  <div className="lg:col-span-2">
    <SpendingOverviewSection
      currentSpending={currentSpending}
      budgetLimit={budgetLimit}
      spendingProgress={spendingProgress}
      groupedSpendingData={groupedSpendingData}
      isLoading={!currentBudget}
    />
  </div>
  
  {/* Right Column - Recent Transactions (1/3 width) */}
  <div className="lg:col-span-1">
    <EnhancedRecentTransactionsCard
      transactions={enhancedTransactions}
      isLoading={!recentTransactions.length}
      onAddTransaction={() => router.push('/dashboard/transactions/new')}
      onViewAll={() => router.push('/dashboard/transactions')}
    />
  </div>
</div>
```

**Data Transformation:**
```typescript
// Transform recent transactions for enhanced display
const enhancedTransactions = recentTransactions.map(transaction => ({
  ...transaction,
  categoryColor: transaction.category_color || '#6b7280',
  formattedDate: formatTransactionDate(transaction.date),
  formattedAmount: formatCurrency(Math.abs(transaction.amount))
}))
```

**Removed Elements:**
- Tab navigation system
- Duplicate transaction tables
- Legacy chart implementations
- Redundant spending displays

## Component Dependencies

### Internal Dependencies
- Juno Design System components (Card, Button, etc.)
- Existing chart infrastructure
- Currency formatting utilities
- Real-time data hooks

### Shared Utilities
```typescript
// src/lib/utils/dashboard-formatting.ts
export const formatSpendingAmount = (amount: number): string => { ... }
export const formatTransactionDate = (date: string): string => { ... }
export const calculateSpendingProgress = (spent: number, budget: number): number => { ... }
```

## Responsive Behavior

### Desktop (>1024px)
- Two-column grid layout (2:1 ratio)
- Full chart width in left column
- Fixed-height transactions card in right column

### Tablet (768px-1024px)
- Single column layout
- Reduced chart height
- Adjusted card proportions

### Mobile (<768px)
- Single column layout
- Compact spending display
- Optimized transaction list height
- Stack action buttons vertically if needed

## Accessibility Requirements

### ARIA Labels
- Chart segments need proper labels
- Transaction rows need accessible descriptions
- Action buttons need clear context

### Keyboard Navigation
- Chart should be keyboard accessible
- Transaction list should be navigable
- Action buttons should be focusable

### Screen Reader Support
- Spending amounts should be announced clearly
- Chart data should have text alternatives
- Loading states should be announced

## Performance Considerations

### Memoization
- SpendingOverviewSection should memo spending calculations
- StackedCategoryChart should memo chart data transformations
- Transaction formatting should be memoized

### Virtual Scrolling
- Consider virtual scrolling for large transaction lists
- Implement efficient re-rendering for real-time updates

### Bundle Size
- Tree-shake unused chart components
- Optimize component imports
- Lazy load non-critical components