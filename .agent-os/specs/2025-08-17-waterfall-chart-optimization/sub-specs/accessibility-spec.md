# Accessibility Specification

This is the accessibility specification for the spec detailed in @.agent-os/specs/2025-08-17-waterfall-chart-optimization/spec.md

> Created: 2025-08-17
> Version: 1.0.0

## Accessibility Requirements

### WCAG 2.1 AA Compliance

#### Perceivable (Level AA)
- **1.1.1 Non-text Content**: All chart elements must have meaningful text alternatives
- **1.3.1 Info and Relationships**: Chart structure must be programmatically determinable
- **1.3.2 Meaningful Sequence**: Chart data must be presentable in a logical sequence
- **1.4.3 Contrast (Minimum)**: 4.5:1 contrast ratio for all text and meaningful graphics
- **1.4.11 Non-text Contrast**: 3:1 contrast ratio for chart bars and interactive elements

#### Operable (Level AA)
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.1.2 No Keyboard Trap**: Keyboard focus never trapped in chart component
- **2.4.3 Focus Order**: Logical, intuitive focus order throughout chart
- **2.4.7 Focus Visible**: Clearly visible focus indicators for all interactive elements

#### Understandable (Level AA)
- **3.1.1 Language of Page**: Chart content language programmatically determinable
- **3.2.1 On Focus**: No unexpected context changes when elements receive focus
- **3.3.2 Labels or Instructions**: Clear instructions for chart interaction

#### Robust (Level AA)
- **4.1.2 Name, Role, Value**: All chart elements have accessible names, roles, and values
- **4.1.3 Status Messages**: Dynamic chart updates communicated to assistive technologies

### Keyboard Navigation Implementation

#### Navigation Patterns
```typescript
// Comprehensive keyboard support
const KeyboardNavigationMap = {
  // Primary navigation
  'Tab': 'Move to next interactive element',
  'Shift+Tab': 'Move to previous interactive element',
  
  // Chart-specific navigation
  'ArrowRight': 'Move to next data bar',
  'ArrowLeft': 'Move to previous data bar',
  'Home': 'Move to first data bar',
  'End': 'Move to last data bar',
  
  // Interaction
  'Enter': 'Activate focused element (show details)',
  'Space': 'Activate focused element (show details)',
  'Escape': 'Close any open details/modal',
  
  // Data table alternative
  'T': 'Switch to table view (if available)',
  'C': 'Switch to chart view',
  
  // Accessibility features
  'H': 'Toggle high contrast mode',
  'A': 'Announce current data summary'
};

// Implementation
const useKeyboardNavigation = (dataPoints: ProcessedWaterfallPoint[]) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [mode, setMode] = useState<'chart' | 'table'>('chart');
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey } = event;
    
    // Prevent default browser behavior for handled keys
    const handledKeys = ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', ' '];
    if (handledKeys.includes(key)) {
      event.preventDefault();
    }
    
    switch (key) {
      case 'ArrowRight':
        setFocusedIndex(prev => Math.min(prev + 1, dataPoints.length - 1));
        announceDataPoint(dataPoints[Math.min(focusedIndex + 1, dataPoints.length - 1)]);
        break;
        
      case 'ArrowLeft':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        announceDataPoint(dataPoints[Math.max(focusedIndex - 1, 0)]);
        break;
        
      case 'Home':
        setFocusedIndex(0);
        announceDataPoint(dataPoints[0]);
        break;
        
      case 'End':
        setFocusedIndex(dataPoints.length - 1);
        announceDataPoint(dataPoints[dataPoints.length - 1]);
        break;
        
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          onBarClick?.(dataPoints[focusedIndex]);
          announceActivation(dataPoints[focusedIndex]);
        }
        break;
        
      case 't':
      case 'T':
        setMode(mode === 'chart' ? 'table' : 'chart');
        announceMode(mode === 'chart' ? 'table' : 'chart');
        break;
        
      case 'a':
      case 'A':
        announceChartSummary(dataPoints);
        break;
    }
  }, [dataPoints, focusedIndex, mode, onBarClick]);
  
  return { focusedIndex, mode, handleKeyDown };
};
```

#### Focus Management
```typescript
// Focus trap implementation for chart container
const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!isActive || !containerRef.current) return;
    
    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    container.addEventListener('keydown', handleTabKeyDown);
    return () => container.removeEventListener('keydown', handleTabKeyDown);
  }, [isActive]);
  
  return containerRef;
};

// Visible focus indicators
const FocusStyles = {
  // High contrast focus ring
  focusRing: {
    outline: '3px solid #0066cc',
    outlineOffset: '2px',
    boxShadow: '0 0 0 1px #ffffff, 0 0 0 4px #0066cc'
  },
  
  // High contrast mode adjustments
  highContrast: {
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: 'HighlightText',
    backgroundColor: 'Highlight',
    color: 'HighlightText'
  }
};
```

