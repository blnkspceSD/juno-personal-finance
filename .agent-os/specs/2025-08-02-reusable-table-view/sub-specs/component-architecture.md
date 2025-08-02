# Component Architecture - Reusable Table View

> Created: 2025-08-02
> Spec: Reusable Table View Component

## Design Philosophy

The table component architecture follows these core principles:

1. **Composition over Configuration** - Small, composable components that can be combined flexibly
2. **Type Safety** - Full TypeScript support with generic interfaces for reusability
3. **Performance First** - Optimized rendering with virtualization and memoization
4. **Accessibility by Default** - WCAG 2.1 AA compliance built into all components
5. **Mobile-First Responsive** - Adaptive design that works seamlessly across all devices

## Component Hierarchy

```
DataTable<T>
├── TableProvider (Context)
├── TableToolbar
│   ├── SearchInput
│   ├── FilterDropdowns
│   ├── ViewToggle (Table/Card)
│   └── ExportButton (Future)
├── TableContainer
│   ├── TableHeader
│   │   ├── ColumnHeader
│   │   │   ├── SortButton
│   │   │   └── FilterButton
│   │   └── SelectAllCheckbox
│   ├── TableBody
│   │   ├── VirtualizedList (Large datasets)
│   │   ├── TableRow
│   │   │   ├── SelectCheckbox
│   │   │   ├── TableCell
│   │   │   │   ├── CellRenderer
│   │   │   │   └── InlineEditor
│   │   │   └── ActionsCell
│   │   │       ├── EditButton
│   │   │       ├── DeleteButton
│   │   │       └── MoreActions
│   │   └── EmptyState
│   └── LoadingState
├── MobileTableView (Responsive)
│   ├── SearchBar
│   ├── FilterChips
│   └── TableCardList
│       ├── TableCard
│       │   ├── CardHeader
│       │   ├── CardContent
│       │   └── CardActions
│       └── InfiniteScroll
└── TableFooter
    ├── TableInfo
    ├── Pagination
    │   ├── PageSizeSelect
    │   ├── PageNavigation
    │   └── PageInfo
    └── PerformanceMetrics (Debug)
```

## Core Component Specifications

### DataTable<T> - Root Component

The main table component that orchestrates all functionality:

```typescript
interface DataTableProps<T> {
  // Data and configuration
  data: T[]
  columns: ColumnDef<T>[]
  isLoading?: boolean
  error?: string | null
  
  // Feature toggles
  features?: {
    search?: boolean
    filtering?: boolean
    sorting?: boolean
    pagination?: boolean
    selection?: boolean
    virtualization?: boolean
    mobileView?: boolean
    inlineEditing?: boolean
  }
  
  // Event handlers
  onRowSelect?: (selectedRows: T[]) => void
  onRowClick?: (row: T, index: number) => void
  onRowEdit?: (row: T, field: keyof T, value: any) => Promise<void>
  onRowDelete?: (row: T) => Promise<void>
  
  // Customization
  className?: string
  rowHeight?: number
  maxHeight?: number
  stickyHeader?: boolean
  
  // Mobile configuration
  mobileBreakpoint?: number
  mobileCardConfig?: MobileCardConfig<T>
}
```

### TableProvider - Context Management

Provides table state and actions to all child components:

```typescript
interface TableContextValue<T> {
  // Table instance from TanStack Table
  table: Table<T>
  
  // State
  data: T[]
  columns: ColumnDef<T>[]
  isLoading: boolean
  error: string | null
  
  // Selection state
  selectedRows: T[]
  isAllSelected: boolean
  
  // UI state
  isMobileView: boolean
  isVirtualized: boolean
  
  // Actions
  handleSort: (columnId: string) => void
  handleFilter: (columnId: string, value: any) => void
  handleSearch: (query: string) => void
  handleRowSelect: (row: T, selected: boolean) => void
  handleSelectAll: (selected: boolean) => void
  
  // Real-time integration
  realtimeConfig?: {
    isConnected: boolean
    hasOptimisticUpdates: boolean
    conflictResolver: (serverData: T, clientData: T) => T
  }
}
```

### ColumnDef<T> - Column Configuration

Extended column definition with Juno-specific enhancements:

