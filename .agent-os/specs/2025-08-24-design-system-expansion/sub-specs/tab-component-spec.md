# Tab Component Technical Specification

**Component**: Tab Navigation System  
**Date**: 2025-08-24  
**Dependencies**: Juno Design Tokens, Button System  

## 1. Component API

### 1.1 Tabs Props Interface

```typescript
interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  variant?: 'default' | 'underline' | 'pill';
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}
```

### 1.2 CSS Class Structure

```css
/* Base tab classes */
.tabs {
  display: flex;
  flex-direction: column;
}

.tabs--vertical {
  flex-direction: row;
}

.tabs__list {
  display: flex;
  border-bottom: 1px solid var(--juno-border);
  gap: var(--juno-space-1);
}

.tabs--vertical .tabs__list {
  flex-direction: column;
  border-bottom: none;
  border-right: 1px solid var(--juno-border);
  width: 200px;
  min-width: 200px;
}

.tabs__trigger {
  padding: var(--juno-space-3) var(--juno-space-4);
  background: transparent;
  border: none;
  border-radius: var(--juno-radius-md) var(--juno-radius-md) 0 0;
  font-size: var(--juno-fs-body);
  color: var(--juno-muted-fg);
  cursor: pointer;
  transition: all 150ms ease-out;
  position: relative;
  white-space: nowrap;
}

.tabs__trigger:hover:not(.tabs__trigger--disabled) {
  color: var(--juno-text);
  background: var(--juno-surface-50);
}

.tabs__trigger--active {
  color: var(--juno-text);
  background: var(--juno-surface-100);
  font-weight: 600;
}

.tabs__trigger--active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--juno-accent);
}

.tabs__trigger--disabled {
  color: var(--juno-muted-fg);
  opacity: 0.5;
  cursor: not-allowed;
}

.tabs__content {
  padding: var(--juno-space-6);
  background: var(--juno-surface-100);
  border-radius: 0 var(--juno-radius-xl) var(--juno-radius-xl) var(--juno-radius-xl);
  min-height: 200px;
}

.tabs--vertical .tabs__content {
  flex: 1;
  border-radius: 0 var(--juno-radius-xl) var(--juno-radius-xl) 0;
}
```

### 1.3 Variant Styles

```css
/* Underline variant */
.tabs--underline .tabs__list {
  border-bottom: 1px solid var(--juno-border);
}

.tabs--underline .tabs__trigger {
  background: transparent;
  border-radius: 0;
}

.tabs--underline .tabs__trigger--active {
  background: transparent;
}

.tabs--underline .tabs__content {
  background: transparent;
  border-radius: 0;
  padding: var(--juno-space-6) 0;
}

/* Pill variant */
.tabs--pill .tabs__list {
  background: var(--juno-surface-50);
  border: 1px solid var(--juno-border);
  border-radius: var(--juno-radius-xl);
  padding: var(--juno-space-1);
  gap: var(--juno-space-1);
}

.tabs--pill .tabs__trigger {
  border-radius: var(--juno-radius-lg);
  padding: var(--juno-space-2) var(--juno-space-4);
}

.tabs--pill .tabs__trigger--active {
  background: var(--juno-pill-bg);
  color: var(--juno-pill-fg);
}

.tabs--pill .tabs__trigger--active::after {
  display: none;
}

.tabs--pill .tabs__content {
  background: transparent;
  border-radius: 0;
}
```

## 2. Component Implementation

### 2.1 Tabs Context

```tsx
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'underline' | 'pill';
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within Tabs');
  }
  return context;
};
```

### 2.2 Tabs Root Component

```tsx
const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ 
    defaultValue,
    value,
    onValueChange,
    orientation = 'horizontal',
    variant = 'default',
    className,
    children,
    ...props 
  }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '');
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;

    const handleValueChange = React.useCallback((newValue: string) => {
      if (!isControlled) {
        setInternalValue(newValue);
      }
      onValueChange?.(newValue);
    }, [isControlled, onValueChange]);

    const contextValue = React.useMemo(() => ({
      value: currentValue,
      onValueChange: handleValueChange,
      orientation,
      variant
    }), [currentValue, handleValueChange, orientation, variant]);

    return (
      <TabsContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={cn(
            'tabs',
            `tabs--${orientation}`,
            `tabs--${variant}`,
            className
          )}
          data-orientation={orientation}
          {...props}
        >
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);
```

### 2.3 TabsList Component

