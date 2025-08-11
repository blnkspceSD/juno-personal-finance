# Juno Design System Governance

**🎯 CRITICAL: All components must use the Juno Design System for consistency and brand cohesion.**

## Design System Requirements

### Mandatory Token Usage
- **Always use Juno design tokens** - Never hardcode colors, spacing, shadows, or typography
- **CSS Classes**: Use `.btn--primary` and `.btn--secondary` for all buttons
- **React Components**: Use existing Button component with Juno variants (juno-primary, juno-secondary, etc.)
- **Colors**: Use `--juno-accent`, `--juno-surface-*`, `--juno-neutral-*` families only
- **Spacing**: Use `--juno-space-*` scale (4px base unit) for all margins, padding, gaps
- **Typography**: Use `--juno-fs-*` scale (Major Third 1.25x progression)
- **Shadows**: Use combined shadow effects (`shadow-juno-card-with-stroke`) for cards
- **Border Radius**: Use `--juno-radius-*` scale (xl for cards, lg for buttons, md for inputs)

## Before Adding Any Component

### Component Integration Process
1. **Check existing components** first - we have Button, ExplainChip, and comprehensive design tokens
2. **Modify imported components** to use Juno tokens instead of default styling
3. **Never use generic Tailwind classes** like `bg-blue-500`, `rounded-lg`, `shadow-md`
4. **Always use Juno equivalents**: `bg-juno-blue-500`, `rounded-juno-xl`, `shadow-juno-card-with-stroke`

### Component Integration Checklist
- [ ] Replace default colors with Juno color tokens
- [ ] Replace default spacing with Juno spacing scale  
- [ ] Replace default shadows with Juno shadow system
- [ ] Replace default border radius with Juno radius scale
- [ ] Update hover/active states to use Juno interaction patterns
- [ ] Test component on design system page (/design-system)

## Quick Reference

### Buttons
- **CSS Classes**: `.btn--primary`, `.btn--secondary` 
- **React Component**: `<Button variant="juno-primary">` or `<Button variant="juno-secondary">`
- **Color Families**: juno-primary, juno-secondary, juno-teal, juno-blue

### Cards & Containers
```tsx
// Standard card styling
<div className="bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke">
```

### Typography
- **Primary Text**: `text-juno-text`
- **Secondary Text**: `text-juno-muted-fg` 
- **Pill Text**: `text-juno-pill-fg bg-juno-pill-bg`

### Spacing (4px base unit)
- **Small**: `p-juno-3` (12px), `gap-juno-2` (8px), `mb-juno-4` (16px)
- **Medium**: `p-juno-6` (24px), `gap-juno-4` (16px), `mb-juno-8` (32px)
- **Large**: `p-juno-8` (32px), `gap-juno-6` (24px), `mb-juno-12` (48px)

### Colors by Use Case

#### Primary Actions
- **Main CTAs**: `bg-juno-accent` (cyan family)
- **Professional**: `bg-juno-teal-500` (teal family)
- **Trustworthy**: `bg-juno-blue-500` (blue family)

#### Backgrounds & Surfaces
- **Cards**: `bg-juno-surface-100`, `bg-juno-surface-200`
- **Page Background**: `bg-juno-surface-50`
- **Dark Sections**: `bg-juno-neutral-850`

#### Status & Semantic
- **Success**: `bg-juno-success-bg text-juno-success-fg`
- **Warning**: `bg-juno-warning-bg text-juno-warning-fg`
- **Danger**: `bg-juno-danger-bg text-juno-danger-fg`
- **Info**: `bg-juno-info-bg text-juno-info-fg`

### Shadows & Depth
- **Cards**: `shadow-juno-card-with-stroke` (default)
- **Hover States**: `shadow-juno-sm-with-stroke`
- **Floating Elements**: `shadow-juno-lg-with-stroke`
- **Modals**: `shadow-juno-xl-with-stroke`

### Border Radius Hierarchy
- **Buttons**: `rounded-juno-lg` (16px)
- **Cards**: `rounded-juno-xl` (24px)
- **Large Containers**: `rounded-juno-2xl` (28px)
- **Small Elements**: `rounded-juno-md` (12px)

## Design System Files

### Core Files
- **Main Tokens**: `src/styles/juno-tokens.css` - Complete design system with 50+ tokens
- **Tailwind Integration**: `src/app/globals.css` - Theme mapping for Tailwind classes
- **Component Examples**: `src/app/design-system/page.tsx` - Interactive preview and testing

### Documentation
- **Usage Guide**: `.agent-os/specs/2025-08-10-visual-ui-branding-improvements/component-usage-guide.md`
- **Implementation Specs**: `.agent-os/specs/2025-08-10-visual-ui-branding-improvements/`

### Preview & Testing
- **Design System Preview**: http://localhost:3000/design-system
- **All Components**: Live examples with proper token usage
- **Interactive Testing**: Hover states, focus management, responsive behavior

## Common Patterns

### Form Components
```tsx
<div className="space-y-juno-4">
  <input className="border border-juno-border rounded-juno-md p-juno-3 focus:border-juno-focus-ring" />
  <div className="flex gap-juno-3">
    <button className="btn--secondary">Cancel</button>
    <button className="btn--primary">Save</button>
  </div>
</div>
```

### Card with Content
```tsx
<div className="bg-juno-surface-100 rounded-juno-xl shadow-juno-card-with-stroke p-juno-6 space-y-juno-4">
  <h3 className="text-juno-text font-semibold">Title</h3>
  <p className="text-juno-muted-fg">Description</p>
</div>
```

### Educational Pattern with ExplainChip
```tsx
<div className="flex items-center gap-juno-2">
  <span className="text-juno-text">Term</span>
  <ExplainChip explanation="Explanation text" />
</div>
```

## ⚠️ What NOT to Do

### Avoid These Classes
- ❌ `bg-blue-500`, `bg-gray-100`, `text-black`
- ❌ `rounded-lg`, `shadow-md`, `p-4`
- ❌ `border-gray-300`, `hover:bg-blue-600`

### Use These Instead
- ✅ `bg-juno-blue-500`, `bg-juno-surface-100`, `text-juno-text`
- ✅ `rounded-juno-xl`, `shadow-juno-card-with-stroke`, `p-juno-4`
- ✅ `border-juno-border`, `hover:bg-juno-blue-600`

## Enforcement

### Pre-Development Checklist
1. Check if component exists in `/src/components/ui/`
2. Review design system preview at `/design-system`
3. Use component usage guide for proper token mapping
4. Test component integration before committing

### Code Review Points
- No hardcoded colors, spacing, or typography values
- All interactive elements use Juno hover/focus states
- Consistent shadow and border radius usage
- Proper semantic color usage (success, warning, etc.)

This design system ensures **brand consistency**, **professional appearance**, and **maintainable code** across the entire Juno application.