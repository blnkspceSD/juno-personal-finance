/**
 * Horizontal Waterfall Chart Component using Recharts
 * Shows simplified Income → Spending → Net Result flow
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { ResponsiveBar } from '@nivo/bar'
import { patternLinesDef, linearGradientDef } from '@nivo/core'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewSelector } from '@/components/ui/view-selector'
import { cn } from '@/lib/utils'
import type { WaterfallChartProps, WaterfallDataPoint, TimeViewPeriod } from '@/lib/types/waterfall'
import { 
  formatWaterfallCurrency, 
  generateMockWaterfallDataForMonth,
  generateMockWaterfallDataForDay,
  generateMockWaterfallDataForWeek,
  hasDataForMonth,
  fetchRealWaterfallDataForMonth,
  fetchRealWaterfallDataForDay,
  fetchRealWaterfallDataForWeek,
  getAvailableDataMonths
} from '@/lib/utils/waterfall-calculations'
import { detectOnboardingDataState } from '@/lib/utils/onboarding-states'
import { OnboardingEmptyState } from '@/components/charts/OnboardingEmptyState'
import { BudgetAllocationChart } from '@/components/charts/BudgetAllocationChart'



/**
 * Main Horizontal Waterfall Chart Component (Simplified)
 */
// Helper function to determine the best default view based on data availability
async function getDataDrivenDefaultView(): Promise<TimeViewPeriod> {
  try {
    // Get current date for analysis
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    // Get available data months to analyze data maturity
    const availableMonths = await getAvailableDataMonths()
    
    // Calculate how many days of data we might have
    const daysSinceMonthStart = Math.floor((now.getTime() - currentMonthStart.getTime()) / (1000 * 60 * 60 * 24))
    
    // Check if we have data for the current month
    const hasCurrentMonthData = availableMonths.length > 0 && 
      availableMonths.some(month => {
        // Parse month format like "august-2025" or "july-2025"
        const [monthName, year] = month.split('-')
        const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth()
        return monthIndex === now.getMonth() && 
               parseInt(year) === now.getFullYear()
      })
    
    // Priority 1: Month view if we have substantial month data (15+ days into month)
    if (hasCurrentMonthData && daysSinceMonthStart >= 15) {
      return 'month'
    }
    
    // Priority 2: Week view if we have at least a week of data or multiple months
    if (hasCurrentMonthData && (daysSinceMonthStart >= 7 || availableMonths.length > 1)) {
      return 'week'
    }
    
    // Priority 3: Week view if we have historical data from previous months
    if (availableMonths.length > 0) {
      return 'week'
    }
    
    // Fallback: Day view for minimal or no data
    return 'day'
  } catch (error) {
    console.warn('Failed to determine data-driven default view:', error)
    return 'day' // Safe fallback
  }
}

