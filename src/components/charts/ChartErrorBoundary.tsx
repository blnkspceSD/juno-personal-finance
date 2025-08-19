/**
 * Chart-specific Error Boundary
 * Provides specialized fallback UI for chart rendering errors
 */

'use client'

import React from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { AlertTriangle, BarChart3, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ChartErrorFallbackProps {
  error?: Error
  resetError?: () => void
  height?: number
  title?: string
}

function ChartErrorFallback({ 
  error, 
  resetError, 
  height = 300,
  title = "Chart" 
}: ChartErrorFallbackProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-300"
      style={{ height }}
    >
      {/* Error Icon */}
      <div className="relative mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        {/* Faded chart icons */}
        <div className="absolute -top-2 -right-6 transform rotate-12 opacity-30">
          <BarChart3 className="w-6 h-6 text-gray-400" />
        </div>
        
        <div className="absolute -top-4 -left-6 transform -rotate-12 opacity-30">
          <TrendingUp className="w-6 h-6 text-gray-400" />
        </div>
      </div>
      
      {/* Error Content */}
      <div className="text-center max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title} Unavailable
        </h3>
        <p className="text-gray-600 text-sm mb-6">
          We're having trouble loading this chart. This might be due to a data processing issue or temporary glitch.
        </p>
        
        {/* Error details for development */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-3 bg-red-50 rounded-lg border border-red-200 text-left">
            <div className="text-xs text-red-700">
              <strong>Dev Error:</strong> {error.message}
            </div>
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            onClick={resetError}
            variant="outline"
            className="text-sm"
          >
            Retry Chart
          </Button>
          
          <Button 
            onClick={() => window.location.reload()}
            variant="ghost" 
            className="text-sm"
          >
            Refresh Page
          </Button>
        </div>
      </div>
      
      {/* Subtle status indicator */}
      <div className="mt-6 text-xs text-gray-400 text-center">
        🔧 Chart temporarily unavailable
      </div>
    </div>
  )
}

interface ChartErrorBoundaryProps {
  children: React.ReactNode
  chartTitle?: string
  height?: number
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export function ChartErrorBoundary({ 
  children, 
  chartTitle,
  height,
  onError 
}: ChartErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log chart-specific error context
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Chart Error: ${chartTitle || 'Unknown Chart'}`)
      console.error('Chart rendering failed:', error)
      console.error('Error context:', errorInfo)
      console.groupEnd()
    }
    
    // Call custom error handler
    onError?.(error, errorInfo)
  }

  return (
    <ErrorBoundary
      onError={handleError}
      fallback={
        <ChartErrorFallback 
          title={chartTitle}
          height={height}
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}

export default ChartErrorBoundary