# Card Component Update Specification

**Feature**: Update Card component to use Juno Design System token API with full customization support  
**Date**: 2025-08-28  
**Status**: Planning  
**Priority**: High  

## 1. Overview

This specification outlines the comprehensive update of the Card component to implement a stable, overrideable token-based API using the existing Juno Design System. The implementation follows a layered approach: Primitives → Semantics → Component tokens → Instance overrides, providing maximum flexibility while maintaining design consistency.

### 1.1 Objectives

- Implement a layered Design System Style API for Cards
- Create 12 public card tokens for comprehensive customization
- Support variants (elevated, filled, outlined) and sizes (sm, md, lg)
- Add status variants (success, warning, danger, info) with semantic token integration
- Ensure RTL-safe implementation using logical properties
- Maintain full accessibility (WCAG 2.1 AA) compliance
- Provide Tailwind CSS integration without specificity conflicts

### 1.2 Success Metrics

- Complete token-based customization system with 12 public API tokens
- Zero specificity conflicts in Tailwind integration
- RTL support through logical properties
- Interactive states (hover, focus, disabled) with smooth transitions
- Full accessibility compliance with keyboard navigation
- 95% reduction in variant-specific CSS through token system
- Comprehensive documentation and migration guide

## 2. Token API Design

### 2.1 Public Card Tokens (12 tokens)

The Card component exposes 12 customizable tokens that map to Juno semantic tokens:

**Surface & Content**:
- `--card-bg` → `var(--juno-color-bg-surface)`
- `--card-fg` → `var(--juno-color-text)`  
- `--card-state-layer` → `rgb(0 0 0 / 0.04)` (overlay for hover/pressed)

**Shape & Border**:
- `--card-radius` → `var(--juno-radius-xl)`
- `--card-border-width` → `1px`
- `--card-border-color` → `var(--juno-color-border)`

**Spacing**:
- `--card-pad-block` → `var(--juno-space-6)` (logical property for RTL)
- `--card-pad-inline` → `var(--juno-space-6)` (logical property for RTL)
- `--card-gap` → `var(--juno-space-3)`

**Elevation**:
- `--card-shadow` → `var(--juno-shadow-md)`
- `--card-hover-shadow` → `var(--juno-shadow-lg)`

**Interaction & Focus**:
- `--card-hover-border-color` → `var(--juno-color-border-hover)`
- `--card-hover-translate-y` → `-2px`
- `--card-focus-ring` → `0 0 0 3px rgb(59 130 246 / .35)`

### 2.2 Token Hierarchy

```
Primitives (brand scales)
├── --juno-space-* (spacing ramps)
├── --juno-radius-* (border radius ramps)
├── --juno-shadow-* (elevation ramps)
└── --juno-duration-*, --juno-ease-* (motion ramps)

Semantics (contextual meanings)
├── --juno-color-bg-surface, --juno-color-bg-surface-secondary
├── --juno-color-text, --juno-color-border, --juno-color-border-hover
└── Status colors: --juno-color-bg-surface-{success,warning,critical,info}

Component Tokens (Card API)
├── --card-* variables consumed by .card with semantic fallbacks
└── Variants/sizes only set --card-* (never properties directly)
```

## 3. Component Architecture

### 3.1 Base Card Implementation

The base `.card` class consumes tokens with semantic fallbacks:

```css
@layer components {
  :where(.card) {
    position: relative;
    background: var(--card-bg, var(--juno-color-bg-surface));
    color: var(--card-fg, var(--juno-color-text));
    
    border-radius: var(--card-radius, var(--juno-radius-xl));
    border: var(--card-border-width, 1px) solid var(--card-border-color, var(--juno-color-border));
    
    padding-block: var(--card-pad-block, var(--juno-space-6));
    padding-inline: var(--card-pad-inline, var(--juno-space-6));
    display: flex;
    flex-direction: column;
    gap: var(--card-gap, var(--juno-space-3));
    
    box-shadow: var(--card-shadow, var(--juno-shadow-md));
    transition: 
      box-shadow var(--juno-duration-normal, 200ms) var(--juno-ease-out, cubic-bezier(.2,0,.2,1)),
      border-color var(--juno-duration-fast, 120ms) var(--juno-ease-out, cubic-bezier(.2,0,.2,1)),
      transform var(--juno-duration-fast, 120ms) var(--juno-ease-out, cubic-bezier(.2,0,.2,1));
    overflow: hidden;
  }
}
```

