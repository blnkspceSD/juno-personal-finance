# Chart Design Specification

This is the chart design implementation for the spec detailed in @.agent-os/specs/2025-08-16-waterfall-chart-component/spec.md

> Created: 2025-08-16
> Version: 1.0.0

## Visual Design Requirements

### Chart Layout and Structure

**Overall Chart Composition**
```
┌─────────────────────────────────────────────────────────────┐
│ Monthly Cash Flow Analysis                                  │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                                                         │ │
│ │ 5000┤                                                   │ │
│ │     │ █████                                             │ │
│ │ 4000┤ █████ ████                                        │ │
│ │     │ █████ ████ ███                                    │ │
│ │ 3000┤ █████ ████ ███ ██                                 │ │
│ │     │ █████ ████ ███ ██ █                               │ │
│ │ 2000┤ █████ ████ ███ ██ █ █                             │ │
│ │     │ █████ ████ ███ ██ █ █ █                           │ │
│ │ 1000┤ █████ ████ ███ ██ █ █ █ █                         │ │
│ │     │ █████ ████ ███ ██ █ █ █ █ █                       │ │
│ │    0└─┴───┴─┴──┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴────│ │
│ │      Income Tax Rent Food Bills Personal Transport Net   │ │
│ │      Salary    Pension                          Result  │ │
│ └─────────────────────────────────────────────────────────┘ │
│ Legend: Income ████ Essential ████ Discretionary ████      │
└─────────────────────────────────────────────────────────────┘
```

**Chart Dimensions and Responsive Breakpoints**
```typescript
const chartDimensions = {
  mobile: {
    height: 300,
    margin: { top: 20, right: 20, bottom: 80, left: 60 },
    barWidth: 40,
    fontSize: 12
  },
  tablet: {
    height: 400,
    margin: { top: 20, right: 30, bottom: 80, left: 80 },
    barWidth: 50,
    fontSize: 14
  },
  desktop: {
    height: 500,
    margin: { top: 20, right: 40, bottom: 80, left: 100 },
    barWidth: 60,
    fontSize: 16
  }
}
```

### Color Scheme and Visual Hierarchy

**Juno Design System Color Mapping**
```css
/* Primary color scheme using Juno tokens */
:root {
  /* Income bars - Success colors */
  --waterfall-income: var(--juno-success-500);
  --waterfall-income-hover: var(--juno-success-600);
  
  /* Essential expenses - Danger colors */
  --waterfall-essential: var(--juno-danger-500);
  --waterfall-essential-hover: var(--juno-danger-600);
  
  /* Moderate expenses - Warning colors */
  --waterfall-moderate: var(--juno-warning-500);
  --waterfall-moderate-hover: var(--juno-warning-600);
  
  /* Discretionary expenses - Purple accent */
  --waterfall-discretionary: var(--juno-accent);
  --waterfall-discretionary-hover: var(--juno-accent-dark);
  
  /* Net result colors */
  --waterfall-net-positive: var(--juno-success-600);
  --waterfall-net-negative: var(--juno-danger-600);
  
  /* Chart background and grid */
  --waterfall-background: var(--juno-surface-100);
  --waterfall-grid: var(--juno-neutral-200);
  --waterfall-text: var(--juno-text);
  --waterfall-muted: var(--juno-muted-fg);
}
```

**Color Assignment Logic**
```typescript
export function getBarColor(dataPoint: WaterfallDataPoint): string {
  switch (dataPoint.type) {
    case 'income':
      return 'var(--waterfall-income)'
    
    case 'expense':
      // Categorize expenses by percentage of income
      if (dataPoint.percentage > 15) {
        return 'var(--waterfall-essential)' // Major expenses (red)
      } else if (dataPoint.percentage > 5) {
        return 'var(--waterfall-moderate)'  // Moderate expenses (orange)
      } else {
        return 'var(--waterfall-discretionary)' // Small expenses (purple)
      }
    
    case 'net':
      return dataPoint.value > 0 
        ? 'var(--waterfall-net-positive)' 
        : 'var(--waterfall-net-negative)'
    
    default:
      return 'var(--juno-neutral-400)'
  }
}
```

