# Juno Design System - Component Usage Guide

## Token Mapping System

### Brand Color Mappings

The main brand colors are now mapped to specific scale tokens for consistency and flexibility:

```css
--juno-accent: var(--juno-accent-300);  /* #85D6FF */
--juno-text: var(--juno-neutral-750);   /* #212730 */
```

**Benefits:**
- **Consistent**: Brand colors are always part of the scale system
- **Flexible**: Easy to adjust by changing the mapping
- **Scalable**: Can use lighter/darker variants from same family
- **Predictable**: `juno-accent` = `juno-accent-300`

## Color Usage Patterns

### 1. Primary Brand Combination (USE SPARINGLY)
```tsx
<div className="bg-juno-accent text-juno-text">
  Primary brand accent - CTAs only
</div>
```
**Use for:** Main CTAs, buttons, highlights only (keep under 5% of interface)

### 2. Neutral Surfaces (RECOMMENDED FOR CARDS)
```tsx
<div className="bg-juno-surface-100 text-juno-text">
  Clean neutral background
</div>
```
**Use for:** Cards, content areas, form backgrounds, main surfaces

### 3. Subtle Surface Variations
```tsx
<div className="bg-juno-surface-200 text-juno-text">
  Slightly darker surface
</div>
```
**Use for:** Secondary cards, hover states, subtle depth

### 4. High Contrast Surfaces
```tsx
<div className="bg-juno-neutral-850 text-juno-surface-50">
  Dark surface with light text
</div>
```
**Use for:** Dark mode, navigation bars, emphasis

### 5. Dark Theme Combinations
```tsx
<div className="bg-juno-neutral-850 text-juno-surface-50">
  Dark theme example
</div>
```
**Use for:** Dark mode interfaces, navigation bars

## Button Component Usage

### CSS Button Classes (New!)

The design system now includes sophisticated CSS button classes that use all Juno design tokens:

#### Primary Button (.btn--primary)
```html
<!-- Basic primary button -->
<button class="btn--primary">
  <span class="btn__lead">Save Changes</span>
</button>

<!-- Two-tone primary button -->
<button class="btn--primary">
  <span class="btn__lead">Create</span>
  <span class="btn__sub">Transaction</span>
</button>

<!-- Primary with icon -->
<button class="btn--primary">
  <span class="btn__lead">Export</span>
  <span class="btn__icon">→</span>
</button>
```

**Features:**
- 40px height with 16px border radius
- Sophisticated layered shadows with inset highlights
- Micro-interactions: hover brightness, active press down
- Uses `--juno-accent` background with `--juno-text` color
- Focus ring using `--juno-focus-ring`

#### Secondary Button (.btn--secondary)
```html
<!-- Basic secondary button -->
<button class="btn--secondary">Cancel</button>

<!-- Secondary with icon -->
<button class="btn--secondary">
  <span>Settings</span>
  <span class="icon">⚙️</span>
</button>

<!-- Icon-only secondary -->
<button class="btn--secondary btn--icon-only">
  <span class="icon">×</span>
</button>
```

**Features:**
- 36px height with 12px border radius
- Advanced layered shadow system (6 shadow layers + inset)
- Uses `--juno-surface-50` background
- Subtle hover and press animations

### React Button Component (Existing)

### Primary Actions (Cyan Family)
```tsx
import { Button } from "@/components/ui/button"

// Main brand button
<Button variant="juno-primary">Save Changes</Button>

// Secondary action
<Button variant="juno-secondary">Cancel</Button>

// Subtle action
<Button variant="juno-ghost">Edit</Button>

// Link style
<Button variant="juno-link">Learn More</Button>
```

### Professional Actions (Teal Family)
```tsx
// Reports, analytics, professional features
<Button variant="juno-teal">Generate Report</Button>
<Button variant="juno-teal-outline">Export Data</Button>
<Button variant="juno-teal-ghost">View Analytics</Button>
```

### Trustworthy Actions (Blue Family)
```tsx
// Security, payments, important confirmations
<Button variant="juno-blue">Confirm Payment</Button>
<Button variant="juno-blue-outline">Security Settings</Button>
<Button variant="juno-blue-ghost">View Statement</Button>
```

### Mobile-Optimized Buttons
```tsx
// Better touch targets on mobile (44px+)
<Button variant="juno-primary" size="juno-mobile">Mobile Friendly</Button>
<Button variant="juno-teal" size="juno-mobile-lg">Large Touch Target</Button>
```

## ExplainChip Educational Component

