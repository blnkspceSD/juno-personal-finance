/**
 * Custom hook for handling keyboard shortcuts in forms and components
 * Provides a clean interface for registering and managing keyboard shortcuts
 */

import { useEffect, useCallback, useRef } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
  handler: (event: KeyboardEvent) => void | Promise<void>
}

export interface ShortcutContext {
  name: string
  priority: number
  active: boolean
  shortcuts: KeyboardShortcut[]
}

interface UseKeyboardShortcutsOptions {
  context?: string
  priority?: number
  enabled?: boolean
  preventDefault?: boolean
  stopPropagation?: boolean
}

export function useKeyboardShortcuts(
  shortcuts: Omit<KeyboardShortcut, 'handler'>[] | KeyboardShortcut[],
  handlers: Record<string, (event: KeyboardEvent) => void | Promise<void>> | undefined,
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    context = 'default',
    priority = 50,
    enabled = true,
    preventDefault = true,
    stopPropagation = true
  } = options

  const shortcutsRef = useRef<KeyboardShortcut[]>([])
  const handlersRef = useRef(handlers)

  // Update refs when handlers change
  useEffect(() => {
    handlersRef.current = handlers
  }, [handlers])

  // Build shortcuts array with handlers
  useEffect(() => {
    if (!handlers) {
      shortcutsRef.current = shortcuts as KeyboardShortcut[]
      return
    }

    shortcutsRef.current = shortcuts.map(shortcut => ({
      ...shortcut,
      preventDefault: shortcut.preventDefault ?? preventDefault,
      stopPropagation: shortcut.stopPropagation ?? stopPropagation,
      handler: handlersRef.current?.[shortcut.key] || (() => {})
    }))
  }, [shortcuts, handlers, preventDefault, stopPropagation])

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return

    for (const shortcut of shortcutsRef.current) {
      const matchesKey = event.key === shortcut.key || event.code === shortcut.key
      const matchesCtrl = (shortcut.ctrlKey ?? false) === event.ctrlKey
      const matchesShift = (shortcut.shiftKey ?? false) === event.shiftKey
      const matchesAlt = (shortcut.altKey ?? false) === event.altKey
      const matchesMeta = (shortcut.metaKey ?? false) === event.metaKey

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt && matchesMeta) {
        if (shortcut.preventDefault) {
          event.preventDefault()
        }
        if (shortcut.stopPropagation) {
          event.stopPropagation()
        }

        try {
          shortcut.handler(event)
        } catch (error) {
          console.error(`Keyboard shortcut handler error for ${shortcut.key}:`, error)
        }
        break
      }
    }
  }, [enabled])

  useEffect(() => {
    if (!enabled) return

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown, enabled])

  return {
    context,
    priority,
    enabled
  }
}

// Helper function to detect platform for modifier keys
export function getPlatformModifierKey(): 'ctrl' | 'meta' {
  if (typeof window === 'undefined') return 'ctrl'
  
  const platform = navigator.platform || navigator.userAgentData?.platform || ''
  return platform.toLowerCase().includes('mac') ? 'meta' : 'ctrl'
}

// Common shortcut patterns
export const CommonShortcuts = {
  save: {
    key: 's',
    [getPlatformModifierKey() + 'Key']: true,
    preventDefault: true
  },
  cancel: {
    key: 'Escape',
    preventDefault: true
  },
  submit: {
    key: 'Enter',
    preventDefault: false // Let form handle it naturally
  },
  clear: {
    key: 'Escape',
    preventDefault: true
  },
  undo: {
    key: 'z',
    [getPlatformModifierKey() + 'Key']: true,
    preventDefault: true
  },
  redo: {
    key: 'y',
    [getPlatformModifierKey() + 'Key']: true,
    preventDefault: true
  }
} as const

// Form-specific shortcuts
export const FormShortcuts = {
  nextField: {
    key: 'Tab',
    preventDefault: false
  },
  previousField: {
    key: 'Tab',
    shiftKey: true,
    preventDefault: false
  },
  selectAll: {
    key: 'a',
    [getPlatformModifierKey() + 'Key']: true,
    preventDefault: false
  }
} as const