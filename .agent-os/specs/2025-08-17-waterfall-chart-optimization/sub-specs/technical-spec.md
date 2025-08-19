# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-08-17-waterfall-chart-optimization/spec.md

> Created: 2025-08-17
> Version: 1.0.0

## Technical Requirements

### Component Architecture

#### Core Component Structure
```typescript
interface WaterfallChartProps {
  data: WaterfallDataPoint[];
  loading?: boolean;
  error?: Error | null;
  onBarClick?: (dataPoint: WaterfallDataPoint) => void;
  onBarFocus?: (dataPoint: WaterfallDataPoint) => void;
  accessibility?: {
    announceUpdates?: boolean;
    skipNavigation?: boolean;
    customAriaLabels?: Record<string, string>;
  };
  performance?: {
    enableVirtualization?: boolean;
    debounceMs?: number;
    memoizeCalculations?: boolean;
  };
}
```

#### Data Type Improvements
```typescript
// Enhanced waterfall data structure
interface WaterfallDataPoint {
  id: string;
  label: string;
  value: number;
  type: 'positive' | 'negative' | 'total';
  category: string;
  subcategory?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Calculation result structure
interface WaterfallCalculationResult {
  dataPoints: ProcessedWaterfallPoint[];
  totals: {
    starting: number;
    ending: number;
    netChange: number;
  };
  scaling: {
    min: number;
    max: number;
    factor: number;
  };
  performance: {
    calculationTime: number;
    dataPointCount: number;
  };
}
```

### Performance Architecture

#### Memoization Strategy
```typescript
// Expensive calculations should be memoized
const memoizedCalculations = useMemo(() => {
  return calculateWaterfallPositions(data, {
    includeRunningTotals: true,
    normalizeValues: true,
    groupSimilarCategories: false // Remove arbitrary grouping
  });
}, [data, chartConfig]);

// Component rendering optimization
const MemoizedWaterfallChart = React.memo(WaterfallChart, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error
  );
});
```

#### Real-time Update Strategy
```typescript
// Debounced updates for rapid data changes
const debouncedDataUpdate = useMemo(
  () => debounce((newData: WaterfallDataPoint[]) => {
    setProcessedData(processWaterfallData(newData));
  }, 150),
  []
);

// Intelligent diffing for partial updates
const updateStrategy = useMemo(() => {
  if (isMinorUpdate(prevData, newData)) {
    return 'partial-rerender';
  }
  if (isStructuralChange(prevData, newData)) {
    return 'full-rerender';
  }
  return 'no-update';
}, [prevData, newData]);
```

### Accessibility Architecture

#### Keyboard Navigation Implementation
```typescript
// Comprehensive keyboard support
const useKeyboardNavigation = (dataPoints: ProcessedWaterfallPoint[]) => {
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowRight':
        setFocusedIndex(prev => Math.min(prev + 1, dataPoints.length - 1));
        break;
      case 'ArrowLeft':
        setFocusedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Home':
        setFocusedIndex(0);
        break;
      case 'End':
        setFocusedIndex(dataPoints.length - 1);
        break;
      case 'Enter':
      case ' ':
        if (focusedIndex >= 0) {
          onBarClick?.(dataPoints[focusedIndex]);
        }
        break;
    }
  }, [dataPoints, focusedIndex, onBarClick]);

  return { focusedIndex, handleKeyDown };
};
```

#### Screen Reader Implementation
```typescript
// Live region for dynamic updates
const useLiveRegion = (data: WaterfallDataPoint[], enabled: boolean = true) => {
  const [announcement, setAnnouncement] = useState<string>('');
  
  useEffect(() => {
    if (!enabled) return;
    
    const summary = generateDataSummary(data);
    setAnnouncement(`Chart updated: ${summary}`);
    
    // Clear announcement after screen reader processes it
    const timer = setTimeout(() => setAnnouncement(''), 1000);
    return () => clearTimeout(timer);
  }, [data, enabled]);
  
  return announcement;
};

// ARIA label generation
const generateAriaLabels = (dataPoint: ProcessedWaterfallPoint, index: number, total: number) => {
  return {
    'aria-label': `${dataPoint.label}, ${formatCurrency(dataPoint.value)}, ${dataPoint.type} change, item ${index + 1} of ${total}`,
    'aria-describedby': `waterfall-description-${dataPoint.id}`,
    'aria-posinset': index + 1,
    'aria-setsize': total
  };
};
```

### Data Processing Architecture

