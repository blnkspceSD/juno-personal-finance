/**
 * React Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree and provides fallback UI
 */

'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
  resetTimeoutId: number | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      resetTimeoutId: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 React Error Boundary Caught Error')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Component Stack:', errorInfo.componentStack)
      console.groupEnd()
    }
  }

  componentDidUpdate(prevProps: Props) {
    const { resetOnPropsChange = false, resetKeys = [] } = this.props
    const { hasError } = this.state

    if (hasError && prevProps.resetKeys !== resetKeys) {
      if (resetOnPropsChange || 
          resetKeys.some((resetKey, idx) => prevProps.resetKeys?.[idx] !== resetKey)) {
        this.resetError()
      }
    }
  }

  componentWillUnmount() {
    if (this.state.resetTimeoutId) {
      clearTimeout(this.state.resetTimeoutId)
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleRetry = () => {
    this.resetError()
    
    // Add slight delay to allow component state to reset
    const timeoutId = window.setTimeout(() => {
      this.setState({ resetTimeoutId: null })
    }, 100)
    
    this.setState({ resetTimeoutId: timeoutId })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI
      return (
        <Card className="m-4">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
            </div>
            <CardDescription>
              An unexpected error occurred in this component. This has been automatically reported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="p-3 bg-destructive/10 rounded-lg">
                <details className="space-y-2">
                  <summary className="cursor-pointer text-sm font-medium text-destructive">
                    Error Details (Development Only)
                  </summary>
                  <div className="text-xs text-destructive font-mono">
                    <div className="mb-2">
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div className="mb-2">
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{this.state.error.stack}</pre>
                    </div>
                    {this.state.errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()} variant="ghost">
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return this.props.children
  }
}

/**
 * Hook-based error boundary for functional components
 * Note: This doesn't catch errors in event handlers, async code, or during SSR
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    
    if (process.env.NODE_ENV === 'development') {
      console.error('🚨 useErrorHandler caught error:', error)
    }
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return handleError
}

/**
 * Higher-order component wrapper for easy error boundary integration
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}

export default ErrorBoundary