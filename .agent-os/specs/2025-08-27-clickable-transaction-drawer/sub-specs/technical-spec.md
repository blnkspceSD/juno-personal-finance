# Technical Specification: Clickable Transaction Drawer

**Feature**: Transaction Details Drawer Implementation  
**Date**: 2025-08-27  
**Type**: Technical Architecture  

## 1. Component Architecture

### 1.1 Component Hierarchy

```
RecentTransactionsCard
├── TransactionItem (enhanced with click handling)
└── TransactionDetailsDrawer
    ├── Sheet (shadcn/ui)
    │   ├── SheetTrigger (transaction row)
    │   └── SheetContent
    │       ├── SheetHeader
    │       │   ├── SheetTitle
    │       │   └── SheetClose
    │       ├── TransactionDetails (content)
    │       └── SheetFooter
    │           └── TransactionActions
    └── LoadingState | ErrorState
```

### 1.2 Core Interfaces

```typescript
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category_id: string;
  category_name: string;
  category_color?: string;
}

interface TransactionDetailsDrawerProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (transactionId: string) => void;
  onDuplicate?: (transaction: Transaction) => void;
  isLoading?: boolean;
  showActions?: {
    delete: boolean;
    duplicate: boolean;
  };
  customTitle?: string;
}

interface TransactionItemProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
  isSelected?: boolean;
}
```

### 1.3 State Management

```typescript
// RecentTransactionsCard state
const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

// Drawer state management
const handleTransactionClick = (transaction: Transaction) => {
  setOpenDrawerId(transaction.id);
};

const handleDrawerClose = () => {
  setOpenDrawerId(null);
};

// Future: Loading state for additional data
const [loadingTransactionId, setLoadingTransactionId] = useState<string | null>(null);
```

## 2. shadcn/ui Sheet Integration

### 2.1 Installation and Setup

```bash
npm install @radix-ui/react-dialog
```

**components/ui/sheet.tsx** (customized for Juno):
```typescript
"use client"

import * as React from "react"
import * as SheetPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"

const Sheet = SheetPrimitive.Root
const SheetTrigger = SheetPrimitive.Trigger
const SheetClose = SheetPrimitive.Close
const SheetPortal = SheetPrimitive.Portal

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: "top" | "right" | "bottom" | "left"
  }
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 gap-4 bg-juno-surface-50 shadow-juno-shadow-lg-with-stroke transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
        side === "right" &&
          "inset-y-0 right-0 h-full w-3/4 border-l border-juno-border data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        className
      )}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-juno-md opacity-70 ring-offset-juno-surface-50 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-juno-focus-ring focus:ring-offset-2 disabled:pointer-events-none">
        <XIcon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
))

// Additional Juno-styled components
const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-2 px-juno-6 py-juno-4 border-b border-juno-border bg-juno-surface-100",
      className
    )}
    {...props}
  />
))

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-juno-text font-semibold text-lg", className)}
    {...props}
  />
))
```

### 2.2 Custom Styling with Juno Tokens

```css
/* Additional Juno-specific Sheet styles */
.transaction-drawer {
  --sheet-width-desktop: 400px;
  --sheet-width-mobile: 100vw;
  --animation-duration-in: 300ms;
  --animation-duration-out: 250ms;
}

.transaction-drawer__content {
  padding: var(--juno-space-6);
  background: var(--juno-surface-50);
  color: var(--juno-text);
}

.transaction-drawer__footer {
  padding: var(--juno-space-6);
  border-top: 1px solid var(--juno-border);
  background: var(--juno-surface-100);
  display: flex;
  gap: var(--juno-space-3);
}

@media (max-width: 640px) {
  .transaction-drawer__footer {
    flex-direction: column;
  }
  
  .transaction-drawer__footer .btn {
    width: 100%;
  }
}
```

## 3. TransactionDetailsDrawer Implementation

### 3.1 Main Component Structure