### Screen Reader Support

#### ARIA Implementation
```typescript
// Comprehensive ARIA labeling
const generateARIAProps = (
  dataPoint: ProcessedWaterfallPoint,
  index: number,
  total: number,
  chartSummary: string
) => {
  const value = formatCurrency(dataPoint.value);
  const runningTotal = formatCurrency(dataPoint.runningTotal);
  const changeType = dataPoint.value >= 0 ? 'increase' : 'decrease';
  
  return {
    // Basic identification
    role: 'button',
    tabIndex: 0,
    
    // Accessible name
    'aria-label': `${dataPoint.label}: ${value} ${changeType}, running total ${runningTotal}`,
    
    // Position in set
    'aria-posinset': index + 1,
    'aria-setsize': total,
    
    // Current state
    'aria-current': dataPoint.isCurrent ? 'true' : undefined,
    'aria-selected': dataPoint.isSelected ? 'true' : 'false',
    
    // Relationships
    'aria-describedby': `chart-summary waterfall-description-${dataPoint.id}`,
    'aria-labelledby': `waterfall-title waterfall-bar-${dataPoint.id}`,
    
    // Live region support
    'aria-live': dataPoint.isUpdating ? 'polite' : undefined,
    'aria-atomic': 'true'
  };
};

// Chart container ARIA
const ChartContainerARIA = {
  role: 'img',
  'aria-label': 'Waterfall chart showing financial flow over time',
  'aria-describedby': 'chart-summary chart-instructions',
  'aria-live': 'polite',
  'aria-atomic': 'false'
};

// Instructions for screen readers
const screenReaderInstructions = `
  Use arrow keys to navigate between data points. 
  Press Enter or Space to view details. 
  Press T to switch to table view for detailed data access.
  Press A to hear a summary of all data.
`;
```

#### Live Regions for Dynamic Updates
```typescript
// Announcement system for screen readers
const useScreenReaderAnnouncements = () => {
  const [politeAnnouncement, setPoliteAnnouncement] = useState('');
  const [assertiveAnnouncement, setAssertiveAnnouncement] = useState('');
  
  const announceDataUpdate = useCallback((summary: string) => {
    setPoliteAnnouncement(`Chart updated: ${summary}`);
    setTimeout(() => setPoliteAnnouncement(''), 1000);
  }, []);
  
  const announceError = useCallback((error: string) => {
    setAssertiveAnnouncement(`Error: ${error}`);
    setTimeout(() => setAssertiveAnnouncement(''), 3000);
  }, []);
  
  const announceDataPoint = useCallback((dataPoint: ProcessedWaterfallPoint) => {
    const value = formatCurrency(dataPoint.value);
    const announcement = `${dataPoint.label}, ${value}, ${dataPoint.value >= 0 ? 'increase' : 'decrease'}`;
    setPoliteAnnouncement(announcement);
    setTimeout(() => setPoliteAnnouncement(''), 800);
  }, []);
  
  return {
    politeAnnouncement,
    assertiveAnnouncement,
    announceDataUpdate,
    announceError,
    announceDataPoint
  };
};

// Live region components
const LiveRegions: React.FC<{ polite: string; assertive: string }> = ({ polite, assertive }) => (
  <>
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
      id="polite-announcements"
    >
      {polite}
    </div>
    <div
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
      id="assertive-announcements"
    >
      {assertive}
    </div>
  </>
);
```

### Color Vision Accessibility

#### Colorblind-Friendly Design
```typescript
// Color palette designed for all types of color vision
const AccessibleColors = {
  // Base colors with high contrast
  positive: {
    primary: '#0066cc',    // Blue - distinguishable by all color vision types
    secondary: '#004499',
    pattern: 'diagonal-up' // Pattern for additional distinction
  },
  
  negative: {
    primary: '#cc3300',    // Red with high luminance contrast
    secondary: '#992200',
    pattern: 'diagonal-down'
  },
  
  neutral: {
    primary: '#666666',    // Gray
    secondary: '#444444',
    pattern: 'horizontal'
  },
  
  // High contrast alternatives
  highContrast: {
    positive: '#000000',
    negative: '#ffffff',
    background: '#ffffff',
    text: '#000000'
  }
};

// Pattern implementation for visual distinction
const PatternDefinitions = `
  <defs>
    <pattern id="diagonal-up" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M 0,4 L 4,0 M -1,1 L 1,-1 M 3,5 L 5,3" stroke="#ffffff" strokeWidth="0.5"/>
    </pattern>
    <pattern id="diagonal-down" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M 0,0 L 4,4 M -1,3 L 1,5 M 3,-1 L 5,1" stroke="#ffffff" strokeWidth="0.5"/>
    </pattern>
    <pattern id="horizontal" patternUnits="userSpaceOnUse" width="4" height="4">
      <path d="M 0,2 L 4,2" stroke="#ffffff" strokeWidth="0.5"/>
    </pattern>
  </defs>