### 3.2 Interactive States

**Focus State**:
```css
.card:focus-visible {
  outline: none;
  box-shadow: 
    var(--card-shadow, var(--juno-shadow-md)),
    var(--card-focus-ring, 0 0 0 3px rgb(59 130 246 / .35));
}
```

**Hover State with State Layer**:
```css
.card[data-hoverable="true"]::after {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: 0;
  border-radius: inherit;
  opacity: 0;
  background: var(--card-state-layer, rgb(0 0 0 / 0.04));
  transition: opacity var(--juno-duration-fast, 120ms) var(--juno-ease-out, cubic-bezier(.2,0,.2,1));
}

.card[data-hoverable="true"]:hover::after { opacity: 1; }
.card[data-hoverable="true"]:hover {
  box-shadow: var(--card-hover-shadow, var(--juno-shadow-lg));
  border-color: var(--card-hover-border-color, var(--juno-color-border-hover));
  transform: translateY(var(--card-hover-translate-y, -2px));
}
```

### 3.3 Card Slots (Optional)

```css
.card__header, .card__footer { display: flex; align-items: center; }
.card__header {
  padding-block: var(--card-header-pad-block, 0);
  padding-inline: var(--card-header-pad-inline, 0);
  background: var(--card-header-bg, var(--juno-color-bg-surface));
}
.card__content {
  padding: var(--card-content-padding, var(--juno-space-6));
}
.card__footer {
  padding-block: var(--card-footer-pad-block, 0);
  padding-inline: var(--card-footer-pad-inline, 0);
  border-top: var(--card-footer-border, 1px solid var(--juno-color-border));
  background: var(--card-footer-bg, var(--juno-color-bg-surface-secondary));
}
```

## 4. Variants as Variable-Only Presets

All variants use only CSS custom properties, never direct property assignments:

### 4.1 Visual Variants

```css
@layer utilities {
  /* Elevated: drop border, add soft shadow */
  .card--elevated {
    --card-border-width: 0px;
    --card-shadow: var(--juno-shadow-md);
    --card-hover-shadow: var(--juno-shadow-lg);
  }

  /* Filled: subtle filled surface, no shadow */
  .card--filled {
    --card-bg: var(--juno-color-bg-surface-secondary);
    --card-border-width: 0px;
    --card-shadow: none;
  }

  /* Outlined: stronger border, no shadow */
  .card--outlined {
    --card-border-width: 1px;
    --card-border-color: var(--juno-color-border-strong, var(--juno-color-border));
    --card-shadow: none;
    --card-hover-shadow: none;
  }
}
```

### 4.2 Size Variants

```css
@layer utilities {
  .card--sm {
    --card-pad-block: var(--juno-space-4);
    --card-pad-inline: var(--juno-space-4);
    --card-radius: var(--juno-radius-lg);
    --card-gap: var(--juno-space-3);
  }
  .card--md {
    --card-pad-block: var(--juno-space-6);
    --card-pad-inline: var(--juno-space-6);
    --card-radius: var(--juno-radius-xl);
    --card-gap: var(--juno-space-3);
  }
  .card--lg {
    --card-pad-block: var(--juno-space-8);
    --card-pad-inline: var(--juno-space-8);
    --card-radius: var(--juno-radius-2xl);
    --card-gap: var(--juno-space-4);
  }
}
```

### 4.3 Status Variants

```css
@layer utilities {
  .card--success {
    --card-bg: var(--juno-color-bg-surface-success, var(--juno-color-bg-surface));
    --card-border-color: var(--juno-color-border-success, var(--juno-color-border));
  }
  .card--warning {
    --card-bg: var(--juno-color-bg-surface-warning, var(--juno-color-bg-surface));
    --card-border-color: var(--juno-color-border-warning, var(--juno-color-border));
  }
  .card--danger {
    --card-bg: var(--juno-color-bg-surface-critical, var(--juno-color-bg-surface));
    --card-border-color: var(--juno-color-border-critical, var(--juno-color-border));
  }
  .card--info {
    --card-bg: var(--juno-color-bg-surface-info, var(--juno-color-bg-surface));
    --card-border-color: var(--juno-color-border-info, var(--juno-color-border));
  }
}
```

## 5. File Structure Implementation

