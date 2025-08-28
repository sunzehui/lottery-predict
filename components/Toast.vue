<template>
  <transition name="fade">
    <div v-if="show" class="fixed bottom-4 right-4 z-50 max-w-md">
      <div :class="toastClasses" class="border-l-4 p-4 shadow-lg rounded-md">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg v-if="type === 'success'" class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type === 'error'" class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type === 'warning'" class="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <svg v-else-if="type === 'info'" class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p :class="textClasses">{{ message }}</p>
          </div>
          <div class="ml-auto pl-3">
            <div class="-mx-1.5 -my-1.5">
              <button 
                @click="hideToast"
                :class="buttonClasses"
                class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2"
              >
                <span class="sr-only">关闭</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  message: {
    type: String,
    default: ''
  },
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // 'success', 'error', 'warning', 'info'
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000 // 默认显示3秒
  }
})

const emit = defineEmits(['hide'])

let timeoutId = null

// 计算样式类
const toastClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 border-green-500'
    case 'error':
      return 'bg-red-50 border-red-500'
    case 'warning':
      return 'bg-yellow-50 border-yellow-500'
    case 'info':
    default:
      return 'bg-blue-50 border-blue-500'
  }
})

const textClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-sm text-green-700'
    case 'error':
      return 'text-sm text-red-700'
    case 'warning':
      return 'text-sm text-yellow-700'
    case 'info':
    default:
      return 'text-sm text-blue-700'
  }
})

const buttonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600'
    case 'error':
      return 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600'
    case 'warning':
      return 'bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600'
    case 'info':
    default:
      return 'bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
  }
})

// 监听show属性变化
watch(() => props.show, (newVal) => {
  if (newVal) {
    // 设置自动隐藏
    timeoutId = setTimeout(() => {
      hideToast()
    }, props.duration)
  } else {
    // 如果隐藏了，清除定时器
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }
})

// 隐藏Toast
const hideToast = () => {
  emit('hide')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