`;

// Color vision simulation testing
const useColorVisionTesting = () => {
  const [simulationMode, setSimulationMode] = useState<'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'>('none');
  
  const applyColorVisionFilter = useCallback((color: string, mode: string) => {
    // Implementation would apply color vision simulation filters
    // This is for development/testing purposes
    return color;
  }, []);
  
  return { simulationMode, setSimulationMode, applyColorVisionFilter };
};
```

#### Contrast Validation
```typescript
// Automated contrast checking
const validateContrast = (foreground: string, background: string): boolean => {
  const getLuminance = (color: string): number => {
    // Convert color to RGB and calculate relative luminance
    // Implementation follows WCAG guidelines
    return 0; // Placeholder
  };
  
  const fg = getLuminance(foreground);
  const bg = getLuminance(background);
  const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
  
  return ratio >= 4.5; // WCAG AA standard
};

// Runtime contrast validation
const useContrastValidation = (colors: Record<string, string>) => {
  useEffect(() => {
    Object.entries(colors).forEach(([key, color]) => {
      const isValid = validateContrast(color, '#ffffff');
      if (!isValid) {
        console.warn(`Color ${key} (${color}) does not meet contrast requirements`);
      }
    });
  }, [colors]);
};
```

## Test Coverage

### Automated Accessibility Testing
```typescript
// axe-core integration for automated testing
import { toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('WaterfallChart Accessibility', () => {
  test('should have no accessibility violations', async () => {
    const { container } = render(<WaterfallChart data={mockData} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
  
  test('should support keyboard navigation', () => {
    const { getByRole } = render(<WaterfallChart data={mockData} />);
    const chart = getByRole('img');
    
    fireEvent.keyDown(chart, { key: 'ArrowRight' });
    // Assert focus moved to first data bar
    
    fireEvent.keyDown(chart, { key: 'Enter' });
    // Assert activation behavior
  });
  
  test('should announce updates to screen readers', async () => {
    const { rerender, getByLabelText } = render(<WaterfallChart data={mockData} />);
    
    rerender(<WaterfallChart data={updatedMockData} />);
    
    await waitFor(() => {
      const liveRegion = getByLabelText(/chart updated/i);
      expect(liveRegion).toBeInTheDocument();
    });
  });
});
```

### Manual Testing Checklist
- [ ] **Screen Reader Testing**
  - [ ] NVDA (Windows)
  - [ ] JAWS (Windows)
  - [ ] VoiceOver (macOS)
  - [ ] Orca (Linux)

- [ ] **Keyboard Navigation Testing**
  - [ ] Tab navigation works correctly
  - [ ] Arrow key navigation functions
  - [ ] Keyboard shortcuts activate properly
  - [ ] Focus is always visible
  - [ ] No keyboard traps exist

- [ ] **Color Vision Testing**
  - [ ] Protanopia simulation
  - [ ] Deuteranopia simulation
  - [ ] Tritanopia simulation
  - [ ] Monochromatic view
  - [ ] High contrast mode

- [ ] **Contrast Testing**
  - [ ] All text meets 4.5:1 ratio
  - [ ] Interactive elements meet 3:1 ratio
  - [ ] Focus indicators are clearly visible
  - [ ] Pattern distinction without color

## Monitoring Requirements

### Accessibility Metrics
- **WCAG Compliance Score**: Target 100% Level AA
- **Keyboard Navigation Coverage**: 100% of interactive elements
- **Screen Reader Compatibility**: All major screen readers
- **Color Contrast Validation**: Automated checking in CI/CD
- **User Testing**: Regular testing with disabled users

### Continuous Monitoring
- Automated accessibility testing in CI/CD pipeline
- Regular audits with real assistive technology users
- Performance monitoring for screen reader responsiveness
- Contrast validation for all design system updates