```
/src/styles/tokens/
  primitives.css            /* ramps: spacing, radius, shadows, durations, easing, color ramps */
  semantics.css             /* maps ramps into surfaces/text/borders/states */
  modes.css                 /* dark/high-contrast/reduced-motion */

@layer components/
  card.css                  /* Card base styles consuming --card-* with semantic fallbacks */

@layer utilities/
  card.variants.css         /* .card--outlined/.card--elevated/.card--filled → set --card-* only */
  card.sizes.css            /* .card--sm/md/lg → set padding/radius vars only */
```

## 6. Tailwind Integration

### 6.1 Layer Strategy
- `.card` in `@layer components` to establish base styles
- Presets in `@layer utilities` for natural override without `!important`
- Arbitrary properties support: `[--card-radius:20px]`

### 6.2 Utility Proxies
```css
@layer utilities {
  .rounded-card-sm { --card-radius: var(--juno-radius-lg); }
  .rounded-card-xl { --card-radius: var(--juno-radius-2xl); }
  .p-card-4 { --card-pad-block: var(--juno-space-4); --card-pad-inline: var(--juno-space-4); }
}
```

## 7. Accessibility Requirements

### 7.1 Keyboard Navigation
- Interactive cards have `tabindex="0"`
- Focus indicators clearly visible with `--card-focus-ring`
- Enter/Space key activation for clickable cards

### 7.2 Screen Reader Support
- Semantic markup with proper heading hierarchy
- `role="button"` for interactive cards
- `aria-pressed` for toggle states
- `aria-expanded` for expandable cards

### 7.3 Motion Preferences
- All transitions respect `prefers-reduced-motion`
- Hover translate effects can be disabled globally
- State transitions maintain layout stability

## 8. Dark Mode & Theme Support

### 8.1 Automatic Theme Adaptation
Cards automatically adapt through semantic token fallbacks:
- `--juno-color-bg-surface` changes in `[data-theme="dark"]`
- `--juno-color-text` and `--juno-color-border` flip appropriately
- Status colors maintain proper contrast ratios

### 8.2 High Contrast Mode
- Centralized contrast changes in `semantics.css`
- Card inherits automatically via fallback chain
- Border widths increase for better definition

## 9. Usage Examples

### 9.1 Basic Usage
```html
<div class="card card--elevated card--md" data-hoverable="true" tabindex="0">
  <div class="card__header">Header</div>
  <div class="card__content">Body</div>
  <div class="card__footer">Footer</div>
</div>
```

### 9.2 Instance Overrides
```html
<div class="card" style="--card-radius:24px; --card-hover-translate-y:-1px" data-hoverable="true">
  Custom instance with inline overrides
</div>
```

### 9.3 Status Cards
```html
<div class="card card--success card--md">
  <p>Success message with semantic styling</p>
</div>
```

## 10. Migration Strategy

### 10.1 Backwards Compatibility
- Existing card usage remains functional during transition
- Gradual migration through automated tooling
- Feature flags for progressive rollout

### 10.2 Migration Steps
1. Replace direct `background/border/shadow` properties with token consumption
2. Convert variants to variable-only classes
3. Update size variants to use logical padding properties
4. Add interactive states and accessibility features
5. Create comprehensive documentation and examples

## 11. Performance Considerations

### 11.1 Bundle Impact
- Token-based approach reduces CSS specificity conflicts
- Single base component with variant overrides minimizes duplication
- Estimated bundle size increase: <2KB gzipped

### 11.2 Runtime Performance
- CSS custom properties provide optimal runtime performance
- Transitions use hardware-accelerated properties (transform, opacity)
- State layer implementation uses pseudo-elements to avoid layout thrash

## 12. Success Criteria

- [ ] 12 public token API implemented with semantic fallbacks
- [ ] All variants (elevated, filled, outlined) working via tokens only
- [ ] Three size variants (sm, md, lg) with logical properties
- [ ] Four status variants with semantic color integration
- [ ] Interactive states (hover, focus, disabled) with smooth animations
- [ ] Full RTL support through logical properties
- [ ] WCAG 2.1 AA accessibility compliance
- [ ] Tailwind integration without specificity conflicts
- [ ] Dark mode automatic adaptation
- [ ] Comprehensive documentation with migration guide
- [ ] Performance impact under 2KB bundle increase
- [ ] 100% existing card usage migrated successfully