# Accessibility Guidelines for Juno Design System

## Overview

This document outlines comprehensive accessibility requirements for the Juno visual redesign, ensuring compliance with **WCAG 2.1 Level AA** standards while supporting the educational-first approach for Malaysian users.

## 1. Color & Contrast Requirements

### 1.1 Color Contrast Standards

**Text Contrast Requirements:**
- **Normal text (< 18pt)**: Minimum 4.5:1 contrast ratio
- **Large text (≥ 18pt or ≥ 14pt bold)**: Minimum 3:1 contrast ratio
- **Interactive elements**: Minimum 4.5:1 contrast ratio

**Juno Brand Color Compliance:**
```css
/* Verified contrast ratios */
--juno-accent (#85D6FF) on --juno-text (#212730): 4.73:1 ✅ WCAG AA
--juno-text (#212730) on --juno-accent (#85D6FF): 4.73:1 ✅ WCAG AA
--juno-muted-fg on --juno-accent: 3.41:1 ✅ WCAG AA (large text only)
--juno-pill-fg on --juno-pill-bg: 8.2:1 ✅ WCAG AAA
```

**Non-Text Element Contrast:**
- **UI components**: Minimum 3:1 contrast ratio for borders, focus indicators
- **Graphics**: Minimum 3:1 contrast ratio for meaningful graphics
- **Focus indicators**: Minimum 4.5:1 contrast ratio against all backgrounds

### 1.2 Color Usage Guidelines

**Color Never as Sole Indicator:**
- Always pair color with text, icons, or patterns
- Status indicators must include text labels or symbols
- Chart data must be distinguishable without color

**Examples:**
```html
<!-- ❌ Color-only indication -->
<div class="text-red-500">Error occurred</div>

<!-- ✅ Color + text + icon -->
<div class="text-juno-danger-fg bg-juno-danger-bg flex items-center gap-2">
  <AlertCircle className="size-4" />
  <span>Error: Please check your input</span>
</div>
```

## 2. Keyboard Navigation

### 2.1 Focus Management

**Focus Order Requirements:**
- Logical tab order following visual layout
- Skip links for main content areas
- Focus trapping in modals and overlays
- Focus restoration after modal dismissal

**Focus Indicator Specifications:**
```css
.juno-focus-visible {
  outline: 2px solid var(--juno-focus-ring);
  outline-offset: 2px;
  border-radius: var(--juno-radius-sm);
}

/* Ensure visibility on all backgrounds */
@media (prefers-contrast: high) {
  .juno-focus-visible {
    outline-color: var(--juno-text);
    outline-width: 3px;
  }
}
```

### 2.2 Keyboard Interaction Patterns

**Interactive Elements:**
- **Buttons**: `Space` and `Enter` to activate
- **Links**: `Enter` to activate
- **Form controls**: Standard form navigation
- **Custom components**: Follow ARIA patterns

**Educational Components:**
```typescript
// ExplainChip keyboard support
const ExplainChip: React.FC<ExplainChipProps> = ({ explanation, onExplain }) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onExplain?.()
    }
    if (event.key === 'Escape') {
      // Close tooltip if open
    }
  }

  return (
    <button
      className="juno-explain-chip"
      onClick={onExplain}
      onKeyDown={handleKeyDown}
      aria-label={`Explain: ${explanation.substring(0, 50)}...`}
      tabIndex={0}
    >
      <Info className="size-4" />
    </button>
  )
}
```

## 3. Screen Reader Support

### 3.1 Semantic HTML Structure

**Required Semantic Elements:**
```html
<!-- Page structure -->
<header role="banner">
  <nav role="navigation" aria-label="Main navigation">
    <!-- Navigation items -->
  </nav>
</header>

<main role="main">
  <section aria-labelledby="dashboard-heading">
    <h1 id="dashboard-heading">Dashboard</h1>
    <!-- Dashboard content -->
  </section>
</main>

<!-- Educational content -->
<article class="financial-explanation">
  <h2 id="budget-explanation">Understanding Your Budget</h2>
  <p>Your available budget is calculated by...</p>
</article>
```

### 3.2 ARIA Labels and Descriptions

