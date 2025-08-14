# Component Architecture - Dashboard Layout Implementation

This is the component architecture specification for the spec detailed in @.agent-os/specs/2025-08-13-dashboard-layout-implementation/spec.md

> Created: 2025-08-13
> Version: 1.0.0

## Component Breakdown

### Overview

The dashboard layout implementation follows a modular component architecture with clear separation of concerns, reusable components, and proper data flow patterns. Each component is designed to be self-contained while maintaining consistency with the Juno Design System.

### Component Hierarchy

```
DashboardPage (Server Component)
├── DashboardHeader (Server Component)
│   ├── PageTitle
│   └── LastUpdatedIndicator
├── TabNavigation (Client Component)
│   ├── TabList
│   │   ├── Tab (Spending)
│   │   ├── Tab (Net worth)
│   │   └── Tab (Investments)
│   └── TabPanels
│       ├── SpendingPanel
│       ├── NetworthPanel
│       └── InvestmentsPanel
├── DashboardContent (Conditional Rendering)
│   ├── MetricDisplay (Server/Client Hybrid)
│   │   ├── MetricValue
│   │   ├── MetricLabel
│   │   └── ProgressBar
│   ├── ChartContainer (Client Component)
│   │   ├── ChartHeader
│   │   ├── ChartPlaceholder
│   │   └── ChartLegend
│   └── RecentTransactions (Server Component)
│       ├── SectionHeader
│       ├── AddTransactionButton (Client Component)
│       └── TransactionTable
│           ├── TableHeader
│           ├── TableBody
│           └── EmptyState
```

## Core Components

### 1. DashboardPage Component

**File**: `src/app/dashboard/page.tsx`  
**Type**: Server Component  
**Purpose**: Main page wrapper and layout orchestration

```typescript
interface DashboardPageProps {
  searchParams?: {
    tab?: 'spending' | 'networth' | 'investments';
  };
}

export default function DashboardPage({ searchParams }: DashboardPageProps) {
  const initialTab = searchParams?.tab || 'spending';

  return (
    <main 
      className="min-h-screen bg-juno-surface-50 p-juno-4 lg:p-juno-8"
      role="main"
      aria-label="Financial Dashboard"
    >
      <div className="max-w-7xl mx-auto space-y-juno-8">
        <DashboardHeader />
        <TabNavigation initialTab={initialTab} />
      </div>
    </main>
  );
}

export const metadata: Metadata = {
  title: 'Dashboard | Juno Finance',
  description: 'Your financial overview and spending insights',
};
```

**Key Features**:
- Server-side rendering for SEO and performance
- URL-based tab state for deep linking
- Semantic HTML structure with ARIA landmarks
- Responsive container with max-width constraints

### 2. TabNavigation Component

**File**: `src/components/dashboard/TabNavigation.tsx`  
**Type**: Client Component  
**Purpose**: Tab switching interface with state management

```typescript
interface TabNavigationProps {
  initialTab?: TabType;
  className?: string;
}

export interface TabType {
  id: 'spending' | 'networth' | 'investments';
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  component: React.ComponentType;
}

export function TabNavigation({ initialTab = 'spending', className }: TabNavigationProps) {
  const [activeTab, setActiveTab] = useState<TabType['id']>(initialTab);
  const router = useRouter();

  const tabs: TabType[] = [
    { id: 'spending', label: 'Spending', component: SpendingPanel },
    { id: 'networth', label: 'Net worth', component: NetworthPanel },
    { id: 'investments', label: 'Investments', component: InvestmentsPanel },
  ];

  const handleTabChange = useCallback((tabId: TabType['id']) => {
    setActiveTab(tabId);
    router.push(`/dashboard?tab=${tabId}`, { scroll: false });
  }, [router]);

  return (
    <div className={cn("space-y-juno-6", className)}>
      <TabList 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <TabPanels 
        tabs={tabs}
        activeTab={activeTab}
      />
    </div>
  );
}
```

**Key Features**:
- URL state synchronization for bookmarkable tabs
- Keyboard navigation support (arrow keys)
- Smooth tab switching with minimal re-renders
- Accessible ARIA implementation

#### TabList Subcomponent

