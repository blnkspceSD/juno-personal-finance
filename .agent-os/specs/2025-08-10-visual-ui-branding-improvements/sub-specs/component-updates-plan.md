# Component Updates & New Component Plan

## Existing Component Analysis

### Current shadcn/ui Components
Based on the codebase analysis, Juno currently has:

**Form Components:**
- `Button` - Full CVA implementation with variants
- `Input` - Basic input styling
- `Label` - Form labels
- `Form` - Form wrapper and validation
- `Checkbox` - Checkbox inputs
- `Textarea` - Text area inputs
- `Select` - Dropdown selection
- `Radio Group` - Radio button groups

**Layout Components:**
- `Card` - Content containers with header/footer
- `Table` / `Data Table` - Tabular data display
- `Separator` - Visual dividers
- `Tabs` - Tab navigation
- `Dialog` - Modal dialogs

**Interactive Components:**
- `Dropdown Menu` - Context menus
- `Tooltip` - Hover information
- `Badge` - Status indicators
- `Toast` - Notifications (use-toast hook)

## Component Update Strategy

### 1. Button Component Updates

#### Current State
```typescript
// Existing variants
variant: {
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90",
  outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground",
  secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
  ghost: "hover:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline"
}
```

#### Juno Enhancement Plan
```typescript
// New Juno-specific variants
variant: {
  // Keep existing variants for backward compatibility
  default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
  
  // Add Juno brand variants
  "juno-primary": "bg-juno-accent text-juno-text shadow-sm hover:brightness-105 active:brightness-95 focus-visible:ring-juno-focus-ring",
  "juno-secondary": "border border-juno-text text-juno-text bg-transparent hover:bg-juno-pill-bg focus-visible:ring-juno-focus-ring",
  "juno-ghost": "text-juno-text hover:bg-juno-pill-bg focus-visible:ring-juno-focus-ring",
  "juno-link": "text-juno-text underline-offset-4 hover:underline focus-visible:ring-juno-focus-ring"
}
```

#### New Button Features
- **12px border radius** (consistent with spec)
- **Shadow system**: `0 4px 8px rgba(33,39,48,0.08)`
- **Brightness hover states**: +5% hover, -5% active
- **Focus rings**: 2px outline using `--juno-focus-ring`

### 2. Form Component Updates

#### Input Component Enhancement
```typescript
const inputVariants = cva(
  "flex h-9 w-full rounded-md border px-3 py-1 text-base transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "border-input bg-background focus-visible:ring-ring",
        juno: "bg-juno-accent border-juno-text text-juno-text placeholder:text-juno-muted-fg focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)
```

#### Select Component Updates
- Background: `bg-juno-accent`
- Border: `border-juno-text`
- Text: `text-juno-text`
- Dropdown: Same accent background with border
- Focus states: Juno focus ring system

### 3. Card Component Updates

#### Current Structure
The Card component has good structure with semantic slots:
- `Card` - Main container
- `CardHeader` - Header with title/description
- `CardContent` - Main content area
- `CardFooter` - Footer actions
- `CardAction` - Header actions

#### Juno Enhancement
```typescript
const cardVariants = cva(
  "flex flex-col gap-6 rounded-xl shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border",
        juno: "bg-juno-accent text-juno-text border-juno-border shadow-juno"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
)
```

#### New Card Features
- **12px border radius** (rounded-xl)
- **Juno shadow**: `0 2px 4px rgba(33,39,48,0.12)`
- **24px padding** for content areas
- **Accent background** throughout

### 4. New Educational Components

#### 4.1 ExplainChip Component
**Purpose**: Tap-to-explain functionality for key numbers

```typescript
// New component: src/components/ui/explain-chip.tsx
interface ExplainChipProps {
  explanation: string;
  position?: "top" | "bottom" | "left" | "right";
  size?: "sm" | "default" | "lg";
}

const explainChipVariants = cva(
  "inline-flex items-center justify-center rounded-full cursor-pointer transition-all hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-juno-focus-ring",
  {
    variants: {
      size: {
        sm: "size-6 text-xs",
        default: "size-8 text-sm",
        lg: "size-10 text-base"
      }
    },
    defaultVariants: {
      size: "default"
    }
  }
)
```

**Features**:
- Info icon ("i" symbol)
- Background: `bg-juno-pill-bg`
- Text: `text-juno-pill-fg`
- Hover scale effect (1.05×)
- Keyboard accessible
- Tooltip integration

#### 4.2 FinancialTooltip Component
**Purpose**: Educational explanations for financial concepts

```typescript
// New component: src/components/ui/financial-tooltip.tsx
interface FinancialTooltipProps {
  title?: string;
  explanation: string;
  example?: string;
  currency?: "RM" | "USD";
  maxWidth?: number;
}
```

