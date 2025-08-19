# Design System Integration

This is the design system integration specification for the spec detailed in @.agent-os/specs/2025-08-17-waterfall-chart-optimization/spec.md

> Created: 2025-08-17
> Version: 1.0.0

## Juno Design System Compliance

### Design Token Integration

#### Color System Integration
```typescript
// Juno Design System color integration
import { junoColors, junoColorTokens } from '@/lib/design-system/colors';

const WaterfallChartColors = {
  // Primary chart colors using Juno tokens
  positive: {
    primary: junoColors.primary.DEFAULT,      // #0066cc
    hover: junoColors.primary.hover,          // #0052a3
    active: junoColors.primary.active,        // #004080
    subtle: junoColors.primary.subtle,        // #e6f2ff
  },
  
  negative: {
    primary: junoColors.danger.DEFAULT,       // #dc2626
    hover: junoColors.danger.hover,           // #b91c1c
    active: junoColors.danger.active,         // #991b1b
    subtle: junoColors.danger.subtle,         // #fef2f2
  },
  
  neutral: {
    primary: junoColors.neutral.DEFAULT,      // #6b7280
    hover: junoColors.neutral.hover,          // #4b5563
    active: junoColors.neutral.active,        // #374151
    subtle: junoColors.neutral.subtle,        // #f9fafb
  },
  
  // Background and text colors
  background: {
    primary: junoColors.background.primary,   // #ffffff
    secondary: junoColors.background.secondary, // #f8fafc
    elevated: junoColors.background.elevated,  // #ffffff with shadow
  },
  
  text: {
    primary: junoColors.text.primary,         // #111827
    secondary: junoColors.text.secondary,     // #6b7280
    tertiary: junoColors.text.tertiary,       // #9ca3af
    inverse: junoColors.text.inverse,         // #ffffff
  },
  
  // Chart-specific colors
  chart: {
    grid: junoColors.border.subtle,           // #e5e7eb
    axis: junoColors.border.DEFAULT,          // #d1d5db
    focus: junoColors.focus.ring,             // #3b82f6
    selection: junoColors.selection.background, // #bfdbfe
  }
};

// CSS custom properties for dynamic theming
const chartColorProperties = `
  --waterfall-positive: ${WaterfallChartColors.positive.primary};
  --waterfall-positive-hover: ${WaterfallChartColors.positive.hover};
  --waterfall-positive-subtle: ${WaterfallChartColors.positive.subtle};
  
  --waterfall-negative: ${WaterfallChartColors.negative.primary};
  --waterfall-negative-hover: ${WaterfallChartColors.negative.hover};
  --waterfall-negative-subtle: ${WaterfallChartColors.negative.subtle};
  
  --waterfall-neutral: ${WaterfallChartColors.neutral.primary};
  --waterfall-neutral-hover: ${WaterfallChartColors.neutral.hover};
  --waterfall-neutral-subtle: ${WaterfallChartColors.neutral.subtle};
  
  --waterfall-background: ${WaterfallChartColors.background.primary};
  --waterfall-text: ${WaterfallChartColors.text.primary};
  --waterfall-text-secondary: ${WaterfallChartColors.text.secondary};
  
  --waterfall-grid: ${WaterfallChartColors.chart.grid};
  --waterfall-axis: ${WaterfallChartColors.chart.axis};
  --waterfall-focus: ${WaterfallChartColors.chart.focus};
  --waterfall-selection: ${WaterfallChartColors.chart.selection};
`;
```

#### Typography Integration
```typescript
// Juno typography tokens
import { junoTypography, junoFontSizes, junoFontWeights } from '@/lib/design-system/typography';

const WaterfallChartTypography = {
  // Chart title and headers
  title: {
    fontSize: junoFontSizes.xl,              // 1.25rem
    fontWeight: junoFontWeights.semibold,    // 600
    lineHeight: junoTypography.leading.tight, // 1.25
    fontFamily: junoTypography.fontFamily.sans, // Geist Sans
  },
  
  // Data labels and values
  dataLabel: {
    fontSize: junoFontSizes.sm,              // 0.875rem
    fontWeight: junoFontWeights.medium,      // 500
    lineHeight: junoTypography.leading.normal, // 1.5
    fontFamily: junoTypography.fontFamily.sans,
  },
  
  // Axis labels
  axisLabel: {
    fontSize: junoFontSizes.xs,              // 0.75rem
    fontWeight: junoFontWeights.normal,      // 400
    lineHeight: junoTypography.leading.normal,
    fontFamily: junoTypography.fontFamily.sans,
  },
  
  // Tooltips and overlays
  tooltip: {
    fontSize: junoFontSizes.sm,
    fontWeight: junoFontWeights.medium,
    lineHeight: junoTypography.leading.snug, // 1.375
    fontFamily: junoTypography.fontFamily.sans,
  },
  
  // Monospace for precise values
  value: {
    fontSize: junoFontSizes.sm,
    fontWeight: junoFontWeights.medium,
    lineHeight: junoTypography.leading.normal,
    fontFamily: junoTypography.fontFamily.mono, // Geist Mono
  }
};

// CSS classes for typography
const typographyClasses = {
  title: 'text-xl font-semibold leading-tight font-sans',
  dataLabel: 'text-sm font-medium leading-normal font-sans',
  axisLabel: 'text-xs font-normal leading-normal font-sans',
  tooltip: 'text-sm font-medium leading-snug font-sans',
  value: 'text-sm font-medium leading-normal font-mono'
};
```

