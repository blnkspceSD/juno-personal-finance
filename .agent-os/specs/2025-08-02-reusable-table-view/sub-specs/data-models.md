# Data Models and Types - Reusable Table View

> Created: 2025-08-02
> Spec: Reusable Table View Component

## Overview

This document defines the data models, TypeScript interfaces, and type systems required for the reusable table view component. It extends the existing database types with table-specific enhancements and provides type safety for all table operations.

## Core Table Types

### Generic Table Interfaces

```typescript
// Base table data interface
interface TableData {
  id: string
  created_at: string
  updated_at: string
}

// Generic table configuration
interface TableConfig<T extends TableData> {
  name: string
  description?: string
  columns: ColumnDefinition<T>[]
  features: TableFeatures
  defaultSort?: SortConfig
  defaultFilters?: FilterConfig
  pagination?: PaginationConfig
}

// Table features configuration
interface TableFeatures {
  search: boolean
  filtering: boolean
  sorting: boolean
  pagination: boolean
  selection: boolean
  bulkActions: boolean
  inlineEditing: boolean
  export: boolean
  virtualization: boolean
  realtime: boolean
}

// Sort configuration
interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
  allowMultiple?: boolean
}

// Filter configuration
interface FilterConfig {
  [columnKey: string]: FilterValue
}

type FilterValue = 
  | string 
  | number 
  | boolean 
  | Date 
  | string[] 
  | { min: number; max: number }
  | { from: Date; to: Date }

// Pagination configuration
interface PaginationConfig {
  pageSize: number
  showSizeChanger: boolean
  showQuickJumper: boolean
  showTotal: boolean
  pageSizeOptions: number[]
}
```

### Column Definition System

```typescript
// Enhanced column definition
interface ColumnDefinition<T extends TableData> {
  // Basic properties
  key: keyof T
  title: string
  description?: string
  
  // Data type and behavior
  dataType: DataType
  sortable: boolean
  filterable: boolean
  searchable: boolean
  editable: boolean
  required: boolean
  
  // Display configuration
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align: 'left' | 'center' | 'right'
  fixed?: 'left' | 'right'
  ellipsis: boolean
  
  // Responsive behavior
  responsive: ResponsiveConfig
  
  // Custom renderers
  render?: CellRenderer<T>
  renderFilter?: FilterRenderer<T>
  renderHeader?: HeaderRenderer<T>
  renderMobile?: MobileCellRenderer<T>
  
  // Validation and transformation
  validate?: ValidationRule<T>
  transform?: TransformRule<T>
  format?: FormatRule<T>
  
  // Real-time behavior
  realtime?: RealtimeConfig
}

// Data types supported by the table
type DataType = 
  | 'text'
  | 'number'
  | 'currency'
  | 'percentage'
  | 'date'
  | 'datetime'
  | 'boolean'
  | 'enum'
  | 'array'
  | 'object'
  | 'status'
  | 'progress'
  | 'actions'
  | 'custom'

// Responsive configuration
interface ResponsiveConfig {
  xs?: ResponsiveColumnConfig // < 576px
  sm?: ResponsiveColumnConfig // 576px - 768px
  md?: ResponsiveColumnConfig // 768px - 992px
  lg?: ResponsiveColumnConfig // 992px - 1200px
  xl?: ResponsiveColumnConfig // > 1200px
}

interface ResponsiveColumnConfig {
  visible: boolean
  width?: number | string
  order?: number
  mobileCard?: boolean
}

// Render functions
type CellRenderer<T> = (
  value: any, 
  record: T, 
  index: number, 
  context: CellRenderContext
) => React.ReactNode

type FilterRenderer<T> = (
  column: ColumnDefinition<T>,
  onChange: (value: FilterValue) => void,
  value?: FilterValue
) => React.ReactNode

type HeaderRenderer<T> = (
  column: ColumnDefinition<T>,
  sortConfig?: SortConfig
) => React.ReactNode

type MobileCellRenderer<T> = (
  value: any,
  record: T,
  context: MobileCellRenderContext
) => React.ReactNode

// Render contexts
interface CellRenderContext {
  isEditing: boolean
  isSelected: boolean
  isOptimistic: boolean
  hasError: boolean
  errorMessage?: string
}

interface MobileCellRenderContext {
  position: 'primary' | 'secondary' | 'tertiary'
  isExpanded: boolean
}

// Validation and transformation
type ValidationRule<T> = (value: any, record: T) => ValidationResult

interface ValidationResult {
  isValid: boolean
  message?: string
  severity?: 'error' | 'warning'
}

type TransformRule<T> = (value: any, record: T) => any

type FormatRule<T> = (value: any, record: T) => string

// Real-time configuration
interface RealtimeConfig {
  optimisticUpdates: boolean
  conflictResolution: 'client' | 'server' | 'merge' | 'prompt'
  updateStrategy: 'replace' | 'merge' | 'selective'
  throttle?: number // milliseconds
}
```

