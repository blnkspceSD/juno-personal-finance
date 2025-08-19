# Performance Specification

This is the performance specification for the spec detailed in @.agent-os/specs/2025-08-17-waterfall-chart-optimization/spec.md

> Created: 2025-08-17
> Version: 1.0.0

## Performance Requirements

### Target Metrics

#### Load Performance
- **Initial Paint**: < 100ms
- **First Contentful Paint**: < 150ms  
- **Chart Ready State**: < 200ms
- **Interactive State**: < 250ms
- **Bundle Size Impact**: < 50KB additional

#### Runtime Performance
- **Data Update Processing**: < 50ms for typical datasets (100 items)
- **Re-render Time**: < 16ms (60 FPS) for smooth animations
- **Memory Usage**: < 10MB for datasets up to 1000 items
- **CPU Usage**: < 20% during active updates

#### Real-time Performance
- **Update Latency**: < 100ms from data change to visual update
- **Debounce Effectiveness**: Handle up to 10 updates/second gracefully
- **Memory Leaks**: Zero memory growth over 1 hour of continuous updates

### Optimization Strategies

#### Component-Level Optimizations

##### Memoization Implementation
```typescript
// Expensive calculation memoization
const useMemoizedCalculations = (data: WaterfallDataPoint[], config: ChartConfig) => {
  return useMemo(() => {
    const startTime = performance.now();
    
    // Core calculations
    const processedData = processWaterfallData(data, config);
    const positions = calculateBarPositions(processedData);
    const scaling = calculateScalingFactors(processedData);
    
    const endTime = performance.now();
    
    // Performance monitoring
    if (endTime - startTime > 10) {
      console.warn(`Slow calculation detected: ${endTime - startTime}ms`);
    }
    
    return {
      processedData,
      positions,
      scaling,
      calculationTime: endTime - startTime
    };
  }, [data, config]);
};

// Component memoization with shallow comparison
const WaterfallChart = React.memo<WaterfallChartProps>(({
  data,
  loading,
  error,
  onBarClick,
  accessibility,
  performance
}) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for performance optimization
  return (
    shallowEqual(prevProps.data, nextProps.data) &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.onBarClick === nextProps.onBarClick
  );
});

// Callback memoization
const useStableCallbacks = (onBarClick?: (dataPoint: WaterfallDataPoint) => void) => {
  return useMemo(() => ({
    onBarClick: onBarClick ? (dataPoint: WaterfallDataPoint) => {
      // Debounce rapid clicks
      debounce(() => onBarClick(dataPoint), 100)();
    } : undefined
  }), [onBarClick]);
};
```

##### Virtual Scrolling for Large Datasets
```typescript
// Virtual scrolling implementation
const useVirtualization = (
  data: ProcessedWaterfallPoint[],
  containerWidth: number,
  enabled: boolean = true
) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const itemWidth = 80; // Minimum bar width
  const visibleCount = Math.ceil(containerWidth / itemWidth);
  
  const updateVisibleRange = useCallback(
    throttle((scrollLeft: number) => {
      if (!enabled || data.length <= visibleCount) return;
      
      const start = Math.floor(scrollLeft / itemWidth);
      const end = Math.min(start + visibleCount + 5, data.length); // Buffer
      
      setVisibleRange({ start, end });
    }, 16), // 60 FPS
    [data.length, visibleCount, itemWidth, enabled]
  );
  
  const visibleData = enabled && data.length > visibleCount 
    ? data.slice(visibleRange.start, visibleRange.end)
    : data;
  
  return {
    visibleData,
    visibleRange,
    updateVisibleRange,
    totalWidth: data.length * itemWidth,
    isVirtualized: enabled && data.length > visibleCount
  };
};
```

#### Data Processing Optimizations