#### Spacing and Layout Integration
```typescript
// Juno spacing tokens
import { junoSpacing, junoSizes } from '@/lib/design-system/spacing';

const WaterfallChartSpacing = {
  // Chart margins and padding
  container: {
    padding: junoSpacing[6],                 // 1.5rem (24px)
    margin: junoSpacing[4],                  // 1rem (16px)
  },
  
  // Bar spacing
  bar: {
    minWidth: junoSizes[8],                  // 2rem (32px)
    maxWidth: junoSizes[24],                 // 6rem (96px)
    gap: junoSpacing[2],                     // 0.5rem (8px)
    padding: junoSpacing[1],                 // 0.25rem (4px)
  },
  
  // Label spacing
  label: {
    margin: junoSpacing[2],                  // 0.5rem (8px)
    padding: junoSpacing[1],                 // 0.25rem (4px)
  },
  
  // Tooltip spacing
  tooltip: {
    padding: junoSpacing[3],                 // 0.75rem (12px)
    margin: junoSpacing[2],                  // 0.5rem (8px)
    borderRadius: junoSpacing[2],            // 0.5rem (8px)
  },
  
  // Interactive element spacing
  interactive: {
    padding: junoSpacing[2],                 // 0.5rem (8px)
    margin: junoSpacing[1],                  // 0.25rem (4px)
    focusOffset: junoSpacing[1],             // 0.25rem (4px)
  }
};

// Responsive spacing
const responsiveSpacing = {
  mobile: {
    container: junoSpacing[4],               // 1rem (16px)
    bar: { gap: junoSpacing[1] },            // 0.25rem (4px)
  },
  tablet: {
    container: junoSpacing[5],               // 1.25rem (20px)
    bar: { gap: junoSpacing[1.5] },          // 0.375rem (6px)
  },
  desktop: {
    container: junoSpacing[6],               // 1.5rem (24px)
    bar: { gap: junoSpacing[2] },            // 0.5rem (8px)
  }
};
```

### Component Integration

#### Button Components
```typescript
// Integration with Juno Button component
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';

const ChartControls: React.FC<{
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  onExport: () => void;
}> = ({ onZoomIn, onZoomOut, onReset, onExport }) => (
  <div className="flex gap-2 p-2">
    <IconButton
      variant="secondary"
      size="sm"
      icon="zoom-in"
      aria-label="Zoom in"
      onClick={onZoomIn}
    />
    <IconButton
      variant="secondary"
      size="sm"
      icon="zoom-out"
      aria-label="Zoom out"
      onClick={onZoomOut}
    />
    <Button
      variant="secondary"
      size="sm"
      onClick={onReset}
    >
      Reset
    </Button>
    <Button
      variant="primary"
      size="sm"
      onClick={onExport}
    >
      Export
    </Button>
  </div>
);

// Chart action buttons
const ChartActionButton: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}> = ({ children, onClick, variant = 'secondary', disabled = false }) => (
  <Button
    variant={variant}
    size="sm"
    className="min-w-[80px]"
    onClick={onClick}
    disabled={disabled}
  >
    {children}
  </Button>
);
```

#### Card and Container Components
```typescript
// Integration with Juno Card component
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';

const WaterfallChartContainer: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}> = ({ title, subtitle, children, actions }) => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex gap-2">
            {actions}
          </div>
        )}
      </div>
    </CardHeader>
    
    <CardContent className="p-0">
      {children}
    </CardContent>
  </Card>
);

// Loading state integration
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Skeleton } from '@/components/ui/Skeleton';

const WaterfallChartSkeleton: React.FC = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="flex items-end space-x-2 h-64">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1"
          style={{ height: `${Math.random() * 200 + 50}px` }}
        />
      ))}
    </div>
    <div className="flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-20" />
    </div>
  </div>
);
```

