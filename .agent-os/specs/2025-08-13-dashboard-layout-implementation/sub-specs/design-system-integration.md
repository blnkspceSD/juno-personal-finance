# Design System Integration - Dashboard Layout Implementation

This is the design system integration specification for the spec detailed in @.agent-os/specs/2025-08-13-dashboard-layout-implementation/spec.md

> Created: 2025-08-13
> Version: 1.0.0

## Juno Design System Integration

### Overview

The dashboard layout implementation must achieve 100% compliance with the Juno Design System tokens and patterns. This specification details the exact token usage, component styling patterns, and integration requirements to ensure visual consistency and brand cohesion across the dashboard.

### Token Usage Reference

#### Color Tokens

**Primary Action Colors**
```css
/* Main CTAs and accent elements */
--juno-accent: #06b6d4;         /* Primary accent color */
--juno-accent-hover: #0891b2;   /* Hover state */
--juno-accent-active: #0e7490;  /* Active state */

/* Professional actions */
--juno-teal-500: #14b8a6;       /* Professional CTAs */
--juno-teal-600: #0d9488;       /* Hover state */

/* Trustworthy actions */
--juno-blue-500: #3b82f6;       /* Trustworthy CTAs */
--juno-blue-600: #2563eb;       /* Hover state */
```

**Surface and Background Colors**
```css
/* Card and container backgrounds */
--juno-surface-50: #f8fafc;     /* Page background */
--juno-surface-100: #f1f5f9;    /* Card background */
--juno-surface-200: #e2e8f0;    /* Progress bar track */

/* Dark sections */
--juno-neutral-850: #1e293b;    /* Dark mode surfaces */
```

**Text Colors**
```css
/* Text hierarchy */
--juno-text: #0f172a;           /* Primary text */
--juno-muted-fg: #64748b;       /* Secondary text */
--juno-pill-fg: #475569;        /* Pill text */
--juno-pill-bg: #e2e8f0;        /* Pill background */
```

**Status Colors**
```css
/* Success states */
--juno-success-bg: #dcfce7;     /* Success background */
--juno-success-fg: #166534;     /* Success text */

/* Warning states */
--juno-warning-bg: #fef3c7;     /* Warning background */
--juno-warning-fg: #92400e;     /* Warning text */

/* Danger states */
--juno-danger-bg: #fee2e2;      /* Danger background */
--juno-danger-fg: #dc2626;      /* Danger text */

/* Info states */
--juno-info-bg: #dbeafe;        /* Info background */
--juno-info-fg: #1d4ed8;        /* Info text */
```

#### Spacing Tokens (4px base unit)

```css
/* Juno spacing scale */
--juno-space-1: 4px;    /* 0.25rem */
--juno-space-2: 8px;    /* 0.5rem */
--juno-space-3: 12px;   /* 0.75rem */
--juno-space-4: 16px;   /* 1rem */
--juno-space-6: 24px;   /* 1.5rem */
--juno-space-8: 32px;   /* 2rem */
--juno-space-12: 48px;  /* 3rem */
--juno-space-16: 64px;  /* 4rem */
```

#### Typography Tokens (Major Third 1.25x progression)

```css
/* Font size scale */
--juno-fs-xs: 0.75rem;      /* 12px */
--juno-fs-sm: 0.875rem;     /* 14px */
--juno-fs-base: 1rem;       /* 16px */
--juno-fs-lg: 1.125rem;     /* 18px */
--juno-fs-xl: 1.25rem;      /* 20px */
--juno-fs-2xl: 1.5rem;      /* 24px */
--juno-fs-3xl: 1.875rem;    /* 30px */
--juno-fs-4xl: 2.25rem;     /* 36px */
```

#### Shadow Tokens

```css
/* Elevation system */
--juno-shadow-card-with-stroke: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05);
--juno-shadow-sm-with-stroke: 0 1px 2px 0 rgb(0 0 0 / 0.05), 0 0 0 1px rgb(0 0 0 / 0.05);
--juno-shadow-lg-with-stroke: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05);
--juno-shadow-xl-with-stroke: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05);
```

#### Border Radius Tokens

```css
/* Radius hierarchy */
--juno-radius-sm: 6px;    /* Small elements */
--juno-radius-md: 12px;   /* Inputs, small components */
--juno-radius-lg: 16px;   /* Buttons */
--juno-radius-xl: 24px;   /* Cards */
--juno-radius-2xl: 28px;  /* Large containers */
--juno-radius-full: 9999px; /* Circular elements */
```

## Component-Specific Design System Usage

