/**
 * Chart Data Caching and Optimization Utilities
 * Provides caching mechanisms for expensive chart calculations
 */

import { useMemo, useRef, useCallback } from 'react'
import type { Transaction, BudgetData, CategoryData, DataMaturityAnalysis } from '@/lib/types/chart-progression'

/**
 * Cache key generator for data analysis
 */
export function generateCacheKey(
  transactions: Transaction[],
  budget?: BudgetData,
  categories?: CategoryData[]
): string {
  const transactionHash = transactions
    .map(t => `${t.id}-${t.amount}-${t.categoryId}`)
    .sort()
    .join('|')
  
  const budgetHash = budget 
    ? `${budget.id}-${budget.totalIncome}-${budget.categories.length}`
    : 'no-budget'
    
  const categoryHash = categories
    ? categories.map(c => `${c.id}-${c.allocated}-${c.spent}`).sort().join('|')
    : 'no-categories'
  
  return `${transactionHash}::${budgetHash}::${categoryHash}`
}

/**
 * LRU Cache implementation for chart data
 */
class ChartDataCache<T> {
  private cache = new Map<string, { value: T; timestamp: number; hits: number }>()
  private maxSize: number
  private ttl: number // Time to live in milliseconds

  constructor(maxSize = 100, ttlMinutes = 30) {
    this.maxSize = maxSize
    this.ttl = ttlMinutes * 60 * 1000
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    // Update hit count and timestamp for LRU
    entry.hits++
    entry.timestamp = Date.now()
    return entry.value
  }

  set(key: string, value: T): void {
    // If cache is full, remove least recently used items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 1
    })
  }

  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()
    let leastHits = Infinity

    for (const [key, entry] of this.cache.entries()) {
      // Prioritize by hits first, then by timestamp
      if (entry.hits < leastHits || (entry.hits === leastHits && entry.timestamp < oldestTime)) {
        oldestTime = entry.timestamp
        leastHits = entry.hits
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  clear(): void {
    this.cache.clear()
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        hits: entry.hits,
        age: Date.now() - entry.timestamp
      }))
    }
  }
}

// Global cache instances
const dataAnalysisCache = new ChartDataCache<DataMaturityAnalysis>(50, 15)
const chartDataCache = new ChartDataCache<any>(100, 30)

/**
 * Hook for cached data analysis with performance monitoring
 */
export function useCachedDataAnalysis(
  transactions: Transaction[],
  budget?: BudgetData,
  analysisFunction?: (transactions: Transaction[], budget?: BudgetData) => DataMaturityAnalysis
) {
  const performanceRef = useRef<{ hits: number; misses: number; totalTime: number }>({
    hits: 0,
    misses: 0,
    totalTime: 0
  })

  const memoizedAnalysis = useMemo(() => {
    if (!analysisFunction) return null

    const startTime = performance.now()
    const cacheKey = generateCacheKey(transactions, budget)
    
    // Try to get from cache first
    const cached = dataAnalysisCache.get(cacheKey)
    if (cached) {
      performanceRef.current.hits++
      const endTime = performance.now()
      performanceRef.current.totalTime += (endTime - startTime)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Cache HIT for data analysis (${(endTime - startTime).toFixed(2)}ms)`)
      }
      
      return cached
    }

    // Cache miss - calculate and store
    performanceRef.current.misses++
    const analysis = analysisFunction(transactions, budget)
    dataAnalysisCache.set(cacheKey, analysis)
    
    const endTime = performance.now()
    performanceRef.current.totalTime += (endTime - startTime)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Cache MISS for data analysis (${(endTime - startTime).toFixed(2)}ms)`)
    }
    
    return analysis
  }, [transactions, budget, analysisFunction])

  const getPerformanceStats = useCallback(() => {
    const stats = performanceRef.current
    const hitRate = stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses) * 100).toFixed(1)
      : '0'
    
    return {
      ...stats,
      hitRate: `${hitRate}%`,
      avgTime: stats.hits + stats.misses > 0 
        ? (stats.totalTime / (stats.hits + stats.misses)).toFixed(2)
        : '0'
    }
  }, [])

  return {
    analysis: memoizedAnalysis,
    cacheStats: getPerformanceStats(),
    clearCache: () => dataAnalysisCache.clear()
  }
}

/**
 * Hook for cached chart data transformations
 */
export function useCachedChartData<T>(
  key: string,
  dependencies: any[],
  computeFunction: () => T
): T {
  return useMemo(() => {
    const cacheKey = `${key}::${JSON.stringify(dependencies)}`
    
    // Try cache first
    const cached = chartDataCache.get(cacheKey)
    if (cached) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`📊 Chart data cache HIT for ${key}`)
      }
      return cached
    }

    // Cache miss - compute and store
    const result = computeFunction()
    chartDataCache.set(cacheKey, result)
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Chart data cache MISS for ${key}`)
    }
    
    return result
  }, dependencies)
}

/**
 * Performance monitoring utilities
 */
export class ChartPerformanceMonitor {
  private static measurements = new Map<string, number[]>()

  static startMeasurement(name: string): () => number {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const duration = endTime - startTime
      
      if (!this.measurements.has(name)) {
        this.measurements.set(name, [])
      }
      
      const measurements = this.measurements.get(name)!
      measurements.push(duration)
      
      // Keep only last 100 measurements
      if (measurements.length > 100) {
        measurements.shift()
      }
      
      return duration
    }
  }

  static getStats(name: string) {
    const measurements = this.measurements.get(name) || []
    if (measurements.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0, latest: 0 }
    }

    const avg = measurements.reduce((sum, val) => sum + val, 0) / measurements.length
    const min = Math.min(...measurements)
    const max = Math.max(...measurements)
    const latest = measurements[measurements.length - 1]

    return {
      count: measurements.length,
      avg: parseFloat(avg.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      latest: parseFloat(latest.toFixed(2))
    }
  }

  static getAllStats() {
    const allStats: Record<string, any> = {}
    for (const [name] of this.measurements.entries()) {
      allStats[name] = this.getStats(name)
    }
    return allStats
  }

  static reset(name?: string) {
    if (name) {
      this.measurements.delete(name)
    } else {
      this.measurements.clear()
    }
  }
}

/**
 * Debounced function for expensive operations
 */
export function useDebounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>()

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      func(...args)
    }, delay)
  }, [func, delay]) as T
}

export { dataAnalysisCache, chartDataCache }