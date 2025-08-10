/**
 * Juno Design System - TypeScript Type Definitions
 * 
 * Complete type system for the Juno visual redesign
 * Provides type safety and IntelliSense for design tokens and components
 */

// ========================================
// COLOR SYSTEM TYPES
// ========================================

/** Primary brand colors */
export type JunoBrandColor = 
  | 'juno-accent'
  | 'juno-text'
  | 'juno-bg'
  | 'juno-on-accent'

/** Accent color scale (50-900) */
export type JunoAccentScale = 
  | 'juno-accent-50'
  | 'juno-accent-100'
  | 'juno-accent-200'
  | 'juno-accent-300'   // Primary accent
  | 'juno-accent-400'
  | 'juno-accent-500'
  | 'juno-accent-600'
  | 'juno-accent-700'
  | 'juno-accent-800'
  | 'juno-accent-900'

/** Neutral color scale */
export type JunoNeutralScale = 
  | 'juno-neutral-50'
  | 'juno-neutral-100'
  | 'juno-neutral-200'
  | 'juno-neutral-300'
  | 'juno-neutral-400'
  | 'juno-neutral-500'
  | 'juno-neutral-600'   // Same as juno-text
  | 'juno-neutral-700'
  | 'juno-neutral-800'
  | 'juno-neutral-850'
  | 'juno-neutral-900'

/** Light surface scale for backgrounds and cards */
export type JunoSurfaceScale = 
  | 'juno-surface-50'    // Pure white
  | 'juno-surface-100'   // Cool white tint
  | 'juno-surface-200'   // Light cool gray
  | 'juno-surface-300'   // Medium light cool gray
  | 'juno-surface-400'   // Medium cool gray
  | 'juno-surface-500'   // Darker cool gray

/** Derived color tokens with alpha transparency */
export type JunoDerivedColor = 
  | 'juno-border'        // 16% opacity
  | 'juno-muted-fg'      // 72% opacity
  | 'juno-pill-fg'       // 88% opacity
  | 'juno-pill-bg'       // 10% opacity
  | 'juno-shadow'        // 12% opacity
  | 'juno-focus-ring'    // 70% opacity
  | 'juno-hover-overlay' // 5% opacity
  | 'juno-active-overlay' // 8% opacity

/** Semantic colors for status indicators */
export type JunoSemanticColor = 
  | 'juno-success' | 'juno-success-bg' | 'juno-success-fg'
  | 'juno-warning' | 'juno-warning-bg' | 'juno-warning-fg'
  | 'juno-danger' | 'juno-danger-bg' | 'juno-danger-fg'
  | 'juno-info' | 'juno-info-bg' | 'juno-info-fg'

/** All available color tokens */
export type JunoColor = 
  | JunoBrandColor
  | JunoAccentScale
  | JunoNeutralScale
  | JunoSurfaceScale
  | JunoDerivedColor
  | JunoSemanticColor

// ========================================
// TYPOGRAPHY TYPES
// ========================================

/** Typography scale following Major Third (1.25×) */
export type JunoFontSize = 
  | 'juno-fs-display'     // 4.8rem / 3.2rem mobile
  | 'juno-fs-hero'        // 3.2rem / 2.4rem mobile
  | 'juno-fs-heading'     // 2.56rem / 2rem mobile
  | 'juno-fs-subheading'  // 2.05rem / 1.6rem mobile
  | 'juno-fs-body-lg'     // 1.6rem / 1.4rem mobile
  | 'juno-fs-body'        // 1.28rem / 1.12rem mobile
  | 'juno-fs-caption'     // 1rem / 0.9rem mobile
  | 'juno-fs-code'        // 0.95rem / 0.85rem mobile

/** Line height variants */
export type JunoLineHeight = 
  | 'juno-lh-tight'       // 1.35 for headings
  | 'juno-lh-normal'      // 1.6 for body text
  | 'juno-lh-code'        // 1.4 for code blocks

/** Font families */
export type JunoFontFamily = 
  | 'font-geist-sans'     // Primary font
  | 'font-geist-mono'     // Monospace font

// ========================================
// SPACING & SIZING TYPES
// ========================================