### 1. Dashboard Page Layout

```css
/* Main dashboard container */
.dashboard-page {
  min-height: 100vh;
  background-color: var(--juno-surface-50);
  padding: var(--juno-space-4);
}

@media (min-width: 1024px) {
  .dashboard-page {
    padding: var(--juno-space-8);
  }
}

/* Content container */
.dashboard-content {
  max-width: 1280px; /* 7xl */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-8);
}
```

### 2. Tab Navigation Styling

```css
/* Tab list container */
.tab-list {
  display: flex;
  border-bottom: 1px solid var(--juno-border);
  background-color: var(--juno-surface-100);
  border-radius: var(--juno-radius-xl) var(--juno-radius-xl) 0 0;
  overflow-x: auto; /* Mobile horizontal scroll */
}

/* Individual tab button */
.tab-button {
  padding: var(--juno-space-3) var(--juno-space-4);
  font-weight: 500;
  font-size: var(--juno-fs-base);
  color: var(--juno-muted-fg);
  border: none;
  background: transparent;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 120px; /* Minimum touch target */
  min-height: 44px; /* Minimum touch target height */
}

/* Tab hover state */
.tab-button:hover {
  background-color: var(--juno-surface-100);
  color: var(--juno-text);
}

/* Tab focus state */
.tab-button:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--juno-focus-ring);
}

/* Active tab state */
.tab-button[aria-selected="true"] {
  color: var(--juno-accent);
  border-bottom-color: var(--juno-accent);
  background-color: var(--juno-surface-100);
}

/* Tab panel container */
.tab-panel {
  background-color: var(--juno-surface-100);
  border-radius: 0 0 var(--juno-radius-xl) var(--juno-radius-xl);
  padding: var(--juno-space-6);
  box-shadow: var(--juno-shadow-card-with-stroke);
}
```

### 3. Metric Display Card

```css
/* Metric display container */
.metric-display {
  background-color: var(--juno-surface-100);
  border-radius: var(--juno-radius-xl);
  box-shadow: var(--juno-shadow-card-with-stroke);
  padding: var(--juno-space-6);
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-4);
}

/* Metric label */
.metric-label {
  color: var(--juno-muted-fg);
  font-size: var(--juno-fs-sm);
  font-weight: 500;
  margin-bottom: var(--juno-space-2);
}

/* Metric value container */
.metric-value {
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-1);
}

/* Main metric number */
.metric-number {
  font-size: var(--juno-fs-2xl);
  font-weight: 700;
  color: var(--juno-text);
  font-family: 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
}

@media (min-width: 1024px) {
  .metric-number {
    font-size: var(--juno-fs-3xl);
  }
}

/* Budget limit text */
.metric-budget {
  color: var(--juno-muted-fg);
  font-weight: 400;
  font-size: var(--juno-fs-lg);
  font-family: 'Geist Mono', monospace;
}
```

### 4. Progress Bar Styling

```css
/* Progress bar container */
.progress-container {
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-2);
}

/* Progress bar track */
.progress-track {
  width: 100%;
  height: var(--juno-space-2); /* 8px */
  background-color: var(--juno-surface-200);
  border-radius: var(--juno-radius-full);
  overflow: hidden;
  position: relative;
}

/* Progress bar fill */
.progress-fill {
  height: 100%;
  border-radius: var(--juno-radius-full);
  transition: width 1s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
}

/* Progress status colors */
.progress-fill--success {
  background-color: var(--juno-success-bg);
  background-image: linear-gradient(90deg, var(--juno-success-bg) 0%, #22c55e 100%);
}

.progress-fill--warning {
  background-color: var(--juno-warning-bg);
  background-image: linear-gradient(90deg, var(--juno-warning-bg) 0%, #f59e0b 100%);
}

.progress-fill--danger {
  background-color: var(--juno-danger-bg);
  background-image: linear-gradient(90deg, var(--juno-danger-bg) 0%, #ef4444 100%);
}

/* Progress labels */
.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--juno-fs-sm);
  color: var(--juno-muted-fg);
}
```

### 5. Chart Container Styling

