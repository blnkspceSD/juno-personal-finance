/**
 * Node.js Performance Audit Runner
 * Runs performance tests for WaterfallChart utilities
 */

import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Mock performance API for Node.js
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
    memory: {
      usedJSHeapSize: process.memoryUsage().heapUsed,
      totalJSHeapSize: process.memoryUsage().heapTotal,
      jsHeapSizeLimit: process.memoryUsage().heapTotal * 2
    }
  }
}

// Mock console for grouped output
const originalLog = console.log
const originalGroup = console.group || (() => {})
const originalGroupEnd = console.groupEnd || (() => {})

class PerformanceAuditRunner {
  constructor() {
    this.results = []
  }

  async runTest(testName, testFn, threshold = 100) {
    console.log(`🧪 Running: ${testName}`)
    
    const memBefore = process.memoryUsage().heapUsed
    const start = performance.now()
    
    try {
      await testFn()
      const end = performance.now()
      const memAfter = process.memoryUsage().heapUsed
      
      const duration = end - start
      const memDelta = (memAfter - memBefore) / 1024 / 1024 // MB
      const status = duration <= threshold ? '✅ PASS' : '❌ FAIL'
      
      const result = {
        testName,
        duration: duration.toFixed(2),
        memoryDelta: memDelta.toFixed(2),
        threshold,
        status
      }
      
      this.results.push(result)
      console.log(`   ${status} ${duration.toFixed(2)}ms (threshold: ${threshold}ms, memory: ${memDelta.toFixed(2)}MB)`)
      
      return result
    } catch (error) {
      console.error(`   ❌ ERROR: ${error.message}`)
      this.results.push({
        testName,
        duration: 'ERROR',
        memoryDelta: '0',
        threshold,
        status: '❌ ERROR',
        error: error.message
      })
    }
  }

  generateReport() {
    console.log('\n📊 Performance Audit Report')
    console.log('=' .repeat(50))
    console.log(`📅 Generated: ${new Date().toISOString()}`)
    console.log(`🧪 Total Tests: ${this.results.length}`)
    
    const passed = this.results.filter(r => r.status === '✅ PASS').length
    const failed = this.results.filter(r => r.status === '❌ FAIL').length
    const errors = this.results.filter(r => r.status === '❌ ERROR').length
    
    console.log(`✅ Passed: ${passed}`)
    console.log(`❌ Failed: ${failed}`)
    console.log(`💥 Errors: ${errors}`)
    console.log('')

    if (failed > 0 || errors > 0) {
      console.log('⚠️ Issues Found:')
      this.results
        .filter(r => r.status !== '✅ PASS')
        .forEach(r => {
          console.log(`   • ${r.testName}: ${r.duration}ms (threshold: ${r.threshold}ms)`)
        })
    }

    console.log('\n💡 Recommendations:')
    if (failed > 0) {
      console.log('   • Implement memoization for slow operations')
      console.log('   • Add performance optimization to data transformations')
      console.log('   • Consider reducing computational complexity')
    }
    if (errors > 0) {
      console.log('   • Fix implementation errors before optimization')
      console.log('   • Ensure all dependencies are properly mocked')
    }
    if (passed === this.results.length) {
      console.log('   • All tests passing - ready for optimization phase')
    }

    return {
      total: this.results.length,
      passed,
      failed,
      errors,
      results: this.results
    }
  }
}

// Mock waterfall data generation functions for testing
function generateMockWaterfallDataForDay() {
  const categories = [
    { id: '1', name: 'Groceries', amount: 50, type: 'expense', color: '#ef4444' },
    { id: '2', name: 'Transport', amount: 15, type: 'expense', color: '#f97316' }
  ]
  
  return {
    dataPoints: [],
    totalIncome: 200,
    totalExpenses: 65,
    netAmount: 135,
    categories
  }
}

function generateMockWaterfallDataForWeek() {
  const categories = []
  for (let i = 0; i < 7; i++) {
    categories.push({
      id: `day-${i}`,
      name: `Day ${i + 1}`,
      amount: Math.random() * 100,
      type: 'expense',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    })
  }
  
  return {
    dataPoints: [],
    totalIncome: 1400,
    totalExpenses: categories.reduce((sum, cat) => sum + cat.amount, 0),
    netAmount: 1400 - categories.reduce((sum, cat) => sum + cat.amount, 0),
    categories
  }
}

