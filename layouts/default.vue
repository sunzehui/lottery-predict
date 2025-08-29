<template>
  <div class="min-h-screen bg-gray-50">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center">
          <h1 class="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-0">双色球预测分析系统</h1>
          <nav class="flex flex-wrap justify-center gap-1 sm:gap-2 md:gap-4">
            <NuxtLink to="/" class="text-gray-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium">首页</NuxtLink>
            <NuxtLink to="/history" class="text-gray-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium">历史数据</NuxtLink>
            <NuxtLink to="/predict" class="text-gray-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium">预测分析</NuxtLink>
            <NuxtLink to="/analysis" class="text-gray-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium">数据统计</NuxtLink>
            <NuxtLink to="/export" class="text-gray-700 hover:text-blue-600 px-2 py-1 sm:px-3 sm:py-2 rounded-md text-xs sm:text-sm font-medium">数据导出</NuxtLink>
          </nav>
        </div>
      </div>
    </header>
    
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <slot />
      </div>
    </main>
    
    <footer class="bg-white shadow mt-8">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <p class="text-center text-gray-500 text-sm">
          © {{ new Date().getFullYear() }} 双色球预测分析系统 - 仅供参考，不构成投资建议
        </p>
      </div>
    </footer>
    
    <!-- Toast 通知容器 -->
    <ToastContainer />
  </div>
</template>

<script setup>
import ToastContainer from '~/components/ToastContainer.vue'
</script>