/** Spacing scale based on 4px units */
export type JunoSpace = 
  | 'juno-space-1'        // 4px
  | 'juno-space-2'        // 8px
  | 'juno-space-4'        // 16px
  | 'juno-space-6'        // 24px
  | 'juno-space-8'        // 32px
  | 'juno-space-12'       // 48px
  | 'juno-space-16'       // 64px
  | 'juno-space-24'       // 96px

/** Border radius scale */
export type JunoRadius = 
  | 'juno-radius-sm'      // 8px
  | 'juno-radius-md'      // 12px - Primary
  | 'juno-radius-lg'      // 16px
  | 'juno-radius-xl'      // 24px
  | 'juno-radius-full'    // 9999px

/** Shadow scale */
export type JunoShadow = 
  | 'juno-shadow-xs'      // Subtle
  | 'juno-shadow-sm'      // Small cards
  | 'juno-shadow-md'      // Buttons, primary cards
  | 'juno-shadow-lg'      // Tooltips, dropdowns
  | 'juno-shadow-xl'      // Modals, overlays

// ========================================
// ANIMATION TYPES
// ========================================

/** Animation durations */
export type JunoDuration = 
  | 'juno-duration-fast'   // 150ms
  | 'juno-duration-normal' // 200ms
  | 'juno-duration-slow'   // 300ms

/** Easing functions */
export type JunoEasing = 
  | 'juno-ease-in'
  | 'juno-ease-out'
  | 'juno-ease-in-out'

// ========================================
// COMPONENT VARIANT TYPES
// ========================================

/** Button variants */
export interface JunoButtonVariants {
  variant: 
    | 'juno-primary'      // Primary CTA (cyan)
    | 'juno-secondary'    // Secondary CTA (cyan)
    | 'juno-ghost'        // Subtle button (cyan)
    | 'juno-link'         // Link-style button (cyan)
    | 'juno-teal'         // Professional primary (teal)
    | 'juno-teal-outline' // Professional outline (teal)
    | 'juno-teal-ghost'   // Professional subtle (teal)
    | 'juno-blue'         // Trustworthy primary (blue)
    | 'juno-blue-outline' // Trustworthy outline (blue)
    | 'juno-blue-ghost'   // Trustworthy subtle (blue)
  size: 
    | 'sm'                // Small button
    | 'default'           // Default button
    | 'lg'                // Large button
    | 'icon'              // Icon-only button
    | 'juno-mobile'       // Mobile-optimized (44px)
    | 'juno-mobile-sm'    // Mobile small (40px)
    | 'juno-mobile-lg'    // Mobile large (48px)
}

/** Input variants */
export interface JunoInputVariants {
  variant: 
    | 'default'           // Standard input
    | 'juno'              // Juno-styled input
  size: 
    | 'sm'
    | 'default'
    | 'lg'
}

/** Card variants */
export interface JunoCardVariants {
  variant: 
    | 'default'           // Standard card
    | 'juno'              // Juno-styled card
    | 'educational'       // Educational content card
}

/** Badge/Status variants */
export interface JunoBadgeVariants {
  variant: 
    | 'juno-success'      // Success status
    | 'juno-warning'      // Warning status
    | 'juno-danger'       // Error status
    | 'juno-info'         // Information status
  size: 
    | 'sm'
    | 'default'
    | 'lg'
}

// ========================================
// EDUCATIONAL COMPONENT TYPES
// ========================================

/** ExplainChip component props */
export interface ExplainChipProps {
  explanation: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'default' | 'lg'
  className?: string
  onExplain?: () => void
}

/** FinancialTooltip component props */
export interface FinancialTooltipProps {
  title?: string
  explanation: string
  example?: string
  currency?: 'RM' | 'USD'
  maxWidth?: number
  className?: string
  children: React.ReactNode
}

/** ScenarioSlider component props */
export interface ScenarioSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step?: number
  currency?: string
  explanation?: string
  className?: string
}

/** TeachModeToggle component props */
export interface TeachModeToggleProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  className?: string
}

// ========================================
// DATA VISUALIZATION TYPES
// ========================================

/** Chart data structure */
export interface ChartDataPoint {
  label: string
  value: number
  period?: 'current' | 'previous' | 'historical'
  explanation?: string
}

/** JunoChart component props */
export interface JunoChartProps {
  type: 'bar' | 'line' | 'area' | 'pie'
  data: ChartDataPoint[]
  currentPeriod?: string
  showExplanation?: boolean
  currency?: string
  height?: number
  className?: string
}

