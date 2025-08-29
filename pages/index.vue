<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- 欢迎区域 -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-4 sm:py-5 sm:p-6">
        <h2 class="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">欢迎使用双色球预测分析系统</h2>
        <p class="text-gray-600 mb-6">
          本系统基于历史开奖数据，运用多种算法进行分析和预测，为您提供双色球选号参考。
          请注意，彩票具有随机性，预测结果仅供参考，不构成投资建议。
        </p>
        
        <!-- 最新开奖信息 -->
        <div v-if="latestResult" class="bg-blue-50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6">
          <h3 class="text-base sm:text-lg font-medium text-blue-800 mb-2">最新开奖结果</h3>
          <div class="flex flex-wrap items-center gap-2 sm:gap-4">
            <div class="flex gap-1 sm:gap-2">
              <span
                v-for="ball in latestResult.redBalls"
                :key="ball"
                class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold"
              >
                {{ ball }}
              </span>
            </div>
            <span class="text-gray-500 text-sm sm:text-base">+</span>
            <span
              class="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs sm:text-sm font-bold"
            >
              {{ latestResult.blueBall }}
            </span>
            <span class="text-gray-600 text-xs sm:text-sm ml-0 sm:ml-4">
              第 {{ latestResult.issue }} 期 ({{ latestResult.openDate }})
            </span>
          </div>
        </div>
        
        <div v-else class="text-center py-3 sm:py-4">
          <p class="text-gray-500 text-sm">正在加载最新开奖信息...</p>
        </div>
      </div>
    </div>
    
    <!-- 功能卡片 -->
    <div class="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <!-- 历史数据卡片 -->
      <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-indigo-500 rounded-md p-2 sm:p-3">
              <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div class="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">历史数据</dt>
                <dd class="text-base sm:text-lg font-medium text-gray-900">查看历史开奖记录</dd>
              </dl>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <NuxtLink to="/history" class="text-xs sm:text-sm font-medium text-indigo-600 hover:text-indigo-500">
              查看详情 <span aria-hidden="true">&rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 预测分析卡片 -->
      <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-500 rounded-md p-2 sm:p-3">
              <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div class="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">预测分析</dt>
                <dd class="text-base sm:text-lg font-medium text-gray-900">智能预测下一期号码</dd>
              </dl>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <NuxtLink to="/predict" class="text-xs sm:text-sm font-medium text-green-600 hover:text-green-500">
              查看详情 <span aria-hidden="true">&rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 数据统计卡片 -->
      <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-500 rounded-md p-2 sm:p-3">
              <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">数据统计</dt>
                <dd class="text-base sm:text-lg font-medium text-gray-900">号码频率与趋势分析</dd>
              </dl>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <NuxtLink to="/analysis" class="text-xs sm:text-sm font-medium text-yellow-600 hover:text-yellow-500">
              查看详情 <span aria-hidden="true">&rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 数据导出卡片 -->
      <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-300">
        <div class="px-4 py-4 sm:py-5 sm:p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-500 rounded-md p-2 sm:p-3">
              <svg class="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div class="ml-3 sm:ml-5 w-0 flex-1">
              <dl>
                <dt class="text-xs sm:text-sm font-medium text-gray-500 truncate">数据导出</dt>
                <dd class="text-base sm:text-lg font-medium text-gray-900">导出历史数据与分析结果</dd>
              </dl>
            </div>
          </div>
          <div class="mt-3 sm:mt-4">
            <NuxtLink to="/export" class="text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-500">
              查看详情 <span aria-hidden="true">&rarr;</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 系统说明 -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="px-4 py-4 sm:py-5 sm:p-6">
        <h3 class="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">系统功能说明</h3>
        <div class="space-y-3 sm:space-y-4">
          <div>
            <h4 class="text-sm sm:text-base font-medium text-gray-900">历史数据查询</h4>
            <p class="text-gray-600 text-xs sm:text-sm">查看双色球历史开奖记录，支持按期号、日期范围筛选。</p>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-medium text-gray-900">智能预测分析</h4>
            <p class="text-gray-600 text-xs sm:text-sm">基于频率分析、趋势分析、冷热号分析等多种算法，预测下一期可能的号码组合。</p>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-medium text-gray-900">数据统计分析</h4>
            <p class="text-gray-600 text-xs sm:text-sm">分析号码出现频率、趋势变化、冷热号分布等统计信息。</p>
          </div>
          <div>
            <h4 class="text-sm sm:text-base font-medium text-gray-900">数据导出功能</h4>
            <p class="text-gray-600 text-xs sm:text-sm">支持将历史数据、预测结果、分析报告导出为JSON、CSV等格式。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面标题
useHead({
  title: '双色球预测分析系统 - 首页'
})

// 获取最新开奖结果
const latestResult = ref(null)

// 页面加载时获取最新开奖结果
onMounted(async () => {
  try {
    const response = await $fetch('/api/lottery/history', {
      params: {
        page: 1,
        size: 1
      }
    })
    
    if (response.success && response.data.length > 0) {
      const data = response.data[0]
      latestResult.value = {
        issue: data.issue,
        openDate: data.date,
        redBalls: [
          data.redBalls[0],
          data.redBalls[1],
          data.redBalls[2],
          data.redBalls[3],
          data.redBalls[4],
          data.redBalls[5]
        ].sort((a, b) => a - b),
        blueBall: data.blueBall
      }
    }
  } catch (error) {
    console.error('获取最新开奖结果失败:', error)
  }
})
</script>