```css
/* Chart container */
.chart-container {
  background-color: var(--juno-surface-100);
  border-radius: var(--juno-radius-xl);
  box-shadow: var(--juno-shadow-card-with-stroke);
  padding: var(--juno-space-6);
  min-height: 400px;
}

/* Chart header */
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--juno-space-6);
}

.chart-title {
  font-size: var(--juno-fs-lg);
  font-weight: 600;
  color: var(--juno-text);
}

/* Chart content area */
.chart-content {
  min-height: 300px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Chart placeholder bars */
.chart-placeholder {
  display: flex;
  align-items: end;
  justify-content: center;
  height: 100%;
  gap: var(--juno-space-2);
  padding: var(--juno-space-4);
}

.chart-bar {
  background-color: var(--juno-accent);
  border-radius: var(--juno-radius-sm);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  min-width: 20px;
  animation: chartBarGrow 0.8s ease-out forwards;
}

@keyframes chartBarGrow {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chart-bar-label {
  text-align: center;
  font-size: var(--juno-fs-xs);
  color: var(--juno-muted-fg);
  font-weight: 500;
  margin-top: var(--juno-space-1);
}

/* Chart legend */
.chart-legend {
  margin-top: var(--juno-space-4);
  padding-top: var(--juno-space-4);
  border-top: 1px solid var(--juno-border);
  display: flex;
  gap: var(--juno-space-4);
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--juno-space-2);
  font-size: var(--juno-fs-sm);
  color: var(--juno-muted-fg);
}

.legend-color {
  width: var(--juno-space-3);
  height: var(--juno-space-3);
  border-radius: var(--juno-radius-sm);
  background-color: var(--juno-accent);
}
```

### 6. Transaction Table Styling

```css
/* Transaction section container */
.transactions-section {
  background-color: var(--juno-surface-100);
  border-radius: var(--juno-radius-xl);
  box-shadow: var(--juno-shadow-card-with-stroke);
}

/* Section header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--juno-space-6);
  border-bottom: 1px solid var(--juno-border);
}

.section-title {
  font-size: var(--juno-fs-lg);
  font-weight: 600;
  color: var(--juno-text);
}

/* Table container */
.table-container {
  padding: var(--juno-space-6);
  padding-top: 0;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Table styling */
.transaction-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.table-header {
  border-bottom: 1px solid var(--juno-border);
}

.table-header th {
  padding: var(--juno-space-3) 0;
  font-size: var(--juno-fs-sm);
  font-weight: 600;
  color: var(--juno-muted-fg);
  text-align: left;
}

.table-header th:last-child,
.table-row td:last-child {
  text-align: right;
}

/* Table rows */
.table-row {
  border-bottom: 1px solid rgba(var(--juno-border-rgb), 0.5);
  transition: background-color 0.2s ease;
}

.table-row:hover {
  background-color: var(--juno-surface-50);
}

.table-row:last-child {
  border-bottom: none;
}

.table-row td {
  padding: var(--juno-space-3) 0;
  vertical-align: middle;
}

/* Transaction description */
.transaction-description {
  color: var(--juno-text);
  font-weight: 500;
  font-size: var(--juno-fs-base);
}

/* Category pill */
.category-pill {
  display: inline-flex;
  padding: var(--juno-space-1) var(--juno-space-2);
  border-radius: var(--juno-radius-sm);
  background-color: var(--juno-pill-bg);
  color: var(--juno-pill-fg);
  font-size: var(--juno-fs-xs);
  font-weight: 500;
}

/* Amount styling */
.amount-expense {
  color: var(--juno-danger-fg);
  font-family: 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
}

.amount-income {
  color: var(--juno-success-fg);
  font-family: 'Geist Mono', monospace;
  font-variant-numeric: tabular-nums;
}

/* Date styling */
.transaction-date {
  color: var(--juno-muted-fg);
  font-size: var(--juno-fs-sm);
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: var(--juno-space-12) var(--juno-space-6);
  color: var(--juno-muted-fg);
}

.empty-state-title {
  font-size: var(--juno-fs-lg);
  font-weight: 500;
  color: var(--juno-text);
  margin-bottom: var(--juno-space-2);
}

.empty-state-description {
  font-size: var(--juno-fs-sm);
  margin-bottom: var(--juno-space-6);
}
```

### 7. Button Styling

