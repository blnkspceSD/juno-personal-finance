# Design System Integration Specification

This is the design system integration specification for the spec detailed in @.agent-os/specs/2025-08-23-dashboard-ui-redesign/spec.md

> Created: 2025-08-23
> Version: 1.0.0

## Juno Design System Requirements

The dashboard redesign must strictly adhere to the established Juno Design System patterns and tokens to ensure consistency with the overall application design.

## Typography Implementation

### Heading Hierarchy

**Main Spending Amount:**
```css
.spending-amount-primary {
  font-size: 2.25rem; /* text-4xl */
  font-weight: 700;   /* font-bold */
  line-height: 1.1;   /* tracking-tight */
  letter-spacing: -0.025em;
}
```

**Budget Limit (Secondary Amount):**
```css
.spending-amount-secondary {
  font-size: 1.25rem; /* text-xl */
  font-weight: 400;   /* font-normal */
  color: hsl(var(--muted-foreground));
}
```

**Section Headers (ALL CAPS):**
```css
.section-header {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;    /* font-medium */
  letter-spacing: 0.05em; /* tracking-wide */
  text-transform: uppercase;
  color: hsl(var(--muted-foreground));
}
```

**Transaction Descriptions:**
```css
.transaction-description {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;    /* font-medium */
  color: hsl(var(--foreground));
}
```

**Transaction Dates:**
```css
.transaction-date {
  font-size: 0.75rem; /* text-xs */
  font-weight: 400;   /* font-normal */
  color: hsl(var(--muted-foreground));
}
```

**Transaction Amounts:**
```css
.transaction-amount {
  font-size: 0.875rem; /* text-sm */
  font-weight: 500;    /* font-medium */
  color: hsl(var(--foreground));
}
```

## Color Palette Integration

### Background Colors
```css
:root {
  --dashboard-background: hsl(var(--background));
  --card-background: hsl(var(--card));
  --muted-background: hsl(var(--muted));
}
```

### Text Colors
```css
:root {
  --primary-text: hsl(var(--foreground));
  --secondary-text: hsl(var(--muted-foreground));
  --accent-text: hsl(var(--primary));
}
```

### Category Colors (From Database)
- Use existing category group color values
- Ensure proper contrast ratios for accessibility
- Apply consistent opacity for hover states

### Chart Color Mapping
```typescript
const getCategoryGroupColors = (groups: CategoryGroup[]): Record<string, string> => {
  return groups.reduce((acc, group) => ({
    ...acc,
    [group.id]: group.color
  }), {})
}
```

## Spacing and Layout

### Grid System
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 2rem; /* 32px */
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 1.5rem; /* 24px */
  }
}
```

### Component Spacing
```css
.spending-overview-spacing {
  gap: 1.5rem; /* 24px between elements */
}

.transaction-row-spacing {
  padding: 0.5rem 0.75rem; /* py-2 px-3 */
  gap: 0.75rem; /* 12px between elements */
}

.card-padding {
  padding: 1.5rem; /* p-6 */
}

.card-header-padding {
  padding: 1.5rem 1.5rem 0.75rem 1.5rem; /* px-6 pt-6 pb-3 */
}
```

### Border Radius
```css
.card-border-radius {
  border-radius: 1.5rem; /* 24px - modern rounded corners */
}

.chart-border-radius {
  border-radius: 0.5rem; /* 8px */
}

.color-indicator-radius {
  border-radius: 9999px; /* rounded-full */
}

.transaction-row-radius {
  border-radius: 0.5rem; /* 8px */
}
```

## Component Styling

### Card Components
```css
.dashboard-card {
  background-color: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 1.5rem;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
}

.dashboard-card:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.2s ease-in-out;
}
```

### Button Styling
```css
.btn--primary {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.btn--secondary {
  background-color: transparent;
  color: hsl(var(--muted-foreground));
  border: 1px solid hsl(var(--border));
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
}

.btn--ghost {
  background-color: transparent;
  color: hsl(var(--foreground));
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-weight: 500;
  font-size: 0.875rem;
}
```

## Interactive States

### Hover States
```css
.transaction-row:hover {
  background-color: hsl(var(--muted) / 0.5);
  transition: background-color 0.15s ease-in-out;
}

.chart-segment:hover {
  opacity: 0.8;
  transition: opacity 0.15s ease-in-out;
}

.action-button:hover {
  transform: translateY(-1px);
  transition: transform 0.15s ease-in-out;
}
```

### Focus States
```css
.focusable:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
  border-radius: 0.5rem;
}
```

### Loading States
```css
.skeleton {
  background: linear-gradient(
    90deg,
    hsl(var(--muted) / 0.8) 0%,
    hsl(var(--muted) / 0.4) 50%,
    hsl(var(--muted) / 0.8) 100%
  );
  background-size: 200% 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

## Responsive Design Tokens

### Breakpoints
```css
:root {
  --breakpoint-mobile: 768px;
  --breakpoint-tablet: 1024px;
  --breakpoint-desktop: 1280px;
}
```

### Responsive Typography
```css
@media (max-width: 768px) {
  .spending-amount-primary {
    font-size: 2rem; /* text-3xl on mobile */
  }
  
  .spending-amount-secondary {
    font-size: 1.125rem; /* text-lg on mobile */
  }
}
```

### Responsive Spacing
```css
@media (max-width: 768px) {
  .dashboard-grid {
    gap: 1rem; /* 16px on mobile */
  }
  
  .card-padding {
    padding: 1rem; /* p-4 on mobile */
  }
}
```

## Dark Mode Support

### CSS Variables Integration
```css
[data-theme="dark"] {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  --muted: 217.2 32.6% 17.5%;
  --muted-foreground: 215 20.2% 65.1%;
  --border: 217.2 32.6% 17.5%;
}
```

### Dark Mode Chart Colors
- Ensure category colors work in dark mode
- Adjust opacity for better contrast
- Test chart readability in both themes

## Accessibility Compliance

### Color Contrast Requirements
- All text must meet WCAG AA standards (4.5:1 minimum)
- Interactive elements must meet contrast requirements
- Chart segments must be distinguishable

### Focus Management
```css
.keyboard-navigation:focus {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Screen Reader Support
```html
<!-- ARIA labels for screen readers -->
<div aria-label="Spending overview section">
  <p aria-live="polite">Current spending: $920 of $1000 budget</p>
</div>

<div role="list" aria-label="Recent transactions">
  <div role="listitem" aria-describedby="transaction-1">
    <span id="transaction-1">Pizza delivery from Dominos, $28.45 on August 16</span>
  </div>
</div>
```

## Implementation Guidelines

### CSS Class Naming
- Use Tailwind CSS utility classes where appropriate
- Create custom CSS classes for complex components
- Follow BEM methodology for custom classes

### Component Props Integration
```typescript
interface DesignSystemProps {
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  theme?: 'light' | 'dark' | 'auto'
}
```

### Consistent API Patterns
- All dashboard components should accept `className` prop
- Use consistent prop naming across components
- Implement proper TypeScript interfaces for all props

## Quality Assurance

### Design System Compliance Checklist
- [ ] Typography matches Juno Design System specifications
- [ ] Color usage follows established palette
- [ ] Spacing uses consistent token values
- [ ] Interactive states are implemented consistently
- [ ] Dark mode support is complete
- [ ] Accessibility requirements are met
- [ ] Responsive design works across all breakpoints
- [ ] Component APIs are consistent with existing patterns