## Category Table Data Models

### Extended Category Types

```typescript
// Enhanced category data for table display
interface CategoryTableRow extends Category {
  // Calculated fields
  remaining: number
  percentage_used: number
  percentage_allocated: number
  efficiency_score: number
  
  // Status indicators
  status: CategoryStatus
  allocation_status: AllocationStatus
  spending_trend: SpendingTrend
  
  // Aggregated data
  transaction_count: number
  avg_transaction_amount: number
  last_transaction_date?: Date
  first_transaction_date?: Date
  
  // Time-based metrics
  days_since_last_transaction?: number
  projected_monthly_spend: number
  burn_rate: number // days until category is depleted
  
  // Real-time state
  is_optimistic?: boolean
  pending_amount?: number
  has_pending_transactions?: boolean
  last_updated: Date
}

// Category status enumeration
type CategoryStatus = 
  | 'healthy'      // < 70% spent
  | 'warning'      // 70-90% spent
  | 'critical'     // 90-100% spent
  | 'overspent'    // > 100% spent
  | 'unused'       // 0% spent
  | 'new'          // Recently created

// Allocation status
type AllocationStatus = 
  | 'well_funded'   // Allocation matches historical spending
  | 'under_funded'  // Allocation below historical spending
  | 'over_funded'   // Allocation above historical spending
  | 'no_history'    // No historical data available

// Spending trend
type SpendingTrend = 
  | 'accelerating'  // Spending rate increasing
  | 'steady'        // Consistent spending rate
  | 'slowing'       // Spending rate decreasing
  | 'stopped'       // No recent spending

// Category table column definitions
const categoryTableColumns: ColumnDefinition<CategoryTableRow>[] = [
  {
    key: 'name',
    title: 'Category',
    description: 'The name of this spending category',
    dataType: 'text',
    sortable: true,
    filterable: false,
    searchable: true,
    editable: true,
    required: true,
    width: '25%',
    minWidth: 150,
    align: 'left',
    ellipsis: false,
    responsive: {
      xs: { visible: true, mobileCard: true },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full border" 
          style={{ backgroundColor: record.color }}
        />
        <span className="font-medium">{value}</span>
        {record.is_optimistic && (
          <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
        )}
      </div>
    ),
    validate: (value) => ({
      isValid: value && value.trim().length > 0,
      message: value ? undefined : 'Category name is required'
    }),
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'server',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'allocated',
    title: 'Allocated',
    description: 'Amount budgeted for this category',
    dataType: 'currency',
    sortable: true,
    filterable: true,
    searchable: false,
    editable: true,
    required: true,
    width: '15%',
    minWidth: 100,
    align: 'right',
    ellipsis: false,
    responsive: {
      xs: { visible: true, mobileCard: true },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record, index, context) => (
      <CurrencyCell
        value={value}
        currency="USD"
        editable={context.isEditing}
        size="md"
        status={record.allocation_status}
      />
    ),
    renderFilter: (column, onChange, value) => (
      <CurrencyRangeFilter
        value={value as { min: number; max: number }}
        onChange={onChange}
        placeholder="Filter by allocation"
      />
    ),
    validate: (value) => ({
      isValid: value >= 0,
      message: value < 0 ? 'Allocation cannot be negative' : undefined
    }),
    transform: (value) => Math.max(0, Number(value) || 0),
    format: (value) => formatCurrency(value, 'USD'),
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'client',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'spent',
    title: 'Spent',
    description: 'Total amount spent in this category',
    dataType: 'currency',
    sortable: true,
    filterable: true,
    searchable: false,
    editable: false,
    required: false,
    width: '15%',
    minWidth: 100,
    align: 'right',
    ellipsis: false,
    responsive: {
      xs: { visible: true, mobileCard: true },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <div className="space-y-1">
        <CurrencyCell
          value={value + (record.pending_amount || 0)}
          currency="USD"
          size="md"
          className={record.status === 'overspent' ? 'text-red-600' : undefined}
        />
        {record.pending_amount && (
          <div className="text-xs text-blue-600">
            +{formatCurrency(record.pending_amount)} pending
          </div>
        )}
      </div>
    ),
    renderFilter: (column, onChange, value) => (
      <CurrencyRangeFilter
        value={value as { min: number; max: number }}
        onChange={onChange}
        placeholder="Filter by spent amount"
      />
    ),
    format: (value, record) => {
      const total = value + (record.pending_amount || 0)
      return formatCurrency(total, 'USD')
    },
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'server',
      updateStrategy: 'merge',
      throttle: 500
    }
  },
  {
    key: 'remaining',
    title: 'Remaining',
    description: 'Amount remaining in this category',
    dataType: 'currency',
    sortable: true,
    filterable: true,
    searchable: false,
    editable: false,
    required: false,
    width: '20%',
    minWidth: 120,
    align: 'right',
    ellipsis: false,
    responsive: {
      xs: { visible: true, mobileCard: false },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <div className="space-y-2">
        <CurrencyCell
          value={value}
          currency="USD"
          size="md"
          className={value < 0 ? 'text-red-600 font-semibold' : 'text-green-600'}
        />
        <ProgressBar
          progress={record.percentage_used}
          status={record.status}
          height={4}
          animated={record.has_pending_transactions}
          showLabel={false}
        />
        <div className="text-xs text-muted-foreground">
          {record.percentage_used.toFixed(1)}% used
        </div>
      </div>
    ),
    renderMobile: (value, record) => (
      <div className="flex items-center justify-between">
        <CurrencyCell value={value} size="sm" />
        <ProgressBar
          progress={record.percentage_used}
          status={record.status}
          height={3}
          className="w-16"
        />
      </div>
    ),
    format: (value) => formatCurrency(value, 'USD'),
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'server',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'status',
    title: 'Status',
    description: 'Current status of this category',
    dataType: 'status',
    sortable: true,
    filterable: true,
    searchable: false,
    editable: false,
    required: false,
    width: '15%',
    minWidth: 100,
    align: 'center',
    ellipsis: false,
    responsive: {
      xs: { visible: false },
      sm: { visible: false },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <StatusBadge
        status={value}
        size="md"
        showIcon={true}
        trend={record.spending_trend}
      />
    ),
    renderFilter: (column, onChange, value) => (
      <StatusFilter
        options={[
          { value: 'healthy', label: 'Healthy', color: 'green' },
          { value: 'warning', label: 'Warning', color: 'yellow' },
          { value: 'critical', label: 'Critical', color: 'orange' },
          { value: 'overspent', label: 'Overspent', color: 'red' },
          { value: 'unused', label: 'Unused', color: 'gray' },
          { value: 'new', label: 'New', color: 'blue' }
        ]}
        value={value as CategoryStatus[]}
        onChange={onChange}
        multiple={true}
      />
    ),
    realtime: {
      optimisticUpdates: false,
      conflictResolution: 'server',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'actions',
    title: '',
    description: 'Available actions for this category',
    dataType: 'actions',
    sortable: false,
    filterable: false,
    searchable: false,
    editable: false,
    required: false,
    width: 80,
    minWidth: 80,
    maxWidth: 80,
    align: 'center',
    ellipsis: false,
    responsive: {
      xs: { visible: false },
      sm: { visible: false },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <ActionsMenu
        actions={[
          {
            key: 'edit',
            label: 'Edit Category',
            icon: 'edit',
            onClick: () => handleEditCategory(record)
          },
          {
            key: 'transactions',
            label: 'View Transactions',
            icon: 'list',
            onClick: () => handleViewTransactions(record)
          },
          {
            key: 'duplicate',
            label: 'Duplicate Category',
            icon: 'copy',
            onClick: () => handleDuplicateCategory(record)
          },
          {
            key: 'delete',
            label: 'Delete Category',
            icon: 'trash',
            destructive: true,
            onClick: () => handleDeleteCategory(record),
            disabled: record.transaction_count > 0
          }
        ]}
        size="sm"
        trigger="hover"
      />
    ),
    realtime: {
      optimisticUpdates: false,
      conflictResolution: 'server',
      updateStrategy: 'replace'
    }
  }
]
```