The ExplainChip component implements the "explain-on-tap" functionality for financial terms and numbers, supporting Juno's educational-first approach.

### Basic Usage
```tsx
import { ExplainChip } from '@/components/ui/explain-chip'

// Basic explanation
<div className="flex items-center gap-2">
  <span>Emergency Fund</span>
  <ExplainChip 
    title="Emergency Fund"
    explanation="A dedicated savings account with 3-6 months of living expenses."
  />
</div>
```

### Size Variants
```tsx
// Small - for inline text
<ExplainChip 
  size="sm"
  explanation="Quick explanation for inline terms"
/>

// Default - standard size
<ExplainChip 
  explanation="Standard explanation for most use cases"
/>

// Large - for prominent elements
<ExplainChip 
  size="lg"
  explanation="Prominent explanations for hero sections"
/>
```

### Position Control
```tsx
// Auto-positioning (recommended)
<ExplainChip explanation="Automatically positions to stay in viewport" />

// Manual positioning
<ExplainChip position="top" explanation="Forces top position" />
<ExplainChip position="bottom" explanation="Forces bottom position" />
<ExplainChip position="left" explanation="Forces left position" />
<ExplainChip position="right" explanation="Forces right position" />
```

### Teach Mode
```tsx
// Always visible in teach mode
<ExplainChip 
  teachMode={true}
  title="Compound Interest"
  explanation="Educational content that's always visible when teach mode is active"
/>
```

### Financial Context Examples
```tsx
// Term explanation
<div className="flex items-center gap-2">
  <h3>Portfolio Diversification</h3>
  <ExplainChip 
    title="Portfolio Diversification"
    explanation="Spreading investments across different asset classes, sectors, and regions to reduce risk. The goal is to maximize returns while minimizing the impact of any single investment's poor performance."
    size="sm"
  />
</div>

// Number explanation
<div className="flex items-center gap-2">
  <span className="text-2xl font-semibold text-juno-text">RM 2,450</span>
  <ExplainChip 
    title="Monthly Investment Recommendation"
    explanation="Based on your income and expenses, this represents 30% of your surplus following the 50/30/20 budgeting rule."
  />
</div>

// Calculation explanation
<div className="space-y-2">
  <div className="flex items-center gap-2">
    <span>Expected Annual Return: 7.5%</span>
    <ExplainChip 
      title="Conservative Growth Projection"
      explanation="Based on historical performance of diversified portfolios. Actual returns will vary and past performance doesn't guarantee future results."
      size="sm"
    />
  </div>
</div>
```

## Advanced Usage Patterns

### 1. Surface Gradients (RECOMMENDED)
```tsx
<div className="bg-gradient-to-r from-juno-surface-100 to-juno-surface-300 text-juno-text">
  Subtle surface gradient
</div>
```

### 2. Surface Hover States
```tsx
<div className="bg-juno-surface-100 hover:bg-juno-surface-200 transition-colors">
  Subtle hover effect
</div>
```

### 3. Focus States
```tsx
<button className="focus-visible:ring-2 focus-visible:ring-juno-focus-ring">
  Proper focus indicator
</button>
```

### 4. Semantic Status Colors
```tsx
<div className="bg-juno-success-bg text-juno-success-fg border border-juno-success rounded-lg p-3">
  Success message
</div>

<div className="bg-juno-warning-bg text-juno-warning-fg border border-juno-warning rounded-lg p-3">
  Warning message
</div>

<div className="bg-juno-danger-bg text-juno-danger-fg border border-juno-danger rounded-lg p-3">
  Error message
</div>
```

## ⚠️ IMPORTANT: Accent Color Usage Rules

### Accent Coverage Limit
**Keep accent color usage under 5% of the interface:**
- Use ONLY for primary CTAs, important buttons, and key highlights
- Do NOT use for cards, backgrounds, or large surface areas
- Use neutral surfaces (juno-surface-*) for 95% of backgrounds

### Proper Accent Usage
```tsx
// ✅ CORRECT - Primary CTA button
<Button variant="juno-primary">Save Changes</Button>

// ✅ CORRECT - Important highlight
<div className="border-l-4 border-juno-accent bg-juno-surface-100">
  Important notification
</div>

// ❌ WRONG - Card background
<div className="bg-juno-accent p-6">
  Card content
</div>

// ✅ CORRECT - Card with neutral background
<div className="bg-juno-surface-100 p-6 border border-juno-border">
  Card content
</div>
```

## When to Use Each Color Family

