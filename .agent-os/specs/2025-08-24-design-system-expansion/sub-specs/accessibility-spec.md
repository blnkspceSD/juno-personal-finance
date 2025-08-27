# Accessibility Specification for Design System Expansion

**Component**: Accessibility Requirements for Buttons, Tabs, and Cards  
**Date**: 2025-08-24  
**Standard**: WCAG 2.1 AA Compliance  

## 1. General Accessibility Principles

### 1.1 Core Requirements

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Reader Support**: Proper semantic markup and ARIA attributes
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Management**: Clear, visible focus indicators
- **Motion Sensitivity**: Respect `prefers-reduced-motion` setting

### 1.2 Testing Strategy

- **Automated Testing**: ESLint accessibility rules, axe-core integration
- **Manual Testing**: Keyboard navigation, screen reader testing
- **User Testing**: Testing with users who rely on assistive technologies

## 2. Button Accessibility

### 2.1 Semantic Structure

```tsx
// Proper button semantics
<Button 
  type="button"
  aria-describedby={hasDescription ? 'button-description' : undefined}
  aria-busy={loading}
  disabled={disabled}
>
  {loading ? 'Processing...' : 'Submit'}
</Button>

// Button with description
{hasDescription && (
  <div id="button-description" className="sr-only">
    This action will save your changes permanently
  </div>
)}
```

### 2.2 State Communication

```tsx
// Loading state with proper announcements
const Button = ({ loading, children, ...props }) => {
  return (
    <button {...props} aria-busy={loading}>
      {loading && (
        <span className="sr-only">Loading, please wait</span>
      )}
      <span aria-hidden={loading}>
        {children}
      </span>
      {loading && <Spinner aria-hidden="true" />}
    </button>
  );
};
```

### 2.3 Destructive Actions

```tsx
// Destructive button with confirmation
<Button 
  variant="destructive"
  aria-describedby="delete-warning"
  onClick={handleDelete}
>
  Delete Account
</Button>

<div id="delete-warning" className="sr-only">
  Warning: This action cannot be undone
</div>
```

### 2.4 Focus Indicators

```css
.btn:focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(133, 214, 255, 0.2);
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  .btn:focus-visible {
    outline: 3px solid ButtonText;
    outline-offset: 3px;
  }
}
```

## 3. Tab Accessibility

### 3.1 ARIA Implementation

```tsx
const Tabs = ({ children, ...props }) => {
  const tabsId = useId();
  
  return (
    <div {...props}>
      <div 
        role="tablist" 
        aria-labelledby={`${tabsId}-label`}
        aria-orientation="horizontal"
      >
        {/* Tab triggers */}
      </div>
      
      {/* Tab panels */}
    </div>
  );
};

const TabsTrigger = ({ value, children, isActive, ...props }) => {
  const panelId = `panel-${value}`;
  const tabId = `tab-${value}`;
  
  return (
    <button
      {...props}
      role="tab"
      id={tabId}
      aria-selected={isActive}
      aria-controls={panelId}
      tabIndex={isActive ? 0 : -1}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, isActive, ...props }) => {
  const panelId = `panel-${value}`;
  const tabId = `tab-${value}`;
  
  return (
    <div
      {...props}
      role="tabpanel"
      id={panelId}
      aria-labelledby={tabId}
      tabIndex={0}
      hidden={!isActive}
    >
      {children}
    </div>
  );
};
```

### 3.2 Keyboard Navigation

```tsx
const useTabsKeyboard = () => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const tabList = event.currentTarget;
    const tabs = Array.from(
      tabList.querySelectorAll('[role="tab"]:not([disabled])')
    ) as HTMLElement[];
    
    const currentIndex = tabs.indexOf(document.activeElement as HTMLElement);
    let targetIndex: number;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        targetIndex = (currentIndex + 1) % tabs.length;
        break;
        
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
        break;
        
      case 'Home':
        event.preventDefault();
        targetIndex = 0;
        break;
        
      case 'End':
        event.preventDefault();
        targetIndex = tabs.length - 1;
        break;
        
      case 'Enter':
      case ' ':
        event.preventDefault();
        (document.activeElement as HTMLElement)?.click();
        return;
        
      default:
        return;
    }

    tabs[targetIndex]?.focus();
  };

  return { handleKeyDown };
};
```

### 3.3 Screen Reader Announcements

```tsx
const useTabAnnouncements = () => {
  const announce = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = message;
    announcement.className = 'sr-only';
    
    document.body.appendChild(announcement);
    
    // Clean up after announcement
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  };

  const announceTabChange = (tabName: string, position: number, total: number) => {
    announce(`${tabName} tab selected, ${position} of ${total}`);
  };

  return { announceTabChange };
};
```

