# Web App Design Direction — Comprehensive Guide

## 1. Executive Summary

Your web application should evoke the confident minimalism shared by Cluely and Clerk: a neutral canvas, one energetic accent, translucent utility overlays, and copy that speaks in rhythmic, human-centric bursts. Everything—colors, type, motion and compliance badges—should reinforce the promise of “powerful yet invisible” assistance.

---

## 2. Brand Personality & Voice

The product is a quietly brilliant side-kick: knowledgeable, lightning-fast, and never in the way. Its tone balances friendly vernacular (“Mid-Sentence answers”) with technical credibility (inline code tags). Copy should be:

- Succinct, often one-sentence hooks.
    
- Repetitive for drama (“Everything. Everything.”).
    
- Sprinkled with developer syntax to build trust.
    

---

## 3. Visual Identity

### 3.1 Color Strategy

Begin with two neutrals and one accent that work in both light and dark surfaces. The accent must pop on white and remain legible on near-black.

|Token|Role|Light|Dark|
|---|---|---|---|
|`--color-surface-0`|Primary canvas|`#FFFFFF`|`#0E0E10`|
|`--color-surface-1`|Alt sections/cards|`#F7F8F9`|`#18181B`|
|`--color-border`|Hairline dividers|`#E1E3E6`|`#2B2B30`|
|`--color-text-primary`|Core copy|`#15171A`|`#F1F2F5`|
|`--color-text-secondary`|Muted captions|`#555B65`|`#9CA3AF`|
|`--color-accent`|Brand hue|`#18A0FB`|`#18A0FB`|
|`--color-accent-contrast`|Text on accent|`#FFFFFF`|`#FFFFFF`|
|`--color-success`|Positive badge|`#12B76A`|`#12B76A`|
|`--color-warning`|Warning badge|`#F5A623`|`#F5A623`|
|`--color-danger`|Error badge|`#EF4040`|`#EF4040`|

**Guidelines:**

- Accent appears in CTAs, focus rings, charts and hover states only.
    
- Frosted-glass overlays = `--color-surface-0` at 20 % opacity with `backdrop-blur(8px)`.
    
- Maintain WCAG 2.1 contrast ≥4.5:1 for all text.
    

### 3.2 Typography

Adopt a **Major Third (1.25×)** modular scale. Pair a humanist sans (Inter, SF Pro) with a monospace (JetBrains Mono) for code snippets.

|Token|Desktop|Mobile|
|---|---|---|
|`--fs-display`|4.8 rem|3.2 rem|
|`--fs-hero`|3.2 rem|2.4 rem|
|`--fs-heading`|2.56 rem|2 rem|
|`--fs-subheading`|2.05 rem|1.6 rem|
|`--fs-body-lg`|1.6 rem|1.4 rem|
|`--fs-body`|1.28 rem|1.12 rem|
|`--fs-caption`|1 rem|0.9 rem|
|`--fs-code`|0.95 rem|0.85 rem|

Line-height: 1.35 (headings) / 1.6 (body).

---

## 4. Core Design Principles with Token Hooks

|Principle|Subpillars|UI Examples|Key Tokens|
|---|---|---|---|
|**Hero-First Storytelling**|Full-bleed hero, one-line value, dual CTA|Cluely & Clerk hero banners|`--fs-display`, `--color-accent`|
|**Bold, Repetitive Copy**|Single-word rhythm, line breaks|“Interviews. Interviews.”|`--fs-hero`, `--fs-heading`|
|**Component Show-and-Tell**|Grid/carousel screenshots, terse code labels|Clerk component gallery|`--color-surface-1`, `--color-border`, `--fs-code`|
|**Monochrome + Accent**|Neutral canvas, one vivid hue|Cyan/indigo CTAs|`--color-accent`, shadow 8/12 px|
|**Glass & Translucency**|20–40 % opacity, backdrop blur|Cluely Ask AI widget|`backdrop-blur(8px)`, glass token|
|**Motion as Context**|Scroll fades, ≤10 s loops|Autoplay demos|Accent hover pulse|
|**Developer Syntax Hints**|Inline JSX tags, monospace|headings|`--fs-code`, monospace font|
|**Trust Markers**|Compliance badges, customer logos|SOC 2 footer rows|`--color-success` etc.|

---

## 5. Layout & Grid

- **Grid:** 12-column, 72 px max column width, 24 px gutters desktop; collapse to 4-column, 16 px gutters mobile.
    
- **Spacing Scale:** 4, 8, 16, 24, 32, 48, 64, 96 px.
    
- **Section Rhythm:** Alternate `--color-surface-0` and `--color-surface-1` every major narrative chapter to keep scannability without visible dividers.
    

---

## 6. Iconography & Imagery

- Use simple, 1.5-stroke icons in `--color-text-primary`; accent only for active/on-state icons.
    
- Screenshots must sit on mock browser/device frames with 8 px radius and soft shadows (0 8 12 rgba(0,0,0,0.1)).
    
- Compliance badges: mono-line glyphs at 40 px height, grayscale unless hovered.
    

---

## 7. Motion & Interaction

- **Load:** Fade-up hero headline 300 ms; CTA slides from 4 px below.
    
- **Hover:** Accent outline pulses (opacity 0.2 → 0.4) over 150 ms.
    
- **Scroll:** 10 % viewport-in thresholds trigger component tiles to fade and scale 95 %→100 %.
    
- **Overlays:** Glass panels scale 98 %→100 % with subtle spring easing. Utility over flourish.
    

---

## 8. Component Guidelines

|Component|Rules|
|---|---|
|**CTA Buttons**|Filled accent; 12 px radius; shadow 0 4 8 rgba(0,0,0,0.08); text = `--color-accent-contrast`.|
|**Forms**|1 px solid `--color-border`; focus ring = 2 px `--color-accent` outside border.|
|**Hero Section**|Min 70 vh; headline left 60 %, supporting media right 40 %; below fold hint arrow pulses.|
|**Floating Widget**|320 × 200 px; glass token; draggable; hides on ESC.|
|**Trust Section**|Badge strip first, logo grid second, testimonial quotes last; surface toggles to `--color-surface-1`.|

---

## 9. Accessibility & Compliance

- All interactive elements reachable via keyboard; focus styles use `--color-accent`.
    
- Motion settings respect `prefers-reduced-motion`, switching animations to fades only.
    
- Content labels for screen readers on every compliance badge and logo.
    


Slow, bluesy jazz ballad with soulful female vocals. Emotional, intimate, and smoky atmosphere. Features piano, upright bass, soft drums, and expressive blues guitar. Lyrics about longing, heartache, or late-night reflection.