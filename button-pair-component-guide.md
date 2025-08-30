
# Button Pair Component Guide

A practical, industry-standard approach to designing and implementing a **Button Pair** component in Juno.

---

## 🎯 Core Features
- Two buttons with defined spacing
- Layout options: **Horizontal** (side-by-side) or **Vertical** (stacked)
- Semantic roles: Primary action + Secondary action
- Consistent variants: Primary / Secondary / Ghost

---

## 🎨 Design Decisions

### 1. Default Spacing
- **12px** (`var(--juno-space-3)`)
- 8px feels dense; 16px over-separates actions
- 12px balances density and clarity

### 2. Default Layout
- **Horizontal** by default
- Matches most dialogs/toolbars where actions sit side-by-side

### 3. Button Order
- **Primary first, Ghost second**
- When stacked vertically: **Primary stays on top**
- Exception: destructive flows may use `order="secondary-first"`

### 4. Responsive Behavior
- **Auto-stack vertically on narrow containers** (preferred over fixed breakpoints)
- Use **CSS Container Queries** (e.g., stack below ~360px width)

---

## 🛠 API Design

### Composition-first (recommended)
```tsx
<ButtonPair aria-label="Dialog actions">
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonPair>
```

### With ergonomic props (optional helper)
```tsx
<ButtonPair
  direction="auto"
  primary={<Button variant="primary">Save</Button>}
  secondary={<Button variant="ghost">Cancel</Button>}
/>
```

### Props
```ts
type ButtonPairProps = {
  direction?: 'horizontal' | 'vertical' | 'auto';
  gap?: 'sm' | 'md' | 'lg' | number;
  order?: 'primary-first' | 'secondary-first';
  'aria-label'?: string;
  className?: string;
  children: React.ReactNode;
};
```

---

## ♿ Accessibility
- Wrap with `role="group"`
- Provide an **`aria-label`** (e.g., “Dialog actions”)
- DOM order matches visual order (no CSS reversal only)
- Respect keyboard tab order

---

## 🎛 Tokens
Keep minimal:
- `--btnpair-gap` → default `var(--juno-space-3)` (12px)
- `--btnpair-direction` → `row | column`

Optional: `--btnpair-wrap-threshold` for container-aware stacking

---

## 💻 Implementation

### React
```tsx
export function ButtonPair({
  direction = 'auto',
  gap = 'md',
  order = 'primary-first',
  'aria-label': ariaLabel,
  className,
  children,
}: ButtonPairProps) {
  const items = React.Children.toArray(children).slice(0, 2) as React.ReactElement[];

  const style: React.CSSProperties = {};
  const gapPx =
    typeof gap === 'number'
      ? `${gap}px`
      : gap === 'sm'
      ? 'var(--juno-space-2)'
      : gap === 'lg'
      ? 'var(--juno-space-4)'
      : 'var(--juno-space-3)'; // md default
  (style as any)['--btnpair-gap'] = gapPx;

  if (direction !== 'auto') {
    (style as any)['--btnpair-direction'] = direction === 'vertical' ? 'column' : 'row';
  }

  const ordered =
    order === 'secondary-first' && items.length === 2 ? [items[1], items[0]] : items;

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={clsx('btn-pair', direction === 'vertical' && 'is-vertical', className)}
      style={style}
    >
      {ordered}
    </div>
  );
}
```

### CSS
```css
@layer components {
  :where(.btn-pair) {
    display: flex;
    flex-direction: var(--btnpair-direction, row);
    gap: var(--btnpair-gap, var(--juno-space-3));
    align-items: stretch;
  }
  .btn-pair.is-vertical {
    --btnpair-direction: column;
  }
  .btn-pair.is-vertical > .btn {
    width: 100%;
  }
}

@container (max-width: 360px) {
  .btn-pair {
    --btnpair-direction: column;
  }
}
```

---

## ✅ Usage Examples

Horizontal by default:
```tsx
<ButtonPair>
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonPair>
```

Force vertical:
```tsx
<ButtonPair direction="vertical">
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonPair>
```

Auto stack + reversed order:
```tsx
<ButtonPair direction="auto" order="secondary-first">
  <Button variant="primary">Save</Button>
  <Button variant="ghost">Cancel</Button>
</ButtonPair>
```

---

## 📌 TL;DR Defaults
- **Spacing:** 12px (`var(--juno-space-3)`)
- **Layout:** Horizontal
- **Order:** Primary first (top when vertical)
- **Responsive:** Container-query auto-stack below ~360px

---

This gives you a **clean, industry-aligned Button Pair** component that’s accessible, tokenized, and consistent with your design system.
