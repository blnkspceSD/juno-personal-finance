/**
 * Performance Analysis Utilities for WaterfallChart Optimization
 * Measures render times, memory usage, and identifies bottlenecks
 */

interface PerformanceMetrics {
  renderTime: number
  memoryUsage: number
  dataTransformTime: number
  reRenderCount: number
  timestamp: number
}

interface ChartPerformanceProfile {
  componentName: string
  metrics: PerformanceMetrics[]
  averages: {
    renderTime: number
    memoryUsage: number
    dataTransformTime: number
  }
  bottlenecks: string[]
}

class PerformanceProfiler {
  private profiles: Map<string, ChartPerformanceProfile> = new Map()
  private renderCount: Map<string, number> = new Map()

  /**
   * Start performance measurement for a component
   */
  startMeasurement(componentName: string): string {
    const measurementId = `${componentName}-${Date.now()}`
    performance.mark(`${measurementId}-start`)
    return measurementId
  }

  /**
   * End performance measurement and record metrics
   */
  endMeasurement(measurementId: string, componentName: string, dataSize: number = 0) {
    performance.mark(`${measurementId}-end`)
    performance.measure(measurementId, `${measurementId}-start`, `${measurementId}-end`)
    
    const measure = performance.getEntriesByName(measurementId)[0]
    const renderTime = measure.duration

    // Get memory usage if available
    const memoryInfo = (performance as any).memory
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0 // MB

    // Record render count
    const currentCount = this.renderCount.get(componentName) || 0
    this.renderCount.set(componentName, currentCount + 1)

    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage,
      dataTransformTime: 0, // Will be set separately
      reRenderCount: currentCount + 1,
      timestamp: Date.now()
    }

    this.recordMetrics(componentName, metrics, dataSize)
    
    // Clean up performance entries
    performance.clearMarks(`${measurementId}-start`)
    performance.clearMarks(`${measurementId}-end`)
    performance.clearMeasures(measurementId)

    return metrics
  }

  /**
   * Measure data transformation performance
   */
  measureDataTransform<T>(fn: () => T, componentName: string): T {
    const start = performance.now()
    const result = fn()
    const end = performance.now()
    const transformTime = end - start

    // Update the latest metrics entry with transform time
    const profile = this.profiles.get(componentName)
    if (profile && profile.metrics.length > 0) {
      profile.metrics[profile.metrics.length - 1].dataTransformTime = transformTime
    }

    return result
  }

  /**
   * Record performance metrics for a component
   */
  private recordMetrics(componentName: string, metrics: PerformanceMetrics, dataSize: number) {
    let profile = this.profiles.get(componentName)
    
    if (!profile) {
      profile = {
        componentName,
        metrics: [],
        averages: { renderTime: 0, memoryUsage: 0, dataTransformTime: 0 },
        bottlenecks: []
      }
      this.profiles.set(componentName, profile)
    }

    profile.metrics.push(metrics)

    // Keep only last 50 measurements to prevent memory leaks
    if (profile.metrics.length > 50) {
      profile.metrics = profile.metrics.slice(-50)
    }

    // Update averages
    this.updateAverages(profile)
    
    // Identify bottlenecks
    this.identifyBottlenecks(profile, dataSize)
  }

  /**
   * Update average performance metrics
   */
  private updateAverages(profile: ChartPerformanceProfile) {
    const metrics = profile.metrics
    const count = metrics.length

    profile.averages.renderTime = metrics.reduce((sum, m) => sum + m.renderTime, 0) / count
    profile.averages.memoryUsage = metrics.reduce((sum, m) => sum + m.memoryUsage, 0) / count
    profile.averages.dataTransformTime = metrics.reduce((sum, m) => sum + m.dataTransformTime, 0) / count
  }

  /**
   * Identify performance bottlenecks
   */
  private identifyBottlenecks(profile: ChartPerformanceProfile, dataSize: number) {
    const bottlenecks: string[] = []
    const { renderTime, memoryUsage, dataTransformTime } = profile.averages

    // Render time bottlenecks
    if (renderTime > 200) {
      bottlenecks.push(`Slow render: ${renderTime.toFixed(1)}ms (target: <200ms)`)
    }

    // Memory usage bottlenecks
    if (memoryUsage > 10) {
      bottlenecks.push(`High memory usage: ${memoryUsage.toFixed(1)}MB (target: <10MB)`)
    }

    // Data transform bottlenecks
    if (dataTransformTime > 50) {
      bottlenecks.push(`Slow data transform: ${dataTransformTime.toFixed(1)}ms (target: <50ms)`)
    }

    // Re-render frequency bottlenecks
    const recentRenders = profile.metrics.filter(m => Date.now() - m.timestamp < 5000).length
    if (recentRenders > 10) {
      bottlenecks.push(`Too many re-renders: ${recentRenders} in 5s (target: <5)`)
    }

    profile.bottlenecks = bottlenecks
  }

  /**
   * Get performance report for a component
   */
  getPerformanceReport(componentName: string): ChartPerformanceProfile | null {
    return this.profiles.get(componentName) || null
  }

  /**
   * Get performance summary for all components
   */
  getPerformanceSummary(): Record<string, ChartPerformanceProfile> {
    const summary: Record<string, ChartPerformanceProfile> = {}
    this.profiles.forEach((profile, name) => {
      summary[name] = profile
    })
    return summary
  }

  /**
   * Log performance report to console
   */
  logPerformanceReport(componentName?: string) {
    if (componentName) {
      const profile = this.profiles.get(componentName)
      if (profile) {
        console.group(`🔍 Performance Report: ${componentName}`)
        console.log('📊 Averages:', profile.averages)
        console.log('🔄 Recent measurements:', profile.metrics.slice(-5))
        if (profile.bottlenecks.length > 0) {
          console.warn('⚠️ Bottlenecks:', profile.bottlenecks)
        } else {
          console.log('✅ No performance issues detected')
        }
        console.groupEnd()
      }
    } else {
      // Log all profiles
      console.group('🔍 Performance Report: All Components')
      this.profiles.forEach((profile, name) => {
        console.group(`📊 ${name}`)
        console.log('Averages:', profile.averages)
        if (profile.bottlenecks.length > 0) {
          console.warn('Bottlenecks:', profile.bottlenecks)
        }
        console.groupEnd()
      })
      console.groupEnd()
    }
  }

  /**
   * Reset performance data for a component
   */
  resetProfile(componentName: string) {
    this.profiles.delete(componentName)
    this.renderCount.delete(componentName)
  }

  /**
   * Reset all performance data
   */
  resetAllProfiles() {
    this.profiles.clear()
    this.renderCount.clear()
  }
}

