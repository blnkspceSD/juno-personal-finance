
# Juno Button Token Migration — Critical Review & Improvement Guide

This document reviews your summary and proposes concrete improvements so your **Button** matches modern design‑system practices (Material/Spectrum/Fluent style) and scales safely.

---

## Executive Summary

**Good progress:** you removed hardcoded values and unified styling around tokens.  
**But:** you’ve likely over‑tokenized mechanics, kept variant classes writing **properties** instead of **variables**, and created global changes (focus/outline) that may regress other components.

**Goal state:** Base button **consumes** a small public `--btn-*` variable API with semantic fallbacks. Variants/sizes **only set variables**. Keep mechanics literal. Provide robust focus, state, and a11y handling.

---

## Top Issues & Targeted Fixes

### 1) Variants still override properties (not variables)
**Why it matters:** Property overrides reintroduce specificity battles and make theming & instance overrides harder.

**Fix (pattern):**
```css
/* Base consumes variables */
:where(.btn){
  background: var(--btn-bg, var(--juno-color-bg-surface));
  color: var(--btn-fg, var(--juno-color-text));
  border: var(--btn-border-width, 1px) solid var(--btn-border, transparent);
  border-radius: var(--btn-radius, var(--juno-radius-lg));
  padding-block: var(--btn-pad-block, var(--juno-space-2));
  padding-inline: var(--btn-pad-inline, var(--juno-space-4));
  gap: var(--btn-gap, var(--juno-space-2));
  box-shadow: var(--btn-shadow, none);
  transform: var(--btn-transform, none);
  transition:
    background var(--juno-duration-fast) var(--juno-ease-out),
    color var(--juno-duration-fast) var(--juno-ease-out),
    border-color var(--juno-duration-fast) var(--juno-ease-out),
    box-shadow var(--juno-duration-fast) var(--juno-ease-out),
    transform var(--juno-duration-fast) var(--juno-ease-out);
}

/* Variants set only variables */
.btn--primary{
  --btn-bg: var(--juno-accent-600);
  --btn-fg: white;
  --btn-bg-hover: color-mix(in srgb, var(--juno-accent-600) 80%, white 20%);
}
```
> From here on, **no variant writes properties** like `background:` — only `--btn-bg`, etc.

---

### 2) Over‑tokenization: 25+ new tokens (layout/mechanics included)
**Why it matters:** Tokens like `--juno-button-display` / `--juno-button-align-items` are unlikely to vary per theme/instance; they bloat the API and create long‑term support burden.

**Action:** Keep mechanics **literal in base**. Reserve public tokens for visuals that actually vary:
- Surface & content: bg/fg
- Border/shape: border, border‑width, radius
- Spacing: pad‑inline/block, gap
- Motion/elevation: shadow, transition, transform (active)
- Focus ring

If you need internal fiddly knobs, prefix as private (undocumented) like `--_btn-stack`.

---

### 3) Tier leakage: component tokens in global token file
**Why it matters:** Mixing `--juno-button-*` into the global token file couples **system** to **component**, breaking the clean tiers.

**Action:**
- **Primitives/Semantics** stay in `juno-tokens.css`.
- **Component variables** (`--btn-*`) live next to the component (or generated under a `component` namespace if you publish DTCG).
- Defaults map to semantics: `--btn-bg: var(--juno-color-bg-surface)` etc.

---

### 4) Transition token uses `all`
**Why it matters:** `transition: all` is a perf and a11y footgun; surprise animations can occur and layout props can animate.

**Action:**
```css
:root { --transition-fast: var(--juno-duration-fast) var(--juno-ease-out); }
:where(.btn){
  transition:
    background var(--transition-fast),
    color var(--transition-fast),
    border-color var(--transition-fast),
    box-shadow var(--transition-fast),
    transform var(--transition-fast);
}
```

---

### 5) Focus ring changes may regress other components
**Why it matters:** Removing global outlines without providing per‑component replacements risks invisible focus on non‑button elements.

**Action:**
```css
/* Safe baseline for the whole app */
:focus-visible { outline: 2px solid CanvasText; outline-offset: 2px; }

/* Button upgrades its own focus appearance */
:where(.btn):focus-visible{
  outline: none;
  box-shadow: var(--btn-shadow, none), var(--btn-focus-ring, 0 0 0 3px rgb(59 130 246 / .35));
}
```
Also add `@media (prefers-contrast: more)` tweaks if available.

---

### 6) “100% token consistency” ≠ “good API”
**Why it matters:** A token for every CSS property creates churn and confusion.

**Action:** Enforce an **API budget** (≈10–12 public button tokens). Deprecate layout/mechanics tokens before they spread.

---

