"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'
import { toast, ToastMessage } from '@/lib/utils/toast'
import { cn } from '@/lib/utils'

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    const unsubscribe = toast.subscribe(setToasts)
    return unsubscribe
  }, [])

  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toastMessage) => (
          <Toast
            key={toastMessage.id}
            message={toastMessage}
            onClose={() => toast.remove(toastMessage.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

interface ToastProps {
  message: ToastMessage
  onClose: () => void
}

function Toast({ message, onClose }: ToastProps) {
  const getIcon = () => {
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'info':
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getBgColor = () => {
    switch (message.type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'pointer-events-auto mb-2 flex items-center rounded-juno-lg border p-4 shadow-lg',
        'max-w-sm',
        getBgColor()
      )}
    >
      {getIcon()}
      <p className="ml-3 flex-1 text-sm font-medium text-gray-900">
        {message.message}
      </p>
      <button
        onClick={onClose}
        className="ml-4 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-juno-sm"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  )
}

export { Toast }