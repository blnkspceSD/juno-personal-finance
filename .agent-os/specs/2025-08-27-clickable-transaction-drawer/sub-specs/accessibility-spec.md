# Accessibility Specification: Transaction Drawer

**Feature**: Clickable Transaction Items with Accessible Drawer  
**Date**: 2025-08-27  
**WCAG Version**: 2.1 AA Compliance  

## 1. Overview

This specification ensures the transaction drawer implementation meets WCAG 2.1 AA accessibility standards, providing an inclusive experience for all users including those using screen readers, keyboard navigation, and other assistive technologies.

## 2. Keyboard Navigation

### 2.1 Transaction Item Interaction

**Required Keyboard Support**:
- **Tab**: Navigate to transaction items in sequential order
- **Enter/Space**: Open transaction details drawer
- **Arrow Keys**: Navigate between transaction items (optional enhancement)
- **Escape**: Close drawer when focused within it

**Implementation**:
```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ': // Space bar
      event.preventDefault();
      onClick(transaction);
      break;
    case 'ArrowDown':
      event.preventDefault();
      focusNextTransaction();
      break;
    case 'ArrowUp':
      event.preventDefault();
      focusPreviousTransaction();
      break;
  }
};
```

**Focus Indicators**:
```css
.transaction-item--clickable:focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
  border-radius: var(--juno-radius-md);
}
```

### 2.2 Drawer Navigation

**Focus Management**:
1. When drawer opens, focus moves to first interactive element (close button)
2. Tab navigation cycles through all interactive elements within drawer
3. Focus remains trapped within drawer until closed
4. When drawer closes, focus returns to originating transaction item

**Implementation**:
```typescript
// Focus trap hook
const useFocusTrap = (isActive: boolean) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !elementRef.current) return;

    const element = elementRef.current;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    firstElement?.focus();
    element.addEventListener('keydown', handleTabKey);
    
    return () => element.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return elementRef;
};
```

## 3. Screen Reader Support

### 3.1 ARIA Attributes

**Transaction Items**:
```html
<div
  role="button"
  tabIndex={0}
  aria-label="View transaction details: Pizza delivery from Domino's, $28.45 on August 21st"
  aria-expanded={isDrawerOpen}
  aria-haspopup="dialog"
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  <!-- Transaction content -->
</div>
```

**Drawer Implementation**:
```html
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="transaction-dialog-title"
  aria-describedby="transaction-dialog-description"
>
  <h1 id="transaction-dialog-title">Transaction Details</h1>
  <div id="transaction-dialog-description">
    View and manage detailed information for this transaction
  </div>
  
  <!-- Content with proper heading hierarchy -->
  <h2>Transaction Information</h2>
  <h3>Category</h3>
  <h3>Payment Method</h3>
  
  <!-- Action buttons with clear labels -->
  <button aria-label="Delete this transaction">
    <TrashIcon />
    Delete Transaction
  </button>
</div>
```

### 3.2 Live Regions

**Status Announcements**:
```typescript
// Announce drawer state changes
const [announcement, setAnnouncement] = useState('');

const announceDrawerOpen = (transactionDescription: string) => {
  setAnnouncement(`Transaction details dialog opened for ${transactionDescription}`);
  // Clear after screen reader has time to announce
  setTimeout(() => setAnnouncement(''), 1000);
};

const announceDrawerClose = () => {
  setAnnouncement('Transaction details dialog closed');
  setTimeout(() => setAnnouncement(''), 1000);
};

// In component JSX
<div
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {announcement}
</div>
```

### 3.3 Screen Reader Optimized Content

**Descriptive Labels**:
```typescript
// Dynamic aria-label generation
const generateTransactionLabel = (transaction: Transaction) => {
  const amount = Math.abs(transaction.amount).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  
  const date = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return `View transaction details: ${transaction.description}, amount ${amount}, dated ${date}, category ${transaction.category_name}`;
};
```

