# Technical Specification - Dashboard Layout Implementation

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-13-dashboard-layout-implementation/spec.md

> Created: 2025-08-13
> Version: 1.0.0

## Technical Requirements

### Architecture Overview

The dashboard layout implementation follows a component-based architecture using React Server Components where appropriate, with client-side interactivity for tab navigation and dynamic UI updates. The implementation emphasizes performance, accessibility, and maintainability while adhering to the established Juno Design System.

### Core Framework Requirements

**Next.js 15.4.5 with App Router**
- Server Components for static dashboard structure
- Client Components for interactive elements (tabs, buttons)
- TypeScript strict mode for type safety
- CSS-in-JS avoided in favor of Tailwind CSS with Juno tokens

**React 19.1.0 Feature Usage**
- Hooks: useState, useEffect, useCallback, useMemo for performance
- Context API: For dashboard state management if needed
- Suspense: For loading states and code splitting
- Error Boundaries: For graceful error handling

### Component Architecture

#### 1. Dashboard Page Component
```typescript
// src/app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-juno-surface-50 p-juno-4 lg:p-juno-8">
      <div className="max-w-7xl mx-auto space-y-juno-8">
        <DashboardHeader />
        <TabNavigation />
        <DashboardContent />
      </div>
    </div>
  );
}
```

#### 2. Component Hierarchy
```
DashboardPage
├── DashboardHeader (optional metadata)
├── TabNavigation (client component)
│   ├── Tab (Spending)
│   ├── Tab (Net worth)
│   └── Tab (Investments)
├── DashboardContent
│   ├── MetricDisplay (spending metric + progress)
│   ├── ChartContainer (bar chart placeholder)
│   └── RecentTransactions
│       ├── TransactionTable
│       └── AddTransactionButton
```

### State Management

#### Tab Navigation State
```typescript
// Client-side state for tab switching
interface TabState {
  activeTab: 'spending' | 'networth' | 'investments';
  setActiveTab: (tab: TabState['activeTab']) => void;
}

// Local storage persistence
const useTabState = () => {
  const [activeTab, setActiveTab] = useState<TabState['activeTab']>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('dashboard-active-tab') as TabState['activeTab'] || 'spending';
    }
    return 'spending';
  });

  useEffect(() => {
    localStorage.setItem('dashboard-active-tab', activeTab);
  }, [activeTab]);

  return { activeTab, setActiveTab };
};
```

#### Dashboard Data State
```typescript
// Data structures for dashboard metrics
interface DashboardMetrics {
  currentSpending: number;
  budgetLimit: number;
  progressPercentage: number;
  lastUpdated: Date;
}

interface ChartDataPoint {
  month: string;
  amount: number;
  budget: number;
}

interface TransactionPreview {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}
```

### Performance Requirements

#### Rendering Optimization
- **Initial Page Load**: <2 seconds for complete dashboard
- **Tab Switching**: <100ms transition time
- **Component Renders**: <50ms for individual component updates
- **Memory Usage**: <50MB JavaScript heap size

#### Code Splitting Strategy
```typescript
// Lazy load chart library when needed
const ChartComponent = lazy(() => import('./ChartComponent'));

// Dynamic imports for large components
const DashboardAnalytics = dynamic(
  () => import('./DashboardAnalytics'),
  { 
    loading: () => <ChartContainer loading />,
    ssr: false 
  }
);
```

#### Bundle Size Optimization
- Tree shaking enabled for all dependencies
- Critical CSS inlined for dashboard components
- Non-critical components lazy loaded
- Shared component chunks optimized

### Responsive Design Implementation

#### Breakpoint Strategy
```css
/* Mobile First Approach */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--juno-space-4);
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--juno-space-6);
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr;
    gap: var(--juno-space-8);
  }
}
```

#### Touch Target Optimization
- Minimum touch target size: 44px × 44px
- Tab navigation optimized for thumb navigation
- Swipe gestures for tab switching on mobile
- Proper spacing between interactive elements

### Accessibility Implementation

