import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  test: {
    // 启用类似 jest 的全局测试 API
    globals: true,
    // 模拟 DOM 环境
    environment: 'jsdom',
    // 支持 Vue 组件测试
    include: ['tests/**/*.test.ts', 'tests/**/*.test.vue'],
    setupFiles: ['./tests/setup.ts']
  },
  resolve: {
    alias: {
      '#imports': resolve(__dirname, './tests/mocks/imports.ts'),
      '@': resolve(__dirname),
      '~': resolve(__dirname),
      '~~': resolve(__dirname),
    },
  },
})