##### Efficient Data Transformations
```typescript
// Optimized waterfall calculations
export const calculateWaterfallPositionsOptimized = (
  data: WaterfallDataPoint[],
  options: WaterfallCalculationOptions = {}
): WaterfallCalculationResult => {
  // Early returns for edge cases
  if (!data?.length) {
    return createEmptyResult();
  }
  
  if (data.length === 1) {
    return createSingleItemResult(data[0]);
  }
  
  const startTime = performance.now();
  
  // Use typed arrays for better performance with large datasets
  const values = new Float64Array(data.length);
  const runningTotals = new Float64Array(data.length + 1);
  
  // Single pass for running totals calculation
  let currentTotal = 0;
  runningTotals[0] = 0;
  
  for (let i = 0; i < data.length; i++) {
    values[i] = data[i].value;
    currentTotal += values[i];
    runningTotals[i + 1] = currentTotal;
  }
  
  // Calculate scaling factors
  const min = Math.min(...runningTotals);
  const max = Math.max(...runningTotals);
  const range = max - min;
  const scalingFactor = range > 0 ? 1 / range : 1;
  
  // Build result array
  const processedData: ProcessedWaterfallPoint[] = new Array(data.length);
  
  for (let i = 0; i < data.length; i++) {
    processedData[i] = {
      ...data[i],
      runningTotal: runningTotals[i + 1],
      startingPosition: runningTotals[i],
      normalizedValue: values[i] * scalingFactor,
      normalizedPosition: runningTotals[i] * scalingFactor
    };
  }
  
  const endTime = performance.now();
  
  return {
    dataPoints: processedData,
    totals: {
      starting: runningTotals[0],
      ending: runningTotals[data.length],
      netChange: currentTotal
    },
    scaling: {
      min,
      max,
      factor: scalingFactor
    },
    performance: {
      calculationTime: endTime - startTime,
      dataPointCount: data.length
    }
  };
};

// Memoized data processing pipeline
const useDataPipeline = (rawData: WaterfallDataPoint[]) => {
  const processedData = useMemo(() => {
    if (!rawData?.length) return [];
    
    // Validate data structure (fast check)
    const validData = rawData.filter(isValidDataPoint);
    
    // Sort by timestamp for correct ordering
    validData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    return validData;
  }, [rawData]);
  
  const calculationResult = useMemo(() => {
    return calculateWaterfallPositionsOptimized(processedData);
  }, [processedData]);
  
  return calculationResult;
};
```

#### Real-time Update Optimizations

##### Intelligent Update Strategies
```typescript
// Debounced updates with intelligent batching
const useOptimizedUpdates = (
  data: WaterfallDataPoint[],
  updateCallback: (data: ProcessedWaterfallPoint[]) => void
) => {
  const [pendingUpdates, setPendingUpdates] = useState<WaterfallDataPoint[]>([]);
  const lastProcessedRef = useRef<WaterfallDataPoint[]>([]);
  
  // Determine update strategy based on change type
  const getUpdateStrategy = useCallback((
    oldData: WaterfallDataPoint[],
    newData: WaterfallDataPoint[]
  ): 'none' | 'append' | 'partial' | 'full' => {
    if (oldData === newData) return 'none';
    if (!oldData.length) return 'full';
    if (newData.length > oldData.length && 
        newData.slice(0, oldData.length).every((item, i) => item === oldData[i])) {
      return 'append';
    }
    if (Math.abs(newData.length - oldData.length) < 5) {
      return 'partial';
    }
    return 'full';
  }, []);
  
  // Optimized update processor
  const processUpdate = useCallback(
    debounce((newData: WaterfallDataPoint[]) => {
      const strategy = getUpdateStrategy(lastProcessedRef.current, newData);
      
      switch (strategy) {
        case 'none':
          return;
          
        case 'append':
          // Only process new items
          const newItems = newData.slice(lastProcessedRef.current.length);
          const processed = processNewItems(newItems, lastProcessedRef.current);
          updateCallback(processed);
          break;
          
        case 'partial':
          // Use differential update
          const diff = calculateDataDiff(lastProcessedRef.current, newData);
          const partiallyProcessed = applyDifferentialUpdate(diff);
          updateCallback(partiallyProcessed);
          break;
          
        case 'full':
          // Full reprocessing
          const fullyProcessed = calculateWaterfallPositionsOptimized(newData);
          updateCallback(fullyProcessed.dataPoints);
          break;
      }
      
      lastProcessedRef.current = newData;
    }, 150), // 150ms debounce for optimal responsiveness
    [getUpdateStrategy, updateCallback]
  );
  
  useEffect(() => {
    processUpdate(data);
  }, [data, processUpdate]);
  
  return { strategy: getUpdateStrategy(lastProcessedRef.current, data) };
};

// Frame-based animation updates
const useFrameBasedUpdates = () => {
  const rafRef = useRef<number>();
  const updateQueueRef = useRef<(() => void)[]>([]);
  
  const scheduleUpdate = useCallback((updateFn: () => void) => {
    updateQueueRef.current.push(updateFn);
    
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        // Process all queued updates in a single frame
        const updates = updateQueueRef.current.splice(0);
        updates.forEach(update => update());
        rafRef.current = undefined;
      });
    }
  }, []);
  
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);
  
  return { scheduleUpdate };
};
```

