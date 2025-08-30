<template>
  <div class="space-y-6">
    <!-- 全局加载指示器 -->
    <div v-if="historyLoading" class="fixed top-4 right-4 z-50 pointer-events-none">
      <div class="bg-white rounded-lg shadow-lg p-4 flex items-center">
        <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-3"></div>
        <span class="text-gray-700 text-sm">加载中...</span>
      </div>
    </div>
    <!-- 页面标题 -->
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">预测分析</h1>
      <p class="mt-2 text-gray-600">基于多种算法预测下一期双色球号码，仅供参考</p>
    </div>
    
    <!-- 预测参数设置 -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">预测参数</h2>
      
      <!-- Tab 导航 -->
      <div class="border-b border-gray-200 mb-4">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'single'"
            :class="[
              activeTab === 'single'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            生成一组
          </button>
          <button
            @click="activeTab = 'multiple'"
            :class="[
              activeTab === 'multiple'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm'
            ]"
          >
            生成多组
          </button>
        </nav>
      </div>
      
      <!-- Tab 内容 -->
      <div>
        <!-- 生成一组 -->
        <div v-if="activeTab === 'single'" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label for="algorithm-single" class="block text-sm font-medium text-gray-700">预测算法</label>
              <div class="mt-1 relative">
                <select
                  id="algorithm-single"
                  v-model="singleParams.algorithm"
                  class="block appearance-none w-full bg-white border border-gray-300 rounded py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="frequency">频率分析</option>
                  <option value="trend">趋势分析</option>
                  <option value="coldHot">冷热号分析</option>
                  <option value="mixed">综合算法</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="flex items-end">
              <button
                @click="generateSinglePrediction"
                :disabled="loading"
                class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ loading ? '生成中...' : '生成一组预测' }}
              </button>
            </div>
          </div>
          
          <!-- 算法说明 -->
          <div class="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 class="text-sm font-medium text-gray-900 mb-2">算法说明</h3>
            <p class="text-sm text-gray-600" v-if="singleParams.algorithm === 'frequency'">
              频率分析：基于历史数据中各号码出现的频率，选择高频号码进行组合。高频号码在近期有较高的出现概率。
            </p>
            <p class="text-sm text-gray-600" v-else-if="singleParams.algorithm === 'trend'">
              趋势分析：分析号码的出现趋势，选择处于上升趋势的号码。考虑号码近期出现频率的变化情况。
            </p>
            <p class="text-sm text-gray-600" v-else-if="singleParams.algorithm === 'coldHot'">
              冷热号分析：结合热号（近期频繁出现）和冷号（长期未出现）进行组合。热号有持续热度，冷号有回补可能。
            </p>
            <p class="text-sm text-gray-600" v-else-if="singleParams.algorithm === 'mixed'">
              综合算法：结合频率分析、趋势分析和冷热号分析，按照不同权重综合计算得出预测结果。
            </p>
          </div>
        </div>
        
        <!-- 生成多组 -->
        <div v-if="activeTab === 'multiple'" class="space-y-4">
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label for="algorithm-multiple" class="block text-sm font-medium text-gray-700">预测算法</label>
              <div class="mt-1 relative">
                <select
                  id="algorithm-multiple"
                  v-model="multipleParams.algorithm"
                  class="block appearance-none w-full bg-white border border-gray-300 rounded py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="frequency">频率分析</option>
                  <option value="trend">趋势分析</option>
                  <option value="coldHot">冷热号分析</option>
                  <option value="mixed">综合算法</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div>
              <label for="count-multiple" class="block text-sm font-medium text-gray-700">预测组数</label>
              <div class="mt-1 relative">
                <select
                  id="count-multiple"
                  v-model="multipleParams.count"
                  class="block appearance-none w-full bg-white border border-gray-300 rounded py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option :value="1">1组</option>
                  <option :value="3">3组</option>
                  <option :value="5">5组</option>
                  <option :value="10">10组</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
            </div>
            <div class="flex items-end">
              <button
                @click="generateMultiplePrediction"
                :disabled="loading"
                class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ loading ? '生成中...' : '生成多组预测' }}
              </button>
            </div>
          </div>
          
          <!-- 算法说明 -->
          <div class="mt-4 p-4 bg-gray-50 rounded-md">
            <h3 class="text-sm font-medium text-gray-900 mb-2">算法说明</h3>
            <p class="text-sm text-gray-600" v-if="multipleParams.algorithm === 'frequency'">
              频率分析：基于历史数据中各号码出现的频率，选择高频号码进行组合。高频号码在近期有较高的出现概率。
            </p>
            <p class="text-sm text-gray-600" v-else-if="multipleParams.algorithm === 'trend'">
              趋势分析：分析号码的出现趋势，选择处于上升趋势的号码。考虑号码近期出现频率的变化情况。
            </p>
            <p class="text-sm text-gray-600" v-else-if="multipleParams.algorithm === 'coldHot'">
              冷热号分析：结合热号（近期频繁出现）和冷号（长期未出现）进行组合。热号有持续热度，冷号有回补可能。
            </p>
            <p class="text-sm text-gray-600" v-else-if="multipleParams.algorithm === 'mixed'">
              综合算法：结合频率分析、趋势分析和冷热号分析，按照不同权重综合计算得出预测结果。
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 预测结果 -->
    <div v-if="predictions.length > 0" class="bg-white shadow rounded-lg overflow-hidden prediction-results">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">预测结果</h2>
        <p class="mt-1 text-sm text-gray-500">
          第 {{ predictions[0].issue }} 期 ({{ formatDate(predictions[0].predictDate) }})
        </p>
      </div>
      
      <div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <div 
          v-for="(prediction, index) in predictions" 
          :key="index"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
        >
          <div class="flex justify-between items-start mb-3">
            <span class="text-sm font-medium text-gray-500">方案 {{ index + 1 }}</span>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              置信度: {{ prediction.confidence.toFixed(1) }}%
            </span>
          </div>
          
          <div class="flex items-center space-x-2 mb-2">
            <div class="flex space-x-1">
              <span 
                v-for="ball in prediction.redBalls" 
                :key="ball" 
                class="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-bold"
              >
                {{ ball }}
              </span>
            </div>
            <span class="text-gray-500">+</span>
            <span 
              class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold"
            >
              {{ prediction.blueBall }}
            </span>
          </div>
          
          <div class="text-xs text-gray-500">
            算法: {{ getAlgorithmName(prediction.algorithm) }}
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex justify-between">
          <button
            @click="savePredictions"
            class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            保存预测结果
          </button>
          <button
            @click="clearPredictions"
            class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            清除结果
          </button>
        </div>
      </div>
    </div>
    
    <!-- 历史预测记录 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">历史预测记录</h2>
      </div>
      
      <!-- 期数过滤器 -->
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="filterIssue" class="block text-sm font-medium text-gray-700">期数</label>
            <div class="mt-1 relative">
              <select
                id="filterIssue"
                v-model="issueFilter.issue"
                class="block appearance-none w-full bg-white border border-gray-300 rounded py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">请选择期数</option>
                <option
                  v-for="issue in availableIssues"
                  :key="issue"
                  :value="issue"
                >
                  第 {{ issue }} 期
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <div class="flex items-end">
            <button
              @click="applyIssueFilter"
              :disabled="historyLoading || !issueFilter.issue"
              class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              查询
            </button>
          </div>
          <div class="flex items-end">
            <button
              @click="resetIssueFilter"
              :disabled="historyLoading"
              class="w-full bg-gray-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              重置
            </button>
          </div>
        </div>
      </div>
      
      <div class="p-4">
        <!-- 空数据状态 -->
        <div v-if="historyData.length === 0 && !historyLoading" class="flex justify-center items-center py-8">
          <div class="text-sm text-gray-500">暂无历史预测记录</div>
        </div>
        
        <!-- 卡片布局 -->
        <div v-if="historyData.length > 0" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="item in historyData"
            :key="item.id"
            class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-300"
          >
            <!-- 卡片头部：期号和日期 -->
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="text-sm font-medium text-gray-900">第 {{ item.issue }} 期</h3>
                <p class="text-xs text-gray-500 mt-1">{{ formatDate(item.predictDate) }}</p>
              </div>
              <span
                :class="getPrizeLevelClass(item.prizeLevel, item.hasResult)"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              >
                {{ getPrizeLevelText(item.prizeLevel, item.hasResult) }}
              </span>
            </div>
            
            <!-- 号码显示 -->
            <div class="mb-3">
              <div class="flex items-center space-x-2">
                <div class="flex space-x-1">
                  <span
                    v-for="ball in getRedBalls(item)"
                    :key="ball"
                    class="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ ball }}
                  </span>
                </div>
                <span class="text-gray-500">+</span>
                <span
                  class="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold inline-block"
                >
                  {{ item.blueBall }}
                </span>
              </div>
            </div>
            
            <!-- 底部信息：算法和置信度 -->
            <div class="flex justify-between items-center text-xs text-gray-500">
              <div>
                <span class="font-medium">算法:</span> {{ getAlgorithmName(item.algorithmType) }}
              </div>
              <div>
                <span class="font-medium">置信度:</span> {{ item.confidence }}%
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 无限滚动加载更多提示 -->
      <div v-if="hasMoreData && !historyLoading" ref="loadMoreTrigger" class="py-4 text-center">
        <div class="text-sm text-gray-500">上拉加载更多</div>
      </div>
      
      <!-- 加载更多状态 -->
      <div v-if="loadingMore" class="py-4 text-center">
        <div class="text-sm text-gray-500">加载更多中...</div>
      </div>
      
      <!-- 无更多数据提示 -->
      <div v-if="!hasMoreData && historyData.length > 0" class="py-4 text-center">
        <div class="text-sm text-gray-500">已加载全部数据</div>
      </div>
    </div>
  </div>
  
  <!-- 视频弹框 -->
  <div v-if="showVideoModal" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" @click="closeVideoModal"></div>
      
      <!-- 弹框内容 -->
      <div class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-gray-900">占卜师正在为您预测...</h3>
          <button @click="closeVideoModal" class="text-gray-400 hover:text-gray-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- 视频播放器 -->
        <div class="aspect-w-16 aspect-h-9">
          <video
            ref="videoPlayer"
            class="w-full h-auto rounded-lg"
            autoplay
            @ended="onVideoEnded"
          >
            <source src="/soothsayer.mp4" type="video/mp4">
            您的浏览器不支持视频播放。
          </video>
        </div>
        
        <div class="mt-4 text-sm text-gray-500" v-if="false">
          播放结束后将自动显示预测结果
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面标题
useHead({
  title: '双色球预测分析系统 - 预测分析'
})

