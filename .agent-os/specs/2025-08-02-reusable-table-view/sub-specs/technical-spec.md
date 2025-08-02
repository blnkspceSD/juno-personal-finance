# Technical Specification - Reusable Table View Component

> Created: 2025-08-02
> Spec: Reusable Table View Component

## Architecture Overview

The reusable table view component will be built using a layered architecture with clear separation of concerns:

1. **Data Layer** - Supabase queries and real-time subscriptions
2. **State Management** - React hooks for table state and real-time updates
3. **Component Layer** - Reusable table components built on shadcn/ui and TanStack Table
4. **Presentation Layer** - Responsive UI with mobile-first design

## Technology Stack

### Core Dependencies

```json
{
  "@tanstack/react-table": "^8.11.8",
  "@tanstack/react-virtual": "^3.0.1",
  "date-fns": "^3.0.6",
  "react-day-picker": "^8.10.0"
}
```

### Existing Dependencies (Already Available)
- **shadcn/ui components** - Button, Card, Input, Label, Select
- **TailwindCSS v4** - Styling framework
- **Lucide React** - Icon library
- **React Hook Form** - Form handling
- **Zod** - Schema validation

## Component Architecture

### Core Components Hierarchy

```
DataTable (Generic)
├── TableHeader
│   ├── ColumnHeader (Sortable)
│   └── FilterRow
├── TableBody
│   ├── TableRow
│   │   ├── TableCell
│   │   └── ActionCell
│   └── EmptyState
├── TableFooter
│   ├── Pagination
│   └── TableInfo
└── MobileTableView
    └── TableCard
```

### Component Specifications

#### DataTable<T> Component

```typescript
interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  error?: string | null
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilteringConfig
  onRowClick?: (row: T) => void
  onRowEdit?: (row: T) => void
  onRowDelete?: (row: T) => void
  mobileViewConfig?: MobileViewConfig
  virtualizedConfig?: VirtualizedConfig
}

interface PaginationConfig {
  pageSize: number
  currentPage: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

interface SortingConfig {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSortChange: (sortBy: string, order: 'asc' | 'desc') => void
}

interface FilteringConfig {
  filters: Record<string, any>
  onFilterChange: (filters: Record<string, any>) => void
  searchQuery?: string
  onSearchChange: (query: string) => void
}
```

#### Column Definition System

```typescript
interface CustomColumnDef<T> extends ColumnDef<T> {
  accessorKey: keyof T
  header: string
  type?: 'text' | 'number' | 'date' | 'currency' | 'status' | 'actions'
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  mobileHidden?: boolean
  cellRenderer?: (value: any, row: T) => React.ReactNode
  headerRenderer?: () => React.ReactNode
  filterComponent?: React.ComponentType<FilterProps>
  width?: number | string
  minWidth?: number
  maxWidth?: number
}
```

## Data Models and TypeScript Interfaces

### Extended Database Types

```typescript
// Extend existing types for table views
interface CategoryTableRow extends Category {
  remaining: number
  percentage_used: number
  status: 'healthy' | 'warning' | 'overspent'
  transaction_count: number
  last_transaction_date?: string
}

interface TransactionTableRow extends Transaction {
  category_name: string
  category_color: string
  formatted_amount: string
  formatted_date: string
  time_ago: string
}

// Table-specific filter types
interface CategoryFilters {
  status?: ('healthy' | 'warning' | 'overspent')[]
  allocatedRange?: { min: number; max: number }
  spentRange?: { min: number; max: number }
  hasTransactions?: boolean
}

interface TransactionFilters {
  categories?: string[]
  dateRange?: { from: Date; to: Date }
  amountRange?: { min: number; max: number }
  description?: string
}
```

### Table State Management

```typescript
// Custom hooks for table state
interface UseTableStateConfig<T> {
  data: T[]
  initialPageSize?: number
  initialSorting?: SortingState
  initialFilters?: Record<string, any>
  enableSearch?: boolean
  enableFiltering?: boolean
  enablePagination?: boolean
}

interface UseTableStateReturn<T> {
  tableInstance: Table<T>
  pagination: PaginationState
  sorting: SortingState
  filtering: ColumnFiltersState
  searchQuery: string
  isLoading: boolean
  error: string | null
  handlePageChange: (page: number) => void
  handleSortChange: (sorting: SortingState) => void
  handleFilterChange: (filters: ColumnFiltersState) => void
  handleSearchChange: (query: string) => void
  resetFilters: () => void
}
```

## Real-time Integration

### Connection to Existing Real-time System

The table components will integrate seamlessly with the existing real-time balance update system:

```typescript
// Integration with existing useRealtimeBalance hook
interface TableRealtimeConfig {
  budgetId: string
  enableOptimisticUpdates: boolean
  updateStrategy: 'immediate' | 'debounced'
  conflictResolution: 'server' | 'client' | 'merge'
}

// Enhanced category table with real-time updates
function useCategoryTableData(budgetId: string): UseTableStateReturn<CategoryTableRow> {
  const { envelopes, isConnected } = useRealtimeBalance(budgetId)
  
  // Transform real-time envelope data to table format
  const tableData = useMemo(() => 
    envelopes.map(envelope => ({
      ...envelope,
      remaining: envelope.allocated - envelope.spent,
      percentage_used: (envelope.spent / envelope.allocated) * 100,
      status: envelope.spent > envelope.allocated ? 'overspent' : 
              envelope.spent > envelope.allocated * 0.8 ? 'warning' : 'healthy'
    }))
  , [envelopes])
  
  return useTableState({
    data: tableData,
    initialPageSize: 10,
    enableSearch: true,
    enableFiltering: true
  })
}
```