### Memory Management

#### Memory Leak Prevention
```typescript
// Cleanup hooks for preventing memory leaks
const useMemoryCleanup = () => {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const listenersRef = useRef<Map<EventTarget, { event: string; handler: EventListener }>>(new Map());
  
  const addTimeout = useCallback((timeout: NodeJS.Timeout) => {
    timeoutsRef.current.add(timeout);
    return timeout;
  }, []);
  
  const addInterval = useCallback((interval: NodeJS.Timeout) => {
    intervalsRef.current.add(interval);
    return interval;
  }, []);
  
  const addEventListener = useCallback((
    target: EventTarget,
    event: string,
    handler: EventListener,
    options?: AddEventListenerOptions
  ) => {
    target.addEventListener(event, handler, options);
    listenersRef.current.set(target, { event, handler });
  }, []);
  
  useEffect(() => {
    return () => {
      // Clear all timeouts
      timeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      timeoutsRef.current.clear();
      
      // Clear all intervals
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current.clear();
      
      // Remove all event listeners
      listenersRef.current.forEach(({ event, handler }, target) => {
        target.removeEventListener(event, handler);
      });
      listenersRef.current.clear();
    };
  }, []);
  
  return { addTimeout, addInterval, addEventListener };
};

// Memory usage monitoring
const useMemoryMonitoring = (componentName: string) => {
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  
  useEffect(() => {
    const monitor = () => {
      if ('memory' in performance) {
        const usage = (performance as any).memory.usedJSHeapSize;
        setMemoryUsage(usage);
        
        // Warn if memory usage is high
        if (usage > 50 * 1024 * 1024) { // 50MB
          console.warn(`High memory usage in ${componentName}: ${(usage / 1024 / 1024).toFixed(2)}MB`);
        }
      }
    };
    
    const interval = setInterval(monitor, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [componentName]);
  
  return memoryUsage;
};
```

### Performance Monitoring

#### Runtime Performance Tracking
```typescript
// Performance metrics collection
interface PerformanceMetrics {
  renderTime: number;
  calculationTime: number;
  updateTime: number;
  memoryUsage: number;
  frameRate: number;
  bundleSize: number;
}

const usePerformanceMetrics = (): PerformanceMetrics => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    calculationTime: 0,
    updateTime: 0,
    memoryUsage: 0,
    frameRate: 60,
    bundleSize: 0
  });
  
  const measureRenderTime = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({ ...prev, renderTime }));
      
      // Log slow renders
      if (renderTime > 16) {
        console.warn(`Slow render in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    };
  }, []);
  
  const measureCalculationTime = useCallback((calculationName: string) => {
    const startTime = performance.now();
    
    return (result?: any) => {
      const endTime = performance.now();
      const calculationTime = endTime - startTime;
      
      setMetrics(prev => ({ ...prev, calculationTime }));
      
      // Log slow calculations
      if (calculationTime > 10) {
        console.warn(`Slow calculation ${calculationName}: ${calculationTime.toFixed(2)}ms`);
      }
      
      return result;
    };
  }, []);
  
  return { ...metrics, measureRenderTime, measureCalculationTime };
};

