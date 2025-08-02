/**
 * User-friendly error messages for network and real-time connection problems
 * Converts technical errors into actionable user guidance
 */

export interface UserFriendlyError {
  title: string
  message: string
  actionLabel?: string
  action?: () => void
  severity: 'low' | 'medium' | 'high'
  dismissible: boolean
  autoHide?: number // milliseconds
}

export type ErrorCode = 
  | 'CONNECTION_LOST'
  | 'CONNECTION_FAILED'
  | 'RECONNECTION_FAILED'
  | 'SYNC_FAILED'
  | 'BALANCE_UPDATE_FAILED'
  | 'DATABASE_ERROR'
  | 'NETWORK_TIMEOUT'
  | 'RATE_LIMITED'
  | 'PERMISSION_ERROR'
  | 'UNKNOWN_ERROR'

/**
 * Maps technical error types to user-friendly messages (lazy-loaded)
 */
let _errorMessageMap: Record<ErrorCode, UserFriendlyError> | null = null

const getErrorMessageMap = (): Record<ErrorCode, UserFriendlyError> => {
  if (!_errorMessageMap) {
    _errorMessageMap = {
  CONNECTION_LOST: {
    title: 'Connection Lost',
    message: 'Your connection to the server was interrupted. We\'ll automatically try to reconnect, but your changes might not sync immediately.',
    severity: 'medium',
    dismissible: true,
    autoHide: 5000
  },

  CONNECTION_FAILED: {
    title: 'Connection Problem',
    message: 'Unable to connect to the server. Please check your internet connection and try again.',
    actionLabel: 'Retry',
    severity: 'high',
    dismissible: true
  },

  RECONNECTION_FAILED: {
    title: 'Unable to Reconnect',
    message: 'We couldn\'t restore your connection after several attempts. Your changes are saved locally and will sync when the connection is restored.',
    actionLabel: 'Refresh Page',
    severity: 'high',
    dismissible: false
  },

  SYNC_FAILED: {
    title: 'Sync Issues',
    message: 'Some of your recent changes might not be fully synced. We\'ll keep trying in the background.',
    severity: 'medium',
    dismissible: true,
    autoHide: 8000
  },

  BALANCE_UPDATE_FAILED: {
    title: 'Balance Update Failed',
    message: 'We couldn\'t update your envelope balances in real-time. Your data is safe, but you might need to refresh to see the latest changes.',
    actionLabel: 'Refresh',
    severity: 'medium',
    dismissible: true
  },

  DATABASE_ERROR: {
    title: 'Database Error',
    message: 'There was a problem accessing your data. This is usually temporary - please try again in a moment.',
    actionLabel: 'Try Again',
    severity: 'high',
    dismissible: true
  },

  NETWORK_TIMEOUT: {
    title: 'Request Timed Out',
    message: 'The request took too long to complete. This might be due to a slow connection.',
    actionLabel: 'Retry',
    severity: 'medium',
    dismissible: true
  },

  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'You\'re making changes too quickly. Please wait a moment before trying again.',
    severity: 'low',
    dismissible: true,
    autoHide: 3000
  },

  PERMISSION_ERROR: {
    title: 'Permission Denied',
    message: 'You don\'t have permission to perform this action. Please check your account settings or contact support.',
    severity: 'high',
    dismissible: true
  },

  UNKNOWN_ERROR: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. If this continues, please refresh the page or contact support.',
    actionLabel: 'Refresh Page',
    severity: 'medium',
    dismissible: true
  }
    }
  }
  return _errorMessageMap
}

/**
 * Get user-friendly error message for a given error code
 */
export function getUserFriendlyError(
  code: ErrorCode, 
  customMessage?: string,
  customAction?: () => void
): UserFriendlyError {
  const baseError = getErrorMessageMap()[code]
  
  return {
    ...baseError,
    message: customMessage || baseError.message,
    action: customAction || baseError.action
  }
}

/**
 * Categorize technical errors into user-friendly error codes
 */