```typescript
interface TabListProps {
  tabs: TabType[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

function TabList({ tabs, activeTab, onTabChange }: TabListProps) {
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    switch (e.key) {
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        // Navigate to next/previous tab
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onTabChange(tabId);
        break;
    }
  };

  return (
    <div 
      role="tablist"
      aria-label="Dashboard Views"
      className="flex border-b border-juno-border"
    >
      {tabs.map((tab, index) => (
        <button
          key={tab.id}
          role="tab"
          tabIndex={activeTab === tab.id ? 0 : -1}
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          className={cn(
            "px-juno-4 py-juno-3 font-medium transition-colors",
            "border-b-2 border-transparent",
            "hover:bg-juno-surface-100 focus:outline-none focus:ring-2 focus:ring-juno-focus-ring",
            activeTab === tab.id && [
              "border-juno-accent text-juno-accent",
              "bg-juno-surface-100"
            ],
            activeTab !== tab.id && "text-juno-muted-fg hover:text-juno-text"
          )}
          onClick={() => onTabChange(tab.id)}
          onKeyDown={(e) => handleKeyDown(e, tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
```

### 3. MetricDisplay Component

**File**: `src/components/dashboard/MetricDisplay.tsx`  
**Type**: Server Component with Client Interactivity  
**Purpose**: Large spending metric with progress visualization

```typescript
interface MetricDisplayProps {
  currentAmount: number;
  budgetLimit: number;
  label?: string;
  isLoading?: boolean;
  className?: string;
}

export function MetricDisplay({ 
  currentAmount, 
  budgetLimit, 
  label = "Current Spending",
  isLoading = false,
  className 
}: MetricDisplayProps) {
  const progressPercentage = Math.min((currentAmount / budgetLimit) * 100, 100);
  const formattedCurrent = formatCurrency(currentAmount);
  const formattedBudget = formatCurrency(budgetLimit);

  if (isLoading) {
    return <MetricDisplaySkeleton className={className} />;
  }

  return (
    <div className={cn(
      "bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke",
      "p-juno-6 space-y-juno-4",
      className
    )}>
      <div className="space-y-juno-2">
        <h2 className="text-juno-muted-fg text-juno-fs-sm font-medium">
          {label}
        </h2>
        <div className="space-y-juno-1">
          <MetricValue 
            current={formattedCurrent}
            budget={formattedBudget}
            className="text-juno-fs-2xl lg:text-juno-fs-3xl font-bold text-juno-text"
          />
          <ProgressBar 
            percentage={progressPercentage}
            showLabel
            status={getProgressStatus(progressPercentage)}
          />
        </div>
      </div>
    </div>
  );
}

function getProgressStatus(percentage: number): 'success' | 'warning' | 'danger' {
  if (percentage <= 70) return 'success';
  if (percentage <= 90) return 'warning';
  return 'danger';
}
```

#### MetricValue Subcomponent

```typescript
interface MetricValueProps {
  current: string;
  budget: string;
  className?: string;
}

function MetricValue({ current, budget, className }: MetricValueProps) {
  return (
    <div className={className}>
      <span className="tabular-nums font-mono">
        {current}
      </span>
      <span className="text-juno-muted-fg font-normal text-juno-fs-lg">
        {' '} / {budget}
      </span>
    </div>
  );
}
```

### 4. ProgressBar Component

**File**: `src/components/dashboard/ProgressBar.tsx`  
**Type**: Client Component  
**Purpose**: Animated progress indicator with accessibility

```typescript
interface ProgressBarProps {
  percentage: number;
  showLabel?: boolean;
  status?: 'success' | 'warning' | 'danger';
  className?: string;
  animated?: boolean;
}

export function ProgressBar({ 
  percentage, 
  showLabel = false,
  status = 'success',
  className,
  animated = true 
}: ProgressBarProps) {
  const [displayPercentage, setDisplayPercentage] = useState(0);
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayPercentage(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      setDisplayPercentage(percentage);
    }
  }, [percentage, animated]);

  const statusColors = {
    success: 'bg-juno-success-bg',
    warning: 'bg-juno-warning-bg', 
    danger: 'bg-juno-danger-bg',
  };

  return (
    <div className={cn("space-y-juno-2", className)}>
      <div 
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(percentage)}% of budget used`}
        className="w-full bg-juno-surface-200 rounded-juno-full h-juno-2 overflow-hidden"
      >
        <div
          className={cn(
            "h-full rounded-juno-full transition-all duration-1000 ease-out",
            statusColors[status]
          )}
          style={{ 
            width: `${displayPercentage}%`,
            transformOrigin: 'left center'
          }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-juno-fs-sm text-juno-muted-fg">
          <span>{Math.round(percentage)}% used</span>
          <span>{100 - Math.round(percentage)}% remaining</span>
        </div>
      )}
    </div>
  );
}
```

### 5. ChartContainer Component

**File**: `src/components/dashboard/ChartContainer.tsx`  
**Type**: Client Component  
**Purpose**: Chart visualization wrapper with responsive behavior

```typescript
interface ChartContainerProps {
  title?: string;
  data?: ChartDataPoint[];
  isLoading?: boolean;
  error?: string;
  className?: string;
}

