<template>
  <div class="min-h-screen bg-gray-50">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <!-- 全局错误通知组件 -->
    <ErrorNotification
      :message="errorStore.errorMessage"
      :show="errorStore.showError"
      :duration="errorStore.errorDuration"
      @hide="errorStore.hideErrorNotification"
    />
  </div>
</template>

<script setup lang="ts">
import { useErrorStore } from '~/stores/errorStore'

// 初始化错误存储
const errorStore = useErrorStore()

// 全局错误处理
onErrorCaptured((err) => {
  errorStore.handleApiError(err)
  // 返回false以阻止错误继续向上传播
  return false
})
</script>