export function categorizeError(error: unknown): ErrorCode {
  const errorMessage = (error as Error)?.message?.toLowerCase() || ''
  const errorCode = (error as { code?: string })?.code || ''

  // Network errors
  if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
    return 'CONNECTION_FAILED'
  }

  if (errorMessage.includes('timeout') || errorCode === 'TIMEOUT') {
    return 'NETWORK_TIMEOUT'
  }

  // Database errors
  if (errorMessage.includes('database') || errorMessage.includes('postgres')) {
    return 'DATABASE_ERROR'
  }

  // Permission errors
  if (errorMessage.includes('permission') || errorMessage.includes('unauthorized') || errorCode === '401') {
    return 'PERMISSION_ERROR'
  }

  // Rate limiting
  if (errorMessage.includes('rate') || errorMessage.includes('too many') || errorCode === '429') {
    return 'RATE_LIMITED'
  }

  // WebSocket specific errors
  if (errorMessage.includes('websocket') || errorMessage.includes('realtime')) {
    return 'CONNECTION_LOST'
  }

  // Channel errors
  if (errorMessage.includes('channel') || errorMessage.includes('subscription')) {
    return 'SYNC_FAILED'
  }

  return 'UNKNOWN_ERROR'
}

/**
 * Create contextual error message based on user action
 */
export function createContextualError(
  baseError: ErrorCode,
  context: {
    action?: string
    envelopeName?: string
    amount?: number
    retryCount?: number
  }
): UserFriendlyError {
  const baseMessage = getErrorMessageMap()[baseError]
  let contextualMessage = baseMessage.message

  if (context.action === 'transaction_create' && context.envelopeName) {
    contextualMessage = `We couldn't add your transaction to "${context.envelopeName}". ${baseMessage.message}`
  } else if (context.action === 'balance_update' && context.envelopeName) {
    contextualMessage = `We couldn't update the balance for "${context.envelopeName}". ${baseMessage.message}`
  } else if (context.retryCount && context.retryCount > 1) {
    contextualMessage = `After ${context.retryCount} attempts: ${baseMessage.message}`
  }

  return {
    ...baseMessage,
    message: contextualMessage
  }
}

/**
 * Error severity levels for UI styling
 */
export const ERROR_SEVERITY_STYLES = {
  low: {
    backgroundColor: '#FEF3C7', // yellow-100
    borderColor: '#F59E0B', // yellow-500
    textColor: '#92400E', // yellow-800
    iconColor: '#F59E0B' // yellow-500
  },
  medium: {
    backgroundColor: '#FED7AA', // orange-100
    borderColor: '#EA580C', // orange-600
    textColor: '#9A3412', // orange-800
    iconColor: '#EA580C' // orange-600
  },
  high: {
    backgroundColor: '#FEE2E2', // red-100
    borderColor: '#DC2626', // red-600
    textColor: '#991B1B', // red-800
    iconColor: '#DC2626' // red-600
  }
}

/**
 * Get appropriate icon for error type
 */
export function getErrorIcon(code: ErrorCode): string {
  switch (code) {
    case 'CONNECTION_LOST':
    case 'CONNECTION_FAILED':
    case 'RECONNECTION_FAILED':
      return '🔗' // or use a proper icon component
    
    case 'SYNC_FAILED':
    case 'BALANCE_UPDATE_FAILED':
      return '🔄'
    
    case 'DATABASE_ERROR':
      return '💾'
    
    case 'NETWORK_TIMEOUT':
      return '⏱️'
    
    case 'RATE_LIMITED':
      return '⚡'
    
    case 'PERMISSION_ERROR':
      return '🔒'
    
    case 'UNKNOWN_ERROR':
    default:
      return '⚠️'
  }
}

/**
 * Format error for logging while preserving user privacy
 */
export function formatErrorForLogging(error: unknown, context?: Record<string, unknown>) {
  return {
    timestamp: new Date().toISOString(),
    message: (error as Error)?.message || 'Unknown error',
    code: (error as { code?: string })?.code,
    stack: (error as Error)?.stack,
    context: {
      userAgent: navigator.userAgent,
      url: window.location.href,
      ...context
    }
  }
}