export function WaterfallChart({
  data,
  height = 200,
  className,
  onDataPointClick,
  defaultView,
  defaultPeriod,
  onViewChange,
  enabledViews = ['day', 'week', 'month'],
  customDateRange,
  periodSelectorProps,
}: WaterfallChartProps) {
  // Enhanced state management for view selection
  const [selectedView, setSelectedView] = useState<TimeViewPeriod>(defaultView || 'day')
  const [selectedMonth, setSelectedMonth] = useState(() => {
    if (defaultPeriod) return defaultPeriod
    return 'august-2025' // Default to august-2025
  })
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [dataState, setDataState] = useState<{
    state: 'no-data' | 'day-data' | 'week-data' | 'month-data' | 'loading';
    disabledViews: TimeViewPeriod[];
  }>({
    state: 'loading', // Start with loading state instead of no-data
    disabledViews: ['week', 'month']
  })

  // Fix SSR/hydration mismatch by only rendering charts on client
  useEffect(() => {
    setIsClient(true)
    
    // Fetch available months and set data-driven default view on client mount
    const loadAvailableMonths = async () => {
      try {
        const months = await getAvailableDataMonths()
        setAvailableMonths(months)
        
        // If current selected month is not available, switch to first available
        if (months.length > 0 && !months.includes(selectedMonth)) {
          setSelectedMonth(months[0])
        }
        
        // Set data-driven default view if no defaultView was provided
        if (!defaultView) {
          const dataDrivenView = await getDataDrivenDefaultView()
          setSelectedView(dataDrivenView)
        }
      } catch (error) {
        console.error('Failed to load available months:', error)
        // Fallback to static list
        setAvailableMonths(['august-2025', 'july-2025', 'june-2025'])
      }
    }
    
    loadAvailableMonths()
  }, [defaultView, selectedMonth])

  // Handle view changes
  const handleViewChange = useCallback((newView: TimeViewPeriod) => {
    setIsLoading(true)
    setSelectedView(newView)
    
    // For now, we'll keep the same period format for all views
    // Later we'll add proper period generation for each view type
    onViewChange?.(newView, selectedMonth)
    
    // Simulate loading (will be replaced with real data generation)
    setTimeout(() => setIsLoading(false), 200)
  }, [onViewChange, selectedMonth])

  // Handle period changes  
  const handlePeriodChange = useCallback((newPeriod: string) => {
    setIsLoading(true)
    setSelectedMonth(newPeriod)
    onViewChange?.(selectedView, newPeriod)
    
    setTimeout(() => setIsLoading(false), 100)
  }, [selectedView, onViewChange])

  // Enhanced data generation with real data fetching
  const [chartData, setChartData] = useState(() => {
    // Initial state with mock data for SSR
    return generateMockWaterfallDataForMonth(selectedMonth)
  })

  // Effect to fetch real data when view or period changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        let data: any
        
        switch (selectedView) {
          case 'day':
            // For day view, use today's date as default
            const today = new Date().toISOString().split('T')[0]
            data = await fetchRealWaterfallDataForDay(today)
            break
          case 'week':
            // For week view, use this week's start date
            const thisWeek = getThisWeekStart()
            data = await fetchRealWaterfallDataForWeek(thisWeek)
            break
          case 'month':
            data = await fetchRealWaterfallDataForMonth(selectedMonth)
            break
          default:
            data = await fetchRealWaterfallDataForMonth(selectedMonth)
        }
        
        console.log('Real data fetched for', selectedView, selectedMonth, ':', JSON.stringify(data, null, 2))
        setChartData(data)
        
        // Detect data state for onboarding logic
        // For demo purposes, default to showing full chart with month data
        let simulatedState: { state: 'no-data' | 'day-data' | 'week-data' | 'month-data'; disabledViews: TimeViewPeriod[] }
        
        if (selectedMonth === 'june-2025') {
          // Simulate no data state only for June
          simulatedState = { state: 'no-data', disabledViews: ['week', 'month'] }
        } else {
          // Default to full month data state to show the chart
          simulatedState = { state: 'month-data', disabledViews: [] }
        }
        
        setDataState(simulatedState)
        
      } catch (error) {
        console.error('Failed to fetch chart data:', error)
        // Fallback to mock data on error
        switch (selectedView) {
          case 'day':
            const today = new Date().toISOString().split('T')[0]
            setChartData(generateMockWaterfallDataForDay(today))
            break
          case 'week':
            const thisWeek = getThisWeekStart()
            setChartData(generateMockWaterfallDataForWeek(thisWeek))
            break
          case 'month':
            setChartData(generateMockWaterfallDataForMonth(selectedMonth))
            break
          default:
            setChartData(generateMockWaterfallDataForMonth(selectedMonth))
        }
        
        // Set appropriate data state for fallback
        setDataState({
          state: 'month-data', // Default to month-data for fallback to show chart
          disabledViews: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedView, selectedMonth])

  // Helper function to get this week's start date
  function getThisWeekStart(): string {
    const now = new Date()
    const day = now.getDay()
    const diff = now.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
    const monday = new Date(now.setDate(diff))
    return monday.toISOString().split('T')[0]
  }
  
  // Keep monthData for backward compatibility (will be replaced)
  const monthData = chartData
  
  // Extract expense categories (excluding income) - these should already be grouped/processed
  const expenseCategories = monthData.categories
    .filter(cat => cat.type === 'expense')
    // Don't slice - the grouping logic has already processed the categories appropriately
  

  // Calculate leftover money
  const totalSpent = expenseCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const leftoverMoney = monthData.totalIncome - totalSpent

  // Calculate dynamic max value based on actual data for appropriate axis intervals
  const maxDataValue = Math.max(monthData.totalIncome, totalSpent)
  const dynamicMax = Math.ceil(maxDataValue * 1.1 / 100) * 100 // 10% padding, round to nearest 100

  // Transform to Nivo horizontal mixed bar format - no padding, start at RM 0
  const chartKeys = ['Income', ...expenseCategories.map(cat => cat.name), 'Leftover']
  
  const incomeRow = {
    category: 'Income',
    Income: monthData.totalIncome,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: 0 }), {}),
    Leftover: 0
  }
  
  const spendingRow = {
    category: 'Spending',
    Income: 0,
    ...expenseCategories.reduce((acc, cat) => ({ ...acc, [cat.name]: cat.amount }), {}),
    Leftover: leftoverMoney
  }

  const nivoData = [spendingRow, incomeRow]
  
  // Color mapping for categories - more flexible matching
  const categoryColors = {
    'Income': '#12B76A',
    'Groceries': '#F5A623', // Orange for food/groceries
    'Food': '#F5A623',
    'Rent/Mortgage': '#EF4040', // Red for housing costs
    'Rent': '#EF4040',
    'Housing': '#EF4040',
    'Bills': '#1D4ED8', // Blue for bills/utilities
    'Utilities': '#1D4ED8',
    'Transport': '#0D9488', // Teal for transport
    'Grab': '#0D9488', // Same color for ride-sharing
    'Travel': '#0D9488',
    'Income tax': '#7c3aed', // Purple for taxes
    'Tax': '#7c3aed',
    'Personal': '#c026d3', // Pink for personal expenses
    'Entertainment': '#c026d3',
    'Shopping': '#c026d3',
    'Leftover': '#808080'
  }

  // Function to get color for any category
  const getCategoryColor = (categoryId: string) => {
    return categoryColors[categoryId as keyof typeof categoryColors] || '#c5c5c5'
  }

  // Function to mute colors by adding neutral-500 overlay (20% opacity)
  const getMutedCategoryColor = (categoryId: string) => {
    const originalColor = getCategoryColor(categoryId)
    if (originalColor === '#c5c5c5') {
      return originalColor
    }
    
    // Convert hex to RGB
    const hex = originalColor.replace('#', '')
    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)
    
    // Neutral-500 gray RGB values: #6b7280 = rgb(107, 114, 128)
    const neutralR = 107
    const neutralG = 114
    const neutralB = 128
    
    // Apply 20% neutral-500 overlay: newColor = originalColor * 0.8 + neutral * 0.2
    const mutedR = Math.round(r * 0.8 + neutralR * 0.2)
    const mutedG = Math.round(g * 0.8 + neutralG * 0.2)
    const mutedB = Math.round(b * 0.8 + neutralB * 0.2)
    
    return `rgb(${mutedR}, ${mutedG}, ${mutedB})`
  }

  // Define line patterns for stripes - updated for real category names
  const linePatterns = [
    patternLinesDef('income-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Income'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('groceries-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Groceries'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('rent-mortgage-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Rent/Mortgage'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('grab-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Grab'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    // Keep original patterns for backward compatibility
    patternLinesDef('rent-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Rent'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('food-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Food'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('bills-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Bills'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('transport-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Transport'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('tax-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Income tax'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
    patternLinesDef('personal-lines', {
      spacing: 14,
      rotation: -45,
      lineWidth: 6,
      background: getMutedCategoryColor('Personal'),
      color: 'rgba(0, 0, 0, 0.05)'
    }),
  ]

  // Define the fill patterns for stripes - updated for real category names
  const fillPatterns = [
    {
      match: { id: 'Income' },
      id: 'income-lines'
    },
    {
      match: { id: 'Groceries' },
      id: 'groceries-lines'
    },
    {
      match: { id: 'Rent/Mortgage' },
      id: 'rent-mortgage-lines'
    },
    {
      match: { id: 'Grab' },
      id: 'grab-lines'
    },
    // Keep original patterns for backward compatibility
    {
      match: { id: 'Rent' },
      id: 'rent-lines'
    },
    {
      match: { id: 'Food' },
      id: 'food-lines'
    },
    {
      match: { id: 'Bills' },
      id: 'bills-lines'
    },
    {
      match: { id: 'Transport' },
      id: 'transport-lines'
    },
    {
      match: { id: 'Income tax' },
      id: 'tax-lines'
    },
    {
      match: { id: 'Personal' },
      id: 'personal-lines'
    }
  ]


  return (
    <div className={cn("space-y-6", className)}>
      {/* Enhanced Chart Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
        <div className="space-y-1">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--juno-text)' }}>
            Cash Flow
          </h1>
          <p className="text-sm" style={{ color: 'var(--juno-muted-fg)' }}>
            {leftoverMoney > 0 
              ? `Saving ${formatWaterfallCurrency(leftoverMoney)} this ${selectedView === 'month' ? 'month' : selectedView === 'week' ? 'week' : 'day'} • ${((leftoverMoney / monthData.totalIncome) * 100).toFixed(1)}% savings rate`
              : leftoverMoney === 0
              ? `Breaking even this ${selectedView === 'month' ? 'month' : selectedView === 'week' ? 'week' : 'day'} • Consider optimizing expenses`
              : `Overspending by ${formatWaterfallCurrency(Math.abs(leftoverMoney))} this ${selectedView === 'month' ? 'month' : selectedView === 'week' ? 'week' : 'day'} • ${((Math.abs(leftoverMoney) / monthData.totalIncome) * 100).toFixed(1)}% over budget`
            }
          </p>
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:gap-4 sm:space-y-0">
          {/* New ViewSelector Component */}
          <ViewSelector
            selectedView={selectedView}
            onViewChange={handleViewChange}
            disabled={[...dataState.disabledViews, 'custom']} // Disable based on data state + custom
            enabledViews={enabledViews}
            size="md"
            className="w-full sm:w-auto"
          />
          
          {/* Enhanced Period Selector */}
          <Select value={selectedMonth} onValueChange={handlePeriodChange} disabled={isLoading}>
            <SelectTrigger className="w-full sm:w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.length > 0 ? (
                availableMonths.map(month => {
                  // Convert month key to display label
                  const [monthName, year] = month.split('-')
                  const displayLabel = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
                  
                  return (
                    <SelectItem key={month} value={month}>
                      {displayLabel}
                    </SelectItem>
                  )
                })
              ) : (
                // Fallback static options while loading
                <>
                  <SelectItem value="august-2025" disabled={!hasDataForMonth('august-2025')}>August 2025</SelectItem>
                  <SelectItem value="july-2025" disabled={!hasDataForMonth('july-2025')}>July 2025</SelectItem>
                  <SelectItem value="june-2025" disabled={!hasDataForMonth('june-2025')}>June 2025</SelectItem>
                  <SelectItem value="may-2025" disabled={!hasDataForMonth('may-2025')}>May 2025</SelectItem>
                  <SelectItem value="april-2025" disabled={!hasDataForMonth('april-2025')}>April 2025</SelectItem>
                  <SelectItem value="march-2025" disabled={!hasDataForMonth('march-2025')}>March 2025</SelectItem>
                  <SelectItem value="february-2025" disabled={!hasDataForMonth('february-2025')}>February 2025</SelectItem>
                  <SelectItem value="january-2025" disabled={!hasDataForMonth('january-2025')}>January 2025</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Conditional Chart Rendering Based on Data State */}
      <div className="w-full" style={{ height: `${height + 100}px` }}>
        {isClient ? (
          <div className="relative w-full h-full">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--juno-muted-fg)' }}>
                  <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" 
                       style={{ borderColor: 'var(--juno-primary)', borderTopColor: 'transparent' }} />
                  Loading {selectedView} data...
                </div>
              </div>
            )}
            
            {/* Render based on data state */}
            {dataState.state === 'loading' ? (
              // Show loading state while data is being fetched
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--juno-muted-fg)' }}>
                  <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" 
                       style={{ borderColor: 'var(--juno-primary)', borderTopColor: 'transparent' }} />
                  Loading chart data...
                </div>
              </div>
            ) : dataState.state === 'no-data' ? (
              // Show empty state when no data
              <OnboardingEmptyState 
                onAddTransaction={() => {
                  // TODO: Implement add transaction modal
                  console.log('Add transaction clicked')
                }}
                className="h-full"
              />
            ) : (
              // Show single unified chart combining budget and actual spending
              <div className="w-full h-full">
                <style jsx global>{`
                  /* Leftover section styling */
                  .leftover-section {
                    fill: url(#neutral-stripes) !important;
                    rx: 8px !important;
                    ry: 8px !important;
                    stroke: none !important;
                  }
                  
                  .leftover-section:hover {
                    fill: url(#neutral-stripes-hover) !important;
                  }
                  
                  /* Hover effect for chart bars using white tint overlay */
                  .chart-bar-hover {
                    filter: brightness(1.2) !important;
                    transition: filter 0.2s ease !important;
                  }
                  
                  /* Specific hover effect for leftover bar - slightly darker */
                  .leftover-bar-hover {
                    filter: brightness(0.85) !important;
                    transition: filter 0.2s ease !important;
                  }
                `}</style>
                {/* Custom SVG patterns for leftover section */}
                <svg width="0" height="0">
                  <defs>
                    {/* Neutral stripes for leftover section */}
                    <pattern id="neutral-stripes" patternUnits="userSpaceOnUse" width="8" height="8">
                      <path d="M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4" stroke="#6b7280" strokeWidth="1"/>
                    </pattern>
                    <pattern id="neutral-stripes-hover" patternUnits="userSpaceOnUse" width="8" height="8">
                      <path d="M 0,8 l 8,-8 M -2,2 l 4,-4 M 6,10 l 4,-4" stroke="#4b5563" strokeWidth="1"/>
                    </pattern>
                  </defs>
                </svg>
                <ResponsiveBar
                  key={`waterfall-chart-${selectedView}`}
                  data={nivoData}
                  keys={chartKeys}
                  indexBy="category"
                  layout="horizontal"
                  margin={{ 
                    top: 40, 
                    right: 140,
                    left: 140,
                    bottom: 60 
                  }}
                  groupMode="stacked"
                  valueScale={{ 
                    type: 'linear',
                    min: 0,
                    max: dynamicMax
                  }}
                  indexScale={{ type: 'band', round: true }}
                  colors={({ id }) => {
                    if (id === 'Leftover') {
                      return leftoverMoney > 0 ? '#e9ecef' : 'transparent'
                    }
                    return getMutedCategoryColor(String(id))
                  }}
                  defs={linePatterns}
                  fill={fillPatterns}
                  onMouseEnter={(data, event) => {
                    const element = event.target as SVGElement
                    if (element) {
                      if (data.id === 'Leftover') {
                        element.classList.add('leftover-bar-hover')
                      } else {
                        element.classList.add('chart-bar-hover')
                      }
                    }
                  }}
                  onMouseLeave={(data, event) => {
                    const element = event.target as SVGElement
                    if (element) {
                      if (data.id === 'Leftover') {
                        element.classList.remove('leftover-bar-hover')
                      } else {
                        element.classList.remove('chart-bar-hover')
                      }
                    }
                  }}
                  theme={{
                    grid: {
                      line: {
                        stroke: '#e2e8f0',
                        strokeWidth: 1,
                        strokeDasharray: '3 3'
                      }
                    },
                    axis: {
                      ticks: {
                        text: {
                          fontSize: 14
                        }
                      },
                      legend: {
                        text: {
                          fontSize: 14
                        }
                      }
                    },
                    tooltip: {
                      container: {
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }
                    }
                  }}
                  axisTop={null}
                  axisRight={null}
                  axisBottom={{
                    tickSize: 0,
                    tickPadding: 5,
                    tickRotation: 0,
                    legend: null,
                    legendPosition: 'middle',
                    legendOffset: 32,
                    format: value => {
                      if (value >= 1000) {
                        return `RM${(value / 1000).toFixed(1)}k`
                      } else {
                        return `RM${value}`
                      }
                    }
                  }}
                  axisLeft={{
                    tickSize: 0,
                    tickPadding: 29,
                    tickRotation: 0,
                    legend: '',
                    legendPosition: 'middle',
                    legendOffset: -40
                  }}
                  enableLabel={false}
                  tooltip={({ id, value }) => {
                    const correctColor = id === 'Leftover' ? (leftoverMoney > 0 ? '#e9ecef' : 'transparent')
                      : getCategoryColor(String(id))
                    
                    const categoryData = chartData.categories.find(cat => cat.name === id)
                    const percentage = categoryData?.type === 'expense' 
                      ? ((categoryData.originalAmount || categoryData.amount) / totalSpent * 100).toFixed(1)
                      : ((categoryData?.amount || 0) / monthData.totalIncome * 100).toFixed(1)
                    
                    const isAdjusted = categoryData?.originalAmount && 
                      categoryData.originalAmount !== categoryData.amount
                    
                    return (
                      <div className="bg-white rounded-lg p-3 border shadow-lg max-w-64">
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: correctColor }}
                          />
                          <span className="font-medium">{id}</span>
                        </div>
                        
                        <div className="space-y-1 text-sm">
                          <div className="font-medium text-lg">
                            RM{value.toLocaleString()}
                          </div>
                          
                          <div className="text-gray-600">
                            {percentage}% of {categoryData?.type === 'expense' ? 'spending' : 'income'}
                          </div>
                          
                          {/* Show original amount if adjusted for visibility */}
                          {isAdjusted && (
                            <div className="text-xs text-orange-600 border-t pt-1 mt-2">
                              Original: RM{(categoryData.originalAmount || 0).toLocaleString()}
                              <br />
                              <span className="text-gray-500">
                                * Segment enlarged for visibility
                              </span>
                            </div>
                          )}
                          
                          {/* Show grouped categories if this is "Other" */}
                          {categoryData?.isGrouped && categoryData.groupedCategories && (
                            <div className="text-xs text-gray-600 border-t pt-1 mt-2">
                              Includes: {categoryData.groupedCategories.join(', ')}
                            </div>
                          )}
                          
                          {id === 'Leftover' && (
                            <div className="text-xs text-gray-600">
                              {leftoverMoney > 0 ? 'Money saved this period' : 'Budget deficit'}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  }}
                  enableGridY={false}
                  enableGridX={true}
                  animate={true}
                  motionConfig="gentle"
                  borderRadius={12}
                  padding={0.4}
                  innerPadding={2}
                  layers={[
                    'grid',
                    'axes',
                    'bars',
                    'markers',
                    'legends',
                    // Custom layer for segment labels
                    ({ bars, innerWidth, innerHeight }) => {
                      return (
                        <g>
                          {bars.map((bar) => {
                            const segmentWidth = Math.abs(bar.width)
                            const segmentHeight = Math.abs(bar.height)
                            const centerX = bar.x + bar.width / 2
                            const centerY = bar.y + bar.height / 2
                            
                            // Only show labels on segments that are wide enough (minimum 60px)
                            if (segmentWidth < 60) return null
                            
                            // Format the value
                            const value = Math.abs((bar.data.data as any)[bar.data.id as string] as number)
                            const formattedValue = value >= 1000 
                              ? `RM${(value / 1000).toFixed(1)}k`
                              : `RM${value.toLocaleString()}`
                            
                            // Skip if value is 0
                            if (value === 0) return null
                            
                            return (
                              <text
                                key={`${bar.data.indexValue}-${bar.data.id}-label`}
                                x={centerX}
                                y={centerY}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                style={{
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  fill: 'white',
                                  textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                  pointerEvents: 'none'
                                }}
                              >
                                {formattedValue}
                              </text>
                            )
                          })}
                        </g>
                      )
                    }
                  ]}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-sm text-muted-foreground">Loading chart...</div>
            </div>
          </div>
        )}
      </div>

      {/* Summary Statistics - Simplified */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center p-4 rounded-xl border" 
             style={{ 
               backgroundColor: 'var(--juno-surface-100)',
               borderColor: 'var(--juno-border)',
               boxShadow: 'var(--juno-shadow-soft-with-stroke)'
             }}>
          <div className="text-sm mb-1" style={{ color: 'var(--juno-muted-fg)' }}>Total Income</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--juno-success)' }}>
            {formatWaterfallCurrency(monthData.totalIncome)}
          </div>
        </div>
        <div className="text-center p-4 rounded-xl border" 
             style={{ 
               backgroundColor: 'var(--juno-surface-100)',
               borderColor: 'var(--juno-border)',
               boxShadow: 'var(--juno-shadow-soft-with-stroke)'
             }}>
          <div className="text-sm mb-1" style={{ color: 'var(--juno-muted-fg)' }}>Total Spending</div>
          <div className="text-lg font-semibold" style={{ color: 'var(--juno-danger)' }}>
            -{formatWaterfallCurrency(monthData.totalExpenses)}
          </div>
        </div>
        <div className="text-center p-4 rounded-xl border" 
             style={{ 
               backgroundColor: 'var(--juno-surface-100)',
               borderColor: 'var(--juno-border)',
               boxShadow: 'var(--juno-shadow-soft-with-stroke)'
             }}>
          <div className="text-sm mb-1" style={{ color: 'var(--juno-muted-fg)' }}>Net Amount</div>
          <div className={cn(
            "text-lg font-semibold",
            monthData.netAmount >= 0 ? "text-green-600" : "text-red-600"
          )}>
            {monthData.netAmount >= 0 ? '+' : ''}{formatWaterfallCurrency(monthData.netAmount)}
          </div>
        </div>
      </div>

  
    </div>
  )
}

export default WaterfallChart