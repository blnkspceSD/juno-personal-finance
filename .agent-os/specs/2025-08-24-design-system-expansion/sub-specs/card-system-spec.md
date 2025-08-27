# Card System Technical Specification

**Component**: Card Layout System  
**Date**: 2025-08-24  
**Dependencies**: Juno Design Tokens  

## 1. Component API

### 1.1 Card Props Interface

```typescript
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'flat' | 'interactive';
  size?: 'compact' | 'default' | 'spacious';
  status?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
  children: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  children: React.ReactNode;
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  children: React.ReactNode;
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children: React.ReactNode;
}
```

### 1.2 CSS Class Structure

```css
/* Base card */
.card {
  background: var(--juno-surface-100);
  border: 1px solid var(--juno-border);
  border-radius: var(--juno-radius-xl);
  box-shadow: var(--juno-shadow-card-with-stroke);
  transition: all 200ms ease-out;
  display: flex;
  flex-direction: column;
}

/* Size variants */
.card--compact {
  padding: var(--juno-card-compact-padding);
}

.card--default {
  padding: var(--juno-card-standard-padding);
}

.card--spacious {
  padding: var(--juno-card-spacious-padding);
}

/* Style variants */
.card--elevated {
  box-shadow: var(--juno-shadow-lg-with-stroke);
}

.card--flat {
  box-shadow: none;
  border: 1px solid var(--juno-border);
}

.card--interactive {
  cursor: pointer;
  transition: all 200ms ease-out;
}

.card--interactive:hover {
  box-shadow: var(--juno-shadow-lg-with-stroke);
  transform: scale(var(--juno-card-interactive-hover-scale));
}

.card--interactive:focus-within {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
}

/* Status variants */
.card--success {
  border-left: 4px solid var(--juno-success-fg);
}

.card--warning {
  border-left: 4px solid var(--juno-warning-fg);
}

.card--danger {
  border-left: 4px solid var(--juno-danger-fg);
}

.card--info {
  border-left: 4px solid var(--juno-accent);
}

/* Card sections */
.card__header {
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-2);
  margin-bottom: var(--juno-space-4);
}

.card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-4);
}

.card__footer {
  margin-top: var(--juno-space-4);
  padding-top: var(--juno-space-4);
  border-top: 1px solid var(--juno-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card__title {
  font-size: var(--juno-fs-subheading);
  font-weight: 600;
  color: var(--juno-text);
  margin: 0;
  line-height: 1.35;
}

.card__description {
  font-size: var(--juno-fs-body);
  color: var(--juno-muted-fg);
  margin: 0;
  line-height: 1.6;
}

.card__actions {
  display: flex;
  gap: var(--juno-space-3);
  align-items: center;
}
```

### 1.3 Layout Utilities

```css
/* Grid layouts */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--juno-space-6);
}

.card-grid--sm {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--juno-space-4);
}

.card-grid--lg {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--juno-space-8);
}

/* List layouts */
.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-4);
}

.card-list--compact {
  gap: var(--juno-space-2);
}

.card-list--spacious {
  gap: var(--juno-space-6);
}

/* Responsive behavior */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
  
  .card--default,
  .card--spacious {
    padding: var(--juno-card-compact-padding);
  }
}
```

## 2. Component Implementation

### 2.1 Card Root Component

