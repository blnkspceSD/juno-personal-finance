# Juno Motion Guidelines

*Inspired by Dropbox and Material Design principles*

## Core Principles

### 1. **Prioritize Simplicity**
- Fewer, better elements with purpose
- Motion should never distract from main function
- Prefer subtle over spectacular

### 2. **Deepen Understanding**
- Motion explains complex actions
- Reduces cognitive load
- Shows relationships between elements

### 3. **Instant Feedback**
- Immediate response to user actions
- Natural physical properties
- Satisfying micro-interactions

### 4. **Subtle Playfulness**
- Make users smile, not overwhelmed
- Professional with gentle personality
- Premium, refined feeling

## Animation System

### Timing Tokens
```css
--motion-duration-instant: 100ms;    /* Immediate feedback */
--motion-duration-short: 200ms;      /* Simple state changes */
--motion-duration-medium: 300ms;     /* Complex transitions */
--motion-duration-long: 500ms;       /* Enter/exit animations */
--motion-duration-extra-long: 1000ms; /* Special moments */
```

### Easing Tokens
```css
--motion-ease-linear: cubic-bezier(0, 0, 1, 1);           /* Mechanical */
--motion-ease-standard: cubic-bezier(0.4, 0, 0.2, 1);     /* Standard Material */
--motion-ease-decelerate: cubic-bezier(0, 0, 0.2, 1);     /* Entering elements */
--motion-ease-accelerate: cubic-bezier(0.4, 0, 1, 1);     /* Exiting elements */
--motion-ease-emphasized: cubic-bezier(0.2, 0, 0, 1);     /* Important moments */
```

### Chart Animation Patterns

#### **Data Visualization Entry**
- **Duration**: 400-600ms
- **Easing**: `standard` or `decelerate`
- **Pattern**: Staggered appearance (50-100ms delays)
- **Effect**: Grow from baseline, fade in opacity

#### **Data Updates**
- **Duration**: 200-300ms
- **Easing**: `standard`
- **Pattern**: Smooth morphing
- **Effect**: Height transitions, color changes

#### **Interactive States**
- **Duration**: 100-150ms
- **Easing**: `standard`
- **Pattern**: Immediate response
- **Effect**: Subtle scale, opacity, or color shift

## Implementation Guidelines

### DO ✅
- Use consistent timing across similar elements
- Stagger related animations with 50-100ms delays
- Keep opacity transitions between 0.7-1.0 for subtle effects
- Use `transform` over changing layout properties
- Test animations at different speeds and devices

### DON'T ❌
- Exceed 1000ms for any single animation
- Use bounce or elastic easing for data visualizations
- Animate more than 3 properties simultaneously
- Create distracting loops or infinite animations
- Use animation without clear purpose

## Accessibility

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Guidelines
- Always provide reduced motion alternatives
- Keep essential information visible without animation
- Use animation to enhance, not replace functionality