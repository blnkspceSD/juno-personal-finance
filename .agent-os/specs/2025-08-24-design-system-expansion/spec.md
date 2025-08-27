# Design System Expansion Specification

**Feature**: Expand Juno Design System with advanced button variants, sizes, tabs, and card layouts  
**Date**: 2025-08-24  
**Status**: Planning  
**Priority**: High  

## 1. Overview

This specification outlines the expansion of the Juno Design System to include comprehensive button variants, sizing system, tab components, and card layout patterns. Building on the existing design system foundation established in the visual UI improvements, this expansion will provide developers with a complete component library for consistent interface development.

### 1.1 Objectives

- Extend button system with ghost, destructive, and additional variant states
- Implement comprehensive sizing system (small, medium, large) for all components
- Design and implement tab navigation components
- Create structured card layout system with consistent patterns
- Maintain design token consistency and accessibility standards

### 1.2 Success Metrics

- Complete button variant coverage for all use cases
- Consistent sizing system across all components
- Accessible tab navigation with keyboard support
- Reusable card components reducing development time by 40%
- 100% design token compliance across all new components

## 2. Button System Expansion

### 2.1 Button Variants

**Primary Button** (existing):
- Background: `var(--juno-accent)`
- Text: `var(--juno-neutral-750)`
- Use: Main CTAs, form submissions

**Secondary Button** (existing):
- Background: transparent
- Border: `1px solid var(--juno-neutral-750)`
- Text: `var(--juno-neutral-750)`
- Use: Secondary actions, cancellations

**Ghost Button** (new):
- Background: transparent
- Border: none
- Text: `var(--juno-accent)`
- Hover: `var(--juno-accent)` background with 10% opacity
- Use: Subtle actions, navigation links

**Destructive Button** (new):
- Background: `var(--juno-danger-bg)`
- Text: `var(--juno-danger-fg)`
- Border: `1px solid var(--juno-danger-fg)`
- Use: Delete, remove, dangerous actions

**Success Button** (new):
- Background: `var(--juno-success-bg)`
- Text: `var(--juno-success-fg)`
- Border: `1px solid var(--juno-success-fg)`
- Use: Confirmation, successful actions

**Warning Button** (new):
- Background: `var(--juno-warning-bg)`
- Text: `var(--juno-warning-fg)`
- Border: `1px solid var(--juno-warning-fg)`
- Use: Caution, important notices

### 2.2 Button Sizes

**Small Buttons**:
- Height: 32px
- Padding: `var(--juno-space-2) var(--juno-space-3)` (8px 12px)
- Font size: `var(--juno-fs-code)` (0.95rem)
- Border radius: `var(--juno-radius-md)` (8px)
- Use: Inline actions, table buttons, secondary controls

**Medium Buttons** (default):
- Height: 40px
- Padding: `var(--juno-space-3) var(--juno-space-4)` (12px 16px)
- Font size: `var(--juno-fs-body)` (1.28rem)
- Border radius: `var(--juno-radius-lg)` (12px)
- Use: Standard forms, primary actions

**Large Buttons**:
- Height: 48px
- Padding: `var(--juno-space-4) var(--juno-space-6)` (16px 24px)
- Font size: `var(--juno-fs-body-large)` (1.6rem)
- Border radius: `var(--juno-radius-lg)` (12px)
- Use: Hero CTAs, mobile primary actions

### 2.3 Button States

**Disabled State**:
- Opacity: 0.4
- Cursor: not-allowed
- No hover effects
- Maintain layout stability

**Loading State**:
- Show spinner with `var(--juno-accent)` color
- Disable interactions
- Maintain button dimensions
- Fade text to 60% opacity

**Focus State**:
- Outline: `2px solid var(--juno-focus-ring)`
- Outline offset: 2px
- No background change

## 3. Tab Component System

### 3.1 Tab Navigation

**Tab Container**:
- Background: transparent
- Border bottom: `1px solid var(--juno-border)`
- Display: flex
- Gap: `var(--juno-space-1)` (4px)

**Tab Button**:
- Padding: `var(--juno-space-3) var(--juno-space-4)` (12px 16px)
- Background: transparent
- Border: none
- Border radius: `var(--juno-radius-md) var(--juno-radius-md) 0 0`
- Font size: `var(--juno-fs-body)`
- Color: `var(--juno-muted-fg)`
- Cursor: pointer

**Active Tab**:
- Color: `var(--juno-text)`
- Background: `var(--juno-surface-100)`
- Border bottom: `2px solid var(--juno-accent)`
- Font weight: 600

**Hover Tab**:
- Color: `var(--juno-text)`
- Background: `var(--juno-surface-50)`

**Disabled Tab**:
- Color: `var(--juno-muted-fg)`
- Opacity: 0.5
- Cursor: not-allowed

### 3.2 Tab Content

**Tab Panel**:
- Padding: `var(--juno-space-6)` (24px)
- Background: `var(--juno-surface-100)`
- Border radius: `0 var(--juno-radius-xl) var(--juno-radius-xl) var(--juno-radius-xl)`
- Min height: 200px

**Tab Transitions**:
- Fade in: 200ms ease-out
- Content change: 150ms ease-out
- Respect `prefers-reduced-motion`

### 3.3 Tab Variants

**Underline Tabs**:
- No background on active state
- Underline indicator: `2px solid var(--juno-accent)`
- Minimal design for dense interfaces

**Pill Tabs**:
- Active background: `var(--juno-pill-bg)`
- Active text: `var(--juno-pill-fg)`
- Border radius: `var(--juno-radius-xl)`
- Use: Secondary navigation, filters

**Vertical Tabs**:
- Flex direction: column
- Tab width: 200px minimum
- Content area: flexible width
- Border right instead of bottom

