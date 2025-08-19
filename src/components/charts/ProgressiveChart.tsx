/**
 * Progressive Chart System
 * Intelligent chart component that evolves with user data maturity
 */

'use client'

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { analyzeDataMaturity, shouldAutoProgress, validateChartStage, DEFAULT_PROGRESSION_CONFIG } from '@/lib/utils/chart-progression'
import { generateChartTitle, generateChartDescription, generateStageChangeAnnouncement, createAriaLiveUpdate } from '@/lib/utils/chart-accessibility'
import { useCachedDataAnalysis, ChartPerformanceMonitor } from '@/lib/utils/chart-cache'
import type {
  ProgressiveChartProps,
  ChartStage,
  DataMaturityAnalysis,
  ChartProgressionConfig
} from '@/lib/types/chart-progression'

// Import chart components (will be created in next tasks)
import { EmptyStateChart } from './EmptyStateChart'
import { BarChart } from './BarChart'
import { TreemapChart } from './TreemapChart'
import { SankeyChart } from './SankeyChart'
import { ChartLoadingState, ChartLoadingOverlay } from './ChartLoadingState'

/**
 * Main Progressive Chart Component
 * Automatically selects and renders the optimal chart type based on data maturity
 */
export const ProgressiveChart = React.memo(function ProgressiveChart({
  transactions = [],
  budget,
  categories = [],
  config = DEFAULT_PROGRESSION_CONFIG as ChartProgressionConfig,
  transitionConfig = {
    enableTransitions: true,
    transitionDuration: 300,
    transitionType: 'fade',
    preserveContext: true
  },
  forceStage,
  onStageChange,
  onEducationRequest,
  onDataInsight,
  height = 640,
  className = '',
  isLoading: externalIsLoading = false
}: ProgressiveChartProps) {
  
  // Chart stage state
  const [currentStage, setCurrentStage] = useState<ChartStage>('empty-state')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [analysisCache, setAnalysisCache] = useState<DataMaturityAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Accessibility state
  const [ariaLiveMessage, setAriaLiveMessage] = useState('')
  const [chartDescription, setChartDescription] = useState('')
  
  // Analyze data maturity with performance monitoring
  const dataAnalysis = useMemo(() => {
    const endMeasurement = ChartPerformanceMonitor.startMeasurement('data-analysis')
    const analysis = analyzeDataMaturity(transactions, budget, config as ChartProgressionConfig)
    const duration = endMeasurement()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Data analysis: ${duration.toFixed(2)}ms`)
    }
    
    return analysis
  }, [transactions, budget, config])
  
  // Update analysis cache and accessibility descriptions
  useEffect(() => {
    setAnalysisCache(dataAnalysis)
    
    // Update chart description for screen readers
    const description = generateChartDescription(currentStage, dataAnalysis, categories, budget)
    setChartDescription(description)
  }, [dataAnalysis, currentStage, categories, budget])
  
  // Determine target stage (either forced or recommended)
  const targetStage = useMemo(() => {
    if (forceStage) return forceStage
    return dataAnalysis.recommendedChart
  }, [forceStage, dataAnalysis.recommendedChart])
  
  // Handle stage transitions
  const transitionToStage = useCallback(async (newStage: ChartStage, trigger: 'auto' | 'manual' = 'auto') => {
    if (newStage === currentStage) return
    
    // Validate the new stage
    const validation = validateChartStage(newStage, {
      transactionCount: dataAnalysis.transactionCount,
      categoryCount: dataAnalysis.categoryCount,
      timeSpanDays: dataAnalysis.timeSpanDays,
      dataRichness: dataAnalysis.dataRichness,
      userTenure: dataAnalysis.userTenure
    }, config as ChartProgressionConfig)
    
    if (!validation.isValid && trigger === 'auto') {
      console.warn(`Cannot auto-transition to ${newStage}: ${validation.missingRequirements.join(', ')}`)
      return
    }
    
    // Start transition with loading state for complex chart types
    const isComplexTransition = newStage === 'treemap' || newStage === 'sankey'
    
    if (transitionConfig.enableTransitions) {
      setIsTransitioning(true)
      if (isComplexTransition) {
        setIsLoading(true)
      }
    }
    
    // For complex transitions, add a small delay to show loading
    const transitionDelay = isComplexTransition ? 800 : 0
    
    setTimeout(() => {
      // Update stage
      setCurrentStage(newStage)
      
      // Generate accessibility announcement
      const announcement = generateStageChangeAnnouncement(newStage, dataAnalysis)
      setAriaLiveMessage(announcement)
      
      // Notify parent component
      onStageChange?.(newStage, dataAnalysis)
    }, transitionDelay)
    
    // Handle transition animation cleanup
    if (transitionConfig.enableTransitions) {
      setTimeout(() => {
        setIsTransitioning(false)
        setIsLoading(false)
      }, transitionConfig.transitionDuration + transitionDelay)
    }
    
    console.log(`📊 Chart stage transition: ${currentStage} → ${newStage} (${trigger})`)
  }, [
    currentStage, 
    dataAnalysis, // Need full object since we pass it to onStageChange
    config, 
    transitionConfig.enableTransitions,
    transitionConfig.transitionDuration,
    onStageChange
  ])
  
  // Store previous stage to prevent infinite loops
  const prevStageRef = useRef<ChartStage>(currentStage)
  
  // Auto-progression logic with safeguards
  useEffect(() => {
    // Prevent infinite loops with strict conditions
    if (!config.enableAutoProgression) return
    if (dataAnalysis.recommendedChart === currentStage) return
    if (dataAnalysis.confidence < 0.8) return
    if (prevStageRef.current === dataAnalysis.recommendedChart) return // Already processed this recommendation
    
    console.log('📊 Auto-progression check:', {
      current: currentStage,
      recommended: dataAnalysis.recommendedChart,
      confidence: dataAnalysis.confidence
    })
    
    // Validate the recommended stage
    const validation = validateChartStage(dataAnalysis.recommendedChart, {
      transactionCount: dataAnalysis.transactionCount,
      categoryCount: dataAnalysis.categoryCount,
      timeSpanDays: dataAnalysis.timeSpanDays,
      dataRichness: dataAnalysis.dataRichness,
      userTenure: dataAnalysis.userTenure
    }, config as ChartProgressionConfig)
    
    if (validation.isValid) {
      prevStageRef.current = dataAnalysis.recommendedChart
      transitionToStage(dataAnalysis.recommendedChart, 'auto')
    }
  }, [
    dataAnalysis.recommendedChart, 
    dataAnalysis.confidence, 
    dataAnalysis.transactionCount,
    dataAnalysis.categoryCount,
    dataAnalysis.timeSpanDays,
    dataAnalysis.dataRichness,
    dataAnalysis.userTenure,
    config.enableAutoProgression,
    config,
    currentStage,
    onStageChange,
    transitionToStage
  ])
  
  // Manual stage selection handler
  const handleManualStageChange = useCallback((newStage: ChartStage) => {
    transitionToStage(newStage, 'manual')
  }, [transitionToStage])
  
  // Educational content request handler
  const handleEducationRequest = useCallback(() => {
    onEducationRequest?.(currentStage)
  }, [currentStage, onEducationRequest])
  
  // Chart-specific props preparation
  const chartProps = useMemo(() => ({
    transactions,
    budget,
    categories,
    dataAnalysis,
    height,
    onEducationRequest: handleEducationRequest,
    onDataInsight,
    className: `progressive-chart progressive-chart--${currentStage} ${className}`
  }), [transactions, budget, categories, dataAnalysis, height, handleEducationRequest, onDataInsight, currentStage, className])
  
  // Render the appropriate chart component
  const renderChart = () => {
    const baseProps = {
      ...chartProps,
      isTransitioning,
      transitionConfig
    }
    
    switch (currentStage) {
      case 'empty-state':
        return (
          <EmptyStateChart 
            {...baseProps}
            onAddTransaction={() => {
              // Handle add transaction action
              console.log('Add transaction requested from empty state')
            }}
            onGetStarted={handleEducationRequest}
          />
        )
      
      case 'bar':
        return (
          <BarChart 
            {...baseProps}
            showBudgetComparison={true}
            enableInteraction={true}
          />
        )
      
      case 'treemap':
        return (
          <TreemapChart 
            {...baseProps}
            enableDrillDown={true}
            showHierarchy={true}
          />
        )
      
      case 'sankey':
        return (
          <SankeyChart 
            {...baseProps}
            showFlowAnimation={true}
            enableAdvancedFeatures={true}
          />
        )
      
      default:
        console.warn(`Unknown chart stage: ${currentStage}`)
        return (
          <EmptyStateChart 
            {...baseProps}
            onAddTransaction={() => console.log('Add transaction requested')}
            onGetStarted={handleEducationRequest}
          />
        )
    }
  }
  
  const chartTitle = generateChartTitle(currentStage, dataAnalysis, categories)
  
  // Helper function to get appropriate loading message for transitions
  const getTransitionMessage = (stage: ChartStage): string => {
    switch (stage) {
      case 'bar':
        return 'Preparing bar chart...'
      case 'treemap':
        return 'Building treemap visualization...'
      case 'sankey':
        return 'Generating cash flow diagram...'
      case 'empty-state':
        return 'Setting up chart...'
      default:
        return 'Updating chart...'
    }
  }
  
  return (
    <div 
      className={`progressive-chart-container ${className}`}
      role="region"
      aria-label={chartTitle}
      aria-describedby="chart-description chart-instructions"
    >
      
      
      {/* Main Chart Content */}
      <div className={`
        progressive-chart-content relative
        ${isTransitioning ? 'transitioning' : ''}
        transition-all duration-${transitionConfig.transitionDuration}
        ${transitionConfig.transitionType === 'fade' ? 'opacity-0' : ''}
        ${transitionConfig.transitionType === 'scale' ? 'scale-95' : ''}
        ${!isTransitioning ? 'opacity-100 scale-100' : ''}
      `}>
        {/* Combine internal and external loading states */}
        {(() => {
          const combinedLoading = isLoading || externalIsLoading
          
          // Show full loading state for initial load or when external loading is true
          if (combinedLoading && (!analysisCache || externalIsLoading)) {
            const message = externalIsLoading ? "Processing your financial data..." : "Analyzing your data..."
            return (
              <ChartLoadingState 
                height={height}
                message={message}
                showProgress={true}
                className="w-full"
              />
            )
          }
          
          // Show chart with optional transition overlay
          return (
            <>
              {renderChart()}
              
              {/* Loading Overlay for Transitions */}
              <ChartLoadingOverlay 
                isVisible={combinedLoading && isTransitioning}
                message={getTransitionMessage(currentStage)}
                className="rounded-lg"
              />
            </>
          )
        })()}
      </div>
      
      
      {/* Accessibility Features */}
      <div className="sr-only">
        <div id="chart-description" aria-live="polite">
          {chartDescription}
        </div>
        <div id="chart-instructions">
          Use Tab to navigate between chart controls. Press Space or Enter to activate buttons. 
          {currentStage !== 'empty-state' && 'Use the data table toggle to view accessible data representation.'}
        </div>
      </div>
      
      {/* ARIA Live Region for Announcements */}
      {ariaLiveMessage && (
        <div 
          className="sr-only" 
          aria-live="assertive" 
          aria-atomic="true"
          key={ariaLiveMessage}
        >
          {ariaLiveMessage}
        </div>
      )}
    </div>
  )
})

/**
 * Progression Status Bar Component
 * Shows current stage and allows manual progression
 */
interface ProgressionStatusBarProps {
  currentStage: ChartStage
  analysis: DataMaturityAnalysis
  config: ChartProgressionConfig
  onStageSelect: (stage: ChartStage) => void
}

function ProgressionStatusBar({ 
  currentStage, 
  analysis, 
  config, 
  onStageSelect 
}: ProgressionStatusBarProps) {
  const stages: ChartStage[] = ['empty-state', 'bar', 'treemap', 'sankey']
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Chart Evolution:</span>
        {stages.map((stage, index) => {
          const isActive = stage === currentStage
          const isAvailable = analysis.canProgressTo.includes(stage)
          const isRecommended = stage === analysis.recommendedChart
          
          return (
            <div key={stage} className="flex items-center">
              {index > 0 && (
                <div className="w-8 h-px bg-gray-300 mx-1" />
              )}
              <button
                onClick={() => isAvailable && onStageSelect(stage)}
                disabled={!isAvailable}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all
                  ${isActive 
                    ? 'bg-blue-500 text-white' 
                    : isAvailable 
                      ? 'bg-gray-200 hover:bg-gray-300 text-gray-700' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                  ${isRecommended && !isActive ? 'ring-2 ring-green-300' : ''}
                `}
                title={
                  isRecommended ? 'Recommended stage' :
                  !isAvailable ? 'Not yet available' :
                  `Switch to ${stage} view`
                }
              >
                {stage}
                {isRecommended && !isActive && (
                  <span className="ml-1 text-green-500">⭐</span>
                )}
              </button>
            </div>
          )
        })}
      </div>
      
      <div className="text-xs text-gray-500">
        Confidence: {(analysis.confidence * 100).toFixed(0)}%
      </div>
    </div>
  )
}