import { useErrorStore } from '~/stores/errorStore'
import { useToastStore } from '~/stores/toastStore'
import { getWithTimeout, postWithTimeout } from '~/utils/apiUtils'
import { computed, nextTick, onUnmounted, watch } from 'vue'

// 浏览器兼容性检测和平滑滚动工具函数
const scrollUtils = {
  // 检测浏览器是否支持现代scrollIntoView选项
  supportsSmoothScroll: () => {
    try {
      const div = document.createElement('div')
      return 'scrollBehavior' in document.documentElement.style &&
             typeof div.scrollIntoView === 'function' &&
             'scrollIntoViewOptions' in window
    } catch (e) {
      return false
    }
  },
  
  // 平滑滚动到元素
  scrollToElement: (element, options = {}) => {
    if (!element) return
    
    const defaultOptions = {
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest'
    }
    
    const finalOptions = { ...defaultOptions, ...options }
    
    // 如果支持现代scrollIntoView，直接使用
    if (scrollUtils.supportsSmoothScroll()) {
      try {
        element.scrollIntoView(finalOptions)
        return
      } catch (e) {
        console.warn('现代scrollIntoView失败，使用降级方案:', e)
      }
    }
    
    // 降级方案：使用传统的scrollTop方法
    scrollUtils.fallbackScrollToElement(element, finalOptions)
  },
  
  // 降级滚动方案
  fallbackScrollToElement: (element, options) => {
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset
    const startPosition = window.pageYOffset
    const distance = targetPosition - startPosition
    const duration = options.behavior === 'smooth' ? 500 : 0 // 平滑滚动持续时间
    
    if (duration === 0) {
      // 即时滚动
      window.scrollTo(0, targetPosition)
      return
    }
    
    // 平滑滚动动画
    let start = null
    const animation = (timestamp) => {
      if (!start) start = timestamp
      const progress = timestamp - start
      const percentage = Math.min(progress / duration, 1)
      
      // 缓动函数
      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      }
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic(percentage))
      
      if (percentage < 1) {
        window.requestAnimationFrame(animation)
      }
    }
    
    window.requestAnimationFrame(animation)
  },
  
  // 检查元素是否包含预测结果
  isPredictionResultsElement: (element) => {
    if (!element) return false
    
    // 检查类名
    if (element.classList && element.classList.contains('prediction-results')) {
      return true
    }
    
    // 检查子元素中是否包含预测结果相关内容
    const heading = element.querySelector('h2')
    if (heading && heading.textContent && heading.textContent.includes('预测结果')) {
      return true
    }
    
    // 检查元素本身的内容
    if (element.textContent && element.textContent.includes('预测结果')) {
      return true
    }
    
    return false
  }
}