## 4. Card Layout System

### 4.1 Base Card Structure

**Standard Card**:
```css
.card {
  background: var(--juno-surface-100);
  border: 1px solid var(--juno-border);
  border-radius: var(--juno-radius-xl);
  box-shadow: var(--juno-shadow-card-with-stroke);
  padding: var(--juno-space-6);
}
```

**Compact Card**:
- Padding: `var(--juno-space-4)` (16px)
- Use: Dense layouts, list items

**Spacious Card**:
- Padding: `var(--juno-space-8)` (32px)
- Use: Feature highlights, detailed content

### 4.2 Card Content Patterns

**Header Pattern**:
```tsx
<div className="card-header">
  <h3 className="card-title">Title</h3>
  <p className="card-description">Optional description</p>
</div>
```

**Body Pattern**:
```tsx
<div className="card-body">
  {/* Main content */}
</div>
```

**Footer Pattern**:
```tsx
<div className="card-footer">
  <div className="card-actions">
    {/* Action buttons */}
  </div>
</div>
```

### 4.3 Card Variants

**Elevated Card**:
- Shadow: `var(--juno-shadow-lg-with-stroke)`
- Use: Important content, modals overlay

**Flat Card**:
- Shadow: none
- Border: `1px solid var(--juno-border)`
- Use: Dense layouts, table alternatives

**Interactive Card**:
- Cursor: pointer
- Hover: shadow increase, subtle scale (1.02×)
- Focus: outline ring
- Use: Clickable cards, navigation

**Status Cards**:
- Success: Border left `4px solid var(--juno-success-fg)`
- Warning: Border left `4px solid var(--juno-warning-fg)`
- Danger: Border left `4px solid var(--juno-danger-fg)`
- Info: Border left `4px solid var(--juno-accent)`

### 4.4 Card Layouts

**Grid Layout**:
```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--juno-space-6);
}
```

**List Layout**:
```css
.card-list {
  display: flex;
  flex-direction: column;
  gap: var(--juno-space-4);
}
```

**Masonry Layout** (optional):
- Variable height cards
- JavaScript-based positioning
- Use: Dashboard widgets, dynamic content

## 5. Design Token Integration

### 5.1 New Design Tokens

**Button Tokens**:
```css
/* Button variants */
--juno-btn-ghost-hover-bg: rgba(133, 214, 255, 0.1);
--juno-btn-destructive-bg: #FEF2F2;
--juno-btn-destructive-fg: #DC2626;
--juno-btn-success-bg: #F0FDF4;
--juno-btn-success-fg: #166534;
--juno-btn-warning-bg: #FFFBEB;
--juno-btn-warning-fg: #D97706;

/* Button sizes */
--juno-btn-sm-height: 32px;
--juno-btn-md-height: 40px;
--juno-btn-lg-height: 48px;
```

**Tab Tokens**:
```css
--juno-tab-active-border: 2px solid var(--juno-accent);
--juno-tab-hover-bg: var(--juno-surface-50);
--juno-tab-content-bg: var(--juno-surface-100);
```

**Card Tokens**:
```css
--juno-card-compact-padding: var(--juno-space-4);
--juno-card-standard-padding: var(--juno-space-6);
--juno-card-spacious-padding: var(--juno-space-8);
--juno-card-interactive-hover-scale: 1.02;
```

### 5.2 CSS Class Structure

**Button Classes**:
- `.btn` (base)
- `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--destructive`
- `.btn--sm`, `.btn--md`, `.btn--lg`
- `.btn--loading`, `.btn--disabled`

**Tab Classes**:
- `.tabs` (container)
- `.tabs__nav`, `.tabs__list`, `.tabs__tab`
- `.tabs__panel`, `.tabs__content`
- `.tabs--underline`, `.tabs--pill`, `.tabs--vertical`

**Card Classes**:
- `.card` (base)
- `.card--compact`, `.card--spacious`
- `.card--elevated`, `.card--flat`, `.card--interactive`
- `.card--success`, `.card--warning`, `.card--danger`, `.card--info`

## 6. Accessibility Requirements

### 6.1 Button Accessibility

- All buttons have descriptive labels
- Loading state announced to screen readers
- Disabled state properly communicated
- Focus indicators clearly visible
- Keyboard navigation support

### 6.2 Tab Accessibility

- ARIA roles: `tablist`, `tab`, `tabpanel`
- Keyboard navigation: Arrow keys, Home, End
- Screen reader announcements for tab changes
- Proper focus management
- `aria-selected` and `aria-expanded` attributes

### 6.3 Card Accessibility

- Semantic markup for card content
- Interactive cards have proper roles
- Focus indicators for clickable cards
- Screen reader friendly content structure
- Status indicators announced properly

## 7. Implementation Strategy

### 7.1 Phase 1: Button Expansion
- Implement new button variants
- Add sizing system
- Update existing button usage
- Create comprehensive tests

### 7.2 Phase 2: Tab Component
- Build tab navigation component
- Implement content switching
- Add keyboard navigation
- Create usage examples

### 7.3 Phase 3: Card System
- Design base card component
- Implement layout patterns
- Create variant system
- Add interactive states

### 7.4 Phase 4: Integration
- Update design system preview
- Create comprehensive documentation
- Migrate existing components
- Performance optimization

## 8. Success Criteria

- [ ] All button variants implemented with proper states
- [ ] Three-size system working across all components
- [ ] Tab navigation with full accessibility support
- [ ] Card system with consistent layout patterns
- [ ] 100% design token compliance
- [ ] Performance impact < 5% bundle size increase
- [ ] WCAG 2.1 AA compliance maintained
- [ ] Complete documentation and examples
- [ ] Migration guide for existing components