**Structured Content**:
```html
<!-- Proper heading hierarchy in drawer -->
<div role="region" aria-labelledby="transaction-overview">
  <h2 id="transaction-overview">Transaction Overview</h2>
  
  <dl>
    <dt>Description</dt>
    <dd>{transaction.description}</dd>
    
    <dt>Amount</dt>
    <dd>${formattedAmount}</dd>
    
    <dt>Date</dt>
    <dd>
      <time dateTime={transaction.date}>
        {formattedDate}
      </time>
    </dd>
    
    <dt>Category</dt>
    <dd>
      <span aria-label={`Category: ${transaction.category_name}`}>
        {transaction.category_name}
      </span>
    </dd>
  </dl>
</div>
```

## 4. Visual Accessibility

### 4.1 Color and Contrast

**Contrast Requirements**:
- Text contrast ratio: Minimum 4.5:1 (AA standard)
- Large text contrast ratio: Minimum 3:1
- Interactive element contrast: Minimum 3:1

**Juno Token Compliance**:
```css
/* Ensure high contrast with Juno tokens */
.transaction-item {
  color: var(--juno-text); /* High contrast against surface */
  background: var(--juno-surface-50);
}

.transaction-item:hover {
  background: var(--juno-surface-300); /* Maintains contrast */
}

.transaction-item:focus-visible {
  outline: 2px solid var(--juno-focus-ring); /* High contrast focus */
}

/* Category color indicators with accessibility */
.category-indicator {
  border: 1px solid var(--juno-border); /* Ensures visibility without color */
  min-width: 12px;
  min-height: 12px;
}

/* Ensure text remains readable over any category color */
.category-indicator + .category-text {
  color: var(--juno-text);
}
```

### 4.2 Focus Indicators

**Visible Focus States**:
```css
/* High visibility focus indicators */
.transaction-item--clickable:focus-visible,
.drawer-button:focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
  transition: outline 0ms; /* Immediate focus visibility */
}

/* Focus within drawer */
.transaction-drawer *:focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 1px;
  border-radius: 2px;
}
```

### 4.3 Reduced Motion Support

**Animation Preferences**:
```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .transaction-item--clickable {
    transition: none;
  }
  
  .transaction-drawer,
  .drawer-overlay {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .transaction-drawer {
    transition: transform 300ms ease-out;
  }
  
  .drawer-overlay {
    transition: opacity 200ms ease-out;
  }
}
```

## 5. Touch and Mobile Accessibility

### 5.1 Touch Target Sizes

**Minimum Touch Targets**:
```css
/* WCAG AAA: 44×44px minimum touch targets */
.transaction-item--clickable {
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: var(--juno-space-3) var(--juno-space-4); /* Ensures adequate padding */
}

.drawer-close-button {
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drawer-action-button {
  min-height: 44px;
  padding: var(--juno-space-3) var(--juno-space-4);
}
```

### 5.2 Mobile Screen Reader Support

**iOS VoiceOver Compatibility**:
```typescript
// Enhanced mobile accessibility attributes
const mobileAccessibilityProps = {
  role: 'button',
  'aria-label': generateTransactionLabel(transaction),
  'aria-haspopup': 'dialog',
  'aria-expanded': isOpen ? 'true' : 'false',
  // iOS specific
  'data-testid': `transaction-${transaction.id}`,
};
```

**Android TalkBack Support**:
```html
<!-- Clear content descriptions for TalkBack -->
<div
  role="button"
  tabIndex={0}
  aria-label="Transaction button"
  aria-describedby="transaction-description"
>
  <div id="transaction-description" className="sr-only">
    {fullTransactionDescription}
  </div>
  <!-- Visible content -->
</div>
```

## 6. Error Handling and States

### 6.1 Loading States

**Accessible Loading Indicators**:
```typescript
// Loading state with screen reader support
const LoadingState = () => (
  <div
    role="status"
    aria-live="polite"
    aria-label="Loading transaction details"
  >
    <div className="loading-skeleton" aria-hidden="true">
      {/* Visual loading indicators */}
    </div>
    <span className="sr-only">Loading transaction details, please wait</span>
  </div>
);
```

### 6.2 Error States

