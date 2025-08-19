/**
 * Empty State Chart Component
 * Engaging onboarding experience for new users with no transaction data
 */

'use client'

import React, { useRef } from 'react'
import { Plus, TrendingUp, PieChart } from 'lucide-react'
import { JUNO_PRIMARY_COLOR, applyWhiteTint } from '@/lib/utils/chart-colors'
import { generateKeyboardInstructions } from '@/lib/utils/chart-accessibility'

interface EmptyStateChartProps {
  height?: number
  className?: string
  onAddTransaction?: () => void
  onGetStarted?: () => void
  isTransitioning?: boolean
}

export function EmptyStateChart({
  height = 300,
  className = '',
  onAddTransaction,
  onGetStarted,
  isTransitioning = false
}: EmptyStateChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const keyboardInstructions = generateKeyboardInstructions('empty-state')
  
  // For empty state, we need more height to accommodate all content
  const adjustedHeight = Math.max(height, 400)
  
  return (
    <div 
      ref={containerRef}
      className={`flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300 py-6 px-4 ${className}`}
      style={{ minHeight: adjustedHeight }}
      role="region"
      aria-label="Empty spending chart - Get started with your financial tracking"
      aria-describedby="empty-state-description"
      tabIndex={0}
    >
      {/* Illustration */}
      <div className="relative mb-4" role="img" aria-label="Sample chart showing spending visualization evolution from simple bars to advanced flow diagrams">
        {/* Sample chart preview using Juno primary color with 60% white tint */}
        <div className="flex items-end space-x-2 mb-4" aria-hidden="true">
          <div 
            className="w-8 h-12 rounded" 
            style={{ backgroundColor: applyWhiteTint(JUNO_PRIMARY_COLOR, 60) }}
            aria-label="Sample bar representing spending category"
          />
          <div 
            className="w-8 h-16 rounded" 
            style={{ backgroundColor: applyWhiteTint(JUNO_PRIMARY_COLOR, 60) }}
            aria-label="Sample bar representing spending category"
          />
          <div 
            className="w-8 h-8 rounded" 
            style={{ backgroundColor: applyWhiteTint(JUNO_PRIMARY_COLOR, 60) }}
            aria-label="Sample bar representing spending category"
          />
          <div 
            className="w-8 h-20 rounded" 
            style={{ backgroundColor: applyWhiteTint(JUNO_PRIMARY_COLOR, 60) }}
            aria-label="Sample bar representing spending category"
          />
        </div>
        
        {/* Chart evolution preview */}
        <div className="absolute -top-2 -right-8 transform rotate-12" aria-hidden="true">
          <PieChart className="w-6 h-6 text-gray-400" aria-label="Advanced chart type preview" />
        </div>
        
        <div className="absolute -top-4 -left-8 transform -rotate-12" aria-hidden="true">
          <TrendingUp className="w-6 h-6 text-gray-400" aria-label="Trending analysis preview" />
        </div>
      </div>
      
      {/* Content */}
      <div className="text-center max-w-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-2" id="empty-state-title">
          Start Your Financial Journey
        </h3>
        <p className="text-gray-600 text-sm mb-4" id="empty-state-description">
          Add your first transactions to unlock intelligent chart visualizations that evolve with your data. 
          Charts automatically progress from simple bar graphs to advanced flow diagrams as you add more financial data.
        </p>
        
        {/* Preview of chart progression */}
        <div 
          className="mb-4 p-3 bg-white rounded-lg border"
          role="img"
          aria-label="Chart progression preview showing evolution from simple to advanced visualizations"
        >
          <div className="text-xs text-gray-500 mb-2" id="progression-label">Your charts will evolve:</div>
          <div className="flex items-center justify-between text-xs" aria-labelledby="progression-label">
            <div className="text-center">
              <div 
                className="w-4 h-4 rounded mb-1 mx-auto" 
                style={{ backgroundColor: applyWhiteTint(JUNO_PRIMARY_COLOR, 70) }}
                aria-label="Simple chart stage indicator"
              />
              <span className="text-gray-400">Simple</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" aria-hidden="true" />
            <div className="text-center">
              <div 
                className="w-4 h-4 rounded mb-1 mx-auto" 
                style={{ backgroundColor: applyWhiteTint(JUNO_PRIMARY_COLOR, 40) }}
                aria-label="Detailed chart stage indicator"
              />
              <span className="text-gray-500">Detailed</span>
            </div>
            <div className="flex-1 h-px bg-gray-200 mx-2" aria-hidden="true" />
            <div className="text-center">
              <div 
                className="w-4 h-4 rounded mb-1 mx-auto" 
                style={{ backgroundColor: JUNO_PRIMARY_COLOR }}
                aria-label="Advanced chart stage indicator"
              />
              <span className="text-gray-600">Advanced</span>
            </div>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center" role="group" aria-labelledby="empty-state-title">
          <button
            onClick={onAddTransaction}
            disabled={!onAddTransaction}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-describedby="add-transaction-help"
          >
            <Plus className="w-4 h-4 mr-2" aria-hidden="true" />
            Add First Transaction
          </button>
          <div id="add-transaction-help" className="sr-only">
            Add your first financial transaction to start building your spending visualization
          </div>
          
          <button
            onClick={onGetStarted}
            disabled={!onGetStarted}
            className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 text-sm font-medium rounded-lg transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-describedby="learn-more-help"
          >
            Learn How It Works
          </button>
          <div id="learn-more-help" className="sr-only">
            Learn about how the progressive chart system evolves with your data
          </div>
        </div>
      </div>
      
      {/* Keyboard Instructions for Screen Readers */}
      <div className="sr-only" aria-live="polite">
        {keyboardInstructions}
      </div>
      
      {/* Subtle animation hint */}
      <div className="mt-4 text-xs text-gray-400 text-center" aria-label="Chart feature information">
        <span aria-hidden="true">💡</span> Charts automatically adapt as you add more data
      </div>
    </div>
  )
}