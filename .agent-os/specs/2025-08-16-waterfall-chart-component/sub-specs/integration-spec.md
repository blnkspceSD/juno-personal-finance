# Integration Specification

This is the integration implementation for the spec detailed in @.agent-os/specs/2025-08-16-waterfall-chart-component/spec.md

> Created: 2025-08-16
> Version: 1.0.0

## Dashboard Integration Requirements

### Component Integration Architecture

**Dashboard Layout Integration**
```typescript
// Update to existing RealtimeDashboard component
interface RealtimeDashboardProps {
  // ... existing props
  waterfallChartData?: WaterfallChartData
  showWaterfallChart?: boolean
}

// Integration within dashboard tabs
const DashboardTabs = {
  SPENDING: 'spending',
  NET_WORTH: 'net-worth', 
  INVESTMENTS: 'investments',
  CASH_FLOW: 'cash-flow' // New tab for waterfall chart
} as const
```

**Tab Navigation Enhancement**
```tsx
// Update to dashboard tab structure
const dashboardTabs = [
  {
    id: 'spending',
    label: 'Spending',
    icon: CreditCardIcon,
    component: SpendingOverview
  },
  {
    id: 'net-worth',
    label: 'Net Worth',
    icon: TrendingUpIcon,
    component: NetWorthOverview
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: ChartBarIcon,
    component: InvestmentsOverview
  },
  {
    id: 'cash-flow',
    label: 'Cash Flow',
    icon: ArrowsUpDownIcon,
    component: CashFlowOverview // Contains waterfall chart
  }
]

// New CashFlowOverview component
const CashFlowOverview = ({ waterfallData, monthlySpendingData }: Props) => (
  <div className="cash-flow-overview">
    <div className="space-y-juno-6">
      {/* Monthly summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-juno-4">
        <MetricCard 
          title="Total Income" 
          value={waterfallData.totalIncome} 
          type="income" 
        />
        <MetricCard 
          title="Total Expenses" 
          value={waterfallData.totalExpenses} 
          type="expense" 
        />
        <MetricCard 
          title="Net Result" 
          value={waterfallData.netResult} 
          type={waterfallData.netResult >= 0 ? 'income' : 'expense'} 
        />
      </div>
      
      {/* Waterfall chart */}
      <WaterfallChartContainer data={waterfallData} />
      
      {/* Supporting analysis */}
      <CashFlowInsights data={waterfallData} />
    </div>
  </div>
)
```

### Data Fetching Integration

**Enhanced Dashboard Data Fetching**
```typescript
// Update to dashboard page.tsx
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Existing data fetching...
  const [
    currentBudget,
    monthlySpendingData,
    recentTransactions,
    categoryGroupsData,
    unassignedCategories,
    waterfallChartData // New data requirement
  ] = await Promise.all([
    getCurrentMonthBudget(),
    getMonthlySpendingData(),
    getRecentTransactions(5),
    getCategoryGroupsWithCategories(),
    getUnassignedCategories(),
    getWaterfallChartData() // New query function
  ])

  return (
    <RealtimeDashboard 
      // ... existing props
      waterfallChartData={waterfallChartData}
    />
  )
}
```

**New Supabase Query Function**
```typescript
// Add to /src/lib/supabase/queries.ts
export async function getWaterfallChartData(
  month?: string
): Promise<WaterfallChartData | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const targetMonth = month || new Date().toISOString().slice(0, 7) // YYYY-MM format
  const startDate = `${targetMonth}-01`
  const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 0)
    .toISOString().slice(0, 10)

  try {
    // Fetch transactions with category information for the specified month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        date,
        description,
        type,
        category_id,
        categories!inner(
          id,
          name,
          type,
          description,
          is_essential
        )
      `)
      .eq('user_id', user.id)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching waterfall chart data:', error)
      return null
    }

    // Transform the data using waterfall utilities
    const waterfallData = transformTransactionsToWaterfall(
      transactions || [],
      targetMonth
    )

    return waterfallData
  } catch (error) {
    console.error('Error processing waterfall chart data:', error)
    return null
  }
}