```tsx
const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { orientation } = useTabsContext();

    return (
      <div
        ref={ref}
        role="tablist"
        aria-orientation={orientation}
        className={cn('tabs__list', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

### 2.4 TabsTrigger Component

```tsx
const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, disabled, className, children, ...props }, ref) => {
    const { value: selectedValue, onValueChange } = useTabsContext();
    const isActive = value === selectedValue;

    const handleClick = () => {
      if (!disabled) {
        onValueChange(value);
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (disabled) return;

      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onValueChange(value);
      }
    };

    return (
      <button
        ref={ref}
        role="tab"
        type="button"
        aria-selected={isActive}
        aria-controls={`panel-${value}`}
        tabIndex={isActive ? 0 : -1}
        disabled={disabled}
        className={cn(
          'tabs__trigger',
          {
            'tabs__trigger--active': isActive,
            'tabs__trigger--disabled': disabled
          },
          className
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {children}
      </button>
    );
  }
);
```

### 2.5 TabsContent Component

```tsx
const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const { value: selectedValue } = useTabsContext();
    const isActive = value === selectedValue;

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        role="tabpanel"
        id={`panel-${value}`}
        aria-labelledby={`tab-${value}`}
        tabIndex={0}
        className={cn('tabs__content', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
```

## 3. Keyboard Navigation

### 3.1 Arrow Key Navigation

```tsx
const useTabsKeyboard = (tabsRef: React.RefObject<HTMLDivElement>) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tabList = tabsRef.current?.querySelector('[role="tablist"]');
      const tabs = Array.from(tabList?.querySelectorAll('[role="tab"]:not([disabled])') || []);
      const activeTab = document.activeElement;
      const currentIndex = tabs.indexOf(activeTab as Element);

      if (currentIndex === -1) return;

      let nextIndex: number;

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          nextIndex = tabs.length - 1;
          break;
        default:
          return;
      }

      (tabs[nextIndex] as HTMLElement)?.focus();
    };

    const tabsElement = tabsRef.current;
    tabsElement?.addEventListener('keydown', handleKeyDown);

    return () => {
      tabsElement?.removeEventListener('keydown', handleKeyDown);
    };
  }, [tabsRef]);
};
```

## 4. Design Token Requirements

### 4.1 Tab-Specific Tokens

```css
/* Tab navigation */
--juno-tab-active-border: 2px solid var(--juno-accent);
--juno-tab-hover-bg: var(--juno-surface-50);
--juno-tab-content-bg: var(--juno-surface-100);
--juno-tab-content-min-height: 200px;

/* Tab transitions */
--juno-tab-transition: all 150ms ease-out;
--juno-tab-content-fade: opacity 200ms ease-out;

/* Vertical tabs */
--juno-tab-vertical-width: 200px;
--juno-tab-vertical-min-width: 200px;

/* Pill variant */
--juno-tab-pill-bg: var(--juno-surface-50);
--juno-tab-pill-active-bg: var(--juno-pill-bg);
--juno-tab-pill-active-fg: var(--juno-pill-fg);
```

## 5. Usage Examples

### 5.1 Basic Tabs

```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  
  <TabsContent value="overview">
    <h2>Overview Content</h2>
    <p>This is the overview panel.</p>
  </TabsContent>
  
  <TabsContent value="details">
    <h2>Details Content</h2>
    <p>This is the details panel.</p>
  </TabsContent>
  
  <TabsContent value="settings">
    <h2>Settings Content</h2>
    <p>This is the settings panel.</p>
  </TabsContent>
</Tabs>
```

### 5.2 Controlled Tabs

```tsx
const [activeTab, setActiveTab] = useState('tab1');

<Tabs value={activeTab} onValueChange={setActiveTab} variant="pill">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
    <TabsTrigger value="tab3" disabled>Tab 3</TabsTrigger>
  </TabsList>
  
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
  <TabsContent value="tab3">Content 3</TabsContent>
</Tabs>
```

### 5.3 Vertical Tabs

```tsx
<Tabs defaultValue="general" orientation="vertical" variant="underline">
  <TabsList>
    <TabsTrigger value="general">General</TabsTrigger>
    <TabsTrigger value="security">Security</TabsTrigger>
    <TabsTrigger value="notifications">Notifications</TabsTrigger>
  </TabsList>
  
  <TabsContent value="general">General settings content</TabsContent>
  <TabsContent value="security">Security settings content</TabsContent>
  <TabsContent value="notifications">Notification settings</TabsContent>
</Tabs>
```

## 6. Accessibility Features

### 6.1 ARIA Implementation

- `role="tablist"` on container
- `role="tab"` on triggers
- `role="tabpanel"` on content
- `aria-selected` for active state
- `aria-controls` linking tabs to panels
- `aria-labelledby` linking panels to tabs

### 6.2 Focus Management

- Only active tab in tab sequence (tabIndex 0/-1)
- Arrow key navigation between tabs
- Home/End key support for first/last tab
- Focus visible indicators

### 6.3 Screen Reader Support

```tsx
// Announce tab changes
const announceTabChange = (tabName: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', 'polite');
  announcement.setAttribute('aria-atomic', 'true');
  announcement.textContent = `${tabName} tab selected`;
  announcement.className = 'sr-only';
  
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
};
```

## 7. Testing Requirements

### 7.1 Unit Tests

- [ ] Renders all variants correctly
- [ ] Handles controlled/uncontrolled state
- [ ] Tab switching works
- [ ] Keyboard navigation functions
- [ ] Disabled tabs are skipped

### 7.2 Accessibility Tests

- [ ] Screen reader announcements
- [ ] Keyboard navigation complete
- [ ] ARIA attributes present and correct
- [ ] Focus management works properly

### 7.3 Integration Tests

- [ ] Works with form elements
- [ ] Content switching preserves state
- [ ] Responsive behavior on small screens
- [ ] All variants render correctly

## 8. Performance Considerations

- Lazy content rendering (only active tab content)
- Efficient re-renders with proper memoization
- Minimal DOM manipulation for tab switching
- CSS transitions for smooth UX