
# Juno Button System Cleanup Playbook
*(Based on your Token Redundancy Audit)*

This playbook turns your audit into precise, actionable steps to converge on a **single, variable-only button system** with a small, stable API.

---

## 0) Principles to lock in
- **Base consumes → presets set only variables.** No property writes inside `.btn--*` ever.
- **Small public API:** 12–15 tokens max per component.
- **One source of truth:** legacy rules live in a quarantined layer until deletion.

---

## 1) Hotfix today (stop the bleeding)
**Goal:** ensure the *new* variable system wins immediately while migration happens.

1. **Quarantine legacy in its own layer**
   ```css
   @layer legacy {
     /* Move the entire old property-based block (lines ~991–1500+) here */
   }
   ```
   Load order should be: `@layer legacy` → `@layer components` (base) → `@layer utilities` (presets). If you can’t alter order, temporarily **comment out** the duplicate rules that conflict.

2. **Neutralize duplicate `.btn--secondary`**
   - Delete the legacy `.btn--secondary` block **or** temporarily rename it to `.btn--secondary-legacy` so it can’t override the new preset.

---

## 2) Migration plan (3 small PRs)

### PR1 — Contain & Map
- **Move** all old property-based button CSS into `@layer legacy`.
- **Add a mapping table** (as a comment at the top of `legacy`) from old tokens → new component vars:
  ```css
  /* Legacy → New mapping (reference only; do not use in new code)
     --juno-button-secondary-bg       → --btn-bg
     --juno-button-secondary-text     → --btn-fg
     --juno-button-radius             → --btn-radius
     --juno-button-border             → --btn-border
     --juno-button-shadow             → --btn-shadow
     ...keep this short (<15 items)...
  */
  ```

### PR2 — Migrate remaining variants
Refactor **destructive / success / warning / outline** to **variable-only presets** (no property writes):
```css
@layer utilities {
  .btn--destructive {
    --btn-bg: var(--juno-critical-600);
    --btn-fg: var(--juno-color-text-on-critical, white);
    --btn-bg-hover: color-mix(in srgb, var(--juno-critical-600) 85%, white 15%);
  }
  .btn--success { --btn-bg: var(--juno-success-600); --btn-fg: white; }
  .btn--warning { --btn-bg: var(--juno-warning-600); --btn-fg: black; }
  .btn--outline { --btn-bg: transparent; --btn-border: var(--juno-color-border); }
}
```

### PR3 — Delete legacy
- **Remove** the entire legacy layer, the 87 unused tokens, and the “compat” tokens (e.g., `--juno-btn-height*`).
- **Shrink the public API** to the list below.

---

## 3) Canonical Button Token API (final, public, ~12)
Keep exactly these override points; everything else stays literal in base.

- **Surface & content:** `--btn-bg`, `--btn-fg`
- **Border/shape:** `--btn-border`, `--btn-border-width`, `--btn-radius`
- **Spacing:** `--btn-pad-inline`, `--btn-pad-block`, `--btn-gap`
- **Motion & elevation:** `--btn-shadow`, `--btn-transition`, `--btn-transform`
- **Focus:** `--btn-focus-ring`
- *(Optional state)*: `--btn-bg-hover`, `--btn-bg-active`

**Base consumes them**:
```css
@layer components {
  :where(.btn){
    /* Mechanics kept literal (don’t tokenize unless truly needed) */
    display:flex; align-items:center; justify-content:center;

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
```

**Presets set only variables**:
```css
@layer utilities {
  .btn--primary   { --btn-bg: var(--juno-accent-600); --btn-fg: white; }
  .btn--secondary { --btn-bg: var(--juno-button-bg-secondary); --btn-fg: var(--juno-button-text-secondary); }
  .btn--ghost     { --btn-bg: transparent; --btn-border: transparent; }
  .btn--outline   { --btn-bg: transparent; --btn-border: var(--juno-color-border); }

  /* Sizes (logical props → RTL safe) */
  .btn--sm { --btn-pad-block: var(--juno-space-1); --btn-pad-inline: var(--juno-space-3); --btn-radius: var(--juno-radius-md); }
  .btn--md { --btn-pad-block: var(--juno-space-2); --btn-pad-inline: var(--juno-space-4); --btn-radius: var(--juno-radius-lg); }
  .btn--lg { --btn-pad-block: var(--juno-space-3); --btn-pad-inline: var(--juno-space-5); --btn-radius: var(--juno-radius-xl); }

  /* States via vars */
  .btn:active { --btn-transform: translateY(1px); }
}
```