## Transaction Table Data Models

### Extended Transaction Types

```typescript
// Enhanced transaction data for table display
interface TransactionTableRow extends Transaction {
  // Related data
  category_name: string
  category_color: string
  category_status: CategoryStatus
  budget_name: string
  budget_month: string
  
  // Formatted values
  formatted_amount: string
  formatted_date: string
  formatted_time: string
  relative_date: string
  
  // Contextual information
  is_recent: boolean // within last 7 days
  is_large: boolean // above average for category
  is_duplicate: boolean // potential duplicate
  similarity_score?: number // for duplicate detection
  
  // Analytics
  category_impact: number // percentage of category budget
  monthly_impact: number // percentage of monthly spending
  running_balance: number // category balance after this transaction
  
  // Real-time state
  is_optimistic?: boolean
  sync_status: SyncStatus
  last_sync: Date
  conflict_data?: ConflictData
}

// Sync status for real-time updates
type SyncStatus = 
  | 'synced'
  | 'pending'
  | 'failed'
  | 'conflict'

// Conflict resolution data
interface ConflictData {
  server_value: Partial<Transaction>
  client_value: Partial<Transaction>
  timestamp: Date
  resolution_strategy: 'pending' | 'resolved'
}

// Transaction table column definitions
const transactionTableColumns: ColumnDefinition<TransactionTableRow>[] = [
  {
    key: 'date',
    title: 'Date',
    description: 'When this transaction occurred',
    dataType: 'date',
    sortable: true,
    filterable: true,
    searchable: false,
    editable: true,
    required: true,
    width: '12%',
    minWidth: 100,
    align: 'left',
    ellipsis: false,
    responsive: {
      xs: { visible: true, mobileCard: true },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <div className="space-y-1">
        <div className="font-medium">
          {format(new Date(value), 'MMM dd')}
        </div>
        <div className="text-xs text-muted-foreground">
          {record.relative_date}
        </div>
        {record.is_recent && (
          <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
            Recent
          </div>
        )}
      </div>
    ),
    renderMobile: (value, record) => (
      <div className="flex flex-col">
        <span className="font-medium text-sm">
          {format(new Date(value), 'MMM dd, yyyy')}
        </span>
        <span className="text-xs text-muted-foreground">
          {record.relative_date}
        </span>
      </div>
    ),
    renderFilter: (column, onChange, value) => (
      <DateRangeFilter
        value={value as { from: Date; to: Date }}
        onChange={onChange}
        presets={[
          { label: 'Today', value: { from: startOfDay(new Date()), to: endOfDay(new Date()) } },
          { label: 'This Week', value: { from: startOfWeek(new Date()), to: endOfWeek(new Date()) } },
          { label: 'This Month', value: { from: startOfMonth(new Date()), to: endOfMonth(new Date()) } },
          { label: 'Last 30 Days', value: { from: subDays(new Date(), 30), to: new Date() } }
        ]}
      />
    ),
    validate: (value) => ({
      isValid: value && !isNaN(new Date(value).getTime()),
      message: 'Please enter a valid date'
    }),
    transform: (value) => {
      const date = new Date(value)
      return isValid(date) ? date.toISOString().split('T')[0] : value
    },
    format: (value) => format(new Date(value), 'yyyy-MM-dd'),
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'prompt',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'description',
    title: 'Description',
    description: 'What this transaction was for',
    dataType: 'text',
    sortable: true,
    filterable: false,
    searchable: true,
    editable: true,
    required: true,
    width: '30%',
    minWidth: 150,
    align: 'left',
    ellipsis: true,
    responsive: {
      xs: { visible: true, mobileCard: true },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record, index, context) => (
      <div className="space-y-1">
        <div className="font-medium flex items-center gap-2">
          {context.isEditing ? (
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(record.id, 'description', e.target.value)}
              className="w-full px-2 py-1 border rounded"
              autoFocus
            />
          ) : (
            <span title={value}>{value}</span>
          )}
          {record.is_duplicate && (
            <div className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Duplicate?
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: record.category_color }}
          />
          <span>{record.category_name}</span>
          {record.sync_status !== 'synced' && (
            <SyncStatusIndicator status={record.sync_status} />
          )}
        </div>
      </div>
    ),
    renderMobile: (value, record) => (
      <div className="space-y-1">
        <h3 className="font-semibold text-base line-clamp-2">{value}</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: record.category_color }}
          />
          <span>{record.category_name}</span>
        </div>
      </div>
    ),
    validate: (value) => ({
      isValid: value && value.trim().length > 0,
      message: 'Description is required'
    }),
    transform: (value) => value?.trim() || '',
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'merge',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'amount',
    title: 'Amount',
    description: 'How much was spent',
    dataType: 'currency',
    sortable: true,
    filterable: true,
    searchable: false,
    editable: true,
    required: true,
    width: '15%',
    minWidth: 100,
    align: 'right',
    ellipsis: false,
    responsive: {
      xs: { visible: true, mobileCard: true },
      sm: { visible: true },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record, index, context) => (
      <div className="space-y-1">
        <CurrencyCell
          value={value}
          currency="USD"
          size="lg"
          editable={context.isEditing}
          className={record.is_large ? 'font-bold text-orange-600' : undefined}
        />
        <div className="text-xs text-muted-foreground">
          {record.category_impact.toFixed(1)}% of category
        </div>
      </div>
    ),
    renderMobile: (value, record) => (
      <div className="text-right">
        <CurrencyCell
          value={value}
          currency="USD"
          size="lg"
          className={record.is_large ? 'font-bold text-orange-600' : 'font-semibold'}
        />
        <div className="text-xs text-muted-foreground">
          {record.category_impact.toFixed(1)}% of budget
        </div>
      </div>
    ),
    renderFilter: (column, onChange, value) => (
      <CurrencyRangeFilter
        value={value as { min: number; max: number }}
        onChange={onChange}
        placeholder="Filter by amount"
        presets={[
          { label: 'Under $10', value: { min: 0, max: 10 } },
          { label: '$10 - $50', value: { min: 10, max: 50 } },
          { label: '$50 - $100', value: { min: 50, max: 100 } },
          { label: 'Over $100', value: { min: 100, max: Infinity } }
        ]}
      />
    ),
    validate: (value) => ({
      isValid: value > 0,
      message: value <= 0 ? 'Amount must be greater than zero' : undefined
    }),
    transform: (value) => Math.abs(Number(value) || 0),
    format: (value) => formatCurrency(value, 'USD'),
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'client',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'category_name',
    title: 'Category',
    description: 'Which budget category this belongs to',
    dataType: 'text',
    sortable: true,
    filterable: true,
    searchable: true,
    editable: true,
    required: true,
    width: '18%',
    minWidth: 120,
    align: 'left',
    ellipsis: false,
    responsive: {
      xs: { visible: false },
      sm: { visible: false },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record, index, context) => (
      <div className="flex items-center gap-2">
        <div 
          className="w-3 h-3 rounded-full border"
          style={{ backgroundColor: record.category_color }}
        />
        {context.isEditing ? (
          <CategorySelect
            value={record.category_id}
            onChange={(categoryId) => handleFieldChange(record.id, 'category_id', categoryId)}
            budgetId={record.budget_id}
          />
        ) : (
          <div className="space-y-1">
            <span className="font-medium">{value}</span>
            <StatusBadge
              status={record.category_status}
              size="sm"
              showIcon={false}
            />
          </div>
        )}
      </div>
    ),
    renderFilter: (column, onChange, value) => (
      <CategoryMultiSelect
        value={value as string[]}
        onChange={onChange}
        placeholder="Filter by category"
        showStatus={true}
      />
    ),
    realtime: {
      optimisticUpdates: true,
      conflictResolution: 'server',
      updateStrategy: 'replace'
    }
  },
  {
    key: 'actions',
    title: '',
    description: 'Available actions for this transaction',
    dataType: 'actions',
    sortable: false,
    filterable: false,
    searchable: false,
    editable: false,
    required: false,
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    align: 'center',
    ellipsis: false,
    responsive: {
      xs: { visible: false },
      sm: { visible: false },
      md: { visible: true },
      lg: { visible: true },
      xl: { visible: true }
    },
    render: (value, record) => (
      <ActionsMenu
        actions={[
          {
            key: 'edit',
            label: 'Edit Transaction',
            icon: 'edit',
            onClick: () => handleEditTransaction(record)
          },
          {
            key: 'duplicate',
            label: 'Duplicate Transaction',
            icon: 'copy',
            onClick: () => handleDuplicateTransaction(record)
          },
          {
            key: 'receipt',
            label: 'Add Receipt',
            icon: 'paperclip',
            onClick: () => handleAddReceipt(record),
            disabled: !!record.receipt_url
          },
          {
            key: 'delete',
            label: 'Delete Transaction',
            icon: 'trash',
            destructive: true,
            onClick: () => handleDeleteTransaction(record)
          }
        ]}
        size="sm"
        trigger="click"
      />
    ),
    realtime: {
      optimisticUpdates: false,
      conflictResolution: 'server',
      updateStrategy: 'replace'
    }
  }
]
```

