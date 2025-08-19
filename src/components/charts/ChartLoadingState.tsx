/**
 * Chart Loading State Component
 * Displays a loading overlay during chart transitions and data processing
 */

'use client'

import React from 'react'
import { BarChart3, TrendingUp, Loader2 } from 'lucide-react'

interface ChartLoadingStateProps {
  height?: number
  message?: string
  showProgress?: boolean
  className?: string
}

export function ChartLoadingState({
  height = 300,
  message = 'Loading chart...',
  showProgress = true,
  className = ''
}: ChartLoadingStateProps) {
  return (
    <div 
      className={`relative flex flex-col items-center justify-center bg-gray-50 rounded-xl border border-gray-200 ${className}`}
      style={{ height }}
      role="status"
      aria-label={message}
      aria-live="polite"
    >
      {/* Loading Animation */}
      <div className="relative mb-6">
        {/* Background chart icons */}
        <div className="relative flex items-end space-x-2 mb-4 opacity-20">
          <div className="w-6 h-8 bg-blue-200 rounded animate-pulse" />
          <div className="w-6 h-12 bg-blue-200 rounded animate-pulse" style={{ animationDelay: '0.1s' }} />
          <div className="w-6 h-6 bg-blue-200 rounded animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-6 h-16 bg-blue-200 rounded animate-pulse" style={{ animationDelay: '0.3s' }} />
          <div className="w-6 h-10 bg-blue-200 rounded animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        
        {/* Floating chart icons */}
        <div className="absolute -top-2 -right-8 opacity-30">
          <BarChart3 className="w-6 h-6 text-blue-400 animate-bounce" style={{ animationDelay: '0.5s' }} />
        </div>
        
        <div className="absolute -top-4 -left-8 opacity-30">
          <TrendingUp className="w-6 h-6 text-blue-400 animate-bounce" style={{ animationDelay: '1s' }} />
        </div>
      </div>
      
      {/* Loading Content */}
      <div className="text-center">
        {/* Spinner */}
        {showProgress && (
          <div className="mb-4">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" aria-hidden="true" />
          </div>
        )}
        
        {/* Loading Message */}
        <div className="mb-2">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {message}
          </h3>
          <p className="text-sm text-gray-600">
            Preparing your visualization...
          </p>
        </div>
        
        {/* Loading Steps Indicator */}
        {showProgress && (
          <div className="flex items-center justify-center space-x-2 mt-4">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>
      
      {/* Screen reader content */}
      <div className="sr-only">
        Chart is loading. Please wait while we prepare your data visualization.
      </div>
    </div>
  )
}

/**
 * Overlay Loading State - for transitions between existing charts
 */
interface ChartLoadingOverlayProps {
  isVisible: boolean
  message?: string
  className?: string
}

export function ChartLoadingOverlay({
  isVisible,
  message = 'Updating chart...',
  className = ''
}: ChartLoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div 
      className={`absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center rounded-xl z-10 transition-all duration-300 ${className}`}
      role="status"
      aria-label={message}
      aria-live="assertive"
    >
      {/* Simple spinner overlay */}
      <div className="flex flex-col items-center space-y-3">
        <Loader2 className="w-6 h-6 text-blue-500 animate-spin" aria-hidden="true" />
        <div className="text-sm font-medium text-gray-700">
          {message}
        </div>
      </div>
      
      {/* Screen reader announcement */}
      <div className="sr-only">
        {message} Please wait.
      </div>
    </div>
  )
}

export default ChartLoadingState