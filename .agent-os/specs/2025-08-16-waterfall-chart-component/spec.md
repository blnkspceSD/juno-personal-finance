# Waterfall Chart Component for Dashboard Overview

> Spec: Waterfall Chart Component Implementation
> Created: 2025-08-16
> Status: Planning

## Overview

Implement a comprehensive waterfall chart component for the Juno dashboard overview page that visualizes the flow of income through various expense categories to show net monthly financial position. The chart will display a clear breakdown of how income flows through categorical expenses (Income tax, Pension, Council tax, Transport, Rent, Food, Personal, Bills, Charity, etc.) to arrive at the final net result.

This implementation uses Recharts library (already integrated in the project) and follows the Juno Design System for consistent styling, colors, and interactions. The waterfall chart will provide users with an intuitive visual representation of their monthly cash flow, making it easy to identify major expense categories and understand their overall financial position.

## User Stories

### Primary User Stories

**As a Juno user, I want to:**

1. **Visual Cash Flow Analysis**: See my monthly income flowing through different expense categories in a waterfall format, so I can understand how my money is allocated and identify areas for potential optimization.

2. **Category Impact Visualization**: Clearly see which expense categories have the largest impact on my net position, with each category represented as a distinct bar showing the reduction from the previous total.

3. **Net Position Clarity**: Immediately understand my final net monthly position (positive or negative) at the end of the waterfall, with clear visual indicators for surplus or deficit situations.

4. **Interactive Category Details**: Hover over any bar in the waterfall to see detailed information about that category including exact amounts, percentage of income, and category description.

5. **Responsive Chart Experience**: Access the waterfall chart seamlessly across mobile, tablet, and desktop devices with appropriate scaling and touch-friendly interactions.

6. **Design System Consistency**: Experience a chart that seamlessly integrates with the Juno design language, using consistent colors, typography, and spacing throughout the interface.

### Secondary User Stories

**As a Juno user, I want to:**

7. **Month-over-Month Comparison**: Compare my current month's waterfall with previous months to track changes in spending patterns and financial health over time.

8. **Category Grouping**: See related expense categories grouped together (e.g., Housing: Rent + Council tax, Lifestyle: Food + Personal + Entertainment) for higher-level financial analysis.

9. **Accessibility Features**: Use the chart with screen readers and keyboard navigation, ensuring the financial data is accessible to users with disabilities.

## Spec Scope

### In Scope

1. **Waterfall Chart Component Architecture**
   - Reusable `<WaterfallChart />` component using Recharts library
   - Custom waterfall calculation logic for cumulative totals
   - Dynamic bar positioning and height calculations
   - Smooth transitions and animations between data states

2. **Chart Data Structure & Processing**
   - TypeScript interfaces for waterfall data format
   - Data transformation utilities for converting transaction data to waterfall format
   - Category aggregation and sorting logic
   - Income and expense flow calculations

3. **Visual Design & Juno Integration**
   - Complete Juno Design System token usage for colors, spacing, typography
   - Color coding for income (positive), expenses (negative), and net result
   - Consistent chart styling with existing dashboard components
   - Responsive design with mobile-optimized touch targets

4. **Interactive Features**
   - Hover tooltips showing detailed category information
   - Category amount formatting (currency, percentages)
   - Loading states during data fetching
   - Error states for data fetching failures

5. **Dashboard Integration**
   - Integration with existing dashboard layout and tab system
   - Data fetching from Supabase backend
   - Real-time updates when transaction data changes
   - Proper component positioning within dashboard grid

6. **Accessibility & Performance**
   - WCAG 2.1 AA compliance with screen reader support
   - Keyboard navigation for chart elements
   - Optimized rendering for large datasets
   - Smooth animations and transitions

### Implementation Phases

**Phase 1: Core Chart Component** (Week 1)
- Waterfall chart component structure
- Basic data transformation logic
- Recharts integration and configuration

**Phase 2: Visual Design & Styling** (Week 2)
- Juno Design System integration
- Color scheme and typography application
- Responsive design implementation