## Filter System Data Models

### Filter Configuration Types

```typescript
// Filter system configuration
interface FilterSystem<T extends TableData> {
  filters: FilterDefinition<T>[]
  activeFilters: ActiveFilter[]
  savedFilters: SavedFilter[]
  quickFilters: QuickFilter<T>[]
}

// Individual filter definition
interface FilterDefinition<T extends TableData> {
  key: string
  label: string
  type: FilterType
  column: keyof T
  options?: FilterOption[]
  validation?: FilterValidation
  defaultValue?: FilterValue
}

// Filter types supported
type FilterType = 
  | 'text'
  | 'number'
  | 'currency'
  | 'date'
  | 'dateRange'
  | 'select'
  | 'multiSelect'
  | 'boolean'
  | 'range'
  | 'custom'

// Filter option for select/multiSelect
interface FilterOption {
  value: string | number | boolean
  label: string
  color?: string
  icon?: string
  count?: number
  disabled?: boolean
}

// Active filter instance
interface ActiveFilter {
  key: string
  value: FilterValue
  operator?: FilterOperator
  label?: string
}

type FilterOperator = 
  | 'equals'
  | 'notEquals'
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'greaterThan'
  | 'lessThan'
  | 'greaterThanOrEqual'
  | 'lessThanOrEqual'
  | 'between'
  | 'in'
  | 'notIn'

// Saved filter preset
interface SavedFilter {
  id: string
  name: string
  description?: string
  filters: ActiveFilter[]
  isDefault?: boolean
  isPublic?: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Quick filter for common scenarios
interface QuickFilter<T extends TableData> {
  key: string
  label: string
  icon?: string
  filters: ActiveFilter[]
  count?: number
  isActive?: boolean
}

// Filter validation
interface FilterValidation {
  required?: boolean
  min?: number
  max?: number
  pattern?: RegExp
  custom?: (value: FilterValue) => ValidationResult
}
```

