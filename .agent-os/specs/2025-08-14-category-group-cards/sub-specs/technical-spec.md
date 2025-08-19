# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-14-category-group-cards/spec.md

> Created: 2025-08-14
> Version: 1.0.0

## Technical Requirements

### Component Architecture

#### Enhanced CategoryGroupCardsView Component
```typescript
interface CategoryGroupCard {
  group: CategoryGroup
  categories: CategoryWithGroup[]
  summary: {
    totalAllocated: number
    totalSpent: number
    remainingBudget: number
    utilizationRate: number
    overspentCount: number
    categoryCount: number
    healthStatus: 'healthy' | 'warning' | 'overspent' | 'underfunded'
  }
  progressSegments: CategoryProgressSegment[]
}

interface CategoryProgressSegment {
  categoryId: string
  categoryName: string
  color: string
  allocated: number
  spent: number
  percentage: number
  isOverspent: boolean
}
```

#### Component Hierarchy
```
CategoryGroupCardsView
├── GroupCard (enhanced with progress visualization)
│   ├── GroupCardHeader
│   │   ├── GroupIcon
│   │   ├── GroupTitle
│   │   └── GroupActions
│   ├── GroupProgressBar (multi-segment progress)
│   │   └── ProgressSegment (per category)
│   ├── GroupSummaryStats
│   │   ├── BudgetMetrics
│   │   └── StatusIndicators
│   └── GroupCardActions
│       ├── ExpandToggle
│       ├── EditGroup
│       └── QuickActions
├── GroupManagementModal
│   ├── GroupPropertiesForm
│   ├── IconColorPicker
│   └── CategoryAssignmentInterface
└── DefaultGroupSetupWizard
    ├── DefaultGroupSelector
    ├── CategoryAutoAssignment
    └── CustomizationStep
```

### Progress Visualization Algorithm

#### Multi-Category Progress Bar Calculation
```typescript
function calculateGroupProgress(categories: CategoryWithGroup[]): GroupProgressData {
  const totalBudget = categories.reduce((sum, cat) => sum + cat.allocated, 0)
  
  if (totalBudget === 0) return { segments: [], healthStatus: 'underfunded' }
  
  const segments = categories.map(category => {
    const spent = Math.min(category.spent, category.allocated)
    const percentage = (spent / totalBudget) * 100
    
    return {
      categoryId: category.id,
      categoryName: category.name,
      color: category.color,
      allocated: category.allocated,
      spent: category.spent,
      percentage,
      isOverspent: category.spent > category.allocated
    }
  }).sort((a, b) => b.percentage - a.percentage) // Largest segments first
  
  const healthStatus = calculateHealthStatus(categories, totalBudget)
  
  return { segments, healthStatus }
}

function calculateHealthStatus(
  categories: CategoryWithGroup[], 
  totalBudget: number
): HealthStatus {
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0)
  const overspentCount = categories.filter(cat => cat.spent > cat.allocated).length
  const utilizationRate = totalBudget > 0 ? totalSpent / totalBudget : 0
  
  if (overspentCount > 0) return 'overspent'
  if (utilizationRate > 0.9) return 'warning'
  if (totalBudget === 0) return 'underfunded'
  return 'healthy'
}
```

### Mobile-First Responsive Design

#### Responsive Grid System
```scss
.category-group-cards {
  display: grid;
  gap: var(--juno-space-4);
  
  // Mobile: Single column
  grid-template-columns: 1fr;
  
  // Tablet: Two columns
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  // Desktop: Three columns, max width
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    max-width: 1200px;
  }
}
```