**Phase 3: Interactive Features** (Week 3)
- Hover tooltips and interactions
- Loading and error states
- Animation and transition effects

**Phase 4: Dashboard Integration** (Week 4)
- Dashboard overview page integration
- Data fetching and real-time updates
- Testing and optimization

## Out of Scope

1. **Advanced Analytics Features**: Complex financial calculations, trend analysis, or predictive modeling beyond basic waterfall visualization
2. **Chart Export Functionality**: PDF generation, image export, or printing capabilities
3. **Custom Chart Library Development**: Building a waterfall chart from scratch instead of using Recharts
4. **Real-time Streaming Updates**: WebSocket connections for live transaction updates (standard polling is sufficient)
5. **Multi-Currency Support**: Handling multiple currencies or exchange rate calculations
6. **Historical Chart Comparison**: Side-by-side chart comparisons or overlay visualizations
7. **Category Budget Integration**: Connecting waterfall chart with budget vs. actual comparisons
8. **Advanced Filtering Options**: Date range pickers, category filters, or custom time period selections

## Expected Deliverable

### Primary Deliverables

1. **Waterfall Chart Component** (`src/components/dashboard/WaterfallChart.tsx`)
   - Complete waterfall chart implementation using Recharts
   - Responsive design with mobile, tablet, and desktop optimization
   - Full Juno Design System integration for consistent styling
   - Interactive hover states and detailed tooltips

2. **Data Processing Utilities** (`src/lib/waterfall-utils.ts`)
   - Data transformation functions for converting transaction data to waterfall format
   - Category aggregation and sorting algorithms
   - Currency formatting and number display utilities
   - Type-safe data processing with comprehensive error handling

3. **TypeScript Interfaces** (`src/types/waterfall.ts`)
   - `WaterfallData` interface for chart data structure
   - `CategoryData` interface for individual category information
   - `ChartTooltipData` interface for hover tooltip content
   - Component prop interfaces with full type safety

4. **Dashboard Integration** (`src/app/dashboard/page.tsx` updates)
   - Waterfall chart integration into existing dashboard layout
   - Data fetching integration with Supabase queries
   - Real-time data updates using existing realtime infrastructure
   - Proper loading and error state handling

5. **Styling Implementation**
   - Juno Design System token usage for all visual elements
   - Custom CSS for chart-specific styling needs
   - Responsive design patterns for different screen sizes
   - Hover and focus states following Juno interaction patterns

### Quality Standards

- **Performance**: Chart renders within 200ms with smooth 60fps animations
- **Accessibility**: WCAG 2.1 AA compliant with screen reader support and keyboard navigation
- **Browser Support**: Modern browsers (Chrome 100+, Firefox 100+, Safari 15+)
- **Mobile Optimization**: Touch targets ≥44px, responsive text scaling, swipe gestures
- **Type Safety**: 100% TypeScript coverage with strict mode compliance
- **Data Accuracy**: Precise financial calculations with proper rounding and currency handling

### Testing Requirements

- **Unit Testing**: Comprehensive tests for data transformation and calculation logic
- **Component Testing**: React Testing Library tests for user interactions and accessibility
- **Integration Testing**: Chart integration with dashboard and real data scenarios
- **Visual Regression Testing**: Chart rendering consistency across browsers and devices
- **Performance Testing**: Chart rendering performance with large datasets
- **Accessibility Testing**: Screen reader compatibility and keyboard navigation

## Spec Documentation

- Tasks: @.agent-os/specs/2025-08-16-waterfall-chart-component/tasks.md
- Technical Specification: @.agent-os/specs/2025-08-16-waterfall-chart-component/sub-specs/technical-spec.md
- Data Structure Specification: @.agent-os/specs/2025-08-16-waterfall-chart-component/sub-specs/data-structure.md
- Chart Design Specification: @.agent-os/specs/2025-08-16-waterfall-chart-component/sub-specs/chart-design.md
- Integration Specification: @.agent-os/specs/2025-08-16-waterfall-chart-component/sub-specs/integration-spec.md