### Cyan (Primary Brand)
- **Main actions**: Save, Submit, Create, Add
- **Hero sections**: Primary content, featured items
- **Navigation**: Active states, current page indicators
- **Branding**: Logo areas, brand highlights

### Teal (Professional)
- **Business features**: Reports, analytics, exports
- **Data visualization**: Professional charts, dashboards  
- **Administrative**: Settings, configuration, management
- **Corporate**: B2B features, enterprise functionality

### Blue (Trustworthy)
- **Financial**: Payments, transactions, money-related
- **Security**: Authentication, permissions, privacy
- **Important confirmations**: Delete, permanent changes
- **Trust signals**: Testimonials, certifications

### Neutrals
- **Text**: Primary (`neutral-750`), secondary (`neutral-500`), muted (`neutral-300`)
- **Backgrounds**: Dark themes (`neutral-850`, `neutral-900`)
- **Borders**: Subtle dividers (`neutral-200`, `neutral-300`)
- **Disabled states**: Low opacity neutrals

### Surfaces
- **Card backgrounds**: Clean, subtle (`surface-100`, `surface-200`)
- **Modal overlays**: Light backgrounds (`surface-50`, `surface-100`)
- **Form backgrounds**: Input areas (`surface-200`, `surface-300`)
- **Subtle highlights**: Hover states (`surface-300`, `surface-400`)

## Accessibility Guidelines

### Color Contrast
All combinations meet WCAG 2.1 AA standards:
- `juno-text` on `juno-accent`: 4.73:1 ✅
- `juno-muted-fg` on `juno-accent`: 3.41:1 (large text only) ⚠️
- `juno-pill-fg` on `juno-pill-bg`: 8.2:1 ✅ AAA

### Focus Indicators
Always use the proper focus ring:
```css
focus-visible:ring-2 focus-visible:ring-juno-focus-ring focus-visible:ring-offset-0
```

### Screen Reader Support
Ensure sufficient context for color-coded information:
```tsx
<div className="text-juno-success-fg" aria-label="Success: Changes saved">
  ✅ Saved
</div>
```

## Spacing Guidelines for "Calm Money Coach" Aesthetic

### Expanded Spacing Scale
The Juno design system uses generous spacing to create a calm, breathable interface:

```css
/* Expanded spacing tokens */
--juno-space-1: 4px;    /* Minimal spacing */
--juno-space-2: 8px;    /* Tight spacing */
--juno-space-3: 12px;   /* Small spacing */
--juno-space-4: 16px;   /* Base spacing */
--juno-space-5: 20px;   /* Comfortable spacing */
--juno-space-6: 24px;   /* Medium spacing */
--juno-space-8: 32px;   /* Large spacing */
--juno-space-10: 40px;  /* Extra large spacing */
--juno-space-12: 48px;  /* Section spacing */
--juno-space-16: 64px;  /* Major section spacing */
--juno-space-20: 80px;  /* Hero section spacing */
--juno-space-24: 96px;  /* Page section spacing */
--juno-space-32: 128px; /* Major page divisions */
--juno-space-40: 160px; /* Hero/landing spacing */
```

### Spacing Usage Patterns

#### Card Components
```tsx
// Generous card spacing for calm feel
<div className="p-8 space-y-4">  {/* 32px padding, 16px between elements */}
  <h3 className="mb-4">Title</h3>  {/* 16px margin below */}
  <p className="mb-6">Content</p>   {/* 24px margin below */}
  <div className="flex gap-4">     {/* 16px gap between actions */}
    <button>Action</button>
  </div>
</div>
```

#### Section Spacing
```tsx
// Page sections with breathing room
<div className="space-y-16">        {/* 64px between major sections */}
  <section className="space-y-10">  {/* 40px between subsections */}
    <h2 className="mb-6">Section Title</h2>  {/* 24px margin below */}
    <div className="space-y-6">     {/* 24px between content blocks */}
      <div>Content block 1</div>
      <div>Content block 2</div>
    </div>
  </section>
</div>
```

#### Component Spacing Hierarchy
- **Elements within components**: `space-3` to `space-4` (12px-16px)
- **Related components**: `space-6` to `space-8` (24px-32px)
- **Component groups**: `space-10` to `space-12` (40px-48px)
- **Page sections**: `space-16` to `space-24` (64px-96px)
- **Major page divisions**: `space-32` to `space-40` (128px-160px)

## Performance Considerations

### Bundle Size
- All colors use CSS custom properties (minimal impact)
- Tailwind purges unused classes automatically
- Token system reduces CSS duplication
- Expanded spacing scale adds minimal overhead