#### Touch-Optimized Interactions
```typescript
// Touch gesture handling for mobile interactions
const useGroupCardGestures = (groupId: string) => {
  const [touchStart, setTouchStart] = useState<TouchPoint | null>(null)
  const [isLongPress, setIsLongPress] = useState(false)
  
  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() })
    
    // Long press for edit mode
    const longPressTimer = setTimeout(() => {
      setIsLongPress(true)
      triggerHapticFeedback('medium')
    }, 500)
    
    return () => clearTimeout(longPressTimer)
  }
  
  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStart) return
    
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY }
    const deltaX = touchEnd.x - touchStart.x
    const deltaY = touchEnd.y - touchStart.y
    const deltaTime = Date.now() - touchStart.time
    
    // Swipe detection
    if (Math.abs(deltaX) > 100 && Math.abs(deltaY) < 50 && deltaTime < 300) {
      if (deltaX > 0) {
        onSwipeRight(groupId)
      } else {
        onSwipeLeft(groupId)
      }
    }
    
    // Tap handling
    if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10 && deltaTime < 300 && !isLongPress) {
      onGroupTap(groupId)
    }
    
    setTouchStart(null)
    setIsLongPress(false)
  }
  
  return { handleTouchStart, handleTouchEnd, isLongPress }
}
```

## Approach

### Phase 1: Enhanced Group Cards UI (Week 1)
**Goal**: Replace current CategoryGroupView with modern card-based interface

**Technical Approach:**
1. **Component Enhancement**
   - Create new CategoryGroupCardsView extending existing functionality
   - Implement GroupCard component with enhanced visual design
   - Add multi-segment progress bar visualization
   - Integrate Juno design system tokens for consistent styling

2. **Progress Calculation Engine**
   - Build progress calculation utilities for group-level metrics
   - Implement health status algorithm for visual indicators
   - Create progress segment calculation for multi-category visualization

3. **Responsive Layout System**
   - CSS Grid implementation with mobile-first approach
   - Breakpoint-based layout adjustments
   - Touch target optimization for mobile devices

### Phase 2: Group Management Interface (Week 2)
**Goal**: Implement comprehensive group management features

**Technical Approach:**
1. **Inline Editing System**
   - Modal-based group property editing
   - Icon and color picker components
   - Real-time preview of changes
   - Optimistic updates with rollback capability

2. **Default Group Creation**
   - User onboarding wizard for default group setup
   - Smart category assignment algorithm
   - Customizable default group templates
   - Migration script for existing users

3. **Group Organization Features**
   - Drag-and-drop reordering with touch support
   - Bulk category reassignment interface
   - Group archiving/restore functionality

### Phase 3: Mobile Optimization & Polish (Week 3)
**Goal**: Optimize for mobile performance and user experience

**Technical Approach:**
1. **Performance Optimization**
   - Virtual scrolling for large group lists
   - Lazy loading of group detail information
   - Memory optimization for progress calculations
   - Touch interaction debouncing

2. **Advanced Touch Interactions**
   - Swipe gestures for quick actions
   - Long press for context menus
   - Haptic feedback integration
   - Smooth animation transitions

3. **Accessibility & Testing**
   - Screen reader compatibility
   - Keyboard navigation support
   - Color contrast compliance
   - Touch target size validation

## External Dependencies

### Core Dependencies (Already Available)
- **React 19.1.0** - Component framework
- **TypeScript** - Type safety and development experience  
- **Tailwind CSS v4** - Styling framework with Juno design system
- **Next.js 15** - App Router and API routes
- **Supabase** - Database and real-time updates

### New Dependencies Required
- **@dnd-kit/core** - Drag and drop functionality for group reordering
- **@dnd-kit/sortable** - Sortable list implementation
- **@dnd-kit/touch** - Touch-optimized drag and drop
- **react-spring** - Smooth animations for card interactions
- **use-gesture** - Advanced touch gesture recognition

### Design System Dependencies  
- **Juno Design Tokens** - Color, spacing, typography tokens
- **Existing UI Components** - Button, Card, Badge components
- **Icon System** - Lucide React or custom icon set for group icons
- **Color Picker Component** - For group customization interface

### Database Dependencies
- **Existing CategoryGroup schema** - Already implemented in migration 006
- **Category relationship** - group_id foreign key already exists
- **User permissions** - RLS policies already in place

### API Dependencies
- **Category CRUD endpoints** - Already available
- **Group management endpoints** - Need implementation
- **Batch update endpoints** - For bulk operations
- **Analytics endpoints** - For progress calculation data