```css
/* Primary button (using Juno Button component) */
.btn--primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--juno-space-2);
  padding: var(--juno-space-3) var(--juno-space-4);
  border-radius: var(--juno-radius-lg);
  border: none;
  background-color: var(--juno-accent);
  color: white;
  font-size: var(--juno-fs-base);
  font-weight: 500;
  line-height: 1.5;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 44px; /* Touch target */
  white-space: nowrap;
}

.btn--primary:hover {
  background-color: var(--juno-accent-hover);
  box-shadow: var(--juno-shadow-sm-with-stroke);
}

.btn--primary:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--juno-focus-ring);
}

.btn--primary:active {
  background-color: var(--juno-accent-active);
  transform: translateY(1px);
}

/* Secondary button */
.btn--secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--juno-space-2);
  padding: var(--juno-space-3) var(--juno-space-4);
  border-radius: var(--juno-radius-lg);
  border: 1px solid var(--juno-border);
  background-color: var(--juno-surface-100);
  color: var(--juno-text);
  font-size: var(--juno-fs-base);
  font-weight: 500;
  line-height: 1.5;
  transition: all 0.2s ease;
  cursor: pointer;
  min-height: 44px;
  white-space: nowrap;
}

.btn--secondary:hover {
  background-color: var(--juno-surface-50);
  border-color: var(--juno-muted-fg);
}
```

## Responsive Design Tokens

### Mobile-First Breakpoints

```css
/* Base: Mobile (0px+) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--juno-space-4);
  padding: var(--juno-space-4);
}

/* Small tablet: 640px+ */
@media (min-width: 640px) {
  .dashboard-grid {
    gap: var(--juno-space-6);
    padding: var(--juno-space-6);
  }
}

/* Tablet: 768px+ */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--juno-space-6);
  }
  
  .metric-display {
    grid-column: 1 / -1; /* Full width */
  }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 2fr 1fr;
    gap: var(--juno-space-8);
    padding: var(--juno-space-8);
  }
  
  .chart-container {
    grid-row: 2;
    grid-column: 1;
  }
  
  .transactions-section {
    grid-row: 2;
    grid-column: 2;
  }
}

/* Large desktop: 1280px+ */
@media (min-width: 1280px) {
  .dashboard-grid {
    max-width: 1280px;
    margin: 0 auto;
  }
}
```

### Touch-Friendly Sizing

```css
/* Minimum touch targets */
.touch-target {
  min-width: 44px;
  min-height: 44px;
  padding: var(--juno-space-3);
}

/* Mobile tab navigation */
@media (max-width: 767px) {
  .tab-button {
    min-width: 100px;
    padding: var(--juno-space-4);
    font-size: var(--juno-fs-base);
  }
  
  .tab-list {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .tab-list::-webkit-scrollbar {
    display: none;
  }
}
```

## Accessibility Integration

### ARIA Implementation

```css
/* Focus management */
[role="tab"]:focus,
[role="button"]:focus {
  outline: none;
  box-shadow: 0 0 0 2px var(--juno-focus-ring);
  border-radius: var(--juno-radius-md);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .chart-bar,
  .progress-fill {
    border: 1px solid currentColor;
  }
  
  .btn--primary {
    border: 2px solid var(--juno-accent);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .chart-bar,
  .progress-fill,
  .tab-button {
    transition: none;
  }
  
  @keyframes chartBarGrow {
    from, to {
      opacity: 1;
    }
  }
}
```

### Color Contrast Compliance

All color combinations meet WCAG 2.1 AA standards:

- Text on backgrounds: 4.5:1 contrast ratio
- Large text (18px+): 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio for borders/states
- Status colors: Sufficient contrast for text readability

## Implementation Checklist

### Token Usage Verification

- [ ] All colors use Juno color tokens (no hardcoded hex values)
- [ ] All spacing uses Juno spacing scale (4px base unit)
- [ ] All typography uses Juno font size scale (Major Third progression)
- [ ] All shadows use Juno shadow system with stroke
- [ ] All border radius uses Juno radius scale
- [ ] All interactive states use proper Juno hover/focus colors

### Component Compliance

- [ ] Tab navigation uses proper ARIA roles and states
- [ ] Progress bar includes proper accessibility attributes
- [ ] Buttons use Juno button classes or component variants
- [ ] Cards use standard Juno card styling pattern
- [ ] Tables follow Juno table styling conventions
- [ ] Status indicators use semantic Juno status colors

### Responsive Behavior

- [ ] Mobile-first responsive implementation
- [ ] Touch targets meet 44px minimum size
- [ ] Horizontal scrolling works on mobile for tables/tabs
- [ ] Layout adapts properly across all breakpoints
- [ ] Text scaling works correctly on all devices

### Performance Optimization

- [ ] CSS custom properties used for dynamic values
- [ ] Transitions use optimized easing functions
- [ ] Animations respect prefers-reduced-motion
- [ ] Critical CSS inlined for above-the-fold content
- [ ] Non-critical styles loaded asynchronously

This design system integration ensures that the dashboard layout maintains visual consistency with the broader Juno application while providing an accessible, performant, and delightful user experience across all devices and interaction modes.