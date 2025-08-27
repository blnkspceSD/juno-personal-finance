# Button Component Technical Specification

**Component**: Enhanced Button System  
**Date**: 2025-08-24  
**Dependencies**: Juno Design Tokens  

## 1. Component API

### 1.1 Button Props Interface

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
```

### 1.2 CSS Class Structure

```css
/* Base button class */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-geist-sans);
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 150ms ease-out;
  position: relative;
  overflow: hidden;
}

/* Variant classes */
.btn--primary { /* existing implementation */ }
.btn--secondary { /* existing implementation */ }
.btn--ghost {
  background: transparent;
  border: none;
  color: var(--juno-accent);
}
.btn--destructive {
  background: var(--juno-btn-destructive-bg);
  color: var(--juno-btn-destructive-fg);
  border: 1px solid var(--juno-btn-destructive-fg);
}
.btn--success {
  background: var(--juno-btn-success-bg);
  color: var(--juno-btn-success-fg);
  border: 1px solid var(--juno-btn-success-fg);
}
.btn--warning {
  background: var(--juno-btn-warning-bg);
  color: var(--juno-btn-warning-fg);
  border: 1px solid var(--juno-btn-warning-fg);
}

/* Size classes */
.btn--sm {
  height: var(--juno-btn-sm-height);
  padding: var(--juno-space-2) var(--juno-space-3);
  font-size: var(--juno-fs-code);
  border-radius: var(--juno-radius-md);
}
.btn--md {
  height: var(--juno-btn-md-height);
  padding: var(--juno-space-3) var(--juno-space-4);
  font-size: var(--juno-fs-body);
  border-radius: var(--juno-radius-lg);
}
.btn--lg {
  height: var(--juno-btn-lg-height);
  padding: var(--juno-space-4) var(--juno-space-6);
  font-size: var(--juno-fs-body-large);
  border-radius: var(--juno-radius-lg);
}

/* State classes */
.btn--loading {
  color: transparent;
}
.btn--disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
```

## 2. Design Token Requirements

### 2.1 New Tokens to Add

```css
/* Button variant backgrounds */
--juno-btn-ghost-hover-bg: rgba(133, 214, 255, 0.1);
--juno-btn-destructive-bg: #FEF2F2;
--juno-btn-destructive-fg: #DC2626;
--juno-btn-destructive-hover-bg: #FECACA;
--juno-btn-success-bg: #F0FDF4;
--juno-btn-success-fg: #166534;
--juno-btn-success-hover-bg: #DCFCE7;
--juno-btn-warning-bg: #FFFBEB;
--juno-btn-warning-fg: #D97706;
--juno-btn-warning-hover-bg: #FEF3C7;

/* Button sizes */
--juno-btn-sm-height: 32px;
--juno-btn-md-height: 40px;
--juno-btn-lg-height: 48px;

/* Loading spinner */
--juno-btn-spinner-size-sm: 16px;
--juno-btn-spinner-size-md: 20px;
--juno-btn-spinner-size-lg: 24px;
```

## 3. Component Implementation

### 3.1 React Component

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    disabled = false, 
    children, 
    className, 
    onClick,
    ...props 
  }, ref) => {
    const baseClasses = 'btn';
    const variantClass = `btn--${variant}`;
    const sizeClass = `btn--${size}`;
    const stateClasses = {
      'btn--loading': loading,
      'btn--disabled': disabled || loading
    };

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        event.preventDefault();
        return;
      }
      onClick?.(event);
    };

    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClass, sizeClass, stateClasses, className)}
        disabled={disabled || loading}
        onClick={handleClick}
        aria-busy={loading}
        {...props}
      >
        {loading && <Spinner size={size} />}
        <span className={loading ? 'opacity-0' : ''}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button };
```

### 3.2 Spinner Component

```tsx
const Spinner = ({ size }: { size: 'sm' | 'md' | 'lg' }) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div
      className={`absolute animate-spin rounded-full border-2 border-transparent border-t-current ${sizeMap[size]}`}
      role="status"
      aria-label="Loading"
    />
  );
};
```

## 4. Hover States

### 4.1 Hover Implementations

```css
.btn--primary:hover:not(.btn--disabled) {
  filter: brightness(1.05);
}

.btn--secondary:hover:not(.btn--disabled) {
  background: var(--juno-surface-50);
}

.btn--ghost:hover:not(.btn--disabled) {
  background: var(--juno-btn-ghost-hover-bg);
}

.btn--destructive:hover:not(.btn--disabled) {
  background: var(--juno-btn-destructive-hover-bg);
}

.btn--success:hover:not(.btn--disabled) {
  background: var(--juno-btn-success-hover-bg);
}

.btn--warning:hover:not(.btn--disabled) {
  background: var(--juno-btn-warning-hover-bg);
}
```

## 5. Accessibility

### 5.1 ARIA Attributes

- `aria-busy="true"` when loading
- `aria-disabled="true"` when disabled
- `role="button"` for non-button elements
- Proper focus indicators via CSS `:focus-visible`

### 5.2 Keyboard Navigation

- Enter and Space key activation
- Focus management with Tab navigation
- Disabled buttons skip focus
- Loading buttons prevent activation

### 5.3 Screen Reader Support

```tsx
// Loading announcement
{loading && <span className="sr-only">Loading...</span>}

// Disabled state communication
{disabled && <span className="sr-only">Button disabled</span>}
```

## 6. Usage Examples

### 6.1 Basic Usage

```tsx
// Primary action
<Button variant="primary" size="md">
  Save Changes
</Button>

// Destructive action
<Button variant="destructive" size="sm" onClick={handleDelete}>
  Delete Item
</Button>

// Loading state
<Button variant="primary" loading={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save'}
</Button>
```

### 6.2 Form Integration

```tsx
<form onSubmit={handleSubmit}>
  <div className="flex gap-juno-3">
    <Button variant="secondary" type="button" onClick={handleCancel}>
      Cancel
    </Button>
    <Button variant="primary" type="submit" loading={isSubmitting}>
      Submit
    </Button>
  </div>
</form>
```

## 7. Testing Requirements

### 7.1 Unit Tests

- [ ] Renders all variants correctly
- [ ] Applies size classes properly
- [ ] Handles loading state
- [ ] Prevents clicks when disabled
- [ ] Calls onClick handler appropriately

### 7.2 Accessibility Tests

- [ ] Keyboard navigation works
- [ ] Screen reader announcements
- [ ] Focus indicators visible
- [ ] ARIA attributes present

### 7.3 Visual Tests

- [ ] All variants match design
- [ ] Hover states work correctly
- [ ] Loading spinner displays
- [ ] Responsive behavior on different sizes

## 8. Migration Guide

### 8.1 Existing Button Updates

```tsx
// Before
<button className="btn--primary">Save</button>

// After (no changes needed for existing usage)
<Button variant="primary">Save</Button>

// Or continue using CSS classes
<button className="btn btn--primary btn--md">Save</button>
```

### 8.2 New Variant Usage

```tsx
// Ghost buttons for subtle actions
<Button variant="ghost" size="sm">Learn More</Button>

// Destructive actions
<Button variant="destructive" onClick={handleDelete}>
  Delete Account
</Button>
```

## 9. Performance Considerations

- Component tree-shaking friendly
- Minimal CSS bundle impact (~2KB additional)
- Efficient re-renders with React.forwardRef
- Loading state doesn't cause layout shift