// Frame rate monitoring
const useFrameRateMonitor = () => {
  const [frameRate, setFrameRate] = useState(60);
  const frameTimesRef = useRef<number[]>([]);
  
  useEffect(() => {
    let animationId: number;
    let lastTime = performance.now();
    
    const measureFrameRate = (currentTime: number) => {
      const delta = currentTime - lastTime;
      frameTimesRef.current.push(delta);
      
      // Keep only last 60 frame times (1 second at 60fps)
      if (frameTimesRef.current.length > 60) {
        frameTimesRef.current.shift();
      }
      
      // Calculate average frame rate
      if (frameTimesRef.current.length >= 10) {
        const averageDelta = frameTimesRef.current.reduce((a, b) => a + b) / frameTimesRef.current.length;
        const fps = 1000 / averageDelta;
        setFrameRate(fps);
      }
      
      lastTime = currentTime;
      animationId = requestAnimationFrame(measureFrameRate);
    };
    
    animationId = requestAnimationFrame(measureFrameRate);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, []);
  
  return frameRate;
};
```

### Bundle Size Optimization

#### Code Splitting Strategies
```typescript
// Lazy loading for optional features
const AccessibilityFeatures = React.lazy(() => 
  import('./AccessibilityFeatures').then(module => ({ 
    default: module.AccessibilityFeatures 
  }))
);

const AdvancedAnalytics = React.lazy(() =>
  import('./AdvancedAnalytics').then(module => ({
    default: module.AdvancedAnalytics
  }))
);

// Conditional feature loading
const WaterfallChartWithFeatures: React.FC<WaterfallChartProps> = (props) => {
  const { accessibility, analytics } = props;
  
  return (
    <WaterfallChart {...props}>
      {accessibility?.enabled && (
        <Suspense fallback={<div>Loading accessibility features...</div>}>
          <AccessibilityFeatures {...accessibility} />
        </Suspense>
      )}
      
      {analytics?.enabled && (
        <Suspense fallback={<div>Loading analytics...</div>}>
          <AdvancedAnalytics {...analytics} />
        </Suspense>
      )}
    </WaterfallChart>
  );
};

// Tree shaking optimization
export {
  WaterfallChart,
  WaterfallChartWithFeatures,
  useWaterfallCalculations,
  type WaterfallChartProps,
  type WaterfallDataPoint
};

// Avoid default exports to improve tree shaking
// Use named exports consistently
```

## Performance Testing Strategy

### Automated Performance Tests
```typescript
// Performance benchmark tests
describe('WaterfallChart Performance', () => {
  test('should render within performance budget', async () => {
    const startTime = performance.now();
    
    render(<WaterfallChart data={generateMockData(100)} />);
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    expect(renderTime).toBeLessThan(200); // 200ms budget
  });
  
  test('should handle large datasets efficiently', async () => {
    const largeDataset = generateMockData(1000);
    const startTime = performance.now();
    
    const result = calculateWaterfallPositionsOptimized(largeDataset);
    
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    
    expect(calculationTime).toBeLessThan(100); // 100ms for 1000 items
    expect(result.dataPoints).toHaveLength(1000);
  });
  
  test('should not leak memory during updates', async () => {
    const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    const { rerender } = render(<WaterfallChart data={generateMockData(50)} />);
    
    // Simulate many updates
    for (let i = 0; i < 100; i++) {
      rerender(<WaterfallChart data={generateMockData(50)} />);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryGrowth = finalMemory - initialMemory;
    
    expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024); // Less than 5MB growth
  });
});
```

### Continuous Performance Monitoring
- **Lighthouse CI**: Automated performance audits in CI/CD
- **Bundle Analyzer**: Track bundle size changes
- **Real User Monitoring**: Production performance metrics
- **Memory Profiling**: Regular memory usage analysis
- **Frame Rate Monitoring**: Smooth animation verification

### Performance Budgets
- **JavaScript Bundle**: 50KB additional impact
- **Initial Load Time**: 200ms maximum
- **Update Processing**: 50ms maximum
- **Memory Usage**: 10MB maximum for typical use
- **Frame Rate**: Maintain 60 FPS during updates