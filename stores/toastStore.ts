import { defineStore } from 'pinia'

export const useToastStore = defineStore('toast', {
  state: () => ({
    toasts: [] as Array<{
      id: number
      message: string
      type: 'success' | 'error' | 'warning' | 'info'
      duration: number
    }>,
    nextId: 1
  }),

  actions: {
    showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 3000) {
      const id = this.nextId++
      this.toasts.push({
        id,
        message,
        type,
        duration
      })

      // 自动移除 toast
      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },

    showSuccess(message: string, duration: number = 3000) {
      this.showToast(message, 'success', duration)
    },

    showError(message: string, duration: number = 5000) {
      this.showToast(message, 'error', duration)
    },

    showWarning(message: string, duration: number = 4000) {
      this.showToast(message, 'warning', duration)
    },

    showInfo(message: string, duration: number = 3000) {
      this.showToast(message, 'info', duration)
    },

    removeToast(id: number) {
      const index = this.toasts.findIndex(toast => toast.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    clearAllToasts() {
      this.toasts = []
    }
  }
})