#### Semantic HTML Structure
```html
<main role="main" aria-label="Financial Dashboard">
  <nav role="tablist" aria-label="Dashboard Views">
    <button role="tab" aria-selected="true" aria-controls="spending-panel">
      Spending
    </button>
    <button role="tab" aria-selected="false" aria-controls="networth-panel">
      Net Worth
    </button>
  </nav>
  
  <div role="tabpanel" id="spending-panel" aria-labelledby="spending-tab">
    <section aria-label="Spending Metrics">
      <h2>Current Spending</h2>
      <div role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100">
        70% of budget used
      </div>
    </section>
  </div>
</main>
```

#### Keyboard Navigation
- Tab order: Header → Tab Navigation → Add Transaction → Chart → Table
- Arrow key navigation within tab list
- Enter/Space activation for interactive elements
- Escape key for modal/dropdown dismissal

#### Screen Reader Support
- Descriptive aria-labels for all interactive elements
- Live regions for dynamic content updates
- Proper heading hierarchy (h1 → h2 → h3)
- Alternative text for visual progress indicators

### Data Flow Architecture

#### Mock Data Structure
```typescript
// Development mock data
export const mockDashboardData: DashboardData = {
  metrics: {
    currentSpending: 888888.88,
    budgetLimit: 1000000.00,
    progressPercentage: 88.9,
    lastUpdated: new Date()
  },
  chartData: [
    { month: 'Jan', amount: 2400, budget: 2400 },
    { month: 'Feb', amount: 1398, budget: 2400 },
    { month: 'Mar', amount: 9800, budget: 2400 },
    // ... additional months
  ],
  recentTransactions: [
    {
      id: '1',
      description: 'Grocery Store',
      amount: -67.32,
      category: 'Food',
      date: new Date('2025-08-12')
    },
    // ... additional transactions
  ]
};
```

#### API Integration Points
```typescript
// Future API integration structure
interface DashboardAPI {
  getMetrics: () => Promise<DashboardMetrics>;
  getChartData: (timeRange: string) => Promise<ChartDataPoint[]>;
  getRecentTransactions: (limit: number) => Promise<TransactionPreview[]>;
}

// SWR integration for data fetching
const useDashboardData = () => {
  const { data: metrics, error: metricsError } = useSWR(
    '/api/dashboard/metrics',
    fetcher
  );
  
  const { data: chartData, error: chartError } = useSWR(
    '/api/dashboard/chart-data',
    fetcher
  );

  return {
    metrics,
    chartData,
    isLoading: !metrics || !chartData,
    isError: metricsError || chartError
  };
};
```

## Approach

### Development Methodology

#### Component-First Development
1. **Design System Integration**: All components start with Juno token implementation
2. **Mobile-First Responsive**: Build mobile layout first, enhance for larger screens
3. **Accessibility-First**: Implement semantic HTML and ARIA from component creation
4. **Type-Safe Development**: Define TypeScript interfaces before component implementation

#### Progressive Enhancement Strategy
1. **Core Layout**: Static HTML structure with semantic elements
2. **Basic Styling**: Juno Design System tokens for visual design
3. **Interactive Features**: Client-side JavaScript for tab navigation
4. **Advanced Features**: Animations, transitions, and performance optimizations

#### Testing Approach
```typescript
// Component testing strategy
describe('DashboardPage', () => {
  it('renders all required sections', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByText('Add transaction')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(<DashboardPage />);
    const networthTab = screen.getByRole('tab', { name: 'Net worth' });
    
    await user.click(networthTab);
    
    expect(networthTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel', { name: /net worth/i })).toBeVisible();
  });
});
```

### Code Organization

#### File Structure
```
src/
├── app/
│   └── dashboard/
│       ├── page.tsx                 # Main dashboard page
│       └── loading.tsx              # Loading UI
├── components/
│   └── dashboard/
│       ├── TabNavigation.tsx        # Tab switching component
│       ├── MetricDisplay.tsx        # Large metric display
│       ├── ProgressBar.tsx          # Progress indicator
│       ├── ChartContainer.tsx       # Chart placeholder
│       ├── TransactionTable.tsx     # Recent transactions
│       └── AddTransactionButton.tsx # CTA button
├── types/
│   └── dashboard.ts                 # TypeScript interfaces
├── hooks/
│   └── useDashboardData.ts         # Data fetching logic
└── utils/
    └── formatters.ts               # Number/date formatting
```