---

## 4) Concrete diffs for your audit items

### A) Duplicate `.btn--secondary` (critical)
**Delete** the legacy block:
```diff
- /* legacy property-based .btn--secondary ... lines 991–1050 */
- .btn--secondary {
-   display: var(--juno-button-display);
-   background: var(--juno-button-secondary-bg);
-   color: var(--juno-button-secondary-text);
-   /* ... */
- }
+ /* New variable-only preset remains; no property writes */
+ .btn--secondary {
+   --btn-bg: var(--juno-button-bg-secondary);
+   --btn-fg: var(--juno-button-text-secondary);
+ }
```

### B) Token bloat (87 unused)
**Keep:** only tokens that back the ~12 public vars (map semantics → component).  
**Remove:** mechanics (`--juno-button-display`, `--juno-button-align-items`, etc.), duplicative sizes (`--juno-btn-height*`), unused color aliases.

**Quick inventory helpers**
```bash
# List all juno button tokens
rg --no-heading -n --trim '--juno-button-[a-z0-9-]+' src | sort -u

# Where are they used?
rg --no-heading -n --trim '(--juno-button-[a-z0-9-]+)\b' src | awk '{print $3}' | sort | uniq -c | sort -n
```
Anything **defined but never referenced** outside tokens is a delete candidate.

### C) Migrate remaining variants
Use the variable-only pattern above for **destructive / success / warning / outline**.

### D) Remove legacy compatibility tokens
Delete `--juno-btn-height*` and point sizes to logical spacing tokens (see **Sizes** presets).

---

## 5) Quality gates (to prevent backslide)

### Stylelint (or ESLint-style) rules
- **Disallow property writes** inside `.btn--*` selectors
  - Forbidden: `background:`, `color:`, `border*:` within `/\.btn--[a-z-]+/`
- **Disallow** `transition: all`
- **Require** var fallbacks in base (`background: var(--btn-bg, …)`)

### CI checks
- **grep/rg** step fails if any `.btn--*` contains forbidden properties.
- **Bundle-size watch** for `@layer legacy` to go to **0** before the cleanup milestone.

---

## 6) Storybook & tests (fast confidence)
**Stories** matrix:
- Variants: primary / secondary / ghost / outline / success / warning / destructive
- Sizes: sm / md / lg
- States: default / hover / active / focus-visible / disabled / loading
- Themes: light / dark / high-contrast

**Playwright smoke tests:**
- Tab focus shows a visible ring on every story.
- Inline override works (`style="--btn-bg: …"` changes background).
- Reduced motion disables transform/animations when `prefers-reduced-motion` is on.

---

## 7) Documentation (one concise page)
- **Public Button API** list (the ~12 vars + defaults).
- **Do/Don’t:** “Don’t write properties in variants; set variables instead.”
- **Legacy mapping** (minimal table) for teams mid-migration.
- **Sunset date** for legacy layer.

---

## 8) Acceptance checklist (merge when all ✓)
- [ ] Duplicate `.btn--secondary` removed; only variable preset remains  
- [ ] **Zero** property writes in any `.btn--*` selector  
- [ ] ≤ 15 public button tokens after cleanup  
- [ ] Legacy tokens deleted (87 → 0)  
- [ ] Storybook matrix passes in light/dark/HC  
- [ ] Stylelint & CI guards in place

---

### Bonus: quick “why” to share with the team
- Variable-only presets **eliminate specificity fights**.
- Small API makes theming and maintenance **predictable**.
- Legacy quarantine + CI rules **prevent regression**.

*Ping me with your legacy `secondary / outline / destructive` blocks, and I’ll return exact variable-only presets matching your `--juno-*` names.*