#### Tooltip Integration
```typescript
// Integration with Juno Tooltip component
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

const WaterfallBarTooltip: React.FC<{
  dataPoint: ProcessedWaterfallPoint;
  children: React.ReactNode;
}> = ({ dataPoint, children }) => {
  const formatValue = (value: number) => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-2">
            <div className="font-medium">{dataPoint.label}</div>
            <div className="text-sm">
              <div>Value: {formatValue(dataPoint.value)}</div>
              <div>Running Total: {formatValue(dataPoint.runningTotal)}</div>
              <div>Change: {dataPoint.value >= 0 ? '+' : ''}{formatValue(dataPoint.value)}</div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
```

### Shadow and Elevation System

#### Shadow Integration
```typescript
// Juno shadow system integration
import { junoShadows } from '@/lib/design-system/shadows';

const WaterfallChartShadows = {
  // Chart container elevation
  container: junoShadows.md,                // 0 4px 6px -1px rgb(0 0 0 / 0.1)
  
  // Bar hover state
  barHover: junoShadows.lg,                 // 0 10px 15px -3px rgb(0 0 0 / 0.1)
  
  // Tooltip elevation
  tooltip: junoShadows.xl,                  // 0 20px 25px -5px rgb(0 0 0 / 0.1)
  
  // Focus state
  focus: junoShadows.outline,               // 0 0 0 3px rgb(59 130 246 / 0.5)
  
  // Floating elements
  floating: junoShadows['2xl'],             // 0 25px 50px -12px rgb(0 0 0 / 0.25)
};

// CSS classes for shadows
const shadowClasses = {
  container: 'shadow-md',
  barHover: 'shadow-lg',
  tooltip: 'shadow-xl',
  focus: 'shadow-outline',
  floating: 'shadow-2xl'
};
```

### Animation and Transition System

#### Motion Integration
```typescript
// Juno animation tokens
import { junoAnimations, junoTransitions } from '@/lib/design-system/motion';

const WaterfallChartAnimations = {
  // Bar entrance animations
  barEntrance: {
    duration: junoTransitions.duration.normal, // 200ms
    easing: junoTransitions.easing.easeOut,    // cubic-bezier(0, 0, 0.2, 1)
    delay: (index: number) => index * 50,      // Stagger effect
  },
  
  // Hover animations
  barHover: {
    duration: junoTransitions.duration.fast,   // 100ms
    easing: junoTransitions.easing.easeInOut,  // cubic-bezier(0.4, 0, 0.2, 1)
  },
  
  // Data update animations
  dataUpdate: {
    duration: junoTransitions.duration.slow,   // 300ms
    easing: junoTransitions.easing.easeOut,
  },
  
  // Focus animations
  focus: {
    duration: junoTransitions.duration.fast,
    easing: junoTransitions.easing.linear,     // linear
  }
};

// CSS animation classes
const animationClasses = {
  barEntrance: 'animate-slide-up',
  barHover: 'transition-all duration-100 ease-in-out',
  dataUpdate: 'transition-all duration-300 ease-out',
  focus: 'transition-all duration-100 ease-linear'
};

// Framer Motion integration
import { motion, useSpring, useTransform } from 'framer-motion';

const AnimatedWaterfallBar: React.FC<{
  dataPoint: ProcessedWaterfallPoint;
  index: number;
}> = ({ dataPoint, index }) => {
  const height = useSpring(dataPoint.height, {
    stiffness: 300,
    damping: 30
  });
  
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ 
        height: dataPoint.height, 
        opacity: 1 
      }}
      transition={{
        duration: WaterfallChartAnimations.barEntrance.duration / 1000,
        ease: WaterfallChartAnimations.barEntrance.easing,
        delay: WaterfallChartAnimations.barEntrance.delay(index) / 1000
      }}
      whileHover={{
        scale: 1.02,
        transition: {
          duration: WaterfallChartAnimations.barHover.duration / 1000
        }
      }}
      style={{ height }}
      className="waterfall-bar"
    />
  );
};
```

### Dark Mode Integration