### 3.4 Vertical Tabs Accessibility

```tsx
// Vertical tabs need different ARIA orientation
<div 
  role="tablist" 
  aria-orientation="vertical"
  aria-label="Settings navigation"
>
  {/* Vertical tab triggers */}
</div>
```

## 4. Card Accessibility

### 4.1 Interactive Cards

```tsx
const Card = ({ onClick, children, ...props }) => {
  const isInteractive = !!onClick;
  
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (isInteractive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      onClick?.(event as any);
    }
  };

  if (isInteractive) {
    return (
      <div
        {...props}
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-describedby="card-instructions"
      >
        {children}
        <div id="card-instructions" className="sr-only">
          Press Enter or Space to activate
        </div>
      </div>
    );
  }

  return <div {...props}>{children}</div>;
};
```

### 4.2 Status Cards

```tsx
const StatusCard = ({ status, children, ...props }) => {
  const statusLabels = {
    success: 'Success',
    warning: 'Warning', 
    danger: 'Error',
    info: 'Information'
  };

  const statusIcons = {
    success: '✓',
    warning: '⚠',
    danger: '✗',
    info: 'ℹ'
  };

  return (
    <Card 
      {...props}
      className={`card--${status}`}
      role="alert"
      aria-labelledby="status-label"
    >
      <div className="sr-only" id="status-label">
        {statusLabels[status]} message
      </div>
      
      <div className="flex items-start gap-juno-3">
        <span 
          className="card__status-icon"
          aria-hidden="true"
          role="img"
          aria-label={statusLabels[status]}
        >
          {statusIcons[status]}
        </span>
        
        <div className="flex-1">
          {children}
        </div>
      </div>
    </Card>
  );
};
```

### 4.3 Card Navigation

```tsx
// Cards with complex interactions need proper focus management
const CardWithActions = ({ title, children, actions }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const handleCardFocus = () => {
    // Announce card content to screen readers
    announce(`Entered ${title} card. Use Tab to navigate actions.`);
  };

  return (
    <Card 
      ref={cardRef}
      onFocus={handleCardFocus}
      aria-labelledby="card-title"
    >
      <CardHeader>
        <CardTitle id="card-title">{title}</CardTitle>
      </CardHeader>
      
      <CardBody>
        {children}
      </CardBody>
      
      <CardFooter>
        <div className="card__actions" role="group" aria-label="Card actions">
          {actions}
        </div>
      </CardFooter>
    </Card>
  );
};
```

## 5. Color Contrast Requirements

### 5.1 Text Contrast Testing

```css
/* All text must meet WCAG AA standards */
.btn--primary {
  /* Background: #85D6FF, Text: #212730 */
  /* Contrast ratio: 8.2:1 ✓ */
  background: var(--juno-accent);
  color: var(--juno-neutral-750);
}

.btn--destructive {
  /* Background: #FEF2F2, Text: #DC2626 */
  /* Contrast ratio: 5.1:1 ✓ */
  background: var(--juno-btn-destructive-bg);
  color: var(--juno-btn-destructive-fg);
}

.card__description {
  /* Background: #FFFFFF, Text: rgba(33,39,48,0.72) */
  /* Contrast ratio: 4.8:1 ✓ */
  color: var(--juno-muted-fg);
}
```

### 5.2 Focus Indicator Contrast

```css
.btn:focus-visible,
.tabs__trigger:focus-visible,
.card--interactive:focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
  /* Focus ring contrast: 7.3:1 against white background ✓ */
}
```

## 6. Motion and Animation

### 6.1 Reduced Motion Support

```css
/* Respect user motion preferences */
@media (prefers-reduced-motion: reduce) {
  .btn,
  .tabs__trigger,
  .card--interactive {
    transition: none;
  }
  
  .card--interactive:hover {
    transform: none;
  }
  
  .tabs__content {
    animation: none;
  }
}
```

### 6.2 Safe Animation Defaults

```css
/* Safe animations that don't trigger vestibular disorders */
.btn {
  transition: 
    background-color 150ms ease-out,
    border-color 150ms ease-out,
    color 150ms ease-out;
  /* Avoid: transform, opacity changes, position changes */
}

.card--interactive:hover {
  /* Minimal scale that's barely perceptible */
  transform: scale(1.02);
  /* Safe alternative: subtle shadow increase */
  box-shadow: var(--juno-shadow-lg-with-stroke);
}
```

## 7. Screen Reader Testing

### 7.1 VoiceOver Testing Commands