/**
 * Chart Education Panel Component
 * Provides contextual guidance and insights
 */
interface ChartEducationPanelProps {
  stage: ChartStage
  analysis: DataMaturityAnalysis
  onEducationRequest: () => void
}

function ChartEducationPanel({ 
  stage, 
  analysis, 
  onEducationRequest 
}: ChartEducationPanelProps) {
  const getStageDescription = (stage: ChartStage): string => {
    switch (stage) {
      case 'empty-state':
        return 'Get started by adding your first transactions to see your spending patterns'
      case 'bar':
        return 'Compare your budget vs actual spending across categories'
      case 'treemap':
        return 'Visualize proportional spending to identify patterns and opportunities'
      case 'sankey':
        return 'Analyze complete cash flow from income to savings and expenses'
      default:
        return ''
    }
  }
  
  const getNextStepHint = (analysis: DataMaturityAnalysis): string | null => {
    const nextStages = analysis.canProgressTo.filter(s => 
      ['bar', 'treemap', 'sankey'].indexOf(s) > ['bar', 'treemap', 'sankey'].indexOf(stage)
    )
    
    if (nextStages.length === 0) return null
    
    const nextStage = nextStages[0]
    const validation = validateChartStage(nextStage, {
      transactionCount: analysis.transactionCount,
      categoryCount: analysis.categoryCount,
      timeSpanDays: analysis.timeSpanDays,
      dataRichness: analysis.dataRichness,
      userTenure: analysis.userTenure
    }, DEFAULT_PROGRESSION_CONFIG as ChartProgressionConfig)
    
    if (validation.recommendations.length > 0) {
      return `To unlock ${nextStage} view: ${validation.recommendations[0]}`
    }
    
    return null
  }
  
  const description = getStageDescription(stage)
  const nextStepHint = getNextStepHint(analysis)
  
  if (!description && !nextStepHint) return null
  
  return (
    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {description && (
            <p className="text-sm text-blue-800 mb-2">{description}</p>
          )}
          {nextStepHint && (
            <p className="text-xs text-blue-600">💡 {nextStepHint}</p>
          )}
        </div>
        <button
          onClick={onEducationRequest}
          className="ml-3 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
        >
          Learn More
        </button>
      </div>
    </div>
  )
}

export default ProgressiveChart