```typescript
// components/ui/TransactionDetailsDrawer.tsx
"use client"

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Copy } from 'lucide-react';

export function TransactionDetailsDrawer({
  transaction,
  isOpen,
  onClose,
  onDelete,
  onDuplicate,
  isLoading = false,
  showActions = { delete: true, duplicate: true },
  customTitle = "Transaction Details"
}: TransactionDetailsDrawerProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="transaction-drawer">
        <SheetHeader>
          <SheetTitle>{customTitle}</SheetTitle>
        </SheetHeader>
        
        <div className="transaction-drawer__content">
          {isLoading ? (
            <TransactionDetailsLoader />
          ) : (
            <TransactionDetailsContent transaction={transaction} />
          )}
        </div>
        
        <div className="transaction-drawer__footer">
          {showActions.delete && (
            <Button
              variant="destructive"
              size="md"
              onClick={() => onDelete?.(transaction.id)}
              disabled={!onDelete}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Transaction
            </Button>
          )}
          
          {showActions.duplicate && (
            <Button
              variant="secondary"
              size="md"
              onClick={() => onDuplicate?.(transaction)}
              disabled={!onDuplicate}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate Transaction
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

### 3.2 Transaction Details Content

```typescript
// components/ui/TransactionDetailsContent.tsx
interface TransactionDetailsContentProps {
  transaction: Transaction;
}

