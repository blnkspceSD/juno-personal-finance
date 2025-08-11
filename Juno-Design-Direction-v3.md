# Juno — Design Direction (v3)

_Last updated: today_

## 1) Executive summary
Juno is a **calm money coach**: premium look, approachable voice, and educational by default. We design for **Malaysia first** while staying globally legible. Marketing and product share one **unified accent** and the same **text color** for clarity. Copy is short, specific, and never shaming.

**Non‑negotiables**
- **Educational first**: every key number can explain itself in one tap.
- **Unified brand color** across marketing and product.
- **Clarity over cleverness**: no repetition gimmicks; no developer‑syntax flourishes in user‑facing copy.

---

# Who Juno should focus on (Malaysia-first, globally legible)

## Primary audience (start here)

**Urban salaried Malaysians (21–35) living paycheck-to-paycheck, BNPL/credit active.**
They hate “money stress,” want simple guardrails, and don’t self-identify as “finance people.”

**Jobs-to-be-done**

* “Help me plan each paycheck so I don’t run dry before month-end.”
* “Warn me about BNPL/auto-debits before they hit.”
* “Show me one next best step, not a lecture.”

**Success metric for them**: end each month with a small surplus (RM100–RM300) and zero surprise charges.

## Secondary audiences (sequence after PMF)

1. **Young households (28–45)** managing rent, groceries, childcare; want shared visibility and bill planning.
2. **Irregular earners (22–40)**—riders, freelancers, side-hustlers; need variable-income envelopes that flex per payout.

## Anti-persona (don’t optimize for Day 1)

Spreadsheet power users / crypto degens who want infinite knobs. They’ll come later if the core feels premium and calm.

## Positioning (working line)

**“A calm money coach for Malaysians—plan by paycheck, tame BNPL, and finish the month ahead.”**
Clear, educational, no hype.

---

# Voice & tone (educational first, approachable—not chummy)

You asked to **remove the repetition device**—done. Also nix the “developer syntax” flourish in user-facing copy; keep it for docs if at all.

**Pillars**

* **Clear**: short sentences, plain words, RM-first examples.
* **Measured**: no hype, numbers over adjectives.
* **Empowering**: always suggest a next step.
* **Respectful**: no shame, ever.

**Style rules**

* Reading level: ~Year 8–10.
* Prefer verbs over nouns: “Move RM120” > “Reallocation.”
* Always show *why*: tap “i” to reveal a 1–2-line explainer.

**Microcopy examples**

* **Dashboard:** “Available to spend this week: RM230.” / “Restaurants is over by RM85. Move RM85 or adjust next week’s plan.”
* **Onboarding:** “We’ll start with 3 envelopes: Food, Transport, Bills. Add more anytime.”
* **Malay variants (lite):** “Baki untuk minggu ini: RM230.” / “Kategori Makan terlebih RM85. Pindahkan RM85 atau sesuaikan pelan minggu depan.”

---

## 2) Color system

### 2.1 Unified accent (marketing **and** product)
Use the **same accent and text** app‑wide:

- **Background / Fills / Primary CTA**: `#85D6FF`  
- **Text on accent & global text**: `#212730`

### 2.2 Accent ramp (tokens)
Darker → lighter (for charts, subtle states, rare tints). The interface can stay strictly on the two core values; this ramp is provided for flexibility where needed.

- `accent-900` – `#1D3F50`
- `accent-800` – `#2A576D`
- `accent-700` – `#396F8A`
- `accent-600` – `#4A88A8`
- `accent-500` – `#5CA2C5`
- `accent-400` – `#70BCE2`
- `accent-300` – `#85D6FF`
- `accent-200` – `#AAE2FF`
- `accent-100` – `#CEEFFF`
- `accent-50` – `#F3FBFF`

### 2.3 Neutrals (tokens)
Provided set, dark → light:

- `#141019`
- `#17141F`
- `#191824`
- `#1D1F2A`
- `#212730`
- `#3E464C`
- `#5C6568`
- `#798383`
- `#979F9E`
- `#B5BAB9`
- `#D2D6D4`

> Mapping suggestion: assign top‑to‑bottom to `neutral-950 … neutral-50`.

### 2.4 White neutrals (for light surfaces)
Inspired by Cluely/Clerk’s cool off‑whites; replace with official hexes if provided.

- `whiteNeutral-50` – `#FFFFFF`
- `whiteNeutral-100` – `#FCFEFF`
- `whiteNeutral-200` – `#F7FAFF`
- `whiteNeutral-300` – `#F3F7FE`
- `whiteNeutral-400` – `#EEF3FB`
- `whiteNeutral-500` – `#EAF0F8`

### 2.5 Usage rules
- **Coverage cap**: accent should occupy **<5%** of any in‑app screen to keep it premium.
- **CTAs**: `background: #85D6FF; color: #212730;` hover +5% brightness; pressed −5%.
- **Links**: `#212730`; underline on hover (no extra colors).
- **Focus rings**: 2px outline `rgba(33,39,48,0.70)`; visible on all surfaces.
- **Pills/selection**: `rgba(33,39,48,0.10)` fill; `#212730` text at ~88%.
- **Dividers/borders**: `rgba(33,39,48,0.16)`; **Shadows**: `rgba(33,39,48,0.12)`.

**Data‑viz**
- Accent marks the **current** series/bar only; history uses `#212730` at 35–60% opacity.
- Reserve greens/amber/reds for semantic states (define separately).

---

## 3) Components spec (content + style)
**Buttons**
- Primary: `background: #85D6FF; color: #212730;`  
- Secondary: outline `1px #212730` on `#85D6FF` (keeps palette tight).  
- Disabled: 40% opacity, keep layout stable.

**Forms**
- Inputs: `background: #85D6FF`, `border: 1px solid #212730`, text `#212730`; focus: 2px outline.
- Helper text: `rgba(33,39,48,0.72)`.

**Cards & panels**
- Panel/background: `#85D6FF` with 1px `rgba(33,39,48,0.16)` border; soft shadow `rgba(33,39,48,0.12)`.

**Charts**
- Current month/series: `#212730` (100%).  
- Prior months/series: `#212730` at 60% → 35% opacity.

---

## 4) Teach‑while‑doing UX
- **Explain‑on‑tap** chips next to computed numbers (“How we calculated this”).  
- **Scenario sliders**: adjusting a category updates “Available” live.  
- **First‑7‑days coach**: one actionable nudge per day (one sentence).  
- **Teach mode toggle**: extra hints visible when ON; off for power users.

---

## 5) Tokens (CSS quick start)
```css
:root {
  /* Exact brand */
  --bg: #85D6FF;
  --text: #212730;
  --accent-fill: #85D6FF;
  --on-accent: #212730;

  /* Accent ramp */
  --accent-900: #1D3F50;
  --accent-800: #2A576D;
  --accent-700: #396F8A;
  --accent-600: #4A88A8;
  --accent-500: #5CA2C5;
  --accent-400: #70BCE2;
  --accent-300: #85D6FF;
  --accent-200: #AAE2FF;
  --accent-100: #CEEFFF;
  --accent-50: #F3FBFF;

  /* Derived neutrals using brand text with alpha */
  --border: rgba(33,39,48,0.16);
  --muted-fg: rgba(33,39,48,0.72);
  --pill-fg: rgba(33,39,48,0.88);
  --shadow: rgba(33,39,48,0.12);
}
```

See also:
- **Design tokens JSON** → `juno-tokens.json`  
- **Tailwind colors** → `tailwind.config.juno.js`  
- **CSS variables** → `juno-tokens.css`
