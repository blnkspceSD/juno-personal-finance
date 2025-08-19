/**
 * Performance Test Suite for Current WaterfallChart
 * Measures baseline performance before optimization
 */

import { 
  generateMockWaterfallDataForDay,
  generateMockWaterfallDataForWeek, 
  generateMockWaterfallDataForMonth,
  fetchRealWaterfallDataForMonth,
  fetchRealWaterfallDataForWeek,
  fetchRealWaterfallDataForDay
} from './waterfall-calculations'
import { PERFORMANCE_TARGETS } from './performance-analysis'

interface PerformanceTestResult {
  testName: string
  duration: number
  memoryBefore: number
  memoryAfter: number
  memoryDelta: number
  dataSize: number
  status: 'PASS' | 'FAIL'
  threshold: number
}

class ChartPerformanceTester {
  private results: PerformanceTestResult[] = []

  /**
   * Get current memory usage in MB
   */
  private getMemoryUsage(): number {
    const memoryInfo = (performance as any).memory
    return memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0
  }

  /**
   * Run a performance test on a function
   */
  private async runTest<T>(
    testName: string,
    fn: () => T | Promise<T>,
    threshold: number,
    dataSize: number = 0
  ): Promise<PerformanceTestResult> {
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }

    const memoryBefore = this.getMemoryUsage()
    const start = performance.now()
    
    await fn()
    
    const end = performance.now()
    const memoryAfter = this.getMemoryUsage()
    
    const duration = end - start
    const memoryDelta = memoryAfter - memoryBefore
    const status = duration <= threshold ? 'PASS' : 'FAIL'

    const result: PerformanceTestResult = {
      testName,
      duration,
      memoryBefore,
      memoryAfter,
      memoryDelta,
      dataSize,
      status,
      threshold
    }

