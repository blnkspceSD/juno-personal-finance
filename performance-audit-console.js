/**
 * Browser Console Script for WaterfallChart Performance Audit
 * Run this in the browser console while viewing the dashboard
 */

// Performance audit runner for browser console
async function runWaterfallChartAudit() {
  console.log('🔍 Starting WaterfallChart Performance Audit...')
  console.log('📅 Timestamp:', new Date().toISOString())
  
  try {
    // Import the performance test module (if available)
    if (typeof window !== 'undefined' && window.__NEXT_DATA__) {
      console.log('✅ Next.js environment detected')
    }

    // Test 1: Monitor current chart render times
    console.group('📊 Test 1: Current Chart Performance')
    
    // Measure current chart container
    const chartContainer = document.querySelector('[data-chart="waterfall"]') || 
                          document.querySelector('.space-y-6') || 
                          document.querySelector('[class*="waterfall"]')
    
    if (chartContainer) {
      console.log('✅ Chart container found')
      
      // Measure current DOM complexity
      const elements = chartContainer.querySelectorAll('*')
      console.log(`📊 DOM Elements: ${elements.length}`)
      
      // Check for SVG elements (chart rendered)
      const svgElements = chartContainer.querySelectorAll('svg')
      console.log(`🎨 SVG Elements: ${svgElements.length}`)
      
      // Check for pattern definitions (Nivo patterns)
      const patterns = chartContainer.querySelectorAll('pattern')
      console.log(`🎭 Pattern Definitions: ${patterns.length}`)
    } else {
      console.warn('⚠️ Chart container not found - may not be rendered yet')
    }
    console.groupEnd()

    // Test 2: Memory usage baseline
    console.group('💾 Test 2: Memory Usage Analysis')
    if (performance.memory) {
      const memory = performance.memory
      console.log('📊 Memory Usage:', {
        used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
        limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
      })
    } else {
      console.warn('⚠️ Memory API not available')
    }
    console.groupEnd()

    // Test 3: Network requests analysis
    console.group('🌐 Test 3: Network Performance')
    const resources = performance.getEntriesByType('resource')
    const chartRelated = resources.filter(r => 
      r.name.includes('nivo') || 
      r.name.includes('chart') || 
      r.name.includes('waterfall')
    )
    
    console.log(`📊 Total Resources: ${resources.length}`)
    console.log(`📈 Chart-related Resources: ${chartRelated.length}`)
    
    if (chartRelated.length > 0) {
      chartRelated.forEach(resource => {
        console.log(`📦 ${resource.name}: ${resource.duration.toFixed(2)}ms`)
      })
    }
    console.groupEnd()

    // Test 4: Interaction performance
    console.group('⚡ Test 4: Interaction Performance')
    
    // Find interactive elements
    const buttons = document.querySelectorAll('button')
    const selects = document.querySelectorAll('select, [role="combobox"]')
    
    console.log(`🔘 Interactive Buttons: ${buttons.length}`)
    console.log(`📋 Select Elements: ${selects.length}`)
    
    // Test click responsiveness
    let clickDelay = 0
    const testButton = Array.from(buttons).find(btn => 
      btn.textContent?.includes('day') || 
      btn.textContent?.includes('week') || 
      btn.textContent?.includes('month')
    )
    
    if (testButton) {
      console.log('🧪 Testing button click responsiveness...')
      const start = performance.now()
      
      // Simulate click event
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      })
      
      testButton.dispatchEvent(clickEvent)
      const end = performance.now()
      clickDelay = end - start
      
      console.log(`⚡ Click Response Time: ${clickDelay.toFixed(2)}ms`)
    }
    console.groupEnd()

    // Test 5: Chart rendering pipeline
    console.group('🎨 Test 5: Chart Rendering Analysis')
    
    // Check for performance marks
    const marks = performance.getEntriesByType('mark')
    const measures = performance.getEntriesByType('measure')
    
    console.log(`📊 Performance Marks: ${marks.length}`)
    console.log(`📏 Performance Measures: ${measures.length}`)
    
    // Filter chart-related measurements
    const chartMarks = marks.filter(m => m.name.includes('chart') || m.name.includes('waterfall'))
    const chartMeasures = measures.filter(m => m.name.includes('chart') || m.name.includes('waterfall'))
    
    if (chartMeasures.length > 0) {
      console.log('🎯 Chart Performance Measures:')
      chartMeasures.forEach(measure => {
        const status = measure.duration > 200 ? '❌ SLOW' : '✅ OK'
        console.log(`  ${measure.name}: ${measure.duration.toFixed(2)}ms ${status}`)
      })
    }
    console.groupEnd()

    // Generate summary report
    console.group('📋 Performance Audit Summary')
    
    const issues = []
    const recommendations = []
    
    // Analyze results and generate issues
    if (performance.memory && performance.memory.usedJSHeapSize > 10 * 1024 * 1024) {
      issues.push('High memory usage detected (>10MB)')
      recommendations.push('Implement data cleanup and memory optimization')
    }
    
    if (clickDelay > 100) {
      issues.push(`Slow interaction response time (${clickDelay.toFixed(2)}ms)`)
      recommendations.push('Optimize event handlers and state updates')
    }
    
    const slowMeasures = measures.filter(m => m.duration > 200)
    if (slowMeasures.length > 0) {
      issues.push(`${slowMeasures.length} slow performance measurements detected`)
      recommendations.push('Implement render optimization and memoization')
    }
    
    // Report issues
    if (issues.length > 0) {
      console.group('⚠️ Issues Found')
      issues.forEach((issue, i) => {
        console.warn(`${i + 1}. ${issue}`)
      })
      console.groupEnd()
      
      console.group('💡 Recommendations')
      recommendations.forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`)
      })
      console.groupEnd()
    } else {
      console.log('✅ No critical performance issues detected')
    }
    
    // Performance score
    let score = 100
    if (issues.length > 0) score -= issues.length * 20
    if (score < 0) score = 0
    
    console.log(`🏆 Performance Score: ${score}/100`)
    console.groupEnd()

    return {
      score,
      issues,
      recommendations,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    console.error('❌ Performance audit failed:', error)
    throw error
  }
}

// Test specific chart operations
function testChartDataTransformation() {
  console.group('🧪 Chart Data Transformation Test')
  
  const testData = {
    totalIncome: 5000,
    categories: [
      { name: 'Groceries', amount: 500, allocated: 600, type: 'expense', color: '#ef4444' },
      { name: 'Transport', amount: 200, allocated: 250, type: 'expense', color: '#f97316' },
      { name: 'Entertainment', amount: 150, allocated: 200, type: 'expense', color: '#3b82f6' }
    ]
  }
  
  console.time('Data Transformation')
  
  // Simulate the transformation logic
  const expenseCategories = testData.categories.filter(cat => cat.type === 'expense')
  const totalSpent = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const leftoverMoney = testData.totalIncome - totalSpent
  
  const chartKeys = ['Income', ...expenseCategories.map(cat => cat.name), 'Leftover']
  
  const spendingRow = {
    category: 'Spending',
    Income: 0,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.amount }), {}),
    Leftover: leftoverMoney
  }
  
  const incomeRow = {
    category: 'Income',
    Income: testData.totalIncome,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {}),
    Leftover: 0
  }
  
  const budgetRow = {
    category: 'Budget',
    Income: 0,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.allocated }), {}),
    Leftover: 0
  }
  
  const nivoData = [spendingRow, incomeRow, budgetRow]
  
  console.timeEnd('Data Transformation')
  console.log('✅ Transformation completed', { chartKeys, nivoData })
  console.groupEnd()
  
  return nivoData
}

// Export functions for global access
if (typeof window !== 'undefined') {
  window.runWaterfallChartAudit = runWaterfallChartAudit
  window.testChartDataTransformation = testChartDataTransformation
  
  console.log('🚀 Performance audit tools loaded!')
  console.log('📋 Available commands:')
  console.log('  • runWaterfallChartAudit() - Full performance audit')
  console.log('  • testChartDataTransformation() - Test data transformation speed')
}