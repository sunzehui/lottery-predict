<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">数据导出</h1>
    
    <!-- 导出类型选择 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">选择导出数据类型</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          @click="exportType = 'history'" 
          :class="['px-4 py-2 rounded-md transition-colors', exportType === 'history' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          历史开奖数据
        </button>
        <button 
          @click="exportType = 'prediction'" 
          :class="['px-4 py-2 rounded-md transition-colors', exportType === 'prediction' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          预测结果数据
        </button>
        <button 
          @click="exportType = 'analysis'" 
          :class="['px-4 py-2 rounded-md transition-colors', exportType === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300']"
        >
          分析结果数据
        </button>
      </div>
    </div>
    
    <!-- 导出参数设置 -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">导出参数</h2>
      
      <!-- 历史数据导出参数 -->
      <div v-if="exportType === 'history'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
            <input 
              v-model="exportParams.startDate" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
            <input 
              v-model="exportParams.endDate" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">导出期数</label>
            <select v-model="exportParams.issueCount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="10">最近10期</option>
              <option value="30">最近30期</option>
              <option value="50">最近50期</option>
              <option value="100">最近100期</option>
              <option value="all">全部</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 预测数据导出参数 -->
      <div v-if="exportType === 'prediction'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">预测算法</label>
            <select v-model="exportParams.algorithm" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="frequency">频率分析</option>
              <option value="trend">趋势分析</option>
              <option value="coldHot">冷热号分析</option>
              <option value="mixed">综合算法</option>
              <option value="all">全部算法</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">预测数量</label>
            <input 
              v-model="exportParams.count" 
              type="number" 
              min="1" 
              max="100"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">包含历史预测</label>
            <select v-model="exportParams.includeHistory" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="true">是</option>
              <option value="false">否</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 分析数据导出参数 -->
      <div v-if="exportType === 'analysis'" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分析类型</label>
            <select v-model="exportParams.analysisType" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="frequency">频率分析</option>
              <option value="trend">趋势分析</option>
              <option value="coldHot">冷热号分析</option>
              <option value="combination">组合分析</option>
              <option value="all">全部分析</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">分析期数</label>
            <select v-model="exportParams.issueCount" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="30">最近30期</option>
              <option value="50">最近50期</option>
              <option value="100">最近100期</option>
              <option value="200">最近200期</option>
              <option value="all">全部</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">包含图表数据</label>
            <select v-model="exportParams.includeCharts" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="true">是</option>
              <option value="false">否</option>
            </select>
          </div>
        </div>
      </div>
      
      <!-- 通用参数 -->
      <div class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">导出格式</label>
          <select v-model="exportParams.format" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">文件名</label>
          <input 
            v-model="exportParams.filename" 
            type="text" 
            placeholder="留空使用默认文件名"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
        </div>
      </div>
      
      <div class="mt-6">
        <button 
          @click="exportData" 
          :disabled="loading"
          class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {{ loading ? '导出中...' : '开始导出' }}
        </button>
      </div>
    </div>
    
    <!-- 导出历史记录 -->
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">导出历史</h2>
      
      <div v-if="exportHistory.length === 0" class="text-center py-8 text-gray-500">
        暂无导出记录
      </div>
      
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">导出时间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">数据类型</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件格式</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">文件大小</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="record in exportHistory" :key="record.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ record.exportTime }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ getExportTypeText(record.type) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ record.format.toUpperCase() }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatFileSize(record.size) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <a 
                  :href="record.downloadUrl" 
                  target="_blank"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  下载
                </a>
                <button 
                  @click="deleteExportRecord(record.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="exportHistory.length > 0" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          共 {{ exportHistory.length }} 条记录
        </div>
        <button 
          @click="clearExportHistory"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          清空历史记录
        </button>
      </div>
    </div>
    
    <!-- 导出成功提示 -->
    <div v-if="exportSuccess" class="fixed bottom-4 right-4 bg-green-50 border-l-4 border-green-500 p-4 shadow-lg rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">数据导出成功！</p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button 
              @click="exportSuccess = false"
              class="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600"
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
  title: '双色球预测分析系统 - 数据导出'
})

