
# PR Template — Juno Button Cleanup

## Summary
Converge on a single, variable-only button system. Remove legacy property-based styles, slim down tokens, and enforce API best practices.

---

## Changes in this PR
- [ ] Remove duplicate `.btn--secondary` legacy block
- [ ] Move legacy property-based rules to `@layer legacy` (if not already deleted)
- [ ] Migrate remaining variants (destructive / success / warning / outline) to **variable-only presets**
- [ ] Delete 87 unused/legacy tokens (mechanics + `--juno-btn-height*`)
- [ ] Shrink public API to ~12 tokens (surface, border, spacing, motion, focus)

---

## Acceptance Checklist
- [ ] **No property writes** inside `.btn--*` selectors (all presets set only variables)
- [ ] ≤ 15 public button tokens remain
- [ ] Duplicate `.btn--secondary` removed
- [ ] Legacy compatibility tokens (`--juno-btn-height*`) deleted
- [ ] Storybook matrix passes (variants × sizes × states) in light/dark/high-contrast
- [ ] Stylelint/CI guards prevent regression (`transition: all` banned, presets property writes banned)

---

## Diffs / Examples

### Secondary (delete legacy, keep variable-only)
```diff
- .btn--secondary {
-   display: var(--juno-button-display);
-   background: var(--juno-button-secondary-bg);
-   color: var(--juno-button-secondary-text);
-   /* ... */
- }
+ .btn--secondary {
+   --btn-bg: var(--juno-button-bg-secondary);
+   --btn-fg: var(--juno-button-text-secondary);
+ }
```

### Destructive (migrated to variables)
```css
.btn--destructive {
  --btn-bg: var(--juno-critical-600);
  --btn-fg: var(--juno-color-text-on-critical, white);
  --btn-bg-hover: color-mix(in srgb, var(--juno-critical-600) 85%, white 15%);
}
```

### Sizes (logical spacing, RTL-safe)
```css
.btn--sm { --btn-pad-block: var(--juno-space-1); --btn-pad-inline: var(--juno-space-3); --btn-radius: var(--juno-radius-md); }
.btn--lg { --btn-pad-block: var(--juno-space-3); --btn-pad-inline: var(--juno-space-5); --btn-radius: var(--juno-radius-xl); }
```

---

## Notes
- Ensure legacy tokens are fully deleted before merge.
- Update design system docs to list the final ~12 button tokens.
- Communicate sunset date for legacy layer to all consumers.

---

## QA / Verification
- [ ] Tab focus shows visible ring on every button variant
- [ ] Inline overrides (`style="--btn-bg: …"`) work on any button
- [ ] Reduced motion disables transforms/animations
- [ ] Regression tests pass across light/dark/high-contrast