```tsx
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default',
    size = 'default',
    status = 'default',
    className,
    children,
    onClick,
    ...props 
  }, ref) => {
    const isInteractive = variant === 'interactive' || !!onClick;
    
    const baseClasses = 'card';
    const variantClass = `card--${variant}`;
    const sizeClass = `card--${size}`;
    const statusClass = status !== 'default' ? `card--${status}` : '';

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
      if (onClick && !event.defaultPrevented) {
        onClick(event);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        const clickEvent = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
        });
        event.currentTarget.dispatchEvent(clickEvent);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClass,
          sizeClass,
          statusClass,
          className
        )}
        onClick={isInteractive ? handleClick : undefined}
        onKeyDown={isInteractive ? handleKeyDown : undefined}
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

### 2.2 Card Subcomponents

```tsx
const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card__header', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card__body', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('card__footer', className)}
      {...props}
    >
      {children}
    </div>
  )
);

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ as: Component = 'h3', className, children, ...props }, ref) => (
    <Component
      ref={ref}
      className={cn('card__title', className)}
      {...props}
    >
      {children}
    </Component>
  )
);

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('card__description', className)}
      {...props}
    >
      {children}
    </p>
  )
);
```

## 3. Design Token Requirements

### 3.1 Card-Specific Tokens

```css
/* Card padding variants */
--juno-card-compact-padding: var(--juno-space-4);
--juno-card-standard-padding: var(--juno-space-6);
--juno-card-spacious-padding: var(--juno-space-8);

/* Card interactions */
--juno-card-interactive-hover-scale: 1.02;
--juno-card-hover-shadow: var(--juno-shadow-lg-with-stroke);

/* Card status indicators */
--juno-card-status-border-width: 4px;
--juno-card-success-border: var(--juno-success-fg);
--juno-card-warning-border: var(--juno-warning-fg);
--juno-card-danger-border: var(--juno-danger-fg);
--juno-card-info-border: var(--juno-accent);

/* Card layout */
--juno-card-grid-min-width: 300px;
--juno-card-grid-gap: var(--juno-space-6);
--juno-card-list-gap: var(--juno-space-4);

/* Card sections */
--juno-card-header-gap: var(--juno-space-2);
--juno-card-body-gap: var(--juno-space-4);
--juno-card-footer-border: 1px solid var(--juno-border);
```

## 4. Usage Examples

### 4.1 Basic Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>This is a description of the card content.</CardDescription>
  </CardHeader>
  
  <CardBody>
    <p>Main card content goes here.</p>
  </CardBody>
  
  <CardFooter>
    <div className="card__actions">
      <Button variant="secondary" size="sm">Cancel</Button>
      <Button variant="primary" size="sm">Save</Button>
    </div>
  </CardFooter>
</Card>
```

### 4.2 Interactive Card

```tsx
<Card variant="interactive" onClick={handleCardClick}>
  <CardHeader>
    <CardTitle>Clickable Card</CardTitle>
  </CardHeader>
  
  <CardBody>
    <p>This entire card is clickable.</p>
  </CardBody>
</Card>
```

### 4.3 Status Cards

```tsx
<div className="card-list">
  <Card status="success" size="compact">
    <CardTitle as="h4">Success</CardTitle>
    <CardDescription>Operation completed successfully.</CardDescription>
  </Card>
  
  <Card status="warning" size="compact">
    <CardTitle as="h4">Warning</CardTitle>
    <CardDescription>Please review this information.</CardDescription>
  </Card>
  
  <Card status="danger" size="compact">
    <CardTitle as="h4">Error</CardTitle>
    <CardDescription>An error occurred during processing.</CardDescription>
  </Card>
</div>
```

### 4.4 Card Grid Layout

```tsx
<div className="card-grid">
  {items.map((item) => (
    <Card key={item.id} variant="elevated">
      <CardHeader>
        <CardTitle>{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      
      <CardBody>
        <div className="space-y-juno-3">
          <p>Status: {item.status}</p>
          <p>Last updated: {item.updatedAt}</p>
        </div>
      </CardBody>
      
      <CardFooter>
        <div className="card__actions">
          <Button variant="ghost" size="sm">View</Button>
          <Button variant="primary" size="sm">Edit</Button>
        </div>
      </CardFooter>
    </Card>
  ))}
</div>
```

## 5. Accessibility Features

### 5.1 Interactive Cards

```tsx
// Interactive card with proper semantics
<Card 
  variant="interactive" 
  onClick={handleClick}
  aria-label="View project details"
  role="button"
  tabIndex={0}
>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
  </CardHeader>
</Card>
```

