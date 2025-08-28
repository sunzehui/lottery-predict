<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white shadow rounded-lg p-6">
      <h1 class="text-2xl font-bold text-gray-900">历史开奖数据</h1>
      <p class="mt-2 text-gray-600">查看双色球历史开奖记录，支持按期号、日期范围筛选</p>
    </div>
    
    <!-- 筛选表单 -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label for="issue" class="block text-sm font-medium text-gray-700">期号</label>
          <input
            type="text"
            id="issue"
            v-model="filters.issue"
            placeholder="输入期号，如：2024081"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="startDate" class="block text-sm font-medium text-gray-700">开始日期</label>
          <input
            type="date"
            id="startDate"
            v-model="filters.startDate"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label for="endDate" class="block text-sm font-medium text-gray-700">结束日期</label>
          <input
            type="date"
            id="endDate"
            v-model="filters.endDate"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div class="flex items-end">
          <button
            @click="searchData"
            class="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            查询
          </button>
        </div>
      </div>
    </div>
    
    <!-- 数据表格 -->
    <div class="bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期号</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开奖日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">红球</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">蓝球</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奖池金额(元)</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                加载中...
              </td>
            </tr>
            <tr v-else-if="data.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                暂无数据
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.issue }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ item.date }}</td>
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatMoney(item.prizePool) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div class="flex-1 flex justify-between sm:hidden">
          <button
            @click="prevPage"
            :disabled="pagination.page === 1"
            class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            上一页
          </button>
          <button
            @click="nextPage"
            :disabled="pagination.page >= pagination.totalPages"
            class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            下一页
          </button>
        </div>
        <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p class="text-sm text-gray-700">
              显示第 <span class="font-medium">{{ (pagination.page - 1) * pagination.size + 1 }}</span> 至 
              <span class="font-medium">{{ Math.min(pagination.page * pagination.size, pagination.total) }}</span> 条，
              共 <span class="font-medium">{{ pagination.total }}</span> 条结果
            </p>
          </div>
          <div>
            <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                @click="prevPage"
                :disabled="pagination.page === 1"
                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span class="sr-only">上一页</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
              
              <!-- 页码按钮 -->
              <button
                v-for="page in getPageNumbers()"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  page === pagination.page
                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50',
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium'
                ]"
              >
                {{ page }}
              </button>
              
              <button
                @click="nextPage"
                :disabled="pagination.page >= pagination.totalPages"
                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <span class="sr-only">下一页</span>
                <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 设置页面标题
useHead({
  title: '双色球预测分析系统 - 历史数据'
})

import { useErrorStore } from '~/stores/errorStore'
import { getWithTimeout } from '~/utils/apiUtils'

// 初始化错误存储
const errorStore = useErrorStore()

// 筛选条件
const filters = ref({
  issue: '',
  startDate: '',
  endDate: ''
})

// 数据和分页
const data = ref([])
const loading = ref(false)
const pagination = ref({
  page: 1,
  size: 10,
  total: 0,
  totalPages: 0
})

// 获取红球号码
const getRedBalls = (item) => {
  return [
    item.redBalls[0],
    item.redBalls[1],
    item.redBalls[2],
    item.redBalls[3],
    item.redBalls[4],
    item.redBalls[5]
  ].sort((a, b) => a - b)
}

// 格式化金额
const formatMoney = (amount) => {
  if (!amount) return '-'
  return new Intl.NumberFormat('zh-CN').format(amount)
}

// 获取页码数组
const getPageNumbers = () => {
  const totalPages = pagination.value.totalPages
  const currentPage = pagination.value.page
  const delta = 2 // 当前页前后显示的页码数
  
  let start = Math.max(1, currentPage - delta)
  let end = Math.min(totalPages, currentPage + delta)
  
  // 如果显示的页码数不足5个，则扩展范围
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(totalPages, start + 4)
    } else {
      start = Math.max(1, end - 4)
    }
  }
  
  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
}

// 跳转到指定页
const goToPage = (page) => {
  pagination.value.page = page
  fetchData()
}

// 上一页
const prevPage = () => {
  if (pagination.value.page > 1) {
    pagination.value.page--
    fetchData()
  }
}

// 下一页
const nextPage = () => {
  if (pagination.value.page < pagination.value.totalPages) {
    pagination.value.page++
    fetchData()
  }
}

// 搜索数据
const searchData = () => {
  pagination.value.page = 1
  fetchData()
}

// 获取数据
const fetchData = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size,
      ...filters.value
    }
    
    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (!params[key]) {
        delete params[key]
      }
    })
    
    const response = await getWithTimeout('/api/lottery/history', params)
    
    if (response.success) {
      data.value = response.data
      pagination.value.total = response.pagination.total
      pagination.value.totalPages = response.pagination.totalPages
    }
  } catch (error) {
    errorStore.handleApiError(error)
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  fetchData()
})
</script>