### Typography and Text Styling

**Chart Text Hierarchy**
```css
/* Chart title */
.waterfall-chart__title {
  @apply text-juno-text font-semibold text-juno-fs-xl;
  @apply mb-juno-4;
}

/* Chart subtitle */
.waterfall-chart__subtitle {
  @apply text-juno-muted-fg text-juno-fs-sm;
  @apply mb-juno-6;
}

/* Axis labels */
.waterfall-chart__axis-label {
  @apply text-juno-muted-fg text-juno-fs-sm;
  @apply font-medium;
}

/* Category labels */
.waterfall-chart__category-label {
  @apply text-juno-text text-juno-fs-xs;
  @apply font-medium;
  transform: rotate(-45deg);
  transform-origin: bottom left;
}

/* Value labels on bars */
.waterfall-chart__value-label {
  @apply text-white text-juno-fs-xs;
  @apply font-semibold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Tooltip text */
.waterfall-tooltip__text {
  @apply text-juno-text text-juno-fs-sm;
}

.waterfall-tooltip__amount {
  @apply text-juno-text text-juno-fs-lg;
  @apply font-bold;
}
```

**Responsive Text Scaling**
```typescript
const getResponsiveTextSize = (screenSize: 'mobile' | 'tablet' | 'desktop') => {
  const sizes = {
    mobile: {
      title: 'text-juno-fs-lg',
      subtitle: 'text-juno-fs-xs',
      axis: 'text-juno-fs-xs',
      category: 'text-juno-fs-2xs',
      value: 'text-juno-fs-2xs'
    },
    tablet: {
      title: 'text-juno-fs-xl',
      subtitle: 'text-juno-fs-sm',
      axis: 'text-juno-fs-sm',
      category: 'text-juno-fs-xs',
      value: 'text-juno-fs-xs'
    },
    desktop: {
      title: 'text-juno-fs-2xl',
      subtitle: 'text-juno-fs-base',
      axis: 'text-juno-fs-sm',
      category: 'text-juno-fs-sm',
      value: 'text-juno-fs-sm'
    }
  }
  
  return sizes[screenSize]
}
```

### Interactive Elements Design

**Tooltip Design**
```tsx
const WaterfallTooltip = ({ active, payload, label }: TooltipProps) => {
  if (!active || !payload || !payload.length) return null
  
  const data = payload[0].payload as WaterfallDataPoint
  
  return (
    <div className="waterfall-tooltip">
      <div className="waterfall-tooltip__container">
        <div className="waterfall-tooltip__header">
          <h4 className="waterfall-tooltip__category">{data.category}</h4>
          <span className="waterfall-tooltip__type">{data.type}</span>
        </div>
        
        <div className="waterfall-tooltip__content">
          <div className="waterfall-tooltip__amount">
            {formatCurrency(data.value)}
          </div>
          <div className="waterfall-tooltip__percentage">
            {data.percentage.toFixed(1)}% of income
          </div>
          {data.description && (
            <div className="waterfall-tooltip__description">
              {data.description}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* Tooltip styling */
.waterfall-tooltip {
  @apply bg-juno-surface-100 border border-juno-border;
  @apply rounded-juno-md shadow-juno-lg-with-stroke;
  @apply p-juno-3 min-w-48 max-w-64;
}

.waterfall-tooltip__container {
  @apply space-y-juno-2;
}

.waterfall-tooltip__header {
  @apply flex items-center justify-between;
  @apply border-b border-juno-border pb-juno-2;
}

.waterfall-tooltip__category {
  @apply text-juno-text font-semibold text-juno-fs-sm;
}

.waterfall-tooltip__type {
  @apply text-juno-muted-fg text-juno-fs-xs;
  @apply px-juno-2 py-juno-1 rounded-juno-sm;
  @apply bg-juno-pill-bg text-juno-pill-fg;
}

.waterfall-tooltip__amount {
  @apply text-juno-text font-bold text-juno-fs-lg;
}

.waterfall-tooltip__percentage {
  @apply text-juno-muted-fg text-juno-fs-sm;
}

.waterfall-tooltip__description {
  @apply text-juno-muted-fg text-juno-fs-xs;
  @apply italic;
}
```