### Runtime Performance
- No JavaScript calculations needed
- CSS custom properties are fast
- Consistent color values cache efficiently
- Generous spacing improves perceived performance by reducing visual clutter

## Migration from Existing Colors

### Step 1: Replace Direct Values
```tsx
// Before
<div className="bg-blue-500 text-white">

// After  
<div className="bg-juno-blue text-white">
```

### Step 2: Use Appropriate Variants
```tsx
// Before
<div className="bg-gray-100 text-gray-800">

// After
<div className="bg-juno-surface-100 text-juno-text">
```

### Step 3: Leverage Scale System
```tsx
// Before (limited options)
<div className="bg-blue-400 hover:bg-blue-500">

// After (full scale available)
<div className="bg-juno-blue-400 hover:bg-juno-blue-500">
```

## Common Mistakes to Avoid

### ❌ Don't Overuse Accent Colors
```tsx
// WRONG - Too much accent color (>5% coverage)
<div className="bg-juno-accent p-6">
  <div className="bg-juno-accent-200 p-4">
    Card with accent background
  </div>
</div>

// CORRECT - Use neutrals for surfaces
<div className="bg-juno-surface-100 p-6 border border-juno-border">
  <div className="bg-juno-surface-200 p-4">
    Card with neutral background
  </div>
</div>
```

### ❌ Don't Use Accent for Large Areas
```tsx
// WRONG - Large background area
<div className="min-h-screen bg-juno-accent">
  
// CORRECT - Neutral background with accent highlights
<div className="min-h-screen bg-juno-surface-50">
  <button className="bg-juno-accent">CTA</button>
</div>
```

### ❌ Don't Mix Color Families Randomly
```tsx
// Poor color harmony
<div className="bg-juno-teal-200 text-juno-blue-600">
```

### ❌ Don't Ignore Accessibility
```tsx
// Poor contrast
<div className="bg-juno-accent-100 text-juno-accent-200">
```

### ✅ Do Use Consistent Patterns
```tsx
// Good neutral-first approach
<div className="bg-juno-surface-100 text-juno-text border border-juno-border">
  <h1 className="text-juno-text">Title</h1>
  <p className="text-juno-muted-fg">Description</p>
  <button className="bg-juno-accent text-juno-text">CTA</button>
</div>

// Good color hierarchy - neutrals + accent highlights
<div className="bg-juno-surface-50">
  <nav className="bg-juno-surface-100 border-b border-juno-border">
    <button className="bg-juno-accent">Primary Action</button>
  </nav>
</div>
```

## Transparent Border System

The Juno design system includes a comprehensive transparent border system that uses opacity-based colors for more sophisticated layering effects.

### ⚡ Important: Combined Shadow + Stroke Convention

**Any card or component with a soft drop shadow should use combined shadow effects that include both depth shadows and stroke-mimicking shadows:**

```tsx
// ✅ CORRECT - Card uses combined shadow that includes depth + stroke mimic
<div className="bg-juno-surface-100 p-6 rounded-lg shadow-juno-card-with-stroke">
  Card with stronger definition shadow (25% opacity) + 1px stroke mimic in one declaration
</div>

// ✅ ALSO CORRECT - Individual shadow tokens for specific effects  
<div className="bg-juno-surface-100 p-6 rounded-lg shadow-juno-stroke-medium">
  Card with just stroke-mimic shadow (no depth)
</div>

// ❌ WRONG - Don't use separate outline/border declarations
<div className="bg-juno-surface-100 p-6 rounded-lg outline-2 outline-juno-outline-alpha-medium shadow-juno-soft">
  Separate outline affects layout and adds complexity
</div>

// ❌ WRONG - Don't use borders with soft shadows
<div className="bg-juno-surface-100 p-6 rounded-lg border-2 border-juno-border-alpha-medium shadow-juno-soft">
  Stroke-inside affects internal layout
</div>
```

**Why combined shadow effects over separate outline/border:**
- **Single declaration**: One shadow property handles both depth and 1px stroke effects
- **Layout preservation**: No impact on content positioning, sizing, or box model
- **Perfect alignment**: 1px stroke and depth shadows are perfectly coordinated
- **Performance**: Single shadow calculation instead of multiple box-shadow layers
- **Clean code**: Simpler class names and fewer CSS declarations
- **Refined appearance**: 1px stroke provides subtle definition without being heavy

### Transparent Border Categories

