/**
 * Form Persistence Hook
 * Handles localStorage persistence, auto-save, and undo/redo functionality for forms
 */

import { useEffect, useRef, useCallback, useState } from 'react'

interface FormPersistenceOptions {
  key: string
  enabled?: boolean
  autoSaveDelay?: number
  maxHistorySteps?: number
  exclude?: string[]
}

interface FormHistoryEntry<T> {
  data: T
  timestamp: number
  action?: string
}

export function useFormPersistence<T extends Record<string, unknown>>(
  formData: T,
  setFormData: (data: T | ((prev: T) => T)) => void,
  options: FormPersistenceOptions
) {
  const {
    key,
    enabled = true,
    autoSaveDelay = 2000,
    maxHistorySteps = 10,
    exclude = []
  } = options

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  
  const historyRef = useRef<FormHistoryEntry<T>[]>([])
  const historyIndexRef = useRef(-1)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const initialDataRef = useRef<T>()
  const lastSavedDataRef = useRef<T>()

  // Initialize with saved data from localStorage
  useEffect(() => {
    if (!enabled) return

    try {
      const saved = localStorage.getItem(`form-${key}`)
      if (saved) {
        const { data, timestamp } = JSON.parse(saved)
        const savedDate = new Date(timestamp)
        
        // Only restore if saved within last 24 hours
        if (Date.now() - savedDate.getTime() < 24 * 60 * 60 * 1000) {
          setFormData(data)
          lastSavedDataRef.current = data
          setLastSaved(savedDate)
          setHasUnsavedChanges(false)
        }
      }

      // Set initial data reference
      initialDataRef.current = formData
    } catch (error) {
      console.warn('Failed to restore form data:', error)
    }
  }, [key, enabled, setFormData])

  // Filter out excluded fields
  const getFilteredData = useCallback((data: T): T => {
    if (exclude.length === 0) return data
    
    const filtered = { ...data }
    exclude.forEach(field => delete filtered[field])
    return filtered
  }, [exclude])

  // Save to localStorage
  const saveToStorage = useCallback((data: T, action?: string) => {
    if (!enabled) return

    try {
      const filteredData = getFilteredData(data)
      const entry = {
        data: filteredData,
        timestamp: Date.now(),
        action
      }
      
      localStorage.setItem(`form-${key}`, JSON.stringify(entry))
      lastSavedDataRef.current = filteredData
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
    } catch (error) {
      console.warn('Failed to save form data:', error)
    }
  }, [key, enabled, getFilteredData])

  // Add to history
  const addToHistory = useCallback((data: T, action?: string) => {
    if (!enabled || maxHistorySteps <= 0) return

    const entry: FormHistoryEntry<T> = {
      data: getFilteredData(data),
      timestamp: Date.now(),
      action
    }

    // Remove any entries after current index (branching)
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1)
    
    // Add new entry
    historyRef.current.push(entry)
    historyIndexRef.current = historyRef.current.length - 1

    // Limit history size
    if (historyRef.current.length > maxHistorySteps) {
      historyRef.current = historyRef.current.slice(-maxHistorySteps)
      historyIndexRef.current = historyRef.current.length - 1
    }
  }, [enabled, maxHistorySteps, getFilteredData])

  // Auto-save functionality
  useEffect(() => {
    if (!enabled || !formData) return

    // Check if data has changed
    const currentFiltered = getFilteredData(formData)
    const lastSavedFiltered = lastSavedDataRef.current ? getFilteredData(lastSavedDataRef.current) : null
    
    const hasChanges = !lastSavedFiltered || 
      JSON.stringify(currentFiltered) !== JSON.stringify(lastSavedFiltered)

    setHasUnsavedChanges(hasChanges)

    if (hasChanges) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }

      // Set new auto-save timeout
      autoSaveTimeoutRef.current = setTimeout(() => {
        setIsAutoSaving(true)
        saveToStorage(formData, 'auto-save')
        addToHistory(formData, 'auto-save')
        
        setTimeout(() => setIsAutoSaving(false), 500)
      }, autoSaveDelay)
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [formData, enabled, autoSaveDelay, saveToStorage, addToHistory, getFilteredData])

  // Manual save
  const saveForm = useCallback((action?: string) => {
    if (!enabled) return
    
    clearTimeout(autoSaveTimeoutRef.current)
    saveToStorage(formData, action || 'manual-save')
    addToHistory(formData, action || 'manual-save')
  }, [formData, enabled, saveToStorage, addToHistory])

  // Clear form data
  const clearForm = useCallback(() => {
    if (!enabled) return

    try {
      localStorage.removeItem(`form-${key}`)
      historyRef.current = []
      historyIndexRef.current = -1
      lastSavedDataRef.current = undefined
      setLastSaved(null)
      setHasUnsavedChanges(false)
      
      if (initialDataRef.current) {
        setFormData(initialDataRef.current)
        addToHistory(initialDataRef.current, 'clear')
      }
    } catch (error) {
      console.warn('Failed to clear form data:', error)
    }
  }, [key, enabled, setFormData, addToHistory])

  // Reset to last saved
  const resetForm = useCallback(() => {
    if (!enabled || !lastSavedDataRef.current) return

    setFormData(lastSavedDataRef.current)
    addToHistory(lastSavedDataRef.current, 'reset')
    setHasUnsavedChanges(false)
  }, [enabled, setFormData, addToHistory])

  // Undo functionality
  const canUndo = historyIndexRef.current > 0
  const undo = useCallback(() => {
    if (!enabled || !canUndo) return

    historyIndexRef.current -= 1
    const entry = historyRef.current[historyIndexRef.current]
    if (entry) {
      setFormData(entry.data)
      setHasUnsavedChanges(true)
    }
  }, [enabled, canUndo, setFormData])

  // Redo functionality
  const canRedo = historyIndexRef.current < historyRef.current.length - 1
  const redo = useCallback(() => {
    if (!enabled || !canRedo) return

    historyIndexRef.current += 1
    const entry = historyRef.current[historyIndexRef.current]
    if (entry) {
      setFormData(entry.data)
      setHasUnsavedChanges(true)
    }
  }, [enabled, canRedo, setFormData])

  // Get history info
  const getHistoryInfo = useCallback(() => {
    return {
      current: historyIndexRef.current,
      total: historyRef.current.length,
      canUndo,
      canRedo,
      history: historyRef.current.map(entry => ({
        action: entry.action,
        timestamp: new Date(entry.timestamp)
      }))
    }
  }, [canUndo, canRedo])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [])

  return {
    // State
    hasUnsavedChanges,
    isAutoSaving,
    lastSaved,
    
    // Actions
    saveForm,
    clearForm,
    resetForm,
    undo,
    redo,
    
    // Info
    canUndo,
    canRedo,
    getHistoryInfo
  }
}