**Hover and Focus States**
```css
/* Bar hover effects */
.waterfall-bar {
  transition: all 0.2s ease-in-out;
  cursor: pointer;
}

.waterfall-bar:hover {
  opacity: 0.8;
  transform: scaleY(1.02);
  filter: brightness(1.1);
}

.waterfall-bar:focus {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
}

/* Category label hover effects */
.waterfall-category-label:hover {
  @apply text-juno-text;
  font-weight: 600;
}
```

### Accessibility Design Features

**High Contrast Mode Support**
```css
@media (prefers-contrast: high) {
  :root {
    --waterfall-income: #000000;
    --waterfall-essential: #CC0000;
    --waterfall-moderate: #FF6600;
    --waterfall-discretionary: #6600CC;
    --waterfall-net-positive: #006600;
    --waterfall-net-negative: #CC0000;
    --waterfall-grid: #000000;
  }
  
  .waterfall-bar {
    stroke: #000000;
    stroke-width: 2px;
  }
}
```

**Reduced Motion Support**
```css
@media (prefers-reduced-motion: reduce) {
  .waterfall-bar,
  .waterfall-tooltip {
    transition: none;
    animation: none;
  }
  
  .waterfall-chart__animation {
    animation-duration: 0.01ms !important;
  }
}
```

**Screen Reader Optimization**
```tsx
// ARIA labels for chart elements
const getBarAriaLabel = (dataPoint: WaterfallDataPoint) => {
  return `${dataPoint.category}: ${formatCurrency(dataPoint.value)}, ${dataPoint.percentage.toFixed(1)}% of income, ${dataPoint.type}`
}

// Chart description for screen readers
const getChartDescription = (data: WaterfallChartData) => {
  return `Waterfall chart showing monthly cash flow. Starting with income of ${formatCurrency(data.totalIncome)}, after ${data.dataPoints.length - 2} expense categories totaling ${formatCurrency(data.totalExpenses)}, the net result is ${formatCurrency(data.netResult)}.`
}
```

### Animation and Transition Design

**Bar Animation Sequence**
```css
/* Initial state - bars start from bottom */
.waterfall-bar {
  animation: waterfall-grow 0.8s ease-out forwards;
  animation-delay: calc(var(--bar-index) * 0.1s);
  transform-origin: bottom;
  transform: scaleY(0);
}

@keyframes waterfall-grow {
  from {
    transform: scaleY(0);
    opacity: 0;
  }
  to {
    transform: scaleY(1);
    opacity: 1;
  }
}

/* Cumulative position animation */
@keyframes waterfall-position {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
```

**Loading State Design**
```tsx
const WaterfallChartSkeleton = () => (
  <div className="waterfall-chart-skeleton">
    <div className="animate-pulse space-y-juno-4">
      {/* Title skeleton */}
      <div className="h-juno-6 bg-juno-neutral-200 rounded-juno-md w-1/3"></div>
      
      {/* Chart area skeleton */}
      <div className="h-80 bg-juno-neutral-100 rounded-juno-lg flex items-end justify-around p-juno-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div
            key={i}
            className="bg-juno-neutral-200 rounded-juno-sm animate-pulse"
            style={{
              height: `${Math.random() * 60 + 20}%`,
              width: '8%',
              animationDelay: `${i * 0.1}s`
            }}
          />
        ))}
      </div>
      
      {/* Legend skeleton */}
      <div className="flex space-x-juno-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex items-center space-x-juno-2">
            <div className="h-juno-3 w-juno-3 bg-juno-neutral-200 rounded-juno-sm"></div>
            <div className="h-juno-4 bg-juno-neutral-200 rounded-juno-sm w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
```

