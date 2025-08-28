<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">预测分析</h1>
      <p class="mt-2 text-gray-600">基于多种算法预测下一期双色球号码，仅供参考</p>
    </div>
    
    <!-- 预测参数设置 -->
    <div class="bg-white shadow rounded-lg p-6">
      <h2 class="text-lg font-medium text-gray-900 mb-4">预测参数</h2>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label for="algorithm" class="block text-sm font-medium text-gray-700">预测算法</label>
          <select
            id="algorithm"
            v-model="params.algorithm"
            class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="frequency">频率分析</option>
            <option value="trend">趋势分析</option>
            <option value="coldHot">冷热号分析</option>
            <option value="mixed">综合算法</option>
          </select>
        </div>
        <div>
          <label for="count" class="block text-sm font-medium text-gray-700">预测组数</label>
          <select
            id="count"
            v-model="params.count"
            class="mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option :value="1">1组</option>
            <option :value="3">3组</option>
            <option :value="5">5组</option>
            <option :value="10">10组</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            @click="generatePrediction"
            :disabled="loading"
            class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? '生成中...' : '生成预测' }}
          </button>
        </div>
      </div>
      
      <!-- 算法说明 -->
      <div class="mt-4 p-4 bg-gray-50 rounded-md">
        <h3 class="text-sm font-medium text-gray-900 mb-2">算法说明</h3>
        <p class="text-sm text-gray-600" v-if="params.algorithm === 'frequency'">
          频率分析：基于历史数据中各号码出现的频率，选择高频号码进行组合。高频号码在近期有较高的出现概率。
        </p>
        <p class="text-sm text-gray-600" v-else-if="params.algorithm === 'trend'">
          趋势分析：分析号码的出现趋势，选择处于上升趋势的号码。考虑号码近期出现频率的变化情况。
        </p>
        <p class="text-sm text-gray-600" v-else-if="params.algorithm === 'coldHot'">
          冷热号分析：结合热号（近期频繁出现）和冷号（长期未出现）进行组合。热号有持续热度，冷号有回补可能。
        </p>
        <p class="text-sm text-gray-600" v-else-if="params.algorithm === 'mixed'">
          综合算法：结合频率分析、趋势分析和冷热号分析，按照不同权重综合计算得出预测结果。
        </p>
      </div>
    </div>
    
    <!-- 预测结果 -->
    <div v-if="predictions.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-medium text-gray-900">预测结果</h2>
        <p class="mt-1 text-sm text-gray-500">
          第 {{ predictions[0].issue }} 期 ({{ predictions[0].predictDate }})
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
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期号</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">预测日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">红球</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">蓝球</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">算法</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">置信度</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="historyLoading">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                加载中...
              </td>
            </tr>
            <tr v-else-if="historyData.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                暂无历史预测记录
              </td>
            </tr>
            <tr v-for="item in historyData" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.issue }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.predictDate }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-1">
                  <span 
                    v-for="ball in getRedBalls(item)" 
                    :key="ball" 
                    class="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                  >
                    {{ ball }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold inline-block">
                  {{ item.blueBall }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ getAlgorithmName(item.algorithmType) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.confidence }}%</td>
            </tr>
          </tbody>
        </table>
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

// 初始化错误存储和Toast存储
const errorStore = useErrorStore()
const toastStore = useToastStore()

// 预测参数
const params = ref({
  algorithm: 'frequency',
  count: 5
})

// 预测结果
const predictions = ref([])
const loading = ref(false)

// 历史预测记录
const historyData = ref([])
const historyLoading = ref(false)

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

// 获取红球号码
const getRedBalls = (item) => {
  return item.redBalls.sort((a, b) => a - b)
}

// 生成预测
const generatePrediction = async () => {
  loading.value = true
  try {
    const response = await getWithTimeout('/api/lottery/predict', params.value)
    
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

// 获取历史预测记录
const fetchHistoryData = async () => {
  historyLoading.value = true
  try {
    const response = await getWithTimeout('/api/lottery/predict/history', {
      page: 1,
      size: 10
    })
    
    if (response.success) {
      historyData.value = response.data
    }
  } catch (error) {
    errorStore.handleApiError(error)
  } finally {
    historyLoading.value = false
  }
}

// 页面加载时获取历史预测记录
onMounted(() => {
  fetchHistoryData()
})
</script>
