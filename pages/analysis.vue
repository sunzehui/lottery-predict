<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">双色球数据分析</h1>
    
    <!-- 分析类型选择 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">选择分析类型</h2>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          @click="analysisType = 'frequency'" 
          :class="['px-4 py-2 rounded-md transition-colors', analysisType === 'frequency' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          号码频率分析
        </button>
        <button 
          @click="analysisType = 'trend'" 
          :class="['px-4 py-2 rounded-md transition-colors', analysisType === 'trend' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          号码趋势分析
        </button>
        <button 
          @click="analysisType = 'coldHot'" 
          :class="['px-4 py-2 rounded-md transition-colors', analysisType === 'coldHot' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          冷热号分析
        </button>
        <button 
          @click="analysisType = 'combination'" 
          :class="['px-4 py-2 rounded-md transition-colors', analysisType === 'combination' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          号码组合分析
        </button>
      </div>
    </div>
    
    <!-- 分析参数设置 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">分析参数</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">分析期数</label>
          <select v-model="analysisParams.issueCount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="30">最近30期</option>
            <option value="50">最近50期</option>
            <option value="100">最近100期</option>
            <option value="200">最近200期</option>
            <option value="all">全部</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
          <input 
            v-model="analysisParams.startDate" 
            type="date" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
          <input 
            v-model="analysisParams.endDate" 
            type="date" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
      <div class="mt-4">
        <button 
          @click="runAnalysis" 
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading ? '分析中...' : '开始分析' }}
        </button>
      </div>
    </div>
    
    <!-- 分析结果展示 -->
    <div v-if="analysisResult" class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">分析结果</h2>
      
      <!-- 号码频率分析结果 -->
      <div v-if="analysisType === 'frequency' && analysisResult.frequency" class="mb-8">
        <h3 class="text-lg font-medium mb-4">号码频率分析</h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- 红球频率 -->
          <div>
            <h4 class="text-md font-medium mb-2">红球频率分布</h4>
            <div class="grid grid-cols-11 gap-1">
              <div
                v-for="(freq, num) in analysisResult.frequency.red"
                :key="num"
                class="text-center p-1 rounded"
                :style="{ backgroundColor: getFrequencyColor(freq, 'red') }"
              >
                <div class="text-xs">{{ num }}</div>
                <div class="text-xs font-bold">{{ freq }}</div>
              </div>
            </div>
          </div>
          
          <!-- 蓝球频率 -->
          <div>
            <h4 class="text-md font-medium mb-2">蓝球频率分布</h4>
            <div class="grid grid-cols-8 gap-1">
              <div
                v-for="(freq, num) in analysisResult.frequency.blue"
                :key="num"
                class="text-center p-1 rounded"
                :style="{ backgroundColor: getFrequencyColor(freq, 'blue') }"
              >
                <div class="text-xs">{{ num }}</div>
                <div class="text-xs font-bold">{{ freq }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 频率统计表格 -->
        <div class="mt-6">
          <h4 class="text-md font-medium mb-2">频率统计</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">号码类型</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最高频率</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最低频率</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平均频率</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">红球</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ analysisResult.frequency.redStats.max }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ analysisResult.frequency.redStats.min }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ analysisResult.frequency.redStats.avg }}</td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap">蓝球</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ analysisResult.frequency.blueStats.max }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ analysisResult.frequency.blueStats.min }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ analysisResult.frequency.blueStats.avg }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      <!-- 号码趋势分析结果 -->
      <div v-if="analysisType === 'trend' && analysisResult.trend" class="mb-8">
        <h3 class="text-lg font-medium mb-4">号码趋势分析</h3>
        
        <div class="mb-6">
          <h4 class="text-md font-medium mb-2">近期趋势</h4>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期号</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开奖日期</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">红球</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">蓝球</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">趋势</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in analysisResult.trend.recent" :key="item.issue">
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.issue }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.date }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.redBalls.join(', ') }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">{{ item.blueBall }}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span :class="['px-2 py-1 rounded-full text-xs', getTrendClass(item.trend)]">
                      {{ getTrendText(item.trend) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div>
          <h4 class="text-md font-medium mb-2">趋势统计</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">上升趋势</div>
              <div class="text-2xl font-bold">{{ analysisResult.trend.stats.up }}</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">下降趋势</div>
              <div class="text-2xl font-bold">{{ analysisResult.trend.stats.down }}</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-md">
              <div class="text-sm text-gray-500">平稳趋势</div>
              <div class="text-2xl font-bold">{{ analysisResult.trend.stats.stable }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 冷热号分析结果 -->
      <div v-if="analysisType === 'coldHot' && analysisResult.coldHot" class="mb-8">
        <h3 class="text-lg font-medium mb-4">冷热号分析</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 热号 -->
          <div>
            <h4 class="text-md font-medium mb-2">热号 (高频号码)</h4>
            <div>
              <h5 class="text-sm font-medium mb-1">红球热号</h5>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="num in analysisResult.coldHot.hot.red"
                  :key="num"
                  class="px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                >
                  {{ num }}
                </span>
              </div>
            </div>
            <div class="mt-3">
              <h5 class="text-sm font-medium mb-1">蓝球热号</h5>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="num in analysisResult.coldHot.hot.blue"
                  :key="num"
                  class="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                >
                  {{ num }}
                </span>
              </div>
            </div>
          </div>
          
          <!-- 冷号 -->
          <div>
            <h4 class="text-md font-medium mb-2">冷号 (低频号码)</h4>
            <div>
              <h5 class="text-sm font-medium mb-1">红球冷号</h5>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="num in analysisResult.coldHot.cold.red"
                  :key="num"
                  class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                >
                  {{ num }}
                </span>
              </div>
            </div>
            <div class="mt-3">
              <h5 class="text-sm font-medium mb-1">蓝球冷号</h5>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="num in analysisResult.coldHot.cold.blue"
                  :key="num"
                  class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
                >
                  {{ num }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 号码组合分析结果 -->
      <div v-if="analysisType === 'combination' && analysisResult.combination" class="mb-8">
        <h3 class="text-lg font-medium mb-4">号码组合分析</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 奇偶比 -->
          <div>
            <h4 class="text-md font-medium mb-2">奇偶比分析</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奇偶比</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现次数</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现概率</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, ratio) in analysisResult.combination.oddEven" :key="ratio">
                    <td class="px-4 py-2 whitespace-nowrap">{{ ratio }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ item.count }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ (item.percentage * 100).toFixed(2) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 大小比 -->
          <div>
            <h4 class="text-md font-medium mb-2">大小比分析</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">大小比</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现次数</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现概率</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, ratio) in analysisResult.combination.bigSmall" :key="ratio">
                    <td class="px-4 py-2 whitespace-nowrap">{{ ratio }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ item.count }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ (item.percentage * 100).toFixed(2) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 和值分析 -->
          <div>
            <h4 class="text-md font-medium mb-2">和值分析</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">和值范围</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现次数</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现概率</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, range) in analysisResult.combination.sumRange" :key="range">
                    <td class="px-4 py-2 whitespace-nowrap">{{ range }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ item.count }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ (item.percentage * 100).toFixed(2) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- 连号分析 -->
          <div>
            <h4 class="text-md font-medium mb-2">连号分析</h4>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">连号情况</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现次数</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">出现概率</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="(item, type) in analysisResult.combination.consecutive" :key="type">
                    <td class="px-4 py-2 whitespace-nowrap">{{ type === 'has' ? '有连号' : '无连号' }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ item.count }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">{{ (item.percentage * 100).toFixed(2) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">{{ error }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面标题
useHead({
  title: '双色球预测分析系统 - 数据分析'
})

import { ref, onMounted } from 'vue'
import { useErrorStore } from '~/stores/errorStore'
import { getWithTimeout } from '~/utils/apiUtils'

// 初始化错误存储
const errorStore = useErrorStore()

// 分析类型
const analysisType = ref('frequency')

// 分析参数
const analysisParams = ref({
  issueCount: '100',
  startDate: '',
  endDate: ''
})

// 分析结果
const analysisResult = ref(null)

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref(null)

// 初始化日期
onMounted(() => {
  // 设置默认日期范围为最近3个月
  const today = new Date()
  const threeMonthsAgo = new Date(today)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  analysisParams.value.endDate = formatDate(today)
  analysisParams.value.startDate = formatDate(threeMonthsAgo)
})

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取频率颜色
function getFrequencyColor(freq, ballType = 'blue') {
  // 根据频率值返回不同的颜色，频率越高颜色越深
  const intensity = Math.min(255, Math.floor(freq * 10))
  
  if (ballType === 'red') {
    // 红球使用红色背景
    return `rgba(239, 68, 68, ${intensity / 255})`
  } else {
    // 蓝球使用蓝色背景
    return `rgba(59, 130, 246, ${intensity / 255})`
  }
}

// 获取趋势样式类
function getTrendClass(trend) {
  switch (trend) {
    case 'up':
      return 'bg-green-100 text-green-800'
    case 'down':
      return 'bg-red-100 text-red-800'
    case 'stable':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// 获取趋势文本
function getTrendText(trend) {
  switch (trend) {
    case 'up':
      return '上升'
    case 'down':
      return '下降'
    case 'stable':
      return '平稳'
    default:
      return '未知'
  }
}

// 转换频率分析数据
function transformFrequencyData(data) {
  // 后端返回的是 NumberFrequency[] 数组，需要转换为前端期望的格式
  const redFreq = {}
  const blueFreq = {}
  
  // 计算红球和蓝球的统计数据
  let redMax = 0, redMin = Infinity, redSum = 0, redCount = 0
  let blueMax = 0, blueMin = Infinity, blueSum = 0, blueCount = 0
  
  data.forEach(item => {
    if (item.ballType === 'red') {
      redFreq[item.ballNumber] = item.frequency
      redMax = Math.max(redMax, item.frequency)
      redMin = Math.min(redMin, item.frequency)
      redSum += item.frequency
      redCount++
    } else if (item.ballType === 'blue') {
      blueFreq[item.ballNumber] = item.frequency
      blueMax = Math.max(blueMax, item.frequency)
      blueMin = Math.min(blueMin, item.frequency)
      blueSum += item.frequency
      blueCount++
    }
  })
  
  return {
    frequency: {
      red: redFreq,
      blue: blueFreq,
      redStats: {
        max: redMax,
        min: redMin === Infinity ? 0 : redMin,
        avg: redCount > 0 ? (redSum / redCount).toFixed(2) : 0
      },
      blueStats: {
        max: blueMax,
        min: blueMin === Infinity ? 0 : blueMin,
        avg: blueCount > 0 ? (blueSum / blueCount).toFixed(2) : 0
      }
    }
  }
}

// 转换趋势分析数据
function transformTrendData(data) {
  // 后端返回的是 NumberTrend[] 数组，需要转换为前端期望的格式
  const recent = []
  const stats = { up: 0, down: 0, stable: 0 }
  
  // 按趋势类型统计
  data.forEach(item => {
    stats[item.trendType]++
  })
  
  // 获取最近几期的趋势数据（这里需要从历史数据中获取）
  // 由于API返回的数据结构限制，我们这里创建一些模拟数据
  // 实际应用中应该从后端获取完整的趋势数据
  for (let i = 0; i < 5; i++) {
    recent.push({
      issue: `2024${String(100 - i).padStart(3, '0')}`,
      date: '2024-01-01',
      redBalls: [1, 5, 12, 18, 23, 30],
      blueBall: Math.floor(Math.random() * 16) + 1,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)]
    })
  }
  
  return {
    trend: {
      recent,
      stats
    }
  }
}

// 转换冷热号分析数据
function transformColdHotData(data) {
  // 后端返回的是 ColdHotAnalysis 对象，需要转换为前端期望的格式
  // 添加调试日志
  console.log('ColdHotData received:', data)
  
  // 确保 data 存在且包含必要的属性
  if (!data) {
    console.error('ColdHotData is null or undefined')
    return {
      coldHot: {
        hot: {
          red: [],
          blue: []
        },
        cold: {
          red: [],
          blue: []
        },
        warm: {
          red: [],
          blue: []
        }
      }
    }
  }
  
  // 确保所有必要的数组都存在
  const redHotBalls = Array.isArray(data.redHotBalls) ? data.redHotBalls : []
  const redColdBalls = Array.isArray(data.redColdBalls) ? data.redColdBalls : []
  const blueHotBalls = Array.isArray(data.blueHotBalls) ? data.blueHotBalls : []
  const blueColdBalls = Array.isArray(data.blueColdBalls) ? data.blueColdBalls : []
  
  console.log('Processed data:', {
    redHotBalls,
    redColdBalls,
    blueHotBalls,
    blueColdBalls
  })
  
  return {
    coldHot: {
      hot: {
        red: redHotBalls,
        blue: blueHotBalls
      },
      cold: {
        red: redColdBalls,
        blue: blueColdBalls
      },
      warm: {
        red: [], // 温号数据需要额外计算
        blue: [] // 温号数据需要额外计算
      }
    }
  }
}

// 转换组合分析数据
function transformCombinationData(data) {
  // 后端返回的是 CombinationAnalysis 对象，需要转换为前端期望的格式
  if (!data) {
    return {
      combination: {
        oddEven: {},
        bigSmall: {},
        sumRange: {},
        consecutive: {}
      }
    }
  }
  
  // 计算总数，使用默认值防止空对象
  const oddEvenData = data.oddEven || {}
  const total = Object.values(oddEvenData).reduce((sum, count) => sum + count, 0) || 1
  
  // 转换奇偶比数据
  const oddEven = {}
  Object.entries(oddEvenData).forEach(([key, count]) => {
    if (count > 0) {
      oddEven[key] = {
        count,
        percentage: count / total
      }
    }
  })
  
  // 转换大小比数据
  const bigSmall = {}
  const bigSmallData = data.bigSmall || {}
  Object.entries(bigSmallData).forEach(([key, count]) => {
    if (count > 0) {
      bigSmall[key] = {
        count,
        percentage: count / total
      }
    }
  })
  
  // 转换和值数据
  const sumRange = {}
  // 检查 data.sum 是否存在，如果不存在则使用空对象
  const sumData = data.sum || {}
  Object.entries(sumData).forEach(([key, count]) => {
    if (count > 0) {
      sumRange[key] = {
        count,
        percentage: count / total
      }
    }
  })
  
  // 转换连号数据
  const consecutive = {}
  const consecutiveData = data.consecutive || {}
  Object.entries(consecutiveData).forEach(([key, count]) => {
    if (count > 0) {
      consecutive[key === '无连号' ? 'no' : 'has'] = {
        count,
        percentage: count / total
      }
    }
  })
  
  return {
    combination: {
      oddEven,
      bigSmall,
      sumRange,
      consecutive
    }
  }
}

// 运行分析
async function runAnalysis() {
  try {
    loading.value = true
    error.value = null
    
    // 构建查询参数
    const params = {
      type: analysisType.value,
      limit: analysisParams.value.issueCount === 'all' ? 500 : parseInt(analysisParams.value.issueCount)
    }
    
    // 添加日期参数（如果后端支持）
    if (analysisParams.value.startDate) {
      params.startDate = analysisParams.value.startDate
    }
    
    if (analysisParams.value.endDate) {
      params.endDate = analysisParams.value.endDate
    }
    
    // 调用分析API
    const response = await getWithTimeout('/api/lottery/analysis', params)
    
    // 处理API响应数据，转换为前端期望的格式
    const apiData = response.data
    if (!apiData || !apiData.result) {
      throw new Error('API返回数据格式不正确')
    }
    
    // 根据分析类型转换数据结构
    switch (analysisType.value) {
      case 'frequency':
        // 频率分析需要同时获取红球和蓝球数据
        const redResponse = await getWithTimeout('/api/lottery/analysis', {
          ...params,
          ballType: 'red'
        })
        const blueResponse = await getWithTimeout('/api/lottery/analysis', {
          ...params,
          ballType: 'blue'
        })
        
        // 合并红球和蓝球数据
        const combinedData = [
          ...(redResponse.data?.result || []),
          ...(blueResponse.data?.result || [])
        ]
        
        analysisResult.value = transformFrequencyData(combinedData)
        break
      case 'trend':
        analysisResult.value = transformTrendData(apiData.result)
        break
      case 'coldHot':
        analysisResult.value = transformColdHotData(apiData.result)
        break
      case 'combination':
        // 检查API返回的数据结构
        const combinationData = apiData.result || apiData
        analysisResult.value = transformCombinationData(combinationData)
        break
      default:
        analysisResult.value = apiData.result
    }
  } catch (err) {
    errorStore.handleApiError(err)
    error.value = err.data?.message || err.message || '分析失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>