/** BudgetProgressBar component props */
export interface BudgetProgressBarProps {
  used: number
  total: number
  category: string
  currency?: string
  showOverage?: boolean
  explanation?: string
  className?: string
}

// ========================================
// MALAYSIAN LOCALIZATION TYPES
// ========================================

/** Supported currencies */
export type SupportedCurrency = 'RM' | 'USD'

/** Supported languages */
export type SupportedLanguage = 'en' | 'ms'

/** Malaysian-specific formatting options */
export interface MalaysianFormatOptions {
  currency: SupportedCurrency
  locale: SupportedLanguage
  showCurrencySymbol?: boolean
  decimalPlaces?: number
}

/** Financial terminology translations */
export interface FinancialTerms {
  en: string
  ms: string
}

// ========================================
// ACCESSIBILITY TYPES
// ========================================

/** ARIA labels for components */
export interface AriaLabels {
  explainChip: string
  financialTooltip: string
  scenarioSlider: string
  teachModeToggle: string
  budgetProgress: string
}

/** Focus management options */
export interface FocusOptions {
  trapFocus?: boolean
  restoreFocus?: boolean
  initialFocus?: string
}

// ========================================
// THEME CONFIGURATION TYPES
// ========================================

/** Complete Juno theme configuration */
export interface JunoThemeConfig {
  colors: {
    brand: Record<string, string>
    accent: Record<string, string>
    neutral: Record<string, string>
    whiteNeutral: Record<string, string>
    derived: Record<string, string>
    semantic: Record<string, string>
  }
  typography: {
    fontSize: Record<string, string>
    lineHeight: Record<string, number>
    fontFamily: Record<string, string[]>
  }
  spacing: Record<string, string>
  borderRadius: Record<string, string>
  boxShadow: Record<string, string>
  animation: {
    duration: Record<string, string>
    easing: Record<string, string>
  }
}

/** Theme customization options */
export interface ThemeCustomization {
  accentColor?: string
  textColor?: string
  reducedMotion?: boolean
  highContrast?: boolean
  fontSize?: 'small' | 'medium' | 'large'
}

// ========================================
// UTILITY TYPES
// ========================================

/** CSS custom property reference */
export type CSSCustomProperty = `var(--${string})`

/** Component with Juno styling */
export interface JunoStyledComponent {
  className?: string
  'data-juno-component'?: string
}

/** Educational enhancement */
export interface EducationalEnhancement {
  hasExplanation?: boolean
  explanationId?: string
  teachMode?: boolean
}

// ========================================
// DESIGN SYSTEM CONTEXT TYPES
// ========================================

/** Design system context */
export interface JunoDesignSystemContext {
  theme: JunoThemeConfig
  customization: ThemeCustomization
  teachMode: boolean
  language: SupportedLanguage
  currency: SupportedCurrency
}

/** Design system provider props */
export interface JunoDesignSystemProviderProps {
  children: React.ReactNode
  theme?: Partial<JunoThemeConfig>
  customization?: ThemeCustomization
  defaultTeachMode?: boolean
  defaultLanguage?: SupportedLanguage
  defaultCurrency?: SupportedCurrency
}

// ========================================
// VALIDATION & TESTING TYPES
// ========================================

/** Color contrast validation */
export interface ContrastValidation {
  ratio: number
  passes: 'AA' | 'AAA' | 'fail'
  foreground: string
  background: string
}

/** Accessibility audit result */
export interface AccessibilityAuditResult {
  component: string
  passed: boolean
  issues: string[]
  wcagLevel: 'A' | 'AA' | 'AAA'
}

/** Design system metrics */
export interface DesignSystemMetrics {
  accentCoveragePercentage: number
  colorContrastCompliance: ContrastValidation[]
  componentConsistency: number
  educationalCoverage: number
}

// ========================================
// EXPORT ALL TYPES
// ========================================

// All types are defined in this file for the reference implementation
// In production, these could be split into separate modules:
// - ./component-props.types
// - ./theme.types  
// - ./accessibility.types

// Re-export common React types for convenience
export type { 
  ComponentProps,
  ReactNode,
  HTMLAttributes,
  MouseEvent,
  KeyboardEvent,
  FocusEvent
} from 'react'