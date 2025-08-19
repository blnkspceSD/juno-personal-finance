# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-16-waterfall-chart-component/spec.md

> Created: 2025-08-16
> Version: 1.0.0

## Technical Requirements

### Chart Library Integration

**Recharts Configuration**
- Use `ComposedChart` component for complex waterfall layout
- Implement custom `Cell` components for individual bar styling
- Configure `ResponsiveContainer` for responsive chart sizing
- Use `Tooltip` component with custom content for category details
- Implement `XAxis` and `YAxis` with Juno Design System styling

**Custom Waterfall Logic**
```typescript
interface WaterfallDataPoint {
  category: string
  value: number
  cumulative: number
  type: 'income' | 'expense' | 'net'
  color: string
  description?: string
}

interface WaterfallChartProps {
  data: WaterfallDataPoint[]
  height?: number
  showTooltip?: boolean
  isLoading?: boolean
  onCategoryClick?: (category: string) => void
}
```

### Data Processing Architecture

**Transformation Pipeline**
1. **Raw Transaction Data** → Category aggregation by month
2. **Category Totals** → Sorted by magnitude (largest expenses first)
3. **Sorted Categories** → Cumulative value calculation for positioning
4. **Waterfall Dataset** → Chart-ready format with positioning data

**Core Algorithms**
```typescript
// Calculate cumulative values for waterfall positioning
function calculateCumulativeValues(categories: CategoryTotal[]): WaterfallDataPoint[] {
  let cumulative = 0
  const income = categories.find(c => c.type === 'income')?.value || 0
  
  return categories.map((category, index) => {
    const start = cumulative
    cumulative += category.value
    
    return {
      category: category.name,
      value: Math.abs(category.value),
      cumulative: start,
      type: category.type,
      color: getColorForCategory(category),
      description: category.description
    }
  })
}

// Transform monthly transactions into waterfall format
function transformTransactionsToWaterfall(
  transactions: Transaction[], 
  month: string
): WaterfallDataPoint[] {
  const categories = aggregateByCategory(transactions, month)
  const sorted = sortCategoriesByMagnitude(categories)
  return calculateCumulativeValues(sorted)
}
```

### Component Architecture

**File Structure**
```
src/components/dashboard/
├── WaterfallChart.tsx          # Main chart component
├── WaterfallTooltip.tsx        # Custom tooltip component
├── WaterfallBar.tsx            # Individual bar component
└── WaterfallContainer.tsx      # Chart container with loading/error states

src/lib/
├── waterfall-utils.ts          # Data transformation utilities
└── chart-colors.ts             # Color assignment logic

src/types/
└── waterfall.ts                # TypeScript interfaces
```

**Component Hierarchy**
```tsx
<WaterfallContainer>
  <WaterfallChart>
    <ResponsiveContainer>
      <ComposedChart>
        <XAxis />
        <YAxis />
        <Bar dataKey="value" />
        <Tooltip content={<WaterfallTooltip />} />
      </ComposedChart>
    </ResponsiveContainer>
  </WaterfallChart>
</WaterfallContainer>
```

### Styling Implementation

**Juno Design System Integration**
```css
/* Chart container styling */
.waterfall-chart-container {
  @apply bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke;
  @apply p-juno-6 space-y-juno-4;
}

/* Chart title styling */
.waterfall-chart-title {
  @apply text-juno-text font-semibold text-juno-fs-lg;
}

/* Bar colors using Juno tokens */
.waterfall-bar--income {
  @apply fill-juno-success-500;
}

.waterfall-bar--expense {
  @apply fill-juno-danger-500;
}

.waterfall-bar--net-positive {
  @apply fill-juno-success-600;
}

.waterfall-bar--net-negative {
  @apply fill-juno-danger-600;
}
```

**Responsive Design Patterns**
```tsx
const chartDimensions = {
  mobile: { height: 300, margin: { top: 20, right: 20, bottom: 60, left: 40 } },
  tablet: { height: 400, margin: { top: 20, right: 30, bottom: 60, left: 60 } },
  desktop: { height: 500, margin: { top: 20, right: 40, bottom: 60, left: 80 } }
}
```

### Performance Optimization

