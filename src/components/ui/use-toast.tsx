/**
 * Toast Hook
 * Basic toast notification system
 */

'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

const toasts: Toast[] = []
const listeners: ((toasts: Toast[]) => void)[] = []

const notify = () => {
  listeners.forEach(listener => listener(toasts))
}

export function useToast() {
  const [, forceUpdate] = useState(0)

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast: Toast = { id, title, description, variant }
    
    toasts.push(newToast)
    notify()

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const index = toasts.findIndex(t => t.id === id)
      if (index > -1) {
        toasts.splice(index, 1)
        notify()
      }
    }, 5000)

    return newToast
  }, [])

  const dismiss = useCallback((toastId: string) => {
    const index = toasts.findIndex(t => t.id === toastId)
    if (index > -1) {
      toasts.splice(index, 1)
      notify()
    }
  }, [])

  // Subscribe to toast changes
  useState(() => {
    const listener = () => forceUpdate(prev => prev + 1)
    listeners.push(listener)
    return () => {
      const index = listeners.indexOf(listener)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  })

  return {
    toast,
    dismiss,
    toasts: [...toasts]
  }
}

// Basic Toast component for display
export function Toaster() {
  const { toasts, dismiss } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            max-w-sm p-4 rounded-lg shadow-lg border
            ${toast.variant === 'destructive' 
              ? 'bg-red-50 border-red-200 text-red-800' 
              : 'bg-white border-gray-200 text-gray-800'
            }
          `}
          onClick={() => dismiss(toast.id)}
        >
          <div className="font-medium">{toast.title}</div>
          {toast.description && (
            <div className="text-sm opacity-90 mt-1">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  )
}