export function ChartContainer({ 
  title = "Monthly Spending",
  data = [],
  isLoading = false,
  error,
  className 
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ 
          width: offsetWidth, 
          height: Math.max(300, offsetHeight) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className={cn(
      "bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke",
      "p-juno-6",
      className
    )}>
      <ChartHeader title={title} />
      <div 
        ref={containerRef}
        className="min-h-[300px] relative"
        role="img"
        aria-label="Monthly spending chart"
      >
        {isLoading && <ChartSkeleton />}
        {error && <ChartError message={error} />}
        {!isLoading && !error && (
          <ChartPlaceholder 
            data={data}
            width={dimensions.width}
            height={dimensions.height}
          />
        )}
      </div>
      <ChartLegend />
    </div>
  );
}
```

#### ChartPlaceholder Subcomponent

```typescript
interface ChartPlaceholderProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
}

function ChartPlaceholder({ data, width, height }: ChartPlaceholderProps) {
  // Mock bar chart visualization
  const maxValue = Math.max(...data.map(d => d.amount));
  const barWidth = Math.max(20, (width - 100) / data.length - 10);

  return (
    <div className="flex items-end justify-center h-full gap-juno-2 p-juno-4">
      {data.map((point, index) => {
        const barHeight = (point.amount / maxValue) * (height - 100);
        return (
          <div key={point.month} className="flex flex-col items-center gap-juno-1">
            <div
              className="bg-juno-accent rounded-juno-sm transition-all duration-500 ease-out"
              style={{
                width: barWidth,
                height: barHeight,
                animationDelay: `${index * 100}ms`
              }}
              role="img"
              aria-label={`${point.month}: ${formatCurrency(point.amount)}`}
            />
            <span className="text-juno-fs-xs text-juno-muted-fg font-medium">
              {point.month}
            </span>
          </div>
        );
      })}
    </div>
  );
}
```

### 6. RecentTransactions Component

**File**: `src/components/dashboard/RecentTransactions.tsx`  
**Type**: Server Component  
**Purpose**: Transaction list with table layout

```typescript
interface RecentTransactionsProps {
  transactions?: TransactionPreview[];
  isLoading?: boolean;
  className?: string;
}

export function RecentTransactions({ 
  transactions = [],
  isLoading = false,
  className 
}: RecentTransactionsProps) {
  return (
    <section 
      className={cn(
        "bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke",
        className
      )}
      aria-labelledby="recent-transactions-title"
    >
      <SectionHeader 
        id="recent-transactions-title"
        title="Recent Transactions"
        action={<AddTransactionButton />}
      />
      <div className="p-juno-6 pt-0">
        {isLoading ? (
          <TransactionTableSkeleton />
        ) : transactions.length > 0 ? (
          <TransactionTable transactions={transactions} />
        ) : (
          <EmptyTransactionsState />
        )}
      </div>
    </section>
  );
}
```

#### TransactionTable Subcomponent

```typescript
interface TransactionTableProps {
  transactions: TransactionPreview[];
}