#### Calculation Engine Redesign
```typescript
// Simplified and accurate calculation pipeline
export const calculateWaterfallPositions = (
  data: WaterfallDataPoint[],
  options: WaterfallCalculationOptions = {}
): WaterfallCalculationResult => {
  const startTime = performance.now();
  
  // Step 1: Validate and clean data
  const validatedData = validateWaterfallData(data);
  
  // Step 2: Calculate running totals without artificial constraints
  const withRunningTotals = calculateRunningTotals(validatedData);
  
  // Step 3: Determine scaling factors based on actual data range
  const scaling = calculateScalingFactors(withRunningTotals, {
    enforceMinimumWidth: false, // Remove artificial minimum widths
    preserveZeroValues: true,
    handleNegatives: true
  });
  
  // Step 4: Position bars with proportional accuracy
  const positionedData = calculateBarPositions(withRunningTotals, scaling);
  
  const endTime = performance.now();
  
  return {
    dataPoints: positionedData,
    totals: calculateTotals(validatedData),
    scaling,
    performance: {
      calculationTime: endTime - startTime,
      dataPointCount: validatedData.length
    }
  };
};

// Remove category grouping that causes data loss
export const processCategories = (data: WaterfallDataPoint[]): WaterfallDataPoint[] => {
  // Return data as-is, without arbitrary grouping or filtering
  return data.map(point => ({
    ...point,
    // Ensure consistent category naming without modification
    category: point.category.trim(),
    // Preserve all subcategory information
    subcategory: point.subcategory?.trim()
  }));
};
```

### Error Handling Architecture

#### Error Boundary Implementation
```typescript
class WaterfallChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<{ error: Error }> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('WaterfallChart Error:', error, errorInfo);
    // Report to error tracking service
    reportError(error, { component: 'WaterfallChart', ...errorInfo });
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} />;
    }

    return this.props.children;
  }
}
```

#### Graceful Degradation
```typescript
const useGracefulDegradation = (data: WaterfallDataPoint[]) => {
  const [fallbackMode, setFallbackMode] = useState<'none' | 'simplified' | 'table'>('none');
  
  useEffect(() => {
    // Detect if we should fall back to simpler rendering
    if (data.length > 1000) {
      setFallbackMode('simplified');
    } else if (data.length > 5000) {
      setFallbackMode('table');
    } else {
      setFallbackMode('none');
    }
  }, [data.length]);
  
  return { fallbackMode };
};
```

## Approach

### Development Strategy

1. **Incremental Migration**: Replace functionality piece by piece while maintaining backward compatibility
2. **Feature Flags**: Use feature flags to enable new functionality gradually
3. **A/B Testing**: Compare performance and usability metrics between old and new implementations
4. **Progressive Enhancement**: Start with basic functionality and add advanced features incrementally

### Implementation Phases

#### Phase 1: Foundation (Week 1)
- Set up new component structure
- Implement basic rendering without advanced features
- Add comprehensive TypeScript types
- Create testing infrastructure

#### Phase 2: Core Functionality (Week 2-3)
- Implement simplified layout design
- Add performance optimizations
- Integrate with existing dashboard
- Ensure data accuracy and fidelity

#### Phase 3: Accessibility (Week 4)
- Add keyboard navigation
- Implement screen reader support
- Ensure colorblind accessibility
- Add comprehensive ARIA support

#### Phase 4: Testing & Polish (Week 5)
- Complete test coverage
- Performance benchmarking
- Cross-browser testing
- Documentation completion

### Migration Strategy

```typescript
// Feature flag implementation
const useWaterfallChartV2 = () => {
  const { featureFlags } = useFeatureFlags();
  return featureFlags.waterfallChartV2 || false;
};

// Gradual rollout wrapper
const WaterfallChartWrapper: React.FC<WaterfallChartProps> = (props) => {
  const useV2 = useWaterfallChartV2();
  
  if (useV2) {
    return <WaterfallChartV2 {...props} />;
  }
  
  return <WaterfallChartLegacy {...props} />;
};
```

## External Dependencies

### Required Libraries
- **@axe-core/react**: For automated accessibility testing
- **lodash.debounce**: For performance optimization (if not already available)
- **react-window**: For virtualization of large datasets (optional)

### Browser Support
- **Modern Browsers**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **Keyboard Navigation**: Full support across all browsers
- **Screen Readers**: NVDA, JAWS, VoiceOver compatibility
- **Color Vision**: Support for all forms of color vision deficiency

### Performance Targets
- **Initial Load**: < 200ms for datasets up to 100 items
- **Re-render**: < 50ms for data updates
- **Memory Usage**: < 10MB for typical datasets
- **Bundle Size**: < 50KB additional impact

### Integration Requirements
- **Juno Design System**: Full compliance with design tokens and patterns
- **Real-time Data**: Seamless integration with existing data pipeline
- **Dashboard Integration**: Backward compatible with RealtimeDashboard
- **TypeScript**: Strict mode compliance with comprehensive type safety