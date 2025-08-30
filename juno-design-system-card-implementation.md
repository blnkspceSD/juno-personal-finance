# Juno Design System — Card Token API Implementation Guide

> Scope: Implement a stable, overrideable **Card** using your existing **Juno tokens** via a layered **Design System Style API** (Primitives → Semantics → Component tokens → Instance overrides).  
> Status: Ready to paste. Tailwind-friendly. RTL-safe. A11y-aware.

---

## 0) Mental Model

- **Primitives (brand scales):** `--juno-space-*`, `--juno-radius-*`, `--juno-shadow-*`, `--juno-duration-*`, `--juno-ease-*`, color ramps.
- **Semantics (contextual):** `--juno-color-bg-surface`, `--juno-color-bg-surface-secondary`, `--juno-color-text`, `--juno-color-border`, etc.
- **Component tokens (Card API):** `--card-*` variables **consumed** by `.card` with fallbacks to Semantics. Variants/sizes set only `--card-*` (not properties).

---

## 1) File Structure

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

> Tailwind users: place `card.css` in `@layer components`, presets in `@layer utilities`, so utilities naturally override components without `!important`.

---

## 2) Card Token API (Public Surface)

Keep it small (~12). These are the knobs consumers can override per instance, variant, or theme.

**Surface & content**
- `--card-bg` → default: `var(--juno-color-bg-surface)`  
- `--card-fg` → default: `var(--juno-color-text)`
- `--card-state-layer` *(optional overlay for hover/pressed)* → default: `rgb(0 0 0 / 0.04)` or a semantic like `var(--juno-active-overlay)` if present

**Shape & border**
- `--card-radius` → default: `var(--juno-radius-xl)`
- `--card-border-width` → default: `1px`
- `--card-border-color` → default: `var(--juno-color-border)`

**Spacing**
- `--card-pad-block` → default: `var(--juno-space-6)`
- `--card-pad-inline` → default: `var(--juno-space-6)`
- `--card-gap` → default: `var(--juno-card-gap, var(--juno-space-3))`

**Elevation**
- `--card-shadow` → default: `var(--juno-shadow-md)`
- `--card-hover-shadow` → default: `var(--juno-shadow-lg)`

**Interaction & focus**
- `--card-hover-border-color` → default: `var(--juno-color-border-hover)`
- `--card-hover-translate-y` → default: `-2px`
- `--card-focus-ring` → default: `0 0 0 3px rgb(59 130 246 / .35)` *(or map to your focus token if defined)*

---

## 3) Card Base (Consumes Semantics, Not Literals)

```css
@layer components {
  :where(.card) {
    position: relative; /* enables optional state-layer pseudo-element */
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
    overflow: hidden; /* clips state layer & focus ring nicely */
  }

  /* Keyboard focus for interactive cards */
  .card:focus-visible {
    outline: none;
    box-shadow:
      var(--card-shadow, var(--juno-shadow-md)),
      var(--card-focus-ring, 0 0 0 3px rgb(59 130 246 / .35));
  }

  /* Optional Material-like state layer */
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

  /* Hover affordance */
  .card[data-hoverable="true"]:hover {
    box-shadow: var(--card-hover-shadow, var(--juno-shadow-lg));
    border-color: var(--card-hover-border-color, var(--juno-color-border-hover));
    transform: translateY(var(--card-hover-translate-y, -2px));
  }

  /* Slots (only if you use them) */
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
}
```

> Why it works: `.card` **reads** `--card-*` with semantic fallbacks, so **variants/sizes/instances** only need to set `--card-*`—no specificity battles.

---

## 4) Variants as **Variable-Only** Presets

Mirror the common _Elevated / Filled / Outlined_ mental model. These classes must **only set variables**, not properties.

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

---

## 5) Sizes (Logical Props → RTL Safe)

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

> You already have spacing/radius scales (`--juno-space-*`, `--juno-radius-*`), so this reads cleanly.

---

## 6) Status Cards (Map to Your Semantics)

Keep status styles aligned to your system tokens so dark mode & themes just work:

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

---

## 7) Example Markup

```html
<div class="card card--elevated card--md" data-hoverable="true" tabindex="0">
  <div class="card__header">Header</div>
  <div class="card__content">Body</div>
  <div class="card__footer">Footer</div>
</div>

<!-- One-off overrides -->
<div class="card" style="--card-radius:24px; --card-hover-translate-y:-1px" data-hoverable="true">
  Custom instance
</div>
```

---

## 8) Tailwind Integration Tips

- Keep `.card` in `@layer components`, presets in `@layer utilities` to avoid `!important`.
- Consider utilities that proxy into the API:
  ```css
  @layer utilities {
    .rounded-card-sm { --card-radius: var(--juno-radius-lg); }
    .rounded-card-xl { --card-radius: var(--juno-radius-2xl); }
    .p-card-4 { --card-pad-block: var(--juno-space-4); --card-pad-inline: var(--juno-space-4); }
  }
  ```
- You can also use arbitrary props in Tailwind (`[--card-radius:20px]`).

---

## 9) Accessibility & Modes

- **Focus**: `.card:focus-visible` adds a visible ring via `--card-focus-ring`. Ensure contrast meets WCAG on all surfaces.
- **Reduced motion**: When honoring `prefers-reduced-motion`, reduce or disable hover translate/shadow transitions globally.
- **High contrast**: Centralize contrast changes in `semantics.css` so the Card inherits automatically.
- **Dark mode**: Flip `--juno-color-bg-surface/*`, `--juno-color-text`, `--juno-color-border` in `[data-theme="dark"]` once; Card will adapt via fallbacks.

---

## 10) Migration Checklist

- [ ] Replace direct `background/border/shadow` on `.card` with the **consuming** pattern above.
- [ ] Convert variants/sizes to **variable-only** classes.
- [ ] Use logical padding props in sizes for RTL-friendliness.
- [ ] Add a small **docs page** enumerating Card tokens and their semantic fallbacks.
- [ ] Add Storybook stories demonstrating: base, 3 variants × 3 sizes, status cards, one-off inline override, dark mode.

---

## 11) Reference: Common Juno Tokens Used Here

- Spacing: `--juno-space-4`, `--juno-space-6`, `--juno-space-8`
- Radius: `--juno-radius-lg`, `--juno-radius-xl`, `--juno-radius-2xl`
- Shadows: `--juno-shadow-md`, `--juno-shadow-lg` (plus your many others)
- Colors (semantics): `--juno-color-bg-surface`, `--juno-color-bg-surface-secondary`, `--juno-color-text`, `--juno-color-border`, `--juno-color-border-hover`, status `--juno-color-bg-surface-{success,warning,info,critical}`, border `{success,warning,info,critical}`
- Motion: `--juno-duration-fast`, `--juno-duration-normal`, `--juno-ease-out`

> If any of these differ in your token file, adjust the fallback names accordingly—this guide is structured to map 1:1 to your token taxonomy.

---

## 12) Optional: Elevation as a Role Token

If you’d like a number-based elevation role (0–5), add:
```css
:root { --card-elevation: 2; } /* default */
:where(.card) { box-shadow: var(--card-shadow, var(--juno-shadow-md)); }
/* Later: map elevation → shadow in one place if desired */
```

This keeps your component API future-proof if you later change the shadow recipe per platform/theme.

---

**Done.** Paste the snippets into your codebase following the folder structure above, and your Card becomes fully themeable and overrideable without specificity fights.