// Enhanced transaction fetching with category details
export async function getTransactionsWithCategoryDetails(
  startDate: string,
  endDate: string
): Promise<TransactionWithCategory[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories!inner(
        id,
        name,
        type,
        description,
        color,
        is_essential
      )
    `)
    .eq('user_id', user.id)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })

  if (error) {
    console.error('Error fetching transactions with categories:', error)
    return []
  }

  return data || []
}
```

### Real-time Updates Integration

**Supabase Real-time Subscription Enhancement**
```typescript
// Update to RealtimeDashboard component
export function RealtimeDashboard({ 
  initialBudget, 
  user, 
  monthlySpendingData,
  recentTransactions,
  categoryGroups,
  categoriesByGroup,
  unassignedCategories,
  waterfallChartData: initialWaterfallData
}: RealtimeDashboardProps) {
  // ... existing state
  const [waterfallData, setWaterfallData] = useState(initialWaterfallData)
  const [waterfallLoading, setWaterfallLoading] = useState(false)

  // Enhanced real-time subscription
  useEffect(() => {
    if (!user) return

    const supabase = createClient()
    
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('Transaction change detected:', payload)
          
          // Update existing data
          if (payload.eventType === 'INSERT') {
            // ... existing logic
            
            // Update waterfall chart data
            await refreshWaterfallData()
          } else if (payload.eventType === 'UPDATE' || payload.eventType === 'DELETE') {
            // ... existing logic
            
            // Update waterfall chart data
            await refreshWaterfallData()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  // Function to refresh waterfall chart data
  const refreshWaterfallData = async () => {
    setWaterfallLoading(true)
    try {
      const newWaterfallData = await getWaterfallChartData()
      setWaterfallData(newWaterfallData)
    } catch (error) {
      console.error('Error refreshing waterfall data:', error)
    } finally {
      setWaterfallLoading(false)
    }
  }

  // ... rest of component
}
```

### State Management Integration

**Enhanced Dashboard State**
```typescript
interface DashboardState {
  // ... existing state
  waterfallData: WaterfallChartData | null
  waterfallLoading: boolean
  waterfallError: string | null
  selectedMonth: string
  chartFilters: {
    showSmallExpenses: boolean
    groupSimilarCategories: boolean
    sortBy: 'magnitude' | 'alphabetical' | 'category-type'
  }
}

// State management for chart interactions
const useDashboardState = () => {
  const [state, setState] = useState<DashboardState>({
    // ... existing initial state
    waterfallData: null,
    waterfallLoading: false,
    waterfallError: null,
    selectedMonth: new Date().toISOString().slice(0, 7),
    chartFilters: {
      showSmallExpenses: true,
      groupSimilarCategories: false,
      sortBy: 'magnitude'
    }
  })

  const updateWaterfallData = useCallback((data: WaterfallChartData) => {
    setState(prev => ({ ...prev, waterfallData: data, waterfallError: null }))
  }, [])

  const setWaterfallLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, waterfallLoading: loading }))
  }, [])

  const setWaterfallError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, waterfallError: error }))
  }, [])

  const updateSelectedMonth = useCallback((month: string) => {
    setState(prev => ({ ...prev, selectedMonth: month }))
  }, [])

  return {
    state,
    updateWaterfallData,
    setWaterfallLoading,
    setWaterfallError,
    updateSelectedMonth
  }
}
```

### Component Integration Points

**WaterfallChart Container Integration**
```tsx
// Main container component for dashboard integration
export const WaterfallChartContainer = ({ 
  data, 
  isLoading, 
  error,
  onRetry,
  onCategoryClick 
}: WaterfallChartContainerProps) => {
  if (isLoading) {
    return <WaterfallChartSkeleton />
  }

  if (error) {
    return <WaterfallChartError error={error} onRetry={onRetry} />
  }

  if (!data || data.dataPoints.length === 0) {
    return <WaterfallChartEmpty />
  }

  return (
    <div className="waterfall-chart-container">
      <div className="waterfall-chart-header">
        <h3 className="waterfall-chart-title">Monthly Cash Flow</h3>
        <p className="waterfall-chart-subtitle">
          Income → Expenses → Net Result for {data.month}
        </p>
      </div>
      
      <WaterfallChart 
        data={data.dataPoints}
        onCategoryClick={onCategoryClick}
        height={400}
        showTooltip={true}
      />
      
      <WaterfallLegend data={data} />
    </div>
  )
}

// Integration with existing table components
export const WaterfallCategoryBreakdown = ({ 
  category, 
  transactions 
}: { 
  category: string
  transactions: Transaction[] 
}) => (
  <div className="waterfall-category-breakdown">
    <h4 className="text-juno-text font-semibold mb-juno-3">
      {category} Breakdown
    </h4>
    
    {/* Reuse existing table components */}
    <ReusableTable
      data={transactions}
      columns={transactionColumns}
      variant="minimal"
      showPagination={false}
    />
  </div>
)
```

### Navigation Integration

**Enhanced Tab Navigation**
```tsx
// Update to existing TabNavigation component
export const TabNavigation = ({ 
  activeTab, 
  onTabChange, 
  waterfallDataAvailable 
}: TabNavigationProps) => {
  const tabs = [
    {
      id: 'spending',
      label: 'Spending',
      icon: CreditCardIcon,
      badge: null
    },
    {
      id: 'net-worth',
      label: 'Net Worth',
      icon: TrendingUpIcon,
      badge: null
    },
    {
      id: 'investments',
      label: 'Investments',
      icon: ChartBarIcon,
      badge: null
    },
    {
      id: 'cash-flow',
      label: 'Cash Flow',
      icon: ArrowsUpDownIcon,
      badge: waterfallDataAvailable ? null : 'New',
      disabled: !waterfallDataAvailable
    }
  ]

  return (
    <div className="tab-navigation">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={cn(
            'tab-navigation__item',
            activeTab === tab.id && 'tab-navigation__item--active',
            tab.disabled && 'tab-navigation__item--disabled'
          )}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
        >
          <tab.icon className="tab-navigation__icon" />
          <span className="tab-navigation__label">{tab.label}</span>
          {tab.badge && (
            <span className="tab-navigation__badge">{tab.badge}</span>
          )}
        </button>
      ))}
    </div>
  )
}
```

### Error Handling Integration

**Comprehensive Error Handling**
```typescript
// Error handling for waterfall chart integration
export const useWaterfallChartErrorHandling = () => {
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  const handleError = useCallback((errorMessage: string, errorType: 'fetch' | 'transform' | 'render') => {
    console.error(`Waterfall chart ${errorType} error:`, errorMessage)
    
    // Categorize errors for user-friendly messages
    const userFriendlyMessages = {
      fetch: 'Unable to load transaction data. Please check your connection.',
      transform: 'Error processing financial data. Please try again.',
      render: 'Chart display error. Please refresh the page.'
    }
    
    setError(userFriendlyMessages[errorType] || errorMessage)
  }, [])

  const retryOperation = useCallback(async (operation: () => Promise<void>) => {
    if (retryCount >= maxRetries) {
      setError('Maximum retry attempts reached. Please refresh the page.')
      return
    }

    setRetryCount(prev => prev + 1)
    setError(null)
    
    try {
      await operation()
      setRetryCount(0) // Reset on success
    } catch (error) {
      handleError(error.message, 'fetch')
    }
  }, [retryCount, maxRetries, handleError])

  const clearError = useCallback(() => {
    setError(null)
    setRetryCount(0)
  }, [])

  return {
    error,
    retryCount,
    handleError,
    retryOperation,
    clearError,
    canRetry: retryCount < maxRetries
  }
}
```

### Performance Integration

**Optimized Data Loading**
```typescript
// Performance optimizations for dashboard integration
export const useOptimizedWaterfallData = (initialData: WaterfallChartData | null) => {
  const [data, setData] = useState(initialData)
  const [isLoading, setIsLoading] = useState(false)
  
  // Memoize expensive calculations
  const chartData = useMemo(() => {
    if (!data) return null
    return transformDataForChart(data)
  }, [data])

  // Debounce data updates to prevent excessive re-renders
  const debouncedUpdateData = useMemo(
    () => debounce((newData: WaterfallChartData) => {
      setData(newData)
    }, 300),
    []
  )

  // Cache data to prevent unnecessary API calls
  const cachedDataRef = useRef<Map<string, WaterfallChartData>>(new Map())

  const loadDataForMonth = useCallback(async (month: string) => {
    // Check cache first
    const cached = cachedDataRef.current.get(month)
    if (cached) {
      setData(cached)
      return
    }

    setIsLoading(true)
    try {
      const newData = await getWaterfallChartData(month)
      if (newData) {
        cachedDataRef.current.set(month, newData)
        debouncedUpdateData(newData)
      }
    } catch (error) {
      console.error('Error loading waterfall data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedUpdateData])

  return {
    data: chartData,
    isLoading,
    loadDataForMonth,
    clearCache: () => cachedDataRef.current.clear()
  }
}
```

This integration specification ensures seamless incorporation of the waterfall chart component into the existing Juno dashboard architecture while maintaining performance, accessibility, and user experience standards established by the current system.