**Rendering Optimization**
```typescript
// Memoize expensive calculations
const waterfallData = useMemo(() => 
  transformTransactionsToWaterfall(transactions, currentMonth), 
  [transactions, currentMonth]
)

// Optimize re-renders
const WaterfallChart = React.memo(({ data, ...props }) => {
  // Chart implementation
})

// Debounce real-time updates
const debouncedUpdateChart = useCallback(
  debounce((newData) => setChartData(newData), 300),
  []
)
```

**Data Loading Strategy**
- Implement progressive loading for large datasets
- Use React Suspense for chart component loading
- Cache transformed waterfall data to avoid recalculation
- Implement virtual scrolling for charts with 20+ categories

### Accessibility Implementation

**ARIA Attributes**
```tsx
<div 
  role="img" 
  aria-label="Monthly cash flow waterfall chart"
  aria-describedby="waterfall-description"
>
  <div id="waterfall-description" className="sr-only">
    Chart showing income of ${income} flowing through expense categories 
    to net result of ${netResult}
  </div>
  
  {/* Chart implementation */}
</div>
```

**Keyboard Navigation**
```typescript
// Enable keyboard navigation for chart elements
const handleKeyDown = (event: KeyboardEvent, categoryIndex: number) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      onCategorySelect(categories[categoryIndex])
      break
    case 'ArrowLeft':
      focusCategory(categoryIndex - 1)
      break
    case 'ArrowRight':
      focusCategory(categoryIndex + 1)
      break
  }
}
```

## Approach

### Development Methodology

**Phase-based Implementation**
1. **Data Layer First**: Build and test data transformation utilities with comprehensive unit tests
2. **Component Structure**: Create basic chart component with mock data
3. **Styling Integration**: Apply Juno Design System tokens and responsive design
4. **Interactivity**: Add tooltips, animations, and user interactions
5. **Dashboard Integration**: Connect to real data and existing dashboard infrastructure

**Testing Strategy**
- **Unit Tests**: Data transformation functions, utility functions
- **Component Tests**: React Testing Library for user interactions
- **Integration Tests**: Chart integration with dashboard and real data
- **Visual Tests**: Screenshot testing for chart rendering consistency
- **Accessibility Tests**: Automated accessibility testing with jest-axe

**Error Handling Strategy**
```typescript
// Graceful error handling for data processing
try {
  const waterfallData = transformTransactionsToWaterfall(transactions, month)
  return <WaterfallChart data={waterfallData} />
} catch (error) {
  console.error('Waterfall chart data processing error:', error)
  return <ChartErrorState 
    message="Unable to display chart" 
    onRetry={() => refetchData()} 
  />
}
```

### Code Quality Standards

**TypeScript Configuration**
- Strict mode enabled for all waterfall chart code
- Comprehensive type definitions for all data structures
- Proper error type definitions and handling
- Generic types for reusable utility functions

**Code Organization Principles**
- Single Responsibility Principle for all components and utilities
- Consistent naming conventions following existing project patterns
- Comprehensive JSDoc documentation for all public functions
- Clear separation of concerns between data processing, UI, and styling

## External Dependencies

### Chart Library Dependency
- **Recharts v2.15.4**: Already integrated in project, stable API
- **Risk Level**: Low - Recharts is well-maintained with stable waterfall support
- **Fallback Strategy**: Custom SVG implementation if Recharts limitations discovered

### Design System Dependencies
- **Juno Design System**: Complete token system already implemented
- **Tailwind CSS v4**: Integration patterns established
- **Risk Level**: Minimal - All required tokens already available

### Data Dependencies
- **Supabase**: Transaction data fetching and real-time updates
- **Existing Query Functions**: Building on established data fetching patterns
- **Risk Level**: Low - Leveraging existing, tested infrastructure

### Performance Dependencies
- **React 19.1.0**: Latest performance optimizations available
- **Next.js 15.4.5**: Built-in performance monitoring and optimization
- **Risk Level**: Minimal - Modern React patterns for optimal performance

### Testing Dependencies
- **React Testing Library**: Component testing infrastructure
- **Jest**: Unit testing framework already configured
- **Vitest**: Performance testing capabilities
- **Risk Level**: None - All testing tools already integrated and working