    this.results.push(result)
    return result
  }

  /**
   * Test mock data generation performance
   */
  async testMockDataGeneration(): Promise<void> {
    console.log('🧪 Testing Mock Data Generation Performance...')

    await this.runTest(
      'Generate Mock Day Data',
      () => generateMockWaterfallDataForDay('2025-08-17'),
      PERFORMANCE_TARGETS.DATA_TRANSFORM_MS,
      1
    )

    await this.runTest(
      'Generate Mock Week Data',
      () => generateMockWaterfallDataForWeek('2025-08-11'),
      PERFORMANCE_TARGETS.DATA_TRANSFORM_MS,
      7
    )

    await this.runTest(
      'Generate Mock Month Data',
      () => generateMockWaterfallDataForMonth('august-2025'),
      PERFORMANCE_TARGETS.DATA_TRANSFORM_MS,
      30
    )
  }

  /**
   * Test real data fetching performance
   */
  async testRealDataFetching(): Promise<void> {
    console.log('🧪 Testing Real Data Fetching Performance...')

    await this.runTest(
      'Fetch Real Day Data',
      () => fetchRealWaterfallDataForDay('2025-08-17'),
      PERFORMANCE_TARGETS.DATA_TRANSFORM_MS * 2, // Allow more time for async operations
      1
    )

    await this.runTest(
      'Fetch Real Week Data', 
      () => fetchRealWaterfallDataForWeek('2025-08-11'),
      PERFORMANCE_TARGETS.DATA_TRANSFORM_MS * 2,
      7
    )

    await this.runTest(
      'Fetch Real Month Data',
      () => fetchRealWaterfallDataForMonth('august-2025'),
      PERFORMANCE_TARGETS.DATA_TRANSFORM_MS * 2,
      30
    )
  }

  /**
   * Test data transformation performance
   */
  async testDataTransformations(): Promise<void> {
    console.log('🧪 Testing Data Transformation Performance...')

    // Generate sample data
    const monthData = generateMockWaterfallDataForMonth('august-2025')
    
    // Test category grouping
    await this.runTest(
      'Category Grouping Transformation',
      () => {
        // Simulate the expensive category grouping logic
        const categories = monthData.categories
        const grouped = categories.reduce((acc, cat) => {
          const key = cat.type
          if (!acc[key]) acc[key] = []
          acc[key].push(cat)
          return acc
        }, {} as Record<string, typeof categories>)
        return grouped
      },
      25, // Should be faster than 25ms
      monthData.categories.length
    )

    // Test Nivo data transformation
    await this.runTest(
      'Nivo Data Structure Transformation',
      () => {
        // Simulate the complex Nivo data transformation
        const expenseCategories = monthData.categories.filter(cat => cat.type === 'expense')
        const totalSpent = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)
        const leftoverMoney = monthData.totalIncome - totalSpent

        const chartKeys = ['Income', ...expenseCategories.map(cat => cat.name), 'Leftover']
        
        const spendingRow = {
          category: 'Spending',
          Income: 0,
          ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.amount }), {}),
          Leftover: leftoverMoney
        }

        const incomeRow = {
          category: 'Income',
          Income: monthData.totalIncome,
          ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {}),
          Leftover: 0
        }

        const budgetRow = {
          category: 'Budget',
          Income: 0,
          ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.allocated || 0 }), {}),
          Leftover: 0
        }

        return [spendingRow, incomeRow, budgetRow]
      },
      15, // Should be very fast
      monthData.categories.length
    )
  }

  /**
   * Test multiple rapid data updates (simulating real-time updates)
   */
  async testRapidUpdates(): Promise<void> {
    console.log('🧪 Testing Rapid Data Updates Performance...')

    await this.runTest(
      'Rapid Data Updates (10 updates)',
      () => {
        // Simulate 10 rapid updates
        for (let i = 0; i < 10; i++) {
          generateMockWaterfallDataForMonth('august-2025')
        }
      },
      PERFORMANCE_TARGETS.RE_RENDER_TIME_MS * 10, // 10 updates should complete in 500ms
      10
    )
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): void {
    console.group('📊 WaterfallChart Performance Audit Report')
    console.log('Generated:', new Date().toISOString())
    console.log('Target Benchmarks:', PERFORMANCE_TARGETS)
    console.log('')

    // Group results by category
    const categories = {
      'Mock Data Generation': this.results.filter(r => r.testName.includes('Generate Mock')),
      'Real Data Fetching': this.results.filter(r => r.testName.includes('Fetch Real')),
      'Data Transformations': this.results.filter(r => r.testName.includes('Transformation')),
      'Rapid Updates': this.results.filter(r => r.testName.includes('Rapid'))
    }

    Object.entries(categories).forEach(([category, tests]) => {
      if (tests.length === 0) return

      console.group(`📈 ${category}`)
      tests.forEach(test => {
        const statusIcon = test.status === 'PASS' ? '✅' : '❌'
        const durationFormatted = test.duration.toFixed(2)
        const memoryFormatted = test.memoryDelta.toFixed(2)
        
        console.log(`${statusIcon} ${test.testName}:`, {
          duration: `${durationFormatted}ms (threshold: ${test.threshold}ms)`,
          memory: `${memoryFormatted}MB delta`,
          dataSize: test.dataSize
        })
      })
      console.groupEnd()
    })

    // Summary statistics
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.status === 'PASS').length
    const failedTests = totalTests - passedTests
    const averageDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / totalTests
    const totalMemoryDelta = this.results.reduce((sum, r) => sum + r.memoryDelta, 0)

    console.group('📊 Summary')
    console.log(`Tests: ${passedTests}/${totalTests} passed (${failedTests} failed)`)
    console.log(`Average Duration: ${averageDuration.toFixed(2)}ms`)
    console.log(`Total Memory Delta: ${totalMemoryDelta.toFixed(2)}MB`)
    console.groupEnd()

    // Identify critical issues
    const criticalIssues = this.results
      .filter(r => r.status === 'FAIL')
      .map(r => `${r.testName}: ${r.duration.toFixed(2)}ms (expected <${r.threshold}ms)`)

    if (criticalIssues.length > 0) {
      console.group('⚠️ Critical Performance Issues')
      criticalIssues.forEach(issue => console.warn(issue))
      console.groupEnd()
    }

    // Recommendations
    console.group('💡 Optimization Recommendations')
    if (this.results.some(r => r.testName.includes('Transformation') && r.status === 'FAIL')) {
      console.log('• Add memoization for data transformations')
      console.log('• Consider useMemo for expensive calculations')
    }
    if (this.results.some(r => r.testName.includes('Fetch') && r.status === 'FAIL')) {
      console.log('• Implement data caching for API calls')
      console.log('• Add loading states to prevent blocking renders')
    }
    if (this.results.some(r => r.testName.includes('Rapid') && r.status === 'FAIL')) {
      console.log('• Implement debouncing for rapid updates')
      console.log('• Use React.memo to prevent unnecessary re-renders')
    }
    if (this.results.some(r => r.memoryDelta > 5)) {
      console.log('• Investigate memory leaks in data processing')
      console.log('• Consider data cleanup after transformations')
    }
    console.groupEnd()

    console.groupEnd()
  }

  /**
   * Export results for further analysis
   */
  exportResults(): PerformanceTestResult[] {
    return [...this.results]
  }

  /**
   * Reset test results
   */
  reset(): void {
    this.results = []
  }
}

/**
 * Run complete performance audit
 */
export async function runPerformanceAudit(): Promise<PerformanceTestResult[]> {
  const tester = new ChartPerformanceTester()
  
  try {
    await tester.testMockDataGeneration()
    await tester.testRealDataFetching()
    await tester.testDataTransformations()
    await tester.testRapidUpdates()
    
    tester.generateReport()
    return tester.exportResults()
  } catch (error) {
    console.error('❌ Performance audit failed:', error)
    throw error
  }
}

// Export the tester class for manual testing
export { ChartPerformanceTester }