export function TransactionDetailsContent({ transaction }: TransactionDetailsContentProps) {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(Math.abs(transaction.amount));

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-juno-6">
      {/* Primary Information */}
      <div className="space-y-juno-2">
        <div className="flex items-start justify-between">
          <h2 className="text-xl font-medium text-juno-text leading-tight flex-1">
            {transaction.description}
          </h2>
          <div className="text-2xl font-semibold text-juno-text ml-juno-4">
            {formattedAmount}
          </div>
        </div>
        <p className="text-sm text-juno-muted-fg">
          {formattedDate}
        </p>
      </div>

      {/* Category Section */}
      <div className="space-y-juno-3">
        <h3 className="text-sm font-medium text-juno-text">Category</h3>
        <div className="flex items-center space-x-juno-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: transaction.category_color || 'var(--juno-muted-fg)' }}
          />
          <span className="text-sm text-juno-text">{transaction.category_name}</span>
        </div>
      </div>

      {/* Future Sections - Placeholder Implementation */}
      <div className="space-y-juno-4 opacity-50">
        <div>
          <h3 className="text-sm font-medium text-juno-text mb-juno-2">Payment Method</h3>
          <p className="text-sm text-juno-muted-fg">Coming soon</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-juno-text mb-juno-2">Notes</h3>
          <p className="text-sm text-juno-muted-fg">Coming soon</p>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-juno-text mb-juno-2">Receipt</h3>
          <p className="text-sm text-juno-muted-fg">Coming soon</p>
        </div>
      </div>
    </div>
  );
}
```

### 3.3 Loading State Component

```typescript
// components/ui/TransactionDetailsLoader.tsx
export function TransactionDetailsLoader() {
  return (
    <div className="space-y-juno-6">
      <div className="space-y-juno-2">
        <div className="flex justify-between items-start">
          <div className="h-6 bg-juno-surface-200 rounded-juno-md w-3/4 animate-pulse" />
          <div className="h-8 bg-juno-surface-200 rounded-juno-md w-20 animate-pulse" />
        </div>
        <div className="h-4 bg-juno-surface-200 rounded-juno-md w-24 animate-pulse" />
      </div>
      
      <div className="space-y-juno-3">
        <div className="h-4 bg-juno-surface-200 rounded-juno-md w-16 animate-pulse" />
        <div className="flex items-center space-x-juno-3">
          <div className="w-3 h-3 bg-juno-surface-200 rounded-full animate-pulse" />
          <div className="h-4 bg-juno-surface-200 rounded-juno-md w-32 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
```

## 4. Enhanced Transaction Item

### 4.1 Clickable Transaction Item

```typescript
// Update to existing transaction item in RecentTransactionsCard
interface ClickableTransactionItemProps {
  transaction: Transaction;
  onClick: (transaction: Transaction) => void;
  isSelected?: boolean;
}

function ClickableTransactionItem({ 
  transaction, 
  onClick, 
  isSelected = false 
}: ClickableTransactionItemProps) {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(transaction);
    }
  };

  const handleClick = () => {
    onClick(transaction);
  };

  return (
    <div
      className={cn(
        "flex items-center px-juno-4 py-juno-4 transition-all duration-150 cursor-pointer",
        "hover:bg-juno-surface-300 hover:translate-x-1",
        "focus-visible:outline-2 focus-visible:outline-juno-focus-ring focus-visible:outline-offset-2",
        isSelected && "bg-juno-surface-300"
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`View details for transaction: ${transaction.description}, ${Math.abs(transaction.amount).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`}
    >
      {/* Existing transaction item content */}
      <div
        className="w-1 h-10 rounded-full mr-juno-4 flex-shrink-0"
        style={{ backgroundColor: transaction.category_color || 'var(--juno-muted-fg)' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-juno-text truncate">
          {transaction.description}
        </p>
        <p className="text-xs text-juno-muted-fg">
          {new Date(transaction.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}
        </p>
      </div>
      <div className="text-right ml-juno-4">
        <p className="text-sm font-medium text-juno-text">
          ${Math.abs(transaction.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
}
```

### 4.2 Integration with RecentTransactionsCard

```typescript
// Updated RecentTransactionsCard component
export function RecentTransactionsCard({ transactions }: RecentTransactionsCardProps) {
  const [openDrawerId, setOpenDrawerId] = useState<string | null>(null);

  const handleTransactionClick = (transaction: Transaction) => {
    setOpenDrawerId(transaction.id);
  };

  const handleDrawerClose = () => {
    setOpenDrawerId(null);
  };

  const handleDelete = (transactionId: string) => {
    // TODO: Implement delete functionality
    console.log('Delete transaction:', transactionId);
    setOpenDrawerId(null);
  };

  const handleDuplicate = (transaction: Transaction) => {
    // TODO: Implement duplicate functionality
    console.log('Duplicate transaction:', transaction);
    setOpenDrawerId(null);
  };

  return (
    <Card className="bg-juno-surface-50 rounded-juno-xl shadow-juno-card-with-stroke flex flex-col h-full">
      <CardHeader className="px-juno-6 pb-juno-4">
        <CardTitle className="!text-sm !text-gray-400 !font-medium tracking-wider">
          RECENT TRANSACTIONS
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col" noPadding>
        {transactions.length > 0 ? (
          <>
            <div className="space-y-0 flex-1">
              {transactions.slice(0, 7).map((transaction) => (
                <ClickableTransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onClick={handleTransactionClick}
                  isSelected={openDrawerId === transaction.id}
                />
              ))}
            </div>

            {/* Existing action buttons */}
            <div className="px-juno-6 pb-juno-6 pt-juno-4 space-y-juno-3">
              {/* ... existing buttons ... */}
            </div>
          </>
        ) : (
          {/* ... existing empty state ... */}
        )}

        {/* Transaction Details Drawer */}
        {openDrawerId && (
          <TransactionDetailsDrawer
            transaction={transactions.find(t => t.id === openDrawerId)!}
            isOpen={true}
            onClose={handleDrawerClose}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            showActions={{ delete: false, duplicate: true }} // Hide delete in recent transactions
          />
        )}
      </CardContent>
    </Card>
  );
}
```

## 5. Performance Optimizations

### 5.1 Component Memoization

```typescript
// Memoize components to prevent unnecessary re-renders
export const TransactionDetailsDrawer = React.memo(function TransactionDetailsDrawer({
  transaction,
  isOpen,
  onClose,
  onDelete,
  onDuplicate,
  isLoading,
  showActions,
  customTitle
}: TransactionDetailsDrawerProps) {
  // ... component implementation
});

export const ClickableTransactionItem = React.memo(function ClickableTransactionItem({
  transaction,
  onClick,
  isSelected
}: ClickableTransactionItemProps) {
  // ... component implementation
});
```

### 5.2 Lazy Loading Strategy

```typescript
// Lazy load drawer content
const TransactionDetailsContent = React.lazy(() => 
  import('./TransactionDetailsContent').then(module => ({ 
    default: module.TransactionDetailsContent 
  }))
);

// Conditional rendering with Suspense
{isOpen && (
  <Suspense fallback={<TransactionDetailsLoader />}>
    <TransactionDetailsContent transaction={transaction} />
  </Suspense>
)}
```

### 5.3 Event Handler Optimization

```typescript
// Memoize event handlers to prevent re-renders
const handleTransactionClick = useCallback((transaction: Transaction) => {
  setOpenDrawerId(transaction.id);
}, []);

const handleDrawerClose = useCallback(() => {
  setOpenDrawerId(null);
}, []);

// Debounce rapid interactions
const debouncedHandleClick = useMemo(
  () => debounce(handleTransactionClick, 150),
  [handleTransactionClick]
);
```

## 6. Accessibility Implementation

### 6.1 ARIA Attributes

```typescript
// Comprehensive ARIA support
<div
  role="button"
  tabIndex={0}
  aria-label={`View transaction details: ${transaction.description}, amount ${formattedAmount}, date ${formattedDate}`}
  aria-expanded={isSelected}
  aria-haspopup="dialog"
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  {/* Transaction content */}
</div>

// Sheet with proper dialog roles
<SheetContent
  role="dialog"
  aria-labelledby="transaction-dialog-title"
  aria-describedby="transaction-dialog-description"
>
  <SheetTitle id="transaction-dialog-title">
    Transaction Details
  </SheetTitle>
  <div id="transaction-dialog-description">
    View and manage transaction information
  </div>
</SheetContent>
```

### 6.2 Focus Management

```typescript
// Focus trap implementation
import { useFocusTrap } from '@/hooks/useFocusTrap';

export function TransactionDetailsDrawer({ isOpen, onClose, ...props }) {
  const focusTrapRef = useFocusTrap(isOpen);
  
  useEffect(() => {
    if (isOpen) {
      // Focus first interactive element
      const firstButton = focusTrapRef.current?.querySelector('button');
      firstButton?.focus();
    }
  }, [isOpen]);

  return (
    <SheetContent ref={focusTrapRef}>
      {/* Content */}
    </SheetContent>
  );
}
```

### 6.3 Keyboard Navigation

```typescript
// Enhanced keyboard support
const handleKeyDown = (event: React.KeyboardEvent) => {
  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault();
      onClick(transaction);
      break;
    case 'Escape':
      if (isSelected) {
        event.preventDefault();
        onClose();
      }
      break;
    case 'ArrowDown':
    case 'ArrowUp':
      // Navigate between transaction items
      handleArrowNavigation(event);
      break;
  }
};
```

## 7. Testing Strategy

### 7.1 Unit Testing

```typescript
// Test file structure
describe('TransactionDetailsDrawer', () => {
  it('opens drawer when transaction is clicked', () => {
    // Test implementation
  });

  it('displays transaction information correctly', () => {
    // Test implementation
  });

  it('handles keyboard navigation', () => {
    // Test implementation
  });

  it('closes drawer on escape key', () => {
    // Test implementation
  });
});
```

### 7.2 Accessibility Testing

```typescript
// Automated accessibility testing
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<TransactionDetailsDrawer {...props} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 7.3 Integration Testing

```typescript
// End-to-end testing with Playwright
test('transaction drawer workflow', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Click transaction item
  await page.click('[data-testid="transaction-item-0"]');
  
  // Verify drawer opens
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  
  // Verify transaction details
  await expect(page.locator('h2')).toContainText('Pizza delivery');
  
  // Close with escape
  await page.keyboard.press('Escape');
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});
```

## 8. Bundle Size Analysis

### 8.1 Expected Impact

```
@radix-ui/react-dialog: ~8.2KB (gzipped)
Additional component code: ~2.1KB (gzipped)
Total bundle increase: ~10.3KB (gzipped)

Current bundle size: ~180KB
New total: ~190KB
Percentage increase: ~5.7%
```

### 8.2 Optimization Strategies

- Lazy load drawer components
- Tree-shake unused Radix UI components
- Use dynamic imports for non-critical functionality
- Implement code splitting for drawer content

This technical specification provides comprehensive implementation details for the clickable transaction drawer feature, ensuring maintainable, accessible, and performant code that integrates seamlessly with the existing Juno Design System.