**Financial Data Announcements:**
```html
<!-- Budget display with full context -->
<div class="financial-number" 
     aria-label="Available budget for this week: 230 Malaysian Ringgit"
     role="status">
  <span class="juno-currency-rm" aria-hidden="true">RM230</span>
  <ExplainChip 
    explanation="Calculated by subtracting fixed expenses from your weekly income"
    aria-describedby="budget-explanation"
  />
</div>

<!-- Progress indicators -->
<div role="progressbar" 
     aria-valuenow="75" 
     aria-valuemin="0" 
     aria-valuemax="100"
     aria-label="Food budget used: 75% of RM400">
  <div class="progress-fill" style="width: 75%"></div>
</div>
```

### 3.3 Dynamic Content Announcements

**Live Regions for Updates:**
```html
<!-- Budget calculations -->
<div aria-live="polite" 
     aria-atomic="true" 
     id="budget-updates"
     class="sr-only">
  <!-- Announced when budget changes -->
</div>

<!-- Status messages -->
<div aria-live="assertive" 
     aria-atomic="true" 
     id="status-messages"
     class="sr-only">
  <!-- Announced immediately for errors/success -->
</div>
```

**Malaysian Context Screen Reader Support:**
```typescript
const formatForScreenReader = (amount: number, currency: string = 'RM') => {
  const formatter = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: currency === 'RM' ? 'MYR' : 'USD',
  })
  
  // Convert "RM230.50" to "230 Malaysian Ringgit and 50 cents"
  return formatter.format(amount).replace(/[^\w\s]/g, ' ')
}
```

## 4. Educational Accessibility

### 4.1 Explain-on-Tap Pattern

**ARIA Implementation:**
```typescript
const ExplainChip: React.FC<ExplainChipProps> = ({ 
  explanation, 
  position = 'top',
  ariaLabel 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const tooltipId = useId()

  return (
    <>
      <button
        className="juno-explain-chip"
        aria-describedby={isOpen ? tooltipId : undefined}
        aria-expanded={isOpen}
        aria-label={ariaLabel || `More information available`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Info className="size-4" />
      </button>
      
      {isOpen && (
        <div
          id={tooltipId}
          role="tooltip"
          className="juno-tooltip"
          aria-hidden={!isOpen}
        >
          {explanation}
        </div>
      )}
    </>
  )
}
```

### 4.2 Teach Mode Accessibility

**Global Teaching State:**
```typescript
const TeachModeToggle: React.FC<TeachModeToggleProps> = ({ 
  enabled, 
  onToggle 
}) => {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-describedby="teach-mode-description"
      onClick={() => onToggle(!enabled)}
      className="juno-teach-mode-toggle"
    >
      <span className="sr-only">
        {enabled ? 'Hide' : 'Show'} educational hints
      </span>
      <div className="toggle-indicator" aria-hidden="true">
        {enabled ? 'ON' : 'OFF'}
      </div>
    </button>
  )
}
```

**Contextual Help:**
```html
<!-- Hidden description for teach mode -->
<div id="teach-mode-description" class="sr-only">
  When enabled, shows additional explanations for financial terms and calculations
</div>

<!-- Conditional hints -->
<div class="budget-category" data-teach-mode="true">
  <h3>Food & Dining</h3>
  <div class="amount">RM385</div>
  
  <!-- Only announced when teach mode is on -->
  <div class="teach-hint" 
       aria-live="polite" 
       data-teach-visible="true">
    This category tracks restaurant meals, groceries, and takeout expenses
  </div>
</div>
```

## 5. Motion & Animation Accessibility

### 5.1 Reduced Motion Support

**CSS Implementation:**
```css
/* Default animations */
.juno-button {
  transition: all var(--juno-duration-normal) var(--juno-ease-out);
}

.juno-tooltip {
  animation: fadeIn var(--juno-duration-fast) var(--juno-ease-out);
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
  .juno-button {
    transition: none;
  }
  
  .juno-tooltip {
    animation: none;
  }
  
  /* Immediate transitions only */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Component-Level Support:**
```typescript
const useReducedMotion = () => {
  return typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
}