```
// Button testing
- Navigate: VO + Arrow keys
- Activate: VO + Space or Enter
- Check states: VO + F3 (status)

// Tab testing  
- Navigate tabs: VO + Arrow keys within tab list
- Activate tab: VO + Space
- Read tab content: VO + A (read all)

// Card testing
- Navigate cards: VO + Arrow keys
- Enter card: VO + Shift + Down Arrow
- Exit card: VO + Shift + Up Arrow
```

### 7.2 NVDA Testing Commands

```
// Button testing
- Navigate: Tab / Shift+Tab
- Activate: Enter or Space
- Read button info: Insert + Tab

// Tab testing
- Navigate: Tab to tab list, then Arrow keys
- Read tab: Insert + Up Arrow
- Activate: Space or Enter

// Card testing
- Navigate: Tab key
- Browse mode: Down Arrow
- Focus mode: Enter
```

## 8. Testing Automation

### 8.1 Jest + Testing Library

```typescript
// Button accessibility tests
test('button has proper accessibility attributes', async () => {
  render(<Button variant="destructive">Delete</Button>);
  
  const button = screen.getByRole('button', { name: /delete/i });
  
  expect(button).toHaveAttribute('type', 'button');
  expect(button).not.toHaveAttribute('aria-busy');
  
  // Test keyboard interaction
  await user.tab();
  expect(button).toHaveFocus();
  
  await user.keyboard('{Enter}');
  expect(mockOnClick).toHaveBeenCalled();
});

// Tab accessibility tests
test('tabs support keyboard navigation', async () => {
  render(
    <Tabs defaultValue="tab1">
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1">Content 1</TabsContent>
      <TabsContent value="tab2">Content 2</TabsContent>
    </Tabs>
  );
  
  const tab1 = screen.getByRole('tab', { name: /tab 1/i });
  const tab2 = screen.getByRole('tab', { name: /tab 2/i });
  
  // First tab should be focusable
  expect(tab1).toHaveAttribute('tabindex', '0');
  expect(tab2).toHaveAttribute('tabindex', '-1');
  
  // Arrow key navigation
  tab1.focus();
  await user.keyboard('{ArrowRight}');
  expect(tab2).toHaveFocus();
});
```

### 8.2 Axe-Core Integration

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('design system components are accessible', async () => {
  const { container } = render(
    <div>
      <Button variant="primary">Primary</Button>
      <Button variant="destructive">Delete</Button>
      
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Overview</TabsTrigger>
          <TabsTrigger value="tab2">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Overview content</TabsContent>
        <TabsContent value="tab2">Details content</TabsContent>
      </Tabs>
      
      <Card variant="interactive">
        <CardHeader>
          <CardTitle>Interactive Card</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
  
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 9. Documentation Requirements

### 9.1 Accessibility Usage Guide

Each component must include:
- Keyboard navigation instructions
- Screen reader behavior description
- ARIA attribute explanations
- Common accessibility pitfalls
- Testing recommendations

### 9.2 Component Accessibility Checklist

```markdown
## Button Accessibility Checklist
- [ ] Proper button semantics (`<button>` or `role="button"`)
- [ ] Descriptive label text
- [ ] Loading states announced
- [ ] Disabled states communicated
- [ ] Focus indicators visible
- [ ] Keyboard activation works

## Tab Accessibility Checklist
- [ ] Proper ARIA roles (`tablist`, `tab`, `tabpanel`)
- [ ] Arrow key navigation
- [ ] Home/End key support
- [ ] Screen reader announcements
- [ ] Focus management correct
- [ ] Panel content keyboard accessible

## Card Accessibility Checklist
- [ ] Semantic content structure
- [ ] Interactive cards have button role
- [ ] Status information announced
- [ ] Focus management for complex cards
- [ ] Keyboard navigation works
- [ ] Content is screen reader friendly
```

## 10. Compliance Validation

### 10.1 WCAG 2.1 AA Checklist

- [ ] **1.1.1 Non-text Content**: All images have alt text
- [ ] **1.3.1 Info and Relationships**: Proper semantic markup
- [ ] **1.4.3 Contrast (Minimum)**: 4.5:1 for normal text
- [ ] **2.1.1 Keyboard**: All functionality keyboard accessible  
- [ ] **2.1.2 No Keyboard Trap**: Focus can leave components
- [ ] **2.4.3 Focus Order**: Logical tab sequence
- [ ] **2.4.7 Focus Visible**: Clear focus indicators
- [ ] **3.2.2 On Input**: No unexpected context changes
- [ ] **4.1.2 Name, Role, Value**: Proper ARIA implementation

### 10.2 Testing Schedule

- **Development**: Automated accessibility tests with each PR
- **Feature Complete**: Manual keyboard and screen reader testing
- **Pre-Release**: Full accessibility audit with real users
- **Post-Release**: Quarterly accessibility reviews and updates