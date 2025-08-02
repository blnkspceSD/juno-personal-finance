/**
 * Utility functions for debouncing and throttling operations
 * Used to optimize performance in real-time updates
 */

export type DebounceOptions = {
  leading?: boolean
  trailing?: boolean
  maxWait?: number
}

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = false, trailing = true, maxWait } = options
  
  let lastCallTime: number | undefined
  let lastInvokeTime = 0
  let timerId: NodeJS.Timeout | undefined
  let lastArgs: Parameters<T>
  let lastThis: any
  let result: ReturnType<T>

  function invokeFunc(time: number) {
    const args = lastArgs
    const thisArg = lastThis

    lastArgs = undefined as any
    lastThis = undefined
    lastInvokeTime = time
    result = func.apply(thisArg, args)
    return result
  }

  function leadingEdge(time: number) {
    lastInvokeTime = time
    timerId = setTimeout(timerExpired, wait)
    return leading ? invokeFunc(time) : result
  }

  function remainingWait(time: number) {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime
    const timeWaiting = wait - timeSinceLastCall

    return maxWait !== undefined
      ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
      : timeWaiting
  }

  function shouldInvoke(time: number) {
    const timeSinceLastCall = time - lastCallTime!
    const timeSinceLastInvoke = time - lastInvokeTime

    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxWait !== undefined && timeSinceLastInvoke >= maxWait)
    )
  }

  function timerExpired() {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  function trailingEdge(time: number) {
    timerId = undefined

    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = undefined as any
    lastThis = undefined
    return result
  }

  function cancel() {
    if (timerId !== undefined) {
      clearTimeout(timerId)
    }
    lastInvokeTime = 0
    lastArgs = undefined as any
    lastCallTime = undefined
    lastThis = undefined
    timerId = undefined
  }

  function flush() {
    return timerId === undefined ? result : trailingEdge(Date.now())
  }

  function debounced(this: any, ...args: Parameters<T>) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = args
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }
      if (maxWait !== undefined) {
        timerId = setTimeout(timerExpired, wait)
        return invokeFunc(lastCallTime)
      }
    }
    if (timerId === undefined) {
      timerId = setTimeout(timerExpired, wait)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  return debounced as T & { cancel: () => void; flush: () => void }
}

/**
 * Creates a throttled function that only invokes func at most once per every wait milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  options: { leading?: boolean; trailing?: boolean } = {}
): T & { cancel: () => void; flush: () => void } {
  const { leading = true, trailing = true } = options
  return debounce(func, wait, {
    leading,
    trailing,
    maxWait: wait
  })
}

/**
 * Batches multiple calls to a function and executes them together
 * Useful for batching state updates
 */
export function batchUpdates<T>(
  func: (items: T[]) => void,
  delay: number = 16 // One frame at 60fps
) {
  let batch: T[] = []
  let timeoutId: NodeJS.Timeout | undefined

  return function addToBatch(item: T) {
    batch.push(item)

    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      if (batch.length > 0) {
        func([...batch])
        batch = []
      }
      timeoutId = undefined
    }, delay)
  }
}

/**
 * Creates a rate-limited function that will only execute once per specified interval
 * but will always execute the latest call after the interval
 */
export function rateLimit<T extends (...args: any[]) => any>(
  func: T,
  interval: number
): T & { cancel: () => void } {
  let lastExecution = 0
  let timeoutId: NodeJS.Timeout | undefined
  let latestArgs: Parameters<T>
  let latestThis: any

  function execute() {
    lastExecution = Date.now()
    return func.apply(latestThis, latestArgs)
  }

  function rateLimited(this: any, ...args: Parameters<T>) {
    latestArgs = args
    latestThis = this

    const now = Date.now()
    const timeSinceLastExecution = now - lastExecution

    if (timeSinceLastExecution >= interval) {
      return execute()
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(() => {
        execute()
        timeoutId = undefined
      }, interval - timeSinceLastExecution)
    }
  }

  rateLimited.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return rateLimited as T & { cancel: () => void }
}