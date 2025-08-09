/**
 * Keyboard Shortcut Context Provider
 * Manages global keyboard shortcuts and provides context for shortcut registration
 */

'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getPlatformModifierKey } from '@/lib/hooks/useKeyboardShortcuts'

interface ShortcutHandler {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  handler: (event: KeyboardEvent) => void | Promise<void>
  description: string
  context?: string
  priority?: number
}

interface KeyboardShortcutContextType {
  shortcuts: ShortcutHandler[]
  registerShortcut: (shortcut: ShortcutHandler) => () => void
  unregisterShortcut: (key: string, context?: string) => void
  isShortcutHelpVisible: boolean
  showShortcutHelp: () => void
  hideShortcutHelp: () => void
  toggleShortcutHelp: () => void
}

const KeyboardShortcutContext = createContext<KeyboardShortcutContextType | undefined>(undefined)

interface KeyboardShortcutProviderProps {
  children: ReactNode
}

export function KeyboardShortcutProvider({ children }: KeyboardShortcutProviderProps) {
  const [shortcuts, setShortcuts] = useState<ShortcutHandler[]>([])
  const [isShortcutHelpVisible, setIsShortcutHelpVisible] = useState(false)
  const router = useRouter()

  const registerShortcut = (shortcut: ShortcutHandler): (() => void) => {
    setShortcuts(prev => {
      // Remove existing shortcut with same key and context
      const filtered = prev.filter(s => 
        !(s.key === shortcut.key && (s.context || 'global') === (shortcut.context || 'global'))
      )
      
      // Add new shortcut and sort by priority (higher priority first)
      const newShortcuts = [...filtered, { ...shortcut, priority: shortcut.priority || 50 }]
      return newShortcuts.sort((a, b) => (b.priority || 50) - (a.priority || 50))
    })

    // Return unregister function
    return () => unregisterShortcut(shortcut.key, shortcut.context)
  }

  const unregisterShortcut = (key: string, context?: string) => {
    setShortcuts(prev => prev.filter(s => 
      !(s.key === key && (s.context || 'global') === (context || 'global'))
    ))
  }

  const showShortcutHelp = () => setIsShortcutHelpVisible(true)
  const hideShortcutHelp = () => setIsShortcutHelpVisible(false)
  const toggleShortcutHelp = () => setIsShortcutHelpVisible(prev => !prev)

  // Global keyboard event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle help shortcut (Ctrl/Cmd + ?)
      if ((event.key === '?' || event.key === '/') && (event.ctrlKey || event.metaKey)) {
        event.preventDefault()
        toggleShortcutHelp()
        return
      }

      // Find matching shortcut
      for (const shortcut of shortcuts) {
        const matchesKey = event.key === shortcut.key || event.code === shortcut.key
        const matchesCtrl = (shortcut.ctrlKey ?? false) === event.ctrlKey
        const matchesShift = (shortcut.shiftKey ?? false) === event.shiftKey
        const matchesAlt = (shortcut.altKey ?? false) === event.altKey
        const matchesMeta = (shortcut.metaKey ?? false) === event.metaKey

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
          try {
            shortcut.handler(event)
          } catch (error) {
            console.error(`Keyboard shortcut handler error for ${shortcut.key}:`, error)
          }
          break // Stop after first match (highest priority)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts, toggleShortcutHelp])

  // Register global shortcuts
  useEffect(() => {
    const modifierKey = getPlatformModifierKey()
    
    const globalShortcuts: ShortcutHandler[] = [
      {
        key: 'n',
        [modifierKey + 'Key']: true,
        handler: (event) => {
          event.preventDefault()
          router.push('/dashboard/transactions/new')
        },
        description: 'Create new transaction',
        context: 'global',
        priority: 10
      }
    ]

    const unregisterFunctions = globalShortcuts.map(shortcut => registerShortcut(shortcut))

    return () => {
      unregisterFunctions.forEach(unregister => unregister())
    }
  }, [registerShortcut, router])

  const value: KeyboardShortcutContextType = {
    shortcuts,
    registerShortcut,
    unregisterShortcut,
    isShortcutHelpVisible,
    showShortcutHelp,
    hideShortcutHelp,
    toggleShortcutHelp
  }

  return (
    <KeyboardShortcutContext.Provider value={value}>
      {children}
      {isShortcutHelpVisible && <ShortcutHelpModal />}
    </KeyboardShortcutContext.Provider>
  )
}

export function useKeyboardShortcutContext() {
  const context = useContext(KeyboardShortcutContext)
  if (context === undefined) {
    throw new Error('useKeyboardShortcutContext must be used within a KeyboardShortcutProvider')
  }
  return context
}

// Shortcut Help Modal Component
function ShortcutHelpModal() {
  const { shortcuts, hideShortcutHelp } = useKeyboardShortcutContext()

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        hideShortcutHelp()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [hideShortcutHelp])

  const formatShortcut = (shortcut: ShortcutHandler): string => {
    const parts: string[] = []
    if (shortcut.ctrlKey) parts.push('Ctrl')
    if (shortcut.metaKey) parts.push('⌘')
    if (shortcut.shiftKey) parts.push('Shift')
    if (shortcut.altKey) parts.push('Alt')
    parts.push(shortcut.key.toUpperCase())
    return parts.join(' + ')
  }

  const groupedShortcuts = shortcuts.reduce((groups, shortcut) => {
    const context = shortcut.context || 'Global'
    if (!groups[context]) groups[context] = []
    groups[context].push(shortcut)
    return groups
  }, {} as Record<string, ShortcutHandler[]>)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Keyboard Shortcuts</h2>
            <button
              onClick={hideShortcutHelp}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close help"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="space-y-6">
            {Object.entries(groupedShortcuts).map(([context, contextShortcuts]) => (
              <div key={context}>
                <h3 className="text-lg font-medium text-gray-900 mb-3 capitalize">
                  {context} Shortcuts
                </h3>
                <div className="space-y-2">
                  {contextShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded">
                      <span className="text-sm text-gray-700">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">
                        {formatShortcut(shortcut)}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Press <kbd className="px-1 py-0.5 text-xs font-semibold text-gray-800 bg-gray-200 border border-gray-300 rounded">Escape</kbd> to close this help
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}