function TransactionTable({ transactions }: TransactionTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        <thead>
          <tr className="border-b border-juno-border">
            <th className="text-left py-juno-3 text-juno-fs-sm font-semibold text-juno-muted-fg">
              Description
            </th>
            <th className="text-left py-juno-3 text-juno-fs-sm font-semibold text-juno-muted-fg">
              Category
            </th>
            <th className="text-right py-juno-3 text-juno-fs-sm font-semibold text-juno-muted-fg">
              Amount
            </th>
            <th className="text-right py-juno-3 text-juno-fs-sm font-semibold text-juno-muted-fg">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction, index) => (
            <TransactionRow 
              key={transaction.id}
              transaction={transaction}
              isLast={index === transactions.length - 1}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TransactionRow({ transaction, isLast }: { 
  transaction: TransactionPreview; 
  isLast: boolean; 
}) {
  const isExpense = transaction.amount < 0;
  
  return (
    <tr className={cn(
      "hover:bg-juno-surface-50 transition-colors",
      !isLast && "border-b border-juno-border/50"
    )}>
      <td className="py-juno-3 text-juno-text font-medium">
        {transaction.description}
      </td>
      <td className="py-juno-3">
        <span className="inline-flex px-juno-2 py-juno-1 rounded-juno-sm bg-juno-pill-bg text-juno-pill-fg text-juno-fs-xs font-medium">
          {transaction.category}
        </span>
      </td>
      <td className={cn(
        "py-juno-3 text-right font-mono",
        isExpense ? "text-juno-danger-fg" : "text-juno-success-fg"
      )}>
        {formatCurrency(Math.abs(transaction.amount))}
      </td>
      <td className="py-juno-3 text-right text-juno-muted-fg text-juno-fs-sm">
        {formatDate(transaction.date)}
      </td>
    </tr>
  );
}
```

### 7. AddTransactionButton Component

**File**: `src/components/dashboard/AddTransactionButton.tsx`  
**Type**: Client Component  
**Purpose**: Primary action button for transaction creation

```typescript
interface AddTransactionButtonProps {
  className?: string;
}

export function AddTransactionButton({ className }: AddTransactionButtonProps) {
  const router = useRouter();

  const handleClick = useCallback(() => {
    // Analytics tracking
    analytics.track('add_transaction_clicked', { source: 'dashboard' });
    
    // Navigate to transaction form
    router.push('/dashboard/transactions/new');
  }, [router]);

  return (
    <button
      className={cn("btn--primary", className)}
      onClick={handleClick}
      aria-label="Add new transaction"
    >
      <PlusIcon className="w-juno-4 h-juno-4 mr-juno-2" />
      Add transaction
    </button>
  );
}
```

## Component Integration Patterns

### Data Flow

```typescript
// Top-down data flow pattern
DashboardPage
├── Server-side data fetching (future)
├── Props passing to client components
└── Client-side state management for interactions

// State management hierarchy
TabNavigation (Client State)
├── Tab selection state
├── URL synchronization
└── Child component props

MetricDisplay (Server Props + Client Animation)
├── Server-rendered content
├── Client-side progress animation
└── Loading state management
```

### Error Boundaries

```typescript
// Error boundary for dashboard components
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={<DashboardErrorFallback />}
      onError={(error, errorInfo) => {
        console.error('Dashboard Error:', error, errorInfo);
        analytics.track('dashboard_error', { error: error.message });
      }}
    >
      {children}
    </ErrorBoundary>
  );
}

function DashboardErrorFallback() {
  return (
    <div className="bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke p-juno-8 text-center">
      <h2 className="text-juno-text text-juno-fs-lg font-semibold mb-juno-4">
        Something went wrong
      </h2>
      <p className="text-juno-muted-fg mb-juno-6">
        We're having trouble loading your dashboard. Please try refreshing the page.
      </p>
      <button 
        className="btn--primary"
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </button>
    </div>
  );
}
```

### Loading States

```typescript
// Consistent loading state patterns
export function ComponentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-juno-4", className)}>
      <div className="h-juno-6 bg-juno-surface-200 rounded-juno-md" />
      <div className="h-juno-4 bg-juno-surface-200 rounded-juno-md w-3/4" />
      <div className="h-juno-4 bg-juno-surface-200 rounded-juno-md w-1/2" />
    </div>
  );
}

// Suspense integration
export function DashboardWithSuspense() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPage />
    </Suspense>
  );
}
```

This component architecture provides a solid foundation for the dashboard implementation with clear separation of concerns, proper accessibility implementation, and integration with the Juno Design System. Each component is designed to be reusable, testable, and maintainable while delivering optimal performance and user experience.