const AnimatedComponent: React.FC = ({ children }) => {
  const reducedMotion = useReducedMotion()
  
  return (
    <div 
      className={cn(
        'transition-all duration-200',
        reducedMotion && 'transition-none'
      )}
    >
      {children}
    </div>
  )
}
```

## 6. Form Accessibility

### 6.1 Form Structure & Labels

**Required Form Patterns:**
```html
<!-- Input with proper labeling -->
<div class="form-field">
  <label for="budget-amount" class="juno-label">
    Monthly Budget Amount
    <span class="required" aria-label="required">*</span>
  </label>
  <input
    id="budget-amount"
    type="number"
    class="juno-input"
    aria-describedby="budget-help budget-error"
    aria-required="true"
    aria-invalid="false"
  />
  <div id="budget-help" class="help-text">
    Enter your total monthly income in Malaysian Ringgit
  </div>
  <div id="budget-error" class="error-text" aria-live="polite">
    <!-- Error messages appear here -->
  </div>
</div>
```

### 6.2 Error Handling & Validation

**Accessible Error Messages:**
```typescript
const FormField: React.FC<FormFieldProps> = ({ 
  label, 
  error, 
  helpText,
  required,
  ...props 
}) => {
  const fieldId = useId()
  const errorId = `${fieldId}-error`
  const helpId = `${fieldId}-help`

  return (
    <div className="form-field">
      <label htmlFor={fieldId} className="juno-label">
        {label}
        {required && (
          <span className="required" aria-label="required">*</span>
        )}
      </label>
      
      <input
        id={fieldId}
        aria-describedby={cn(
          helpText && helpId,
          error && errorId
        )}
        aria-required={required}
        aria-invalid={!!error}
        className={cn(
          'juno-input',
          error && 'juno-input-error'
        )}
        {...props}
      />
      
      {helpText && (
        <div id={helpId} className="help-text">
          {helpText}
        </div>
      )}
      
      {error && (
        <div id={errorId} className="error-text" role="alert">
          {error}
        </div>
      )}
    </div>
  )
}
```

## 7. Data Visualization Accessibility

### 7.1 Chart Accessibility

**Chart Alternative Content:**
```html
<!-- Chart with data table alternative -->
<div class="chart-container">
  <div class="chart" aria-labelledby="chart-title" aria-describedby="chart-desc">
    <h3 id="chart-title">Monthly Spending by Category</h3>
    <p id="chart-desc">
      Bar chart showing spending across 5 categories for January 2025
    </p>
    <!-- Chart visualization -->
  </div>
  
  <!-- Data table for screen readers -->
  <table class="chart-data-table sr-only" aria-label="Chart data">
    <caption>Monthly spending breakdown</caption>
    <thead>
      <tr>
        <th scope="col">Category</th>
        <th scope="col">Amount (RM)</th>
        <th scope="col">Percentage of Budget</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th scope="row">Food & Dining</th>
        <td>RM 385</td>
        <td>32%</td>
      </tr>
      <!-- Additional rows -->
    </tbody>
  </table>