```typescript
interface ColumnDef<T> extends TanStackColumnDef<T> {
  // Basic properties
  accessorKey: keyof T
  header: string | ((props: HeaderContext<T>) => React.ReactNode)
  
  // Type and behavior
  type: 'text' | 'number' | 'currency' | 'date' | 'status' | 'actions' | 'progress'
  sortable?: boolean
  filterable?: boolean
  searchable?: boolean
  editable?: boolean
  
  // Responsive behavior
  mobileHidden?: boolean
  mobileOrder?: number
  minWidth?: number
  maxWidth?: number
  
  // Custom renderers
  cellRenderer?: (props: CellContext<T>) => React.ReactNode
  headerRenderer?: (props: HeaderContext<T>) => React.ReactNode
  filterRenderer?: (props: FilterContext<T>) => React.ReactNode
  mobileRenderer?: (props: MobileCellContext<T>) => React.ReactNode
  
  // Validation for inline editing
  validate?: (value: any) => string | null
  transform?: (value: any) => any
  
  // Real-time behavior
  optimisticUpdate?: boolean
  conflictResolution?: 'client' | 'server' | 'merge'
}
```

## Specialized Table Components

### CategoryTable Component

Purpose-built table for envelope category management:

```typescript
interface CategoryTableProps {
  budgetId: string
  initialData?: CategoryTableRow[]
  onCategoryEdit?: (category: Category, field: keyof Category, value: any) => Promise<void>
  onCategoryDelete?: (category: Category) => Promise<void>
  onAllocationChange?: (categoryId: string, newAllocation: number) => Promise<void>
  showRealtimeIndicators?: boolean
  compactMode?: boolean
}

// Column definitions for categories
const categoryColumns: ColumnDef<CategoryTableRow>[] = [
  {
    accessorKey: 'name',
    header: 'Category',
    type: 'text',
    sortable: true,
    searchable: true,
    editable: true,
    cellRenderer: ({ value, row }) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: row.original.color }}
        />
        <span className="font-medium">{value}</span>
        {row.original.isOptimistic && <OptimisticIndicator />}
      </div>
    )
  },
  {
    accessorKey: 'allocated',
    header: 'Allocated',
    type: 'currency',
    sortable: true,
    filterable: true,
    editable: true,
    cellRenderer: ({ value }) => (
      <CurrencyCell value={value} editable />
    )
  },
  {
    accessorKey: 'spent',
    header: 'Spent',
    type: 'currency',
    sortable: true,
    filterable: true,
    cellRenderer: ({ value, row }) => (
      <CurrencyCell 
        value={value} 
        className={row.original.status === 'overspent' ? 'text-red-600' : ''}
      />
    )
  },
  {
    accessorKey: 'remaining',
    header: 'Remaining',
    type: 'currency',
    sortable: true,
    cellRenderer: ({ value, row }) => (
      <div className="space-y-1">
        <CurrencyCell 
          value={value}
          className={value < 0 ? 'text-red-600' : 'text-green-600'}
        />
        <ProgressBar 
          progress={row.original.percentage_used}
          status={row.original.status}
          className="h-1"
        />
      </div>
    )
  },
  {
    accessorKey: 'status',
    header: 'Status',
    type: 'status',
    sortable: true,
    filterable: true,
    mobileHidden: true,
    cellRenderer: ({ value }) => (
      <StatusBadge status={value} />
    )
  },
  {
    id: 'actions',
    header: '',
    type: 'actions',
    cellRenderer: ({ row }) => (
      <ActionsCell
        actions={[
          { key: 'edit', label: 'Edit', icon: Edit2 },
          { key: 'transactions', label: 'View Transactions', icon: List },
          { key: 'delete', label: 'Delete', icon: Trash2, destructive: true }
        ]}
        onAction={(action) => handleCategoryAction(action, row.original)}
      />
    )
  }
]
```

### TransactionTable Component

Comprehensive transaction management table:

```typescript
interface TransactionTableProps {
  budgetId?: string
  categoryId?: string
  initialData?: TransactionTableRow[]
  dateRange?: { from: Date; to: Date }
  onTransactionEdit?: (transaction: Transaction, updates: Partial<Transaction>) => Promise<void>
  onTransactionDelete?: (transaction: Transaction) => Promise<void>
  onTransactionDuplicate?: (transaction: Transaction) => Promise<void>
  showCategoryFilter?: boolean
  showBulkActions?: boolean
}

// Column definitions for transactions
const transactionColumns: ColumnDef<TransactionTableRow>[] = [
  {
    accessorKey: 'date',
    header: 'Date',
    type: 'date',
    sortable: true,
    filterable: true,
    cellRenderer: ({ value }) => (
      <div className="space-y-1">
        <div className="font-medium">{formatDate(value, 'MMM dd')}</div>
        <div className="text-xs text-muted-foreground">{formatDate(value, 'yyyy')}</div>
      </div>
    ),
    mobileRenderer: ({ value }) => (
      <span className="text-sm font-medium">{formatDate(value, 'MMM dd, yyyy')}</span>
    )
  },
  {
    accessorKey: 'description',
    header: 'Description',
    type: 'text',
    sortable: true,
    searchable: true,
    editable: true,
    cellRenderer: ({ value, row }) => (
      <div className="space-y-1">
        <div className="font-medium">{value}</div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-full" 
            style={{ backgroundColor: row.original.category_color }}
          />
          {row.original.category_name}
        </div>
      </div>
    )
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    type: 'currency',
    sortable: true,
    filterable: true,
    editable: true,
    cellRenderer: ({ value }) => (
      <CurrencyCell value={value} size="lg" />
    )
  },
  {
    accessorKey: 'category_name',
    header: 'Category',
    type: 'text',
    sortable: true,
    filterable: true,
    mobileHidden: true,
    cellRenderer: ({ value, row }) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full" 
          style={{ backgroundColor: row.original.category_color }}
        />
        <span>{value}</span>
      </div>
    )
  },
  {
    id: 'actions',
    header: '',
    type: 'actions',
    cellRenderer: ({ row }) => (
      <ActionsCell
        actions={[
          { key: 'edit', label: 'Edit', icon: Edit2 },
          { key: 'duplicate', label: 'Duplicate', icon: Copy },
          { key: 'delete', label: 'Delete', icon: Trash2, destructive: true }
        ]}
        onAction={(action) => handleTransactionAction(action, row.original)}
      />
    )
  }
]
```

## Mobile-Responsive Components

### MobileTableCard Component

Card-based view for mobile devices:

```typescript
interface MobileTableCardProps<T> {
  data: T
  config: MobileCardConfig<T>
  onTap?: (data: T) => void
  onSwipe?: (direction: 'left' | 'right', data: T) => void
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
}

interface MobileCardConfig<T> {
  primaryField: keyof T
  secondaryField?: keyof T
  tertiaryField?: keyof T
  statusField?: keyof T
  amountField?: keyof T
  
  // Custom renderers
  primaryRenderer?: (value: any, data: T) => React.ReactNode
  secondaryRenderer?: (value: any, data: T) => React.ReactNode
  statusRenderer?: (value: any, data: T) => React.ReactNode
  
  // Swipe actions
  swipeActions?: SwipeAction<T>[]
  
  // Styling
  className?: string
  compactMode?: boolean
}

// Example mobile card for transactions
<MobileTableCard
  data={transaction}
  config={{
    primaryField: 'description',
    secondaryField: 'category_name',
    statusField: 'date',
    amountField: 'amount',
    primaryRenderer: (value) => (
      <h3 className="font-semibold text-lg">{value}</h3>
    ),
    secondaryRenderer: (value, data) => (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: data.category_color }}
        />
        {value}
      </div>
    ),
    swipeActions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: Edit2,
        color: 'blue',
        onAction: handleEdit
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: Trash2,
        color: 'red',
        onAction: handleDelete
      }
    ]
  }}
  onTap={handleTransactionTap}
  onSwipe={handleSwipeAction}
/>
```

## Utility Components

### Cell Renderers

Reusable cell components for common data types:

```typescript
// Currency cell with formatting
interface CurrencyCellProps {
  value: number
  currency?: string
  size?: 'sm' | 'md' | 'lg'
  editable?: boolean
  onEdit?: (newValue: number) => Promise<void>
  className?: string
}

// Status badge component
interface StatusBadgeProps {
  status: 'healthy' | 'warning' | 'overspent'
  size?: 'sm' | 'md'
  showIcon?: boolean
}

// Progress bar for categories
interface ProgressBarProps {
  progress: number // 0-100
  status: 'healthy' | 'warning' | 'overspent'
  height?: number
  animated?: boolean
  showLabel?: boolean
}

// Actions cell with dropdown
interface ActionsCellProps<T> {
  actions: Action<T>[]
  onAction: (actionKey: string, data: T) => void
  size?: 'sm' | 'md'
  trigger?: 'click' | 'hover'
}
```

### Filter Components

Specialized filter components for different data types:

```typescript
// Date range filter
interface DateRangeFilterProps {
  value?: { from: Date; to: Date }
  onChange: (range: { from: Date; to: Date } | undefined) => void
  presets?: DateRangePreset[]
}

// Category multi-select filter
interface CategoryFilterProps {
  categories: Category[]
  selectedCategories: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
}

// Amount range filter
interface AmountRangeFilterProps {
  value?: { min: number; max: number }
  onChange: (range: { min: number; max: number } | undefined) => void
  currency?: string
  step?: number
}
```

## Performance Optimizations

### Component Memoization

```typescript
// Memoized table row to prevent unnecessary re-renders
const TableRow = memo<TableRowProps<T>>(({ row, columns, onEdit, onDelete }) => {
  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      {columns.map((column) => (
        <TableCell 
          key={column.id}
          column={column}
          row={row}
          onEdit={onEdit}
        />
      ))}
    </tr>
  )
}, (prevProps, nextProps) => {
  // Custom comparison to prevent re-renders
  return (
    prevProps.row === nextProps.row &&
    prevProps.columns === nextProps.columns &&
    prevProps.onEdit === nextProps.onEdit &&
    prevProps.onDelete === nextProps.onDelete
  )
})

// Virtualized table body for large datasets
const VirtualizedTableBody = memo<VirtualizedTableBodyProps<T>>(({ 
  data, 
  columns, 
  rowHeight = 60,
  containerHeight = 400 
}) => {
  const parentRef = useRef<HTMLDivElement>(null)
  
  const virtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5
  })
  
  return (
    <div ref={parentRef} style={{ height: containerHeight, overflow: 'auto' }}>
      <div style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            <TableRow
              row={data[virtualRow.index]}
              columns={columns}
              index={virtualRow.index}
            />
          </div>
        ))}
      </div>
    </div>
  )
})
```

## Integration Points

### Real-time Updates Integration

The table components integrate with the existing real-time system:

```typescript
// Enhanced table with real-time capabilities
function useRealtimeTable<T extends { id: string }>(
  baseData: T[],
  realtimeConfig: {
    channel: string
    events: string[]
    transform: (payload: any) => Partial<T>
  }
) {
  const [data, setData] = useState(baseData)
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map())
  
  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel(realtimeConfig.channel)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public' 
      }, (payload) => {
        const update = realtimeConfig.transform(payload)
        
        // Apply update to data
        setData(prevData => 
          prevData.map(item => 
            item.id === update.id ? { ...item, ...update } : item
          )
        )
        
        // Remove optimistic update if it exists
        setOptimisticUpdates(prev => {
          const next = new Map(prev)
          next.delete(update.id!)
          return next
        })
      })
      .subscribe()
    
    return () => subscription.unsubscribe()
  }, [realtimeConfig])
  
  // Merge real data with optimistic updates
  const finalData = useMemo(() => {
    return data.map(item => {
      const optimistic = optimisticUpdates.get(item.id)
      return optimistic ? { ...item, ...optimistic, isOptimistic: true } : item
    })
  }, [data, optimisticUpdates])
  
  return {
    data: finalData,
    addOptimisticUpdate: (id: string, update: Partial<T>) => {
      setOptimisticUpdates(prev => new Map(prev).set(id, update as T))
    },
    removeOptimisticUpdate: (id: string) => {
      setOptimisticUpdates(prev => {
        const next = new Map(prev)
        next.delete(id)
        return next
      })
    }
  }
}
```

This architecture provides a solid foundation for building powerful, performant, and accessible table components that seamlessly integrate with the existing Juno budgeting application.