// 初始化错误存储和Toast存储
const errorStore = useErrorStore()
const toastStore = useToastStore()

// Tab 状态
const activeTab = ref('single')

// 单组预测参数
const singleParams = ref({
  algorithm: 'frequency'
})

// 多组预测参数
const multipleParams = ref({
  algorithm: 'frequency',
  count: 5
})

// 为了向后兼容，保留原有的 params 对象
const params = computed(() => {
  return activeTab.value === 'single'
    ? { ...singleParams.value, count: 1 }
    : multipleParams.value
})

// 预测结果
const predictions = ref([])
const loading = ref(false)

// 历史预测记录
const historyData = ref([])
const historyLoading = ref(false)
const loadingMore = ref(false)

// 开奖结果数据
const lotteryResults = ref({})

// 分页状态
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
  totalPages: 0
})

// 无限滚动相关
const loadMoreTrigger = ref(null)
const hasMoreData = ref(true)
const observer = ref(null)

// 视频弹框相关
const showVideoModal = ref(false)
const videoPlayer = ref(null)

// 期数过滤相关
const issueFilter = ref({
  issue: ''
})
const availableIssues = ref([])
const issuesLoading = ref(false)

// 获取算法名称
const getAlgorithmName = (algorithm) => {
  const algorithmMap = {
    'frequency': '频率分析',
    'trend': '趋势分析',
    'coldHot': '冷热号分析',
    'mixed': '综合算法'
  }
  return algorithmMap[algorithm] || algorithm
}