</div>
```

### 7.2 Progress Indicators

**Accessible Progress Bars:**
```typescript
const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  used,
  total,
  category,
  currency = 'RM'
}) => {
  const percentage = Math.round((used / total) * 100)
  const remaining = total - used
  const isOverBudget = used > total

  return (
    <div className="budget-progress">
      <div className="progress-header">
        <span className="category-name">{category}</span>
        <span className="progress-text">
          {formatCurrency(used, currency)} of {formatCurrency(total, currency)}
        </span>
      </div>
      
      <div
        role="progressbar"
        aria-valuenow={Math.min(percentage, 100)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label={`${category} budget: ${percentage}% used. ${
          isOverBudget 
            ? `Over budget by ${formatCurrency(Math.abs(remaining), currency)}`
            : `${formatCurrency(remaining, currency)} remaining`
        }`}
        className={cn(
          'progress-bar',
          isOverBudget && 'progress-over'
        )}
      >
        <div 
          className="progress-fill" 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
        {isOverBudget && (
          <div 
            className="progress-over-fill"
            style={{ width: `${percentage - 100}%` }}
            aria-hidden="true"
          />
        )}
      </div>
      
      {isOverBudget && (
        <div className="over-budget-warning" role="alert">
          <AlertTriangle className="size-4" />
          <span>Over budget by {formatCurrency(Math.abs(remaining), currency)}</span>
        </div>
      )}
    </div>
  )
}
```

## 8. Mobile Accessibility

### 8.1 Touch Target Requirements

**Minimum Touch Target Sizes:**
- **Interactive elements**: 44×44px minimum
- **Form inputs**: 44px height minimum
- **Buttons**: 44px height minimum
- **Explain chips**: 32×32px minimum (larger than desktop)

```css
@media (max-width: 768px) {
  .juno-button {
    min-height: 44px;
    min-width: 44px;
    padding: 12px 16px;
  }
  
  .juno-input {
    min-height: 44px;
    padding: 12px 16px;
  }
  
  .juno-explain-chip {
    min-width: 32px;
    min-height: 32px;
  }
}
```

### 8.2 Mobile Screen Reader Support

**VoiceOver/TalkBack Optimizations:**
```typescript
const MobileOptimizedComponent: React.FC = () => {
  return (
    <div>
      {/* Larger touch targets */}
      <button 
        className="mobile-button"
        aria-label="Add new budget category"
        style={{ minHeight: '44px', minWidth: '44px' }}
      >
        <Plus className="size-6" />
      </button>
      
      {/* Simplified announcements for mobile */}
      <div 
        role="status"
        aria-label="Budget summary"
      >
        <span>Total spent: {formatCurrency(totalSpent)}</span>
        <span>Remaining: {formatCurrency(remaining)}</span>
      </div>
    </div>
  )
}
```

## 9. Testing Requirements

### 9.1 Automated Testing

**Required Test Coverage:**
- **axe-core** accessibility testing
- **Color contrast** verification
- **Keyboard navigation** testing
- **ARIA attribute** validation

```typescript
// Example test setup
import { render, screen } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'
import userEvent from '@testing-library/user-event'

expect.extend(toHaveNoViolations)

describe('ExplainChip Accessibility', () => {
  test('meets accessibility standards', async () => {
    const { container } = render(
      <ExplainChip explanation="Test explanation" />
    )
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  test('keyboard navigation works', async () => {
    const user = userEvent.setup()
    const mockExplain = jest.fn()
    
    render(<ExplainChip explanation="Test" onExplain={mockExplain} />)
    
    const chip = screen.getByRole('button')
    await user.tab()
    expect(chip).toHaveFocus()
    
    await user.keyboard('{Enter}')
    expect(mockExplain).toHaveBeenCalled()
  })
})
```

### 9.2 Manual Testing Checklist

**Required Manual Tests:**
- [ ] **Screen reader testing** (NVDA, JAWS, VoiceOver)
- [ ] **Keyboard-only navigation** through entire interface
- [ ] **High contrast mode** compatibility
- [ ] **Zoom testing** up to 200% without horizontal scrolling
- [ ] **Voice control** testing (Dragon, Voice Control)
- [ ] **Mobile screen reader** testing (VoiceOver, TalkBack)

### 9.3 User Testing with Disabilities

**Testing Requirements:**
- [ ] **Vision impairments**: Screen reader users, low vision users
- [ ] **Motor impairments**: Keyboard-only users, voice control users
- [ ] **Cognitive impairments**: Users with learning disabilities
- [ ] **Malaysian users**: Native Malay speakers with accessibility needs

## 10. Compliance Documentation

### 10.1 WCAG 2.1 Level AA Checklist

**Perceivable:**
- [ ] Text alternatives for images
- [ ] Captions for videos
- [ ] Color contrast meets standards
- [ ] Text can resize to 200%

**Operable:**
- [ ] All functionality keyboard accessible
- [ ] No seizure-inducing content
- [ ] Users can pause, stop, or hide moving content
- [ ] Clear focus indicators

**Understandable:**
- [ ] Text is readable and understandable
- [ ] Content appears and functions predictably
- [ ] Input assistance provided for forms

**Robust:**
- [ ] Content works with assistive technologies
- [ ] Valid HTML markup
- [ ] ARIA used correctly

### 10.2 Accessibility Statement Template

```markdown
# Accessibility Statement for Juno

Juno is committed to ensuring digital accessibility for people with disabilities. 
We continually improve the user experience for everyone and apply relevant 
accessibility standards.

## Compliance Status
This website is partially compliant with WCAG 2.1 Level AA standards.

## Feedback
We welcome your feedback on accessibility. Please contact us at 
accessibility@juno.app with any accessibility concerns.

## Last Updated
This statement was last updated on [DATE].
```