// Global profiler instance
export const chartProfiler = new PerformanceProfiler()

/**
 * React Hook for performance measurement
 */
export function useChartPerformance(componentName: string) {
  return {
    startMeasurement: () => chartProfiler.startMeasurement(componentName),
    endMeasurement: (measurementId: string, dataSize?: number) => 
      chartProfiler.endMeasurement(measurementId, componentName, dataSize),
    measureDataTransform: <T>(fn: () => T) => 
      chartProfiler.measureDataTransform(fn, componentName),
    getReport: () => chartProfiler.getPerformanceReport(componentName),
    logReport: () => chartProfiler.logPerformanceReport(componentName)
  }
}

/**
 * Performance measurement decorator for functions
 */
export function measurePerformance<T extends (...args: any[]) => any>(
  fn: T,
  functionName: string
): T {
  return ((...args: any[]) => {
    const start = performance.now()
    const result = fn(...args)
    const end = performance.now()
    
    console.log(`⏱️ ${functionName}: ${(end - start).toFixed(2)}ms`)
    
    return result
  }) as T
}

/**
 * Memory usage measurement utility
 */
export function measureMemoryUsage(): number {
  const memoryInfo = (performance as any).memory
  return memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0 // MB
}

/**
 * Current performance baseline constants (targets)
 */
export const PERFORMANCE_TARGETS = {
  RENDER_TIME_MS: 200,
  RE_RENDER_TIME_MS: 50,
  MEMORY_USAGE_MB: 10,
  DATA_TRANSFORM_MS: 50,
  MAX_RERENDERS_PER_5S: 5
} as const

/**
 * Performance analysis for specific chart data transformations
 */
export function analyzeChartDataPerformance() {
  console.group('📈 Chart Data Performance Analysis')
  
  // Test mock data generation performance
  const mockDataTests = [
    { name: 'Mock Day Data', size: 'small', fn: () => import('../utils/waterfall-calculations').then(m => m.generateMockWaterfallDataForDay('2025-08-17')) },
    { name: 'Mock Week Data', size: 'medium', fn: () => import('../utils/waterfall-calculations').then(m => m.generateMockWaterfallDataForWeek('2025-08-11')) },
    { name: 'Mock Month Data', size: 'large', fn: () => import('../utils/waterfall-calculations').then(m => m.generateMockWaterfallDataForMonth('august-2025')) }
  ]

  mockDataTests.forEach(async (test) => {
    const start = performance.now()
    await test.fn()
    const end = performance.now()
    const duration = end - start
    
    console.log(`${test.name} (${test.size}):`, {
      duration: `${duration.toFixed(2)}ms`,
      status: duration > PERFORMANCE_TARGETS.DATA_TRANSFORM_MS ? '⚠️ SLOW' : '✅ OK'
    })
  })
  
  console.groupEnd()
}