#### Theme-Aware Color System
```typescript
// Dark mode color overrides
const WaterfallChartDarkMode = {
  positive: {
    primary: '#3b82f6',      // Brighter blue for dark backgrounds
    subtle: '#1e3a8a',       // Darker blue subtle
  },
  
  negative: {
    primary: '#ef4444',      // Brighter red for dark backgrounds
    subtle: '#7f1d1d',       // Darker red subtle
  },
  
  neutral: {
    primary: '#9ca3af',      // Lighter gray
    subtle: '#374151',       // Darker gray subtle
  },
  
  background: {
    primary: '#111827',      // Dark background
    secondary: '#1f2937',    // Darker secondary
    elevated: '#374151',     // Elevated surface
  },
  
  text: {
    primary: '#f9fafb',      // Light text
    secondary: '#d1d5db',    // Secondary light text
    tertiary: '#9ca3af',     // Tertiary light text
  },
  
  chart: {
    grid: '#374151',         // Dark grid lines
    axis: '#4b5563',         // Dark axis lines
  }
};

// CSS custom properties for dark mode
const darkModeProperties = `
  [data-theme="dark"] {
    --waterfall-positive: ${WaterfallChartDarkMode.positive.primary};
    --waterfall-positive-subtle: ${WaterfallChartDarkMode.positive.subtle};
    
    --waterfall-negative: ${WaterfallChartDarkMode.negative.primary};
    --waterfall-negative-subtle: ${WaterfallChartDarkMode.negative.subtle};
    
    --waterfall-neutral: ${WaterfallChartDarkMode.neutral.primary};
    --waterfall-neutral-subtle: ${WaterfallChartDarkMode.neutral.subtle};
    
    --waterfall-background: ${WaterfallChartDarkMode.background.primary};
    --waterfall-text: ${WaterfallChartDarkMode.text.primary};
    --waterfall-text-secondary: ${WaterfallChartDarkMode.text.secondary};
    
    --waterfall-grid: ${WaterfallChartDarkMode.chart.grid};
    --waterfall-axis: ${WaterfallChartDarkMode.chart.axis};
  }
`;
```

## Implementation Guidelines

### CSS-in-JS Integration
```typescript
// Styled-components with Juno tokens
import styled from 'styled-components';
import { junoTheme } from '@/lib/design-system/theme';

const StyledWaterfallChart = styled.div`
  padding: ${junoTheme.spacing[6]};
  background-color: ${junoTheme.colors.background.primary};
  border-radius: ${junoTheme.borderRadius.lg};
  box-shadow: ${junoTheme.shadows.md};
  
  .waterfall-bar {
    transition: all ${junoTheme.transitions.duration.fast}ms ${junoTheme.transitions.easing.easeInOut};
    border-radius: ${junoTheme.borderRadius.sm};
    
    &:hover {
      box-shadow: ${junoTheme.shadows.lg};
      transform: scale(1.02);
    }
    
    &:focus {
      outline: 2px solid ${junoTheme.colors.focus.ring};
      outline-offset: 2px;
    }
  }
  
  @media (prefers-color-scheme: dark) {
    background-color: ${junoTheme.colors.background.dark};
    color: ${junoTheme.colors.text.dark};
  }
`;
```

### Tailwind CSS Integration
```typescript
// Tailwind classes using Juno design tokens
const waterfallChartClasses = {
  container: 'p-6 bg-white rounded-lg shadow-md dark:bg-gray-900 dark:text-white',
  bar: 'transition-all duration-100 ease-in-out rounded-sm hover:shadow-lg hover:scale-102 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
  barPositive: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500',
  barNegative: 'bg-red-600 hover:bg-red-700 dark:bg-red-500',
  barNeutral: 'bg-gray-600 hover:bg-gray-700 dark:bg-gray-500',
  text: {
    title: 'text-xl font-semibold text-gray-900 dark:text-white',
    label: 'text-sm font-medium text-gray-700 dark:text-gray-300',
    value: 'text-sm font-mono font-medium text-gray-900 dark:text-white'
  }
};
```

### Component Props Integration
```typescript
// Props that integrate with Juno design system
interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  
  // Design system integration
  theme?: 'light' | 'dark' | 'auto';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'minimal' | 'detailed';
  colorScheme?: 'default' | 'monochrome' | 'accessible';
  
  // Spacing overrides
  spacing?: {
    container?: keyof typeof junoSpacing;
    bars?: keyof typeof junoSpacing;
    labels?: keyof typeof junoSpacing;
  };
  
  // Typography overrides
  typography?: {
    title?: keyof typeof junoFontSizes;
    labels?: keyof typeof junoFontSizes;
    values?: keyof typeof junoFontSizes;
  };
  
  // Animation preferences
  motion?: {
    reduceMotion?: boolean;
    animationSpeed?: 'slow' | 'normal' | 'fast';
    staggerDelay?: number;
  };
}
```

## Quality Assurance

### Design System Compliance Checklist
- [ ] **Colors**: All colors use Juno design tokens
- [ ] **Typography**: All text uses Juno font tokens
- [ ] **Spacing**: All spacing uses Juno spacing tokens  
- [ ] **Shadows**: All elevations use Juno shadow tokens
- [ ] **Animations**: All motion uses Juno transition tokens
- [ ] **Components**: Integrates with existing Juno components
- [ ] **Dark Mode**: Proper dark mode support
- [ ] **Responsive**: Follows Juno responsive patterns
- [ ] **Accessibility**: Meets Juno accessibility standards
- [ ] **Performance**: Maintains Juno performance standards