#### Light Background Borders (Dark Text with Opacity)
```tsx
// Very subtle separation (8% opacity)
<div className="border border-juno-border-alpha-subtle">
  Barely visible separation
</div>

// Soft definition (12% opacity)
<div className="border border-juno-border-alpha-soft">
  Gentle boundary
</div>

// Standard separation (16% opacity - same as solid juno-border)
<div className="border border-juno-border-alpha-medium">
  Standard transparent border
</div>

// Strong definition (24% opacity)
<div className="border border-juno-border-alpha-strong">
  Clear boundary
</div>

// Bold separation (32% opacity)
<div className="border border-juno-border-alpha-bold">
  Strong visual separation
</div>
```

#### Dark Background Borders (White with Opacity)
```tsx
// For darker surfaces and overlays
<div className="bg-juno-neutral-850 border border-juno-border-alpha-dark-subtle">
  Very subtle on dark backgrounds
</div>

<div className="bg-juno-neutral-850 border border-juno-border-alpha-dark-soft">
  Soft separation on dark
</div>

<div className="bg-juno-neutral-850 border border-juno-border-alpha-dark-medium">
  Standard separation on dark
</div>

<div className="bg-juno-neutral-850 border border-juno-border-alpha-dark-strong">
  Strong definition on dark
</div>
```

#### Accent Transparent Borders
```tsx
// Subtle brand presence (20% accent opacity)
<div className="border border-juno-border-alpha-accent-subtle">
  Gentle brand touch
</div>

// Soft brand presence (30% accent opacity) 
<div className="border border-juno-border-alpha-accent-soft">
  Soft brand connection
</div>

// Medium brand presence (40% accent opacity)
<div className="border border-juno-border-alpha-accent-medium">
  Clear brand association
</div>
```

### Layered Border Effects

#### Default Card Shadow
```tsx
// Standard card with stronger definition (recommended default)
<div className="bg-juno-surface-100 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
  <h3>Card Title</h3>
  <p>Uses 24px border radius with sophisticated shadow for balanced card appearance</p>
</div>
```

#### Card Layering Pattern
```tsx
// Outer container with combined shadow + stroke effect
<div className="bg-juno-surface-50 p-6 rounded-juno-xl shadow-juno-card-with-stroke">
  {/* Inner content with traditional border for subtle separation */}
  <div className="bg-juno-surface-100 p-4 rounded-juno-lg border border-juno-border-alpha-soft">
    <h3>Layered Card Content</h3>
    <p>Creates depth without harsh visual breaks</p>
  </div>
</div>
```

#### Focus State Progression
```tsx
// Progressive transparency on focus/hover
<input 
  className="
    border border-juno-border-alpha-medium
    focus:border-juno-border-alpha-accent-medium
    hover:border-juno-border-alpha-strong
    transition-colors
  "
  placeholder="Form input with transparent borders"
/>
```

#### Modal/Overlay Borders
```tsx
// Light overlay with dark transparent border
<div className="bg-juno-surface-50/95 backdrop-blur-sm border border-juno-border-alpha-dark-medium">
  Modal content with sophisticated layering
</div>
```

### Border Radius Scale

Juno uses generous border radii for a modern, friendly appearance:

- **`rounded-juno-sm`**: 8px - Small components, chips
- **`rounded-juno-md`**: 12px - Buttons, form inputs
- **`rounded-juno-lg`**: 16px - Small cards, modals
- **`rounded-juno-xl`**: 24px - **Main cards (default)**
- **`rounded-juno-2xl`**: 28px - Large containers
- **`rounded-juno-3xl`**: 32px - Inner card elements
- **`rounded-juno-4xl`**: 40px - Hero sections, special containers
- **`rounded-juno-full`**: Full rounded - Avatars, pills

#### Card Border Radius Usage
```tsx
// Main container cards use xl (24px) for balanced appearance
<div className="rounded-juno-xl shadow-juno-card-with-stroke">
  Main card content
</div>

// Nested elements use smaller radii for hierarchy
<div className="rounded-juno-xl">
  <div className="rounded-juno-lg border">
    Inner content
  </div>
</div>
```

### Shadow Hierarchy and Usage

#### Shadow Scale Overview
- **`shadow-juno-card`**: Default card shadow with stronger definition (0 2px 8px rgba(0,0,0,0.25))
- **`shadow-juno-sm`**: Subtle hover states and light cards (0 2px 8px rgba(33,39,48,0.06))
- **`shadow-juno-soft`**: Layered depth shadows (multiple shadow values)
- **`shadow-juno-md/lg/xl`**: Progressive depth for floating elements

