/**
 * Safe Async Hook
 * Prevents React state updates on unmounted components
 */

import { useRef, useCallback, useEffect } from 'react'

export function useSafeAsync() {
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const safeSetState = useCallback((callback: () => void) => {
    if (isMountedRef.current) {
      callback()
    }
  }, [])

  return { isMounted: isMountedRef.current, safeSetState }
}

/**
 * Safe async effect that cancels on unmount
 */
export function useSafeEffect(
  effect: (isCancelled: () => boolean) => void | (() => void),
  deps: React.DependencyList
) {
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    const isCancelled = () => !isMountedRef.current

    const cleanup = effect(isCancelled)

    return () => {
      isMountedRef.current = false
      if (cleanup) {
        cleanup()
      }
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])
}

export default useSafeAsync