### 5.2 Status Communication

```tsx
// Status cards with screen reader support
<Card status="danger" aria-describedby="error-description">
  <CardTitle>Error</CardTitle>
  <CardDescription id="error-description">
    Failed to process request. Please try again.
  </CardDescription>
</Card>
```

### 5.3 Focus Management

```tsx
// Card with focus trap for complex interactions
const CardWithFocusTrap = ({ children, ...props }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      cardRef.current?.blur();
    }
  };
  
  return (
    <Card 
      ref={cardRef}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {children}
    </Card>
  );
};
```

## 6. Layout Patterns

### 6.1 Dashboard Cards

```tsx
<div className="card-grid card-grid--lg">
  <Card variant="elevated" size="spacious">
    <CardHeader>
      <CardTitle>Revenue</CardTitle>
      <CardDescription>Monthly revenue overview</CardDescription>
    </CardHeader>
    
    <CardBody>
      <div className="text-juno-text text-3xl font-bold">
        RM 12,450
      </div>
      <div className="flex items-center gap-juno-2 text-juno-success-fg">
        <ArrowUpIcon className="w-4 h-4" />
        <span>+12% from last month</span>
      </div>
    </CardBody>
  </Card>
  
  <Card variant="elevated" size="spacious">
    <CardHeader>
      <CardTitle>Transactions</CardTitle>
      <CardDescription>Recent transaction activity</CardDescription>
    </CardHeader>
    
    <CardBody>
      <div className="space-y-juno-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex justify-between">
            <span>{transaction.description}</span>
            <span className="font-mono">RM {transaction.amount}</span>
          </div>
        ))}
      </div>
    </CardBody>
  </Card>
</div>
```

### 6.2 Form Cards

```tsx
<Card size="spacious">
  <CardHeader>
    <CardTitle>Account Settings</CardTitle>
    <CardDescription>Update your account information</CardDescription>
  </CardHeader>
  
  <CardBody>
    <form className="space-y-juno-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-juno-2">
          Email
        </label>
        <input
          id="email"
          type="email"
          className="w-full p-juno-3 border border-juno-border rounded-juno-md"
        />
      </div>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-juno-2">
          Full Name
        </label>
        <input
          id="name"
          type="text"
          className="w-full p-juno-3 border border-juno-border rounded-juno-md"
        />
      </div>
    </form>
  </CardBody>
  
  <CardFooter>
    <div className="card__actions">
      <Button variant="secondary">Cancel</Button>
      <Button variant="primary">Save Changes</Button>
    </div>
  </CardFooter>
</Card>
```

## 7. Testing Requirements

### 7.1 Unit Tests

- [ ] Renders all variants correctly
- [ ] Handles interactive states properly
- [ ] Status indicators display correctly
- [ ] Size variants apply proper spacing
- [ ] Subcomponents compose correctly

### 7.2 Accessibility Tests

- [ ] Interactive cards have proper roles
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Screen reader announcements
- [ ] Status information communicated

### 7.3 Layout Tests

- [ ] Grid layouts respond correctly
- [ ] Cards adapt to mobile screens
- [ ] Content overflow handled properly
- [ ] Spacing consistent across variants

## 8. Performance Considerations

- Minimal re-renders with proper memoization
- Efficient layout calculations for grid
- CSS transforms for hover states (GPU acceleration)
- Lazy loading for card content when appropriate

## 9. Migration Strategy

### 9.1 Existing Card Migration

```tsx
// Before: Manual card styling
<div className="bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke p-juno-6">
  <h3 className="font-semibold mb-juno-2">Title</h3>
  <p className="text-juno-muted-fg">Description</p>
</div>

// After: Card component
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
</Card>
```

### 9.2 Layout Migration

```tsx
// Before: Manual grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-juno-6">
  {/* cards */}
</div>

// After: Card grid utility
<div className="card-grid">
  {/* cards */}
</div>
```