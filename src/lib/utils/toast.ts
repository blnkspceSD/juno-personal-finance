// Simple toast utility for user feedback
// This is a minimal implementation - in production, consider using react-hot-toast or similar

interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
  duration?: number
}

class SimpleToast {
  private toasts: ToastMessage[] = []
  private listeners: ((toasts: ToastMessage[]) => void)[] = []

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.toasts]))
  }

  subscribe(listener: (toasts: ToastMessage[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  show(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 4000) {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: ToastMessage = { id, message, type, duration }
    
    this.toasts.push(toast)
    this.notifyListeners()

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id)
      }, duration)
    }

    return id
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration)
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration)
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration)
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notifyListeners()
  }

  getToasts() {
    return [...this.toasts]
  }
}

export const toast = new SimpleToast()
export type { ToastMessage }