### Chart Legend and Annotations

**Legend Design**
```tsx
const WaterfallLegend = ({ data }: { data: WaterfallChartData }) => (
  <div className="waterfall-legend">
    <div className="waterfall-legend__container">
      <div className="waterfall-legend__item">
        <div className="waterfall-legend__color" style={{ backgroundColor: 'var(--waterfall-income)' }} />
        <span className="waterfall-legend__label">Income ({formatCurrency(data.totalIncome)})</span>
      </div>
      
      <div className="waterfall-legend__item">
        <div className="waterfall-legend__color" style={{ backgroundColor: 'var(--waterfall-essential)' }} />
        <span className="waterfall-legend__label">Essential Expenses</span>
      </div>
      
      <div className="waterfall-legend__item">
        <div className="waterfall-legend__color" style={{ backgroundColor: 'var(--waterfall-discretionary)' }} />
        <span className="waterfall-legend__label">Discretionary Expenses</span>
      </div>
      
      <div className="waterfall-legend__item">
        <div className="waterfall-legend__color" style={{ backgroundColor: data.netResult >= 0 ? 'var(--waterfall-net-positive)' : 'var(--waterfall-net-negative)' }} />
        <span className="waterfall-legend__label">Net Result ({formatCurrency(data.netResult)})</span>
      </div>
    </div>
  </div>
)

/* Legend styling */
.waterfall-legend {
  @apply mt-juno-4 p-juno-3;
  @apply bg-juno-surface-50 rounded-juno-md;
  @apply border border-juno-border;
}

.waterfall-legend__container {
  @apply flex flex-wrap gap-juno-4;
  @apply justify-center md:justify-start;
}

.waterfall-legend__item {
  @apply flex items-center gap-juno-2;
}

.waterfall-legend__color {
  @apply w-juno-3 h-juno-3 rounded-juno-sm;
}

.waterfall-legend__label {
  @apply text-juno-text text-juno-fs-sm font-medium;
}
```

### Error State Design

**Error State Component**
```tsx
const WaterfallChartError = ({ error, onRetry }: { error: string, onRetry: () => void }) => (
  <div className="waterfall-chart-error">
    <div className="waterfall-chart-error__container">
      <div className="waterfall-chart-error__icon">
        <ExclamationTriangleIcon className="h-juno-8 w-juno-8 text-juno-danger-500" />
      </div>
      
      <div className="waterfall-chart-error__content">
        <h3 className="waterfall-chart-error__title">Unable to Load Chart</h3>
        <p className="waterfall-chart-error__message">{error}</p>
        <button 
          className="btn--primary waterfall-chart-error__retry"
          onClick={onRetry}
        >
          Try Again
        </button>
      </div>
    </div>
  </div>
)

/* Error state styling */
.waterfall-chart-error {
  @apply h-80 flex items-center justify-center;
  @apply bg-juno-surface-100 rounded-juno-xl;
  @apply border border-juno-border;
}

.waterfall-chart-error__container {
  @apply text-center space-y-juno-4 p-juno-8;
}

.waterfall-chart-error__icon {
  @apply flex justify-center;
}

.waterfall-chart-error__title {
  @apply text-juno-text font-semibold text-juno-fs-lg;
}

.waterfall-chart-error__message {
  @apply text-juno-muted-fg text-juno-fs-sm;
  @apply max-w-sm mx-auto;
}

.waterfall-chart-error__retry {
  @apply mt-juno-4;
}
```

This comprehensive chart design specification ensures the waterfall chart component maintains visual consistency with the Juno Design System while providing an intuitive and accessible user experience across all device types and user needs.