#### When to Use Each Shadow

**Default Card Shadow (`shadow-juno-card-with-stroke`)**:
```tsx
// Standard cards, main content containers
<div className="bg-juno-surface-100 p-6 rounded-lg shadow-juno-card-with-stroke">
  Default card with strong definition
</div>
```

**Subtle Hover States (`shadow-juno-sm-with-stroke`)**:
```tsx
// Interactive elements, lighter emphasis
<button className="bg-juno-surface-200 p-4 rounded-lg shadow-juno-sm-with-stroke hover:shadow-juno-card-with-stroke">
  Interactive element
</button>
```

#### Use Combined Shadow Effects For:
- **Main containers**: Cards, sections, and large content areas that need both depth and definition
- **Professional components**: Elements requiring sophisticated visual hierarchy
- **Layout-sensitive areas**: Components where borders would affect sizing or positioning

#### Use Stroke-Only Shadows For:
- **Simple definition**: Elements that need visual separation without depth
- **Layered backgrounds**: Components on colored or textured backgrounds where depth shadows might clash
- **Subtle emphasis**: When you need gentle visual definition without drawing attention

#### Use Traditional Borders For:
- **Form elements**: Inputs, textareas, and interactive components where precise control is needed
- **Small components**: Buttons, chips, and elements where layout adjustment is manageable
- **Inner separations**: Nested elements within shadow-container hierarchies
- **Interactive states**: Focus indicators and state changes that need immediate visual feedback

#### Mixed Approach Example
```tsx
// Outer container uses combined shadow effect
<div className="shadow-juno-soft-with-stroke">
  <div className="p-6">
    {/* Inner elements use traditional borders for precise control */}
    <input className="border border-juno-border-alpha-medium" />
    <button className="border border-juno-border-alpha-soft">Submit</button>
  </div>
</div>
```

### When to Use Transparent vs Solid Borders

#### Use Transparent Borders For:
- **Layered interfaces**: Multiple nested elements
- **Sophisticated overlays**: Modals, dropdowns, tooltips
- **Subtle separations**: When you want gentle definition without harsh lines
- **Brand integration**: Accent borders that shouldn't overpower content
- **Responsive designs**: Borders that adapt to different background contexts

#### Use Solid Borders For:
- **High contrast needs**: Accessibility requirements
- **Clear separations**: When you need obvious boundaries
- **Simple interfaces**: Single-layer designs
- **Print-friendly designs**: When transparency might not render properly

### Responsive Transparent Border Patterns

#### Mobile Adaptations
```tsx
// Increase opacity on mobile for better visibility
<div className="
  border border-juno-border-alpha-medium
  md:border-juno-border-alpha-soft
">
  More visible on mobile, softer on desktop
</div>
```

#### Dark Mode Adaptations
```tsx
// Automatic adaptation for dark themes
<div className="
  border border-juno-border-alpha-medium
  dark:border-juno-border-alpha-dark-medium
">
  Adapts to light/dark contexts
</div>
```

### Advanced Transparent Border Combinations

#### Button States with Transparent Borders
```tsx
// Primary action with accent transparent border
<button className="
  bg-juno-accent 
  text-juno-text 
  border border-juno-border-alpha-accent-medium
  hover:border-juno-border-alpha-accent-soft
">
  Primary Action
</button>

// Secondary action with neutral transparent border
<button className="
  bg-juno-surface-200 
  text-juno-text 
  border border-juno-border-alpha-soft
  hover:border-juno-border-alpha-medium
">
  Secondary Action
</button>
```

#### Form Field Grouping
```tsx
<div className="bg-juno-surface-100 p-6 rounded-lg shadow-juno-sm-with-stroke">
  <fieldset className="border border-juno-border-alpha-subtle p-4 rounded-lg">
    <legend className="px-2 text-sm font-medium">Personal Information</legend>
    <div className="space-y-3">
      <input className="border border-juno-border-alpha-medium" />
      <input className="border border-juno-border-alpha-medium" />
    </div>
  </fieldset>
</div>
```

## Testing Your Implementation

### Visual Testing
- Check contrast ratios meet WCAG standards
- Test hover and focus states
- Verify mobile touch target sizes (44px+)

### Browser Testing
- Test in Chrome, Firefox, Safari, Edge
- Check mobile browsers (iOS Safari, Chrome Mobile)
- Verify CSS custom property support

### Accessibility Testing
- Use screen reader (VoiceOver, NVDA)
- Test keyboard navigation
- Check high contrast mode
- Verify color-blind accessibility