function generateMockWaterfallDataForMonth() {
  const categories = []
  const categoryNames = ['Groceries', 'Transport', 'Entertainment', 'Bills', 'Shopping', 'Dining', 'Healthcare', 'Education']
  
  for (let i = 0; i < categoryNames.length; i++) {
    categories.push({
      id: `cat-${i}`,
      name: categoryNames[i],
      amount: Math.random() * 500 + 100,
      allocated: Math.random() * 600 + 150,
      type: 'expense',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`
    })
  }
  
  return {
    dataPoints: [],
    totalIncome: 5000,
    totalExpenses: categories.reduce((sum, cat) => sum + cat.amount, 0),
    netAmount: 5000 - categories.reduce((sum, cat) => sum + cat.amount, 0),
    categories
  }
}

// Test data transformation functions
function testNivoDataTransformation(mockData) {
  const expenseCategories = mockData.categories.filter(cat => cat.type === 'expense')
  const totalSpent = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const leftoverMoney = mockData.totalIncome - totalSpent
  
  const spendingRow = {
    category: 'Spending',
    Income: 0,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.amount }), {}),
    Leftover: leftoverMoney
  }
  
  const incomeRow = {
    category: 'Income',
    Income: mockData.totalIncome,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {}),
    Leftover: 0
  }
  
  const budgetRow = {
    category: 'Budget',
    Income: 0,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.allocated || cat.amount * 1.2 }), {}),
    Leftover: 0
  }
  
  return [spendingRow, incomeRow, budgetRow]
}

// Main audit function
async function runAudit() {
  console.log('🔍 WaterfallChart Performance Audit')
  console.log('📦 Testing Core Data Operations')
  console.log('')
  
  const runner = new PerformanceAuditRunner()
  
  // Test 1: Mock data generation
  await runner.runTest(
    'Generate Mock Day Data',
    () => generateMockWaterfallDataForDay(),
    25 // 25ms threshold
  )
  
  await runner.runTest(
    'Generate Mock Week Data', 
    () => generateMockWaterfallDataForWeek(),
    50 // 50ms threshold
  )
  
  await runner.runTest(
    'Generate Mock Month Data',
    () => generateMockWaterfallDataForMonth(),
    75 // 75ms threshold
  )
  
  // Test 2: Data transformations
  const monthData = generateMockWaterfallDataForMonth()
  
  await runner.runTest(
    'Nivo Data Transformation (Small)',
    () => testNivoDataTransformation(generateMockWaterfallDataForDay()),
    15 // 15ms threshold
  )
  
  await runner.runTest(
    'Nivo Data Transformation (Medium)',
    () => testNivoDataTransformation(generateMockWaterfallDataForWeek()),
    25 // 25ms threshold
  )
  
  await runner.runTest(
    'Nivo Data Transformation (Large)',
    () => testNivoDataTransformation(monthData),
    40 // 40ms threshold
  )
  
  // Test 3: Rapid operations (simulating real-time updates)
  await runner.runTest(
    'Rapid Data Updates (10x)',
    () => {
      for (let i = 0; i < 10; i++) {
        testNivoDataTransformation(generateMockWaterfallDataForMonth())
      }
    },
    100 // 100ms threshold for 10 operations
  )
  
  // Test 4: Memory intensive operations
  await runner.runTest(
    'Large Dataset Processing',
    () => {
      const largeData = generateMockWaterfallDataForMonth()
      // Add many more categories
      for (let i = 0; i < 50; i++) {
        largeData.categories.push({
          id: `extra-${i}`,
          name: `Category ${i}`,
          amount: Math.random() * 100,
          type: 'expense',
          color: '#666666'
        })
      }
      return testNivoDataTransformation(largeData)
    },
    150 // 150ms threshold for large dataset
  )
  
  // Generate final report
  const report = runner.generateReport()
  
  // Save results to file for review
  try {
    const fs = await import('fs')
    const reportData = {
      timestamp: new Date().toISOString(),
      summary: {
        total: report.total,
        passed: report.passed,
        failed: report.failed,
        errors: report.errors
      },
      results: report.results,
      environment: {
        node: process.version,
        platform: process.platform,
        memory: process.memoryUsage()
      }
    }
    
    fs.writeFileSync('performance-audit-results.json', JSON.stringify(reportData, null, 2))
    console.log('\n💾 Results saved to: performance-audit-results.json')
  } catch (error) {
    console.warn('⚠️ Could not save results to file:', error.message)
  }
  
  console.log('\n✅ Performance audit completed!')
  return report
}

// Run the audit
runAudit().catch(console.error)