import { ref, onMounted } from 'vue'
import { useErrorStore } from '~/stores/errorStore'
import { getWithTimeout, fetchWithTimeout } from '~/utils/apiUtils'

// 初始化错误存储
const errorStore = useErrorStore()

// 导出类型
const exportType = ref('history')

// 导出参数
const exportParams = ref({
  startDate: '',
  endDate: '',
  issueCount: '100',
  algorithm: 'all',
  count: 10,
  includeHistory: 'true',
  analysisType: 'all',
  includeCharts: 'true',
  format: 'excel',
  filename: ''
})

// 导出历史记录
const exportHistory = ref([])

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref(null)

// 导出成功提示
const exportSuccess = ref(false)

// 初始化日期
onMounted(() => {
  // 设置默认日期范围为最近3个月
  const today = new Date()
  const threeMonthsAgo = new Date(today)
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
  
  exportParams.value.endDate = formatDate(today)
  exportParams.value.startDate = formatDate(threeMonthsAgo)
  
  // 加载导出历史记录
  loadExportHistory()
})

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 获取导出类型文本
function getExportTypeText(type) {
  switch (type) {
    case 'history':
      return '历史开奖数据'
    case 'prediction':
      return '预测结果数据'
    case 'analysis':
      return '分析结果数据'
    default:
      return '未知类型'
  }
}

// 格式化文件大小
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 加载导出历史记录
async function loadExportHistory() {
  try {
    const response = await getWithTimeout('/api/lottery/export/history')
    exportHistory.value = response.data || []
  } catch (err) {
    errorStore.handleApiError(err)
  }
}

// 导出数据
async function exportData() {
  try {
    loading.value = true
    error.value = null
    
    // 构建查询参数
    const params = {
      type: exportType.value,
      format: exportParams.value.format
    }
    
    // 根据导出类型添加特定参数
    if (exportType.value === 'history') {
      if (exportParams.value.startDate) {
        params.startDate = exportParams.value.startDate
      }
      
      if (exportParams.value.endDate) {
        params.endDate = exportParams.value.endDate
      }
      
      params.issueCount = exportParams.value.issueCount
    } else if (exportType.value === 'prediction') {
      params.algorithm = exportParams.value.algorithm
      params.count = exportParams.value.count
      params.includeHistory = exportParams.value.includeHistory === 'true'
    } else if (exportType.value === 'analysis') {
      params.analysisType = exportParams.value.analysisType
      params.issueCount = exportParams.value.issueCount
      params.includeCharts = exportParams.value.includeCharts === 'true'
    }
    
    if (exportParams.value.filename) {
      params.filename = exportParams.value.filename
    }
    
    // 调用导出API
    const response = await getWithTimeout('/api/lottery/export', params)
    
    // 创建下载链接
    const downloadUrl = response.data.downloadUrl
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = response.data.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // 显示成功提示
    exportSuccess.value = true
    setTimeout(() => {
      exportSuccess.value = false
    }, 3000)
    
    // 刷新导出历史记录
    loadExportHistory()
  } catch (err) {
    errorStore.handleApiError(err)
    error.value = err.data?.message || err.message || '导出失败，请重试'
  } finally {
    loading.value = false
  }
}

// 删除导出记录
async function deleteExportRecord(id) {
  if (!confirm('确定要删除这条导出记录吗？')) {
    return
  }
  
  try {
    await fetchWithTimeout(`/api/lottery/export/history/${id}`, {
      method: 'DELETE'
    })
    
    // 刷新导出历史记录
    loadExportHistory()
  } catch (err) {
    errorStore.handleApiError(err)
    error.value = err.data?.message || err.message || '删除失败，请重试'
  }
}

// 清空导出历史记录
async function clearExportHistory() {
  if (!confirm('确定要清空所有导出记录吗？此操作不可恢复。')) {
    return
  }
  
  try {
    await fetchWithTimeout('/api/lottery/export/history', {
      method: 'DELETE'
    })
    
    // 刷新导出历史记录
    loadExportHistory()
  } catch (err) {
    errorStore.handleApiError(err)
    error.value = err.data?.message || err.message || '清空失败，请重试'
  }
}
</script>