## Performance Optimizations

### Virtual Scrolling Implementation

```typescript
// Virtual scrolling for large datasets
interface VirtualizedConfig {
  enabled: boolean
  itemHeight: number
  containerHeight: number
  overscan?: number
}

// Implementation using @tanstack/react-virtual
function useVirtualizedTable<T>(
  data: T[],
  config: VirtualizedConfig
) {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => config.itemHeight,
    overscan: config.overscan || 5
  })
  
  return {
    parentRef,
    virtualizer,
    virtualItems: virtualizer.getVirtualItems()
  }
}
```

### Memoization Strategy

```typescript
// Optimized component re-rendering
const DataTableMemo = memo(DataTable, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.columns === nextProps.columns &&
    prevProps.isLoading === nextProps.isLoading &&
    isEqual(prevProps.pagination, nextProps.pagination) &&
    isEqual(prevProps.sorting, nextProps.sorting) &&
    isEqual(prevProps.filtering, nextProps.filtering)
  )
})
```

## Mobile Responsiveness Strategy

### Adaptive Column Display

```typescript
// Mobile column configuration
interface MobileViewConfig {
  breakpoint: number // px width
  hiddenColumns: string[]
  cardView: {
    enabled: boolean
    primaryField: string
    secondaryField: string
    tertiaryField?: string
  }
  swipeActions?: SwipeAction[]
}

interface SwipeAction {
  key: string
  label: string
  icon: React.ComponentType
  color: string
  onAction: (row: any) => void
}
```

### Responsive Design Implementation

```typescript
// Hook for responsive table behavior
function useResponsiveTable(config: MobileViewConfig) {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  const [isMobileView, setIsMobileView] = useState(false)
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth
      if (width < config.breakpoint) {
        setScreenSize('mobile')
        setIsMobileView(true)
      } else if (width < 1024) {
        setScreenSize('tablet')
        setIsMobileView(false)
      } else {
        setScreenSize('desktop')
        setIsMobileView(false)
      }
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [config.breakpoint])
  
  return { screenSize, isMobileView }
}
```

## Accessibility Implementation

### ARIA and Keyboard Navigation

```typescript
// Accessibility configuration
interface AccessibilityConfig {
  announcements: {
    sorting: (column: string, direction: 'asc' | 'desc') => string
    filtering: (activeFilters: number) => string
    pagination: (page: number, total: number) => string
  }
  keyboardShortcuts: {
    [key: string]: () => void
  }
  screenReaderOptimizations: boolean
}

// Keyboard navigation implementation
function useTableKeyboardNavigation(tableRef: RefObject<HTMLTableElement>) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowDown':
          // Navigate between rows
          break
        case 'ArrowLeft':
        case 'ArrowRight':
          // Navigate between columns
          break
        case 'Enter':
        case ' ':
          // Select/activate current row
          break
        case 'Home':
        case 'End':
          // Navigate to first/last row
          break
      }
    }
    
    const table = tableRef.current
    if (table) {
      table.addEventListener('keydown', handleKeyDown)
      return () => table.removeEventListener('keydown', handleKeyDown)
    }
  }, [tableRef])
}
```

## Testing Strategy

### Component Testing Approach

```typescript
// Test utilities for table components
interface TableTestUtils<T> {
  renderTable: (props: Partial<DataTableProps<T>>) => RenderResult
  getTableRows: () => HTMLElement[]
  getTableHeaders: () => HTMLElement[]
  clickColumnHeader: (columnName: string) => void
  enterSearchQuery: (query: string) => void
  selectFilter: (filterName: string, value: any) => void
  changePage: (page: number) => void
  expectRowCount: (count: number) => void
  expectSortOrder: (columnName: string, order: 'asc' | 'desc') => void
}

// Integration test scenarios
describe('CategoryTable Integration', () => {
  it('should update in real-time when transaction is added', async () => {
    // Test real-time integration
  })
  
  it('should maintain sort order after real-time update', async () => {
    // Test sort persistence
  })
  
  it('should handle connection loss gracefully', async () => {
    // Test offline behavior
  })
})
```

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── table.tsx (shadcn/ui base)
│   │   ├── data-table.tsx (reusable component)
│   │   ├── table-pagination.tsx
│   │   ├── table-filters.tsx
│   │   └── mobile-table-card.tsx
│   ├── tables/
│   │   ├── CategoryTable.tsx
│   │   ├── TransactionTable.tsx
│   │   └── table-columns/
│   │       ├── category-columns.tsx
│   │       └── transaction-columns.tsx
│   └── dashboard/
│       └── EnhancedDashboard.tsx
├── lib/
│   ├── hooks/
│   │   ├── useTableState.ts
│   │   ├── useResponsiveTable.ts
│   │   └── useTableKeyboardNavigation.ts
│   ├── utils/
│   │   ├── table-utils.ts
│   │   └── table-formatters.ts
│   └── types/
│       └── table-types.ts
└── __tests__/
    ├── components/
    │   ├── DataTable.test.tsx
    │   ├── CategoryTable.test.tsx
    │   └── TransactionTable.test.tsx
    └── utils/
        └── table-utils.test.ts
```

## Security Considerations

### Data Access and RLS

All table components will respect existing Row Level Security (RLS) policies:

- Category data filtered by `user_id`
- Transaction data filtered by `user_id`
- Real-time subscriptions using authenticated connections
- Client-side validation for all data operations

### Input Sanitization

- Search queries sanitized to prevent injection attacks
- Filter inputs validated against schema
- Pagination parameters bounded to prevent abuse
- Sort parameters validated against allowed columns