**Features**:
- Background: `bg-juno-accent`
- Border: `border-juno-border`
- Shadow: `0 8px 16px rgba(33,39,48,0.12)`
- Max width: 320px
- Malaysian context (RM examples)
- Clear typography hierarchy

#### 4.3 ScenarioSlider Component
**Purpose**: Interactive budget adjustment with live updates

```typescript
// New component: src/components/ui/scenario-slider.tsx
interface ScenarioSliderProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  currency?: string;
  explanation?: string;
}
```

**Features**:
- Juno accent track
- Text color thumb
- Live value updates
- Integrated ExplainChip
- Malaysian currency formatting

#### 4.4 TeachModeToggle Component
**Purpose**: Global setting to show/hide educational hints

```typescript
// New component: src/components/ui/teach-mode-toggle.tsx
interface TeachModeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  className?: string;
}
```

**Features**:
- Toggle switch using Juno colors
- Persists to user preferences
- Global state management
- Clear on/off states

### 5. Data Visualization Components

#### 5.1 JunoChart Component
**Purpose**: Base chart component with Juno color system

```typescript
// New component: src/components/charts/juno-chart.tsx
interface JunoChartProps {
  type: "bar" | "line" | "area";
  data: ChartData[];
  currentPeriod?: string;
  showExplanation?: boolean;
  currency?: string;
}
```

**Color System**:
- Current period: `--juno-text` (100% opacity)
- Previous period: `--juno-text` (60% opacity)
- Historical: `--juno-text` (35% opacity)
- Highlights: `--juno-accent-400`

#### 5.2 BudgetProgressBar Component
**Purpose**: Visual progress indicator for budget categories

```typescript
// New component: src/components/charts/budget-progress-bar.tsx
interface BudgetProgressBarProps {
  used: number;
  total: number;
  category: string;
  currency?: string;
  showOverage?: boolean;
  explanation?: string;
}
```

**Features**:
- Progress visualization using Juno colors
- Overage indication (red semantic color)
- Integrated explanation tooltip
- Malaysian currency formatting

### 6. Status & Feedback Components

#### 6.1 StatusBadge Updates
Enhance existing Badge component with Juno variants:

```typescript
const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // Existing variants...
        default: "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        
        // New Juno semantic variants
        "juno-success": "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        "juno-warning": "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        "juno-danger": "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        "juno-info": "border-transparent bg-juno-accent-100 text-juno-text"
      }
    }
  }
)
```

#### 6.2 Toast Notifications Update
Enhance toast system with Juno styling and Malaysian context:

```typescript
// Update: src/components/ui/use-toast.tsx
interface ToastProps {
  // Existing props...
  variant?: "default" | "destructive" | "juno-success" | "juno-warning" | "juno-info";
  currency?: "RM";
  amount?: number;
}
```

## Implementation Priority

### Phase 1: Core Components (Week 1-2)
1. **Button** - Most used component, foundation for interactions
2. **Input/Form** - Critical for data entry
3. **Card** - Main content container
4. **ExplainChip** - New educational pattern

### Phase 2: Educational Components (Week 2-3)
1. **FinancialTooltip** - Explanatory system
2. **ScenarioSlider** - Interactive adjustments
3. **TeachModeToggle** - Global educational setting
4. **StatusBadge** - Feedback system

### Phase 3: Data Components (Week 3-4)
1. **JunoChart** - Data visualization foundation
2. **BudgetProgressBar** - Category progress
3. **Toast updates** - Notification improvements
4. **Advanced chart types** - Specialized visualizations

### Phase 4: Integration & Polish (Week 4-5)
1. **Cross-component consistency** - Ensure unified styling
2. **Accessibility audit** - WCAG 2.1 compliance
3. **Performance optimization** - Bundle size and runtime
4. **Documentation** - Component usage guidelines

## Testing Strategy

### Visual Regression Testing
- Screenshot comparison for all component variants
- Cross-browser consistency checks
- Mobile responsive behavior
- Dark mode compatibility (if applicable)

### Accessibility Testing
- Keyboard navigation for all interactive components
- Screen reader compatibility
- Color contrast verification
- Focus management
- ARIA label completeness

### Performance Testing
- Component render performance
- Bundle size impact measurement
- Animation performance on mobile devices
- Memory usage optimization

### User Experience Testing
- Malaysian user testing for cultural appropriateness
- Educational effectiveness measurement
- Task completion rate improvements
- Comprehension testing for financial concepts

## Migration Guidelines

### Backward Compatibility
- Keep existing component variants intact
- Add new Juno variants alongside current ones
- Provide clear migration path for each component
- Document breaking changes (if any)

### Gradual Rollout
- Start with new features using Juno components
- Migrate existing pages component by component
- A/B test educational features
- Collect user feedback throughout process

### Documentation Requirements
- Component API documentation
- Usage examples with Juno variants
- Design system guidelines
- Migration instructions
- Accessibility requirements