import { defineStore } from 'pinia'

interface ApiError {
  data?: {
    message?: string
    statusMessage?: string
  }
  message?: string
}

export const useErrorStore = defineStore('error', {
  state: () => ({
    errorMessage: '',
    showError: false,
    errorDuration: 5000 // 默认显示5秒
  }),

  actions: {
    // 显示错误消息
    showErrorNotification(message: string, duration = 5000) {
      this.errorMessage = message
      this.errorDuration = duration
      this.showError = true
    },

    // 隐藏错误消息
    hideErrorNotification() {
      this.showError = false
      this.errorMessage = ''
    },

    // 处理API错误
    handleApiError(error: ApiError | string | unknown) {
      console.error('API错误:', error)

      // 从错误对象中提取错误消息
      let errorMessage = '操作失败，请重试'

      if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object' && 'data' in error) {
        const apiError = error as ApiError
        if (apiError.data?.message) {
          errorMessage = apiError.data.message
        } else if (apiError.data?.statusMessage) {
          errorMessage = apiError.data.statusMessage
        }
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = (error as Error).message
      }

      // 检查是否是超时错误
      if (error && typeof error === 'object' && 'statusCode' in error) {
        const statusCode = (error as any).statusCode
        if (statusCode === 408) {
          errorMessage = '请求超时，请检查网络连接后重试'
        }
      }

      this.showErrorNotification(errorMessage)
    }
  }
})