## State Management Types

### Table State Interface

```typescript
// Complete table state
interface TableState<T extends TableData> {
  // Data state
  data: T[]
  filteredData: T[]
  selectedRows: T[]
  
  // UI state
  isLoading: boolean
  error: string | null
  pagination: PaginationState
  sorting: SortingState
  filtering: FilteringState
  selection: SelectionState
  editing: EditingState
  
  // Real-time state
  realtime: RealtimeState
  
  // Configuration
  config: TableConfig<T>
  features: TableFeatures
}

// Pagination state
interface PaginationState {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// Sorting state
interface SortingState {
  column?: string
  direction?: 'asc' | 'desc'
  multiSort?: SortColumn[]
}

interface SortColumn {
  column: string
  direction: 'asc' | 'desc'
  priority: number
}

// Filtering state
interface FilteringState {
  activeFilters: ActiveFilter[]
  searchQuery: string
  quickFilter?: string
  savedFilter?: string
}

// Selection state
interface SelectionState {
  selectedRowIds: string[]
  isAllSelected: boolean
  isPartiallySelected: boolean
  selectionMode: 'single' | 'multiple'
}

// Editing state
interface EditingState {
  editingRowId?: string
  editingField?: string
  originalValue?: any
  isInlineEditing: boolean
  hasUnsavedChanges: boolean
  validationErrors: ValidationError[]
}

interface ValidationError {
  field: string
  message: string
  severity: 'error' | 'warning'
}

// Real-time state
interface RealtimeState {
  isConnected: boolean
  isReconnecting: boolean
  hasError: boolean
  lastUpdate: Date
  optimisticUpdates: Map<string, any>
  conflictedRows: Map<string, ConflictData>
  subscribedChannels: string[]
}
```

## Utility Types and Helpers

### Data Transformation Types

```typescript
// Data transformation utilities
type DataTransformer<TInput, TOutput> = (input: TInput) => TOutput

// Common transformers
interface DataTransformers {
  categoryToTableRow: DataTransformer<Category, CategoryTableRow>
  transactionToTableRow: DataTransformer<Transaction, TransactionTableRow>
  tableRowToCategory: DataTransformer<CategoryTableRow, Category>
  tableRowToTransaction: DataTransformer<TransactionTableRow, Transaction>
}

// Aggregation utilities
interface AggregationConfig<T> {
  groupBy?: keyof T
  aggregations: {
    [key: string]: AggregationFunction<T>
  }
}

type AggregationFunction<T> = 
  | 'sum'
  | 'avg' 
  | 'min'
  | 'max'
  | 'count'
  | 'first'
  | 'last'
  | ((values: T[]) => any)

// Performance monitoring
interface PerformanceMetrics {
  renderTime: number
  dataProcessingTime: number
  filterTime: number
  sortTime: number
  totalRows: number
  visibleRows: number
  memoryUsage?: number
}
```

This comprehensive data model specification provides type safety, extensibility, and clear contracts for all table-related operations in the Juno budgeting application. The models support both basic table functionality and advanced features like real-time updates, optimistic UI, and conflict resolution.