**Error Communication**:
```typescript
// Error state with clear messaging
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div
    role="alert"
    aria-live="assertive"
    className="error-container"
  >
    <h3>Unable to load transaction details</h3>
    <p>{error}</p>
    <button
      onClick={onRetry}
      aria-describedby="retry-description"
    >
      Try Again
    </button>
    <div id="retry-description" className="sr-only">
      Retry loading transaction details
    </div>
  </div>
);
```

## 7. Testing Requirements

### 7.1 Automated Accessibility Testing

**Required Tools**:
- axe-core for automated WCAG compliance
- React Testing Library for screen reader testing
- Lighthouse accessibility audits

**Test Implementation**:
```typescript
// Automated accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

expect.extend(toHaveNoViolations);

describe('Transaction Drawer Accessibility', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<TransactionDrawerTest />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should support keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<TransactionDrawerTest />);
    
    const transactionItem = screen.getByRole('button', { name: /pizza delivery/i });
    
    // Test keyboard opening
    await user.tab();
    expect(transactionItem).toHaveFocus();
    
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    
    // Test escape closing
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(transactionItem).toHaveFocus();
  });

  it('should announce state changes to screen readers', async () => {
    const { container } = render(<TransactionDrawerTest />);
    
    // Check for live regions
    const liveRegion = container.querySelector('[aria-live="polite"]');
    expect(liveRegion).toBeInTheDocument();
  });
});
```

### 7.2 Manual Testing Checklist

**Keyboard Navigation Testing**:
- [ ] Tab navigation reaches all transaction items
- [ ] Enter/Space opens drawer from transaction items
- [ ] Focus moves to drawer when opened
- [ ] Tab cycles through drawer elements only
- [ ] Escape closes drawer
- [ ] Focus returns to original transaction item
- [ ] Arrow keys navigate between transactions (if implemented)

**Screen Reader Testing** (NVDA, JAWS, VoiceOver):
- [ ] Transaction items are announced with full context
- [ ] Drawer opening is announced
- [ ] Drawer content is read in logical order
- [ ] Action buttons have clear labels
- [ ] State changes are announced
- [ ] Drawer closing is announced

**Mobile Accessibility Testing**:
- [ ] Touch targets meet 44px minimum
- [ ] VoiceOver navigation works correctly (iOS)
- [ ] TalkBack navigation works correctly (Android)
- [ ] Gesture support for closing drawer
- [ ] Pinch-to-zoom doesn't break interaction

### 7.3 Accessibility Audit Requirements

**Pre-Launch Checklist**:
- [ ] WCAG 2.1 AA compliance verified with axe-core
- [ ] Manual keyboard testing completed
- [ ] Screen reader testing with NVDA and VoiceOver
- [ ] Mobile accessibility testing on iOS and Android
- [ ] Color contrast ratios verified (4.5:1 minimum)
- [ ] Focus indicators visible and consistent
- [ ] Reduced motion preferences respected
- [ ] Touch targets meet accessibility guidelines

## 8. Implementation Guidelines

### 8.1 Development Priorities

1. **Critical (Must Have)**:
   - Keyboard navigation
   - Screen reader support
   - Focus management
   - ARIA attributes

2. **Important (Should Have)**:
   - High contrast modes
   - Reduced motion support
   - Touch target optimization
   - Mobile screen reader support

3. **Nice to Have**:
   - Advanced keyboard shortcuts
   - Voice control support
   - Gesture navigation

### 8.2 Code Review Requirements

**Accessibility Review Checklist**:
- [ ] All interactive elements have proper ARIA labels
- [ ] Focus management is implemented correctly
- [ ] Keyboard navigation works as expected
- [ ] Screen reader announcements are appropriate
- [ ] Color is not the only way to convey information
- [ ] Touch targets meet minimum size requirements
- [ ] Reduced motion preferences are respected

This accessibility specification ensures that the transaction drawer feature provides an inclusive experience for all users, meeting WCAG 2.1 AA standards while maintaining the high-quality user experience expected from the Juno application.