### 7) Missing state and accessibility hooks
**Why it matters:** Disabled/loading/high‑contrast/reduced‑motion states are part of “best practice”.

**Action:**
```css
/* Disabled */
.btn[disabled], .btn[aria-disabled="true"]{
  --btn-bg: var(--btn-bg-disabled, var(--juno-color-bg-surface-disabled));
  --btn-fg: var(--btn-fg-disabled, var(--juno-color-text-disabled));
  pointer-events: none;
  opacity: var(--btn-opacity-disabled, .6);
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce){
  .btn{ transition: none; transform: none; }
}
```

---

## Recommended Public Button Token API (tight & useful)

Keep it learnable and stable (≈12 tokens).

- **Surface & content:** `--btn-bg`, `--btn-fg`
- **Border/shape:** `--btn-border`, `--btn-border-width`, `--btn-radius`
- **Spacing:** `--btn-pad-inline`, `--btn-pad-block`, `--btn-gap`
- **Elevation & motion:** `--btn-shadow`, `--btn-transition`, `--btn-transform`
- **Focus:** `--btn-focus-ring`
- *(Optional state)*: `--btn-bg-hover`, `--btn-bg-active`

Everything else stays literal in base.

---

## Concrete Migration Steps (Minimal Diff, Maximum Win)

1. **Refactor base** to *only consume* `--btn-*` variables with semantic fallbacks.  
2. **Change every variant/size** to set only `--btn-*` variables (no property writes).  
3. **Trim the token list**: remove or privatize layout/mechanics tokens.  
4. **Restore safe global focus**; override focus only inside `.btn`.  
5. **Add states**: disabled, loading (aria-busy), high-contrast, reduced motion.  
6. **Document the API**: list the ~12 tokens with defaults and show how variants map to them.  
7. **Test** via Storybook matrix (variants × sizes × states) in **light/dark/high‑contrast** + keyboard‑only flow; add basic visual regression.

---

## Example: Final Shape

```css
/* Base */
@layer components{
  :where(.btn){
    display:flex; align-items:center; justify-content:center; /* literals */
    background: var(--btn-bg, var(--juno-color-bg-surface));
    color: var(--btn-fg, var(--juno-color-text));
    border: var(--btn-border-width, 1px) solid var(--btn-border, transparent);
    border-radius: var(--btn-radius, var(--juno-radius-lg));
    padding-block: var(--btn-pad-block, var(--juno-space-2));
    padding-inline: var(--btn-pad-inline, var(--juno-space-4));
    gap: var(--btn-gap, var(--juno-space-2));
    box-shadow: var(--btn-shadow, none);
    transform: var(--btn-transform, none);
    transition:
      background var(--juno-duration-fast) var(--juno-ease-out),
      color var(--juno-duration-fast) var(--juno-ease-out),
      border-color var(--juno-duration-fast) var(--juno-ease-out),
      box-shadow var(--juno-duration-fast) var(--juno-ease-out),
      transform var(--juno-duration-fast) var(--juno-ease-out);
  }
  .btn:focus-visible{
    outline:none;
    box-shadow: var(--btn-shadow, none), var(--btn-focus-ring, 0 0 0 3px rgb(59 130 246 / .35));
  }
}

/* Presets */
@layer utilities{
  .btn--primary{
    --btn-bg: var(--juno-accent-600);
    --btn-fg: white;
    --btn-bg-hover: color-mix(in srgb, var(--juno-accent-600) 80%, white 20%);
  }
  .btn--secondary{
    --btn-bg: var(--juno-color-bg-surface-secondary);
    --btn-fg: var(--juno-color-text);
  }
  .btn--outline{
    --btn-bg: transparent;
    --btn-border: var(--juno-color-border);
  }
  .btn--sm{
    --btn-pad-block: var(--juno-space-1);
    --btn-pad-inline: var(--juno-space-3);
    --btn-radius: var(--juno-radius-md);
  }
  .btn--lg{
    --btn-pad-block: var(--juno-space-3);
    --btn-pad-inline: var(--juno-space-5);
    --btn-radius: var(--juno-radius-xl);
  }
}

/* States */
.btn:active{ --btn-transform: translateY(1px); }
.btn[disabled], .btn[aria-disabled="true"]{ pointer-events:none; opacity:.6; }
```

---

## Final Verdict

You’re **very close**. Trim the token surface, move variants to **variable-only** presets, restore a safe global focus baseline, and add state/a11y hooks. That puts Juno’s Button on par with mature systems — themeable, predictable, and easy to extend.

> Want me to convert your current `btn` base + two variants to this pattern with your exact `--juno-*` names? Share the snippet and I’ll return a paste‑ready diff.