// 格式化日期为本地时间（年月日 周一）
const formatDate = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) return dateString
  
  // 获取年月日
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  // 获取星期几
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  
  return `${year}年${month}月${day}日（${weekday}）`
}

// 获取红球号码
const getRedBalls = (item) => {
  return item.redBalls.sort((a, b) => a - b)
}

// 计算中奖等级
const calculatePrizeLevel = (prediction, result) => {
  if (!result) return null
  
  const redHits = prediction.redBalls.filter(ball => result.redBalls.includes(ball)).length
  const blueHit = prediction.blueBall === result.blueBall
  
  // 双色球中奖规则
  if (redHits === 6 && blueHit) return 1
  if (redHits === 6 && !blueHit) return 2
  if (redHits === 5 && blueHit) return 3
  if (redHits === 5 || (redHits === 4 && blueHit)) return 4
  if (redHits === 4 || (redHits === 3 && blueHit)) return 5
  if ((redHits === 2 && blueHit) || (redHits === 1 && blueHit) || (redHits === 0 && blueHit)) return 6
  
  return null
}

// 获取中奖等级文本
const getPrizeLevelText = (prizeLevel, hasResult = true) => {
  if (!hasResult) return '等待开奖'
  if (!prizeLevel) return '未中奖'
  
  const prizeTexts = {
    1: '一等奖',
    2: '二等奖',
    3: '三等奖',
    4: '四等奖',
    5: '五等奖',
    6: '六等奖'
  }
  
  return prizeTexts[prizeLevel] || '未中奖'
}

// 获取中奖等级样式类
const getPrizeLevelClass = (prizeLevel, hasResult = true) => {
  if (!hasResult) return 'bg-yellow-100 text-yellow-800'
  if (!prizeLevel) return 'bg-gray-100 text-gray-800'
  
  const prizeClasses = {
    1: 'bg-red-100 text-red-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-yellow-100 text-yellow-800',
    4: 'bg-green-100 text-green-800',
    5: 'bg-blue-100 text-blue-800',
    6: 'bg-purple-100 text-purple-800'
  }
  
  return prizeClasses[prizeLevel] || 'bg-gray-100 text-gray-800'
}

// 生成单组预测
const generateSinglePrediction = async () => {
  // 显示视频弹框
  showVideoModal.value = true
}

// 执行实际的预测请求
const executePrediction = async () => {
  loading.value = true
  try {
    const response = await getWithTimeout('/api/lottery/predict', {
      algorithm: singleParams.value.algorithm,
      count: 1
    })
    
    if (response.success) {
      predictions.value = response.data.predictions
      // 按照置信度由高到低排序
      predictions.value.sort((a, b) => b.confidence - a.confidence)
      
      // 滚动到预测结果区域
      nextTick(() => {
        const resultsElement = document.querySelector('.prediction-results')
        console.log('预测结果元素:', resultsElement);
        
        if (resultsElement && scrollUtils.isPredictionResultsElement(resultsElement)) {
          scrollUtils.scrollToElement(resultsElement, { behavior: 'smooth', block: 'start' })
        }
      })
    }
  } catch (error) {
    errorStore.handleApiError(error)
  } finally {
    loading.value = false
  }
}

// 生成多组预测
const generateMultiplePrediction = async () => {
  loading.value = true
  try {
    const response = await getWithTimeout('/api/lottery/predict', multipleParams.value)
    
    if (response.success) {
      predictions.value = response.data.predictions
      // 按照置信度由高到低排序
      predictions.value.sort((a, b) => b.confidence - a.confidence)
    }
  } catch (error) {
    errorStore.handleApiError(error)
  } finally {
    loading.value = false
  }
}

// 为了向后兼容，保留原有的 generatePrediction 函数
const generatePrediction = async () => {
  if (activeTab.value === 'single') {
    await generateSinglePrediction()
  } else {
    await generateMultiplePrediction()
  }
}

// 保存预测结果
const savePredictions = async () => {
  try {
    if (predictions.value.length === 0) {
      toastStore.showWarning('没有可保存的预测结果')
      return
    }

    // 调用保存API
    const response = await postWithTimeout('/api/lottery/predict/save', {
      predictions: predictions.value
    })
    
    if (response.success) {
      toastStore.showSuccess(`成功保存 ${response.data.savedCount} 组预测结果`)
      
      // 如果有保存失败的预测，显示错误信息
      if (response.data.errors && response.data.errors.length > 0) {
        console.warn('部分预测结果保存失败:', response.data.errors)
        toastStore.showWarning('部分预测结果保存失败，请查看控制台获取详细信息')
      }
      
      // 刷新历史预测记录
      await fetchHistoryData()
    } else {
      toastStore.showError('保存预测结果失败')
    }
  } catch (error) {
    console.error('保存预测失败:', error)
    errorStore.handleApiError(error)
    toastStore.showError('保存预测结果失败，请重试')
  }
}

// 清除预测结果
const clearPredictions = () => {
  predictions.value = []
}

// 获取可用期数列表
const fetchAvailableIssues = async () => {
  issuesLoading.value = true
  try {
    const response = await getWithTimeout('/api/lottery/predict/available-issues', {
      limit: 10
    })
    
    if (response.success) {
      availableIssues.value = response.data || []
    }
  } catch (error) {
    errorStore.handleApiError(error)
  } finally {
    issuesLoading.value = false
  }
}

// 应用期数过滤
const applyIssueFilter = async () => {
  if (!issueFilter.value.issue) {
    toastStore.showError('请选择要查询的期数')
    return
  }
  
  // 重置分页并重新获取数据
  pagination.value.page = 1
  hasMoreData.value = true
  
  // 直接获取新数据，不要清空历史数据
  await fetchHistoryData(1, false)
}

// 重置期数过滤
const resetIssueFilter = async () => {
  issueFilter.value.issue = ''
  
  // 重置分页并重新获取数据
  pagination.value.page = 1
  hasMoreData.value = true
  
  // 直接获取新数据，不要清空历史数据
  await fetchHistoryData(1, false)
}

// 获取历史预测记录
const fetchHistoryData = async (page = 1, append = false) => {
  if (!append) {
    historyLoading.value = true
  } else {
    loadingMore.value = true
  }
  
  try {
    // 构建请求参数
    const queryParams = {
      page,
      size: pagination.value.size
    }
    
    // 添加期数过滤参数
    if (issueFilter.value.issue) {
      queryParams.issue = issueFilter.value.issue
    }
    
    const response = await getWithTimeout('/api/lottery/predict/history', queryParams)
    
    if (response.success) {
      // 获取历史预测记录
      const predictions = response.data
      
      // 更新分页信息
      if (response.pagination) {
        pagination.value = {
          page: response.pagination.page,
          size: response.pagination.size,
          total: response.pagination.total,
          totalPages: response.pagination.totalPages
        }
        
        // 检查是否还有更多数据
        hasMoreData.value = pagination.value.page < pagination.value.totalPages
      }
      
      // 获取所有期号
      const issues = [...new Set(predictions.map(p => p.issue))]
      
      // 获取开奖结果 - 批量获取所有期号的结果，减少闪烁
      const resultsMap = {}
      if (issues.length > 0) {
        try {
          // 使用 Promise.all 并行获取所有期号的结果
          const resultPromises = issues.map(issue =>
            getWithTimeout('/api/lottery/history', {
              issue,
              size: 1
            }).catch(error => {
              console.warn(`获取期号 ${issue} 的开奖结果失败:`, error)
              return { success: false, data: [] }
            })
          )
          
          const results = await Promise.all(resultPromises)
          
          // 处理结果
          results.forEach((resultResponse, index) => {
            if (resultResponse.success && resultResponse.data.length > 0) {
              resultsMap[issues[index]] = resultResponse.data[0]
            }
          })
        } catch (error) {
          console.warn('批量获取开奖结果失败:', error)
        }
      }
      
      // 计算每个预测的中奖等级
      const processedPredictions = predictions.map(prediction => {
        const result = resultsMap[prediction.issue]
        const prizeLevel = result ? calculatePrizeLevel(prediction, result) : null
        const hasResult = !!result
        
        return {
          ...prediction,
          prizeLevel,
          hasResult
        }
      })
      
      // 根据是否追加数据来更新历史数据
      if (append) {
        historyData.value = [...historyData.value, ...processedPredictions]
      } else {
        historyData.value = processedPredictions
      }
    }
  } catch (error) {
    errorStore.handleApiError(error)
  } finally {
    historyLoading.value = false
    loadingMore.value = false
  }
}

// 加载更多数据
const loadMoreData = async () => {
  if (hasMoreData.value && !loadingMore.value && !historyLoading.value) {
    const nextPage = pagination.value.page + 1
    await fetchHistoryData(nextPage, true)
  }
}

// 设置无限滚动观察器
const setupInfiniteScroll = () => {
  if (observer.value) {
    observer.value.disconnect()
  }
  
  observer.value = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMoreData.value) {
      loadMoreData()
    }
  }, {
    rootMargin: '100px' // 提前100px触发加载
  })
  
  if (loadMoreTrigger.value) {
    observer.value.observe(loadMoreTrigger.value)
  }
}

// 页面加载时获取历史预测记录、可用期数和设置无限滚动
onMounted(() => {
  fetchHistoryData()
  fetchAvailableIssues()
  
  // 在下一个tick中设置无限滚动，确保DOM已渲染
  nextTick(() => {
    setupInfiniteScroll()
  })
})

// 组件卸载时断开观察器
onUnmounted(() => {
  if (observer.value) {
    observer.value.disconnect()
  }
})

// 监听loadMoreTrigger元素的变化，重新设置观察器
watch(loadMoreTrigger, () => {
  if (loadMoreTrigger.value) {
    setupInfiniteScroll()
  }
})

// 视频播放完成后的处理
const onVideoEnded = async () => {
  // 关闭视频弹框
  showVideoModal.value = false
  
  // 执行预测请求
  await executePrediction()
}

// 关闭视频弹框
const closeVideoModal = () => {
  showVideoModal.value = false
  if (videoPlayer.value) {
    videoPlayer.value.pause()
    videoPlayer.value.currentTime = 0
  }
}
</script>