#### Import Organization
```typescript
// External dependencies
import React, { useState, useEffect } from 'react';
import { type Metadata } from 'next';

// Internal components
import { TabNavigation } from '@/components/dashboard/TabNavigation';
import { MetricDisplay } from '@/components/dashboard/MetricDisplay';

// Types and utilities
import type { DashboardData } from '@/types/dashboard';
import { formatCurrency } from '@/utils/formatters';

// Hooks and data
import { useDashboardData } from '@/hooks/useDashboardData';
```

### Performance Optimization Strategies

#### React Optimization
```typescript
// Memoization for expensive calculations
const MemoizedMetricDisplay = memo(MetricDisplay, (prevProps, nextProps) => {
  return prevProps.amount === nextProps.amount && 
         prevProps.budget === nextProps.budget;
});

// Callback optimization
const handleTabChange = useCallback((tab: TabType) => {
  setActiveTab(tab);
  // Track analytics
  analytics.track('dashboard_tab_changed', { tab });
}, []);

// State optimization
const chartData = useMemo(() => {
  return rawData.map(point => ({
    ...point,
    formattedAmount: formatCurrency(point.amount)
  }));
}, [rawData]);
```

#### Bundle Optimization
- Code splitting by route and feature
- Dynamic imports for non-critical components
- Tree shaking for unused Juno Design System tokens
- CSS purging for production builds

## External Dependencies

### Core Dependencies

#### UI and Styling
```json
{
  "dependencies": {
    "next": "15.4.5",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "@tailwindcss/postcss": "^4.0.0",
    "tailwindcss": "^4.0.0"
  }
}
```

#### TypeScript and Development
```json
{
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "15.4.5"
  }
}
```

### Optional Dependencies (Future Phases)

#### Chart Visualization
```json
{
  "dependencies": {
    "recharts": "^2.8.0",
    "@types/recharts": "^2.8.0"
  }
}
```
- **Alternative**: Chart.js with react-chartjs-2
- **Rationale**: Recharts provides better TypeScript support and React integration

#### Data Fetching
```json
{
  "dependencies": {
    "swr": "^2.2.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```
- **SWR**: Client-side data fetching with caching
- **Supabase**: Backend API integration when ready

#### Animation and Interaction
```json
{
  "dependencies": {
    "framer-motion": "^10.16.0"
  }
}
```
- **Usage**: Smooth tab transitions and progress bar animations
- **Alternative**: CSS transitions for simpler animations

### Development Tools

#### Testing Framework
```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0"
  }
}
```

#### Accessibility Testing
```json
{
  "devDependencies": {
    "@axe-core/react": "^4.8.0",
    "jest-axe": "^8.0.0"
  }
}
```

### Dependency Management Strategy

#### Version Pinning
- Pin major versions for core dependencies (React, Next.js)
- Allow minor version updates for development tools
- Regular dependency audits for security vulnerabilities

#### Bundle Analysis
```bash
# Bundle analysis command
npm run build && npm run analyze

# Size monitoring
npx size-limit
```

#### Performance Monitoring
- Core Web Vitals tracking in production
- Bundle size alerts on CI/CD
- Performance regression testing

### Integration Requirements

#### Existing System Integration
- **Sidebar Navigation**: Must work with existing sidebar state
- **Authentication**: Respect user session and permissions
- **Routing**: Integrate with Next.js App Router patterns
- **Design System**: 100% compliance with Juno tokens

#### Future Integration Points
- **Chart Libraries**: Prepared API for chart component integration
- **Real-time Updates**: WebSocket connection points identified
- **Analytics**: Event tracking infrastructure ready
- **PWA Features**: Offline capability preparation