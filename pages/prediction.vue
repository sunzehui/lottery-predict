<template>
  <div class="px-4 py-6 sm:px-0">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">预测结果</h2>
      <p class="text-gray-600">基于多种算法模型生成的双色球预测结果</p>
    </div>

    <!-- 预测结果展示 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- 最新预测 -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">最新预测</h3>
        <div v-if="latestPrediction" class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">预测期号</span>
            <span class="font-medium">{{ latestPrediction.issue }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">预测日期</span>
            <span class="font-medium">{{ formatDate(latestPrediction.date) }}</span>
          </div>
          <div>
            <span class="text-sm text-gray-500">预测号码</span>
            <div class="flex items-center mt-2 space-x-2">
              <div v-for="ball in latestPrediction.redBalls" :key="ball" class="lottery-ball-red">
                {{ ball }}
              </div>
              <div class="lottery-ball-blue">
                {{ latestPrediction.blueBall }}
              </div>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">置信度</span>
            <span class="font-medium">{{ latestPrediction.confidence }}%</span>
          </div>
          <div>
            <span class="text-sm text-gray-500">预测算法</span>
            <div class="mt-2 space-y-1">
              <div v-for="algorithm in latestPrediction.algorithms" :key="algorithm.name" class="flex justify-between text-sm">
                <span>{{ algorithm.name }}</span>
                <span>{{ algorithm.weight }}%</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          暂无预测结果
        </div>
      </div>

      <!-- 历史预测准确率 -->
      <div class="card">
        <h3 class="text-lg font-medium text-gray-900 mb-4">历史预测准确率</h3>
        <div v-if="accuracyStats" class="space-y-4">
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">总预测次数</span>
            <span class="font-medium">{{ accuracyStats.totalPredictions }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">红球命中数(平均)</span>
            <span class="font-medium">{{ accuracyStats.avgRedHits }}/6</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">蓝球命中率</span>
            <span class="font-medium">{{ accuracyStats.blueHitRate }}%</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-sm text-gray-500">最高命中记录</span>
            <span class="font-medium">{{ accuracyStats.maxRedHits }}红+{{ accuracyStats.maxBlueHits ? '1蓝' : '0蓝' }}</span>
          </div>
        </div>
        <div v-else class="text-center py-4 text-gray-500">
          暂无统计数据
        </div>
      </div>
    </div>

    <!-- 预测算法说明 -->
    <div class="card mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">预测算法说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 class="font-medium text-gray-900 mb-2">频率分析</h4>
          <p class="text-gray-600 text-sm">
            基于历史数据中各号码出现的频率进行分析，选择出现频率较高的号码作为预测结果。
          </p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">趋势分析</h4>
          <p class="text-gray-600 text-sm">
            分析号码出现的趋势变化，包括上升期、下降期、平稳期等，预测下一期可能出现的号码。
          </p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">冷热号分析</h4>
          <p class="text-gray-600 text-sm">
            分析冷热号的变化规律，预测冷号转热、热号转冷的时机，选择合适的号码组合。
          </p>
        </div>
        <div>
          <h4 class="font-medium text-gray-900 mb-2">组合分析</h4>
          <p class="text-gray-600 text-sm">
            分析号码之间的组合关系，包括奇偶比、大小比、和值、连号等，选择合理的号码组合。
          </p>
        </div>
      </div>
    </div>

    <!-- 历史预测记录 -->
    <div class="card">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">历史预测记录</h3>
        <button
          @click="generatePrediction"
          class="btn-primary"
        >
          生成新预测
        </button>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                预测期号
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                预测号码
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                实际开奖
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                命中情况
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                置信度
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in predictionHistory" :key="record.issue">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ record.issue }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-1">
                  <span v-for="ball in record.prediction.redBalls" :key="ball" class="lottery-ball-red">
                    {{ ball }}
                  </span>
                  <span class="lottery-ball-blue">
                    {{ record.prediction.blueBall }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div v-if="record.actual" class="flex space-x-1">
                  <span v-for="ball in record.actual.redBalls" :key="ball" class="lottery-ball-red">
                    {{ ball }}
                  </span>
                  <span class="lottery-ball-blue">
                    {{ record.actual.blueBall }}
                  </span>
                </div>
                <span v-else class="text-gray-400">未开奖</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span v-if="record.actual">
                  {{ record.hits.redHits }}红{{ record.hits.blueHit ? '+1蓝' : '' }}
                </span>
                <span v-else class="text-gray-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ record.prediction.confidence }}%
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 设置页面标题
useHead({
  title: '双色球预测分析系统 - 预测结果'
})

import { ref, onMounted } from 'vue'
import { useErrorStore } from '~/stores/errorStore'
import { getWithTimeout } from '~/utils/apiUtils'

// 初始化错误存储
const errorStore = useErrorStore()

// 定义数据类型
interface PredictionResult {
  issue: string
  date: string
  redBalls: number[]
  blueBall: number
  confidence: number
  algorithms: {
    name: string
    weight: number
  }[]
}

interface ActualResult {
  issue: string
  date: string
  redBalls: number[]
  blueBall: number
}

interface PredictionRecord {
  issue: string
  prediction: PredictionResult
  actual?: ActualResult
  hits: {
    redHits: number
    blueHit: boolean
  }
}

interface AccuracyStats {
  totalPredictions: number
  avgRedHits: number
  blueHitRate: number
  maxRedHits: number
  maxBlueHits: boolean
}

// 响应式数据
const latestPrediction = ref<PredictionResult | null>(null)
const predictionHistory = ref<PredictionRecord[]>([])
const accuracyStats = ref<AccuracyStats | null>(null)

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN')
}

// 获取最新预测
const fetchLatestPrediction = async () => {
  try {
    // 这里将调用后端 API
    // const response = await $fetch('/api/prediction/latest')
    // latestPrediction.value = response.data
    
    // 模拟数据
    latestPrediction.value = {
      issue: '2025081',
      date: new Date().toISOString().split('T')[0],
      redBalls: [5, 9, 14, 19, 24, 28],
      blueBall: 11,
      confidence: 75,
      algorithms: [
        { name: '频率分析', weight: 30 },
        { name: '趋势分析', weight: 25 },
        { name: '冷热号分析', weight: 25 },
        { name: '组合分析', weight: 20 }
      ]
    }
  } catch (error) {
    errorStore.handleApiError(error)
  }
}

// 获取预测历史
const fetchPredictionHistory = async () => {
  try {
    // 这里将调用后端 API
    // const response = await $fetch('/api/prediction/history')
    // predictionHistory.value = response.data
    
    // 模拟数据
    const mockHistory: PredictionRecord[] = []
    for (let i = 0; i < 5; i++) {
      const issue = 2025080 - i
      const predictionRedBalls = Array.from({ length: 6 }, () => Math.floor(Math.random() * 33) + 1)
        .sort((a, b) => a - b)
      const predictionBlueBall = Math.floor(Math.random() * 16) + 1
      
      const actualRedBalls = Array.from({ length: 6 }, () => Math.floor(Math.random() * 33) + 1)
        .sort((a, b) => a - b)
      const actualBlueBall = Math.floor(Math.random() * 16) + 1
      
      const redHits = predictionRedBalls.filter(ball => actualRedBalls.includes(ball)).length
      const blueHit = predictionBlueBall === actualBlueBall
      
      mockHistory.push({
        issue: issue.toString(),
        prediction: {
          issue: issue.toString(),
          date: new Date(2025, 0, 1 - i).toISOString().split('T')[0],
          redBalls: predictionRedBalls,
          blueBall: predictionBlueBall,
          confidence: Math.floor(Math.random() * 30) + 60,
          algorithms: []
        },
        actual: {
          issue: issue.toString(),
          date: new Date(2025, 0, 1 - i).toISOString().split('T')[0],
          redBalls: actualRedBalls,
          blueBall: actualBlueBall
        },
        hits: {
          redHits,
          blueHit
        }
      })
    }
    
    predictionHistory.value = mockHistory
  } catch (error) {
    errorStore.handleApiError(error)
  }
}

// 获取准确率统计
const fetchAccuracyStats = async () => {
  try {
    // 这里将调用后端 API
    // const response = await $fetch('/api/prediction/accuracy')
    // accuracyStats.value = response.data
    
    // 模拟数据
    accuracyStats.value = {
      totalPredictions: 50,
      avgRedHits: 2.3,
      blueHitRate: 18,
      maxRedHits: 5,
      maxBlueHits: true
    }
  } catch (error) {
    errorStore.handleApiError(error)
  }
}

// 生成新预测
const generatePrediction = async () => {
  try {
    // 这里将调用后端 API
    // await $fetch('/api/prediction/generate', {
    //   method: 'POST'
    // })
    
    // 重新获取数据
    fetchLatestPrediction()
    fetchPredictionHistory()
    
    alert('预测生成成功！')
  } catch (error) {
    errorStore.handleApiError(error)
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchLatestPrediction()
  fetchPredictionHistory()
  fetchAccuracyStats()
})
</script>
