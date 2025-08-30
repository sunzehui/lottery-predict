<template>
  <div class="space-y-4 sm:space-y-6">
    <!-- 页面标题 -->
    <div class="bg-white shadow rounded-lg p-4 sm:p-6">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">历史开奖数据</h1>
      <p class="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">查看双色球历史开奖记录，支持按期号、日期范围筛选</p>
    </div>
    
    <!-- 筛选表单 -->
    <div class="bg-white shadow rounded-lg p-4 sm:p-6">
      <div class="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
        <div>
          <label for="hasConsecutive" class="block text-sm font-medium text-gray-700">红球连续号码</label>
          <select
            id="hasConsecutive"
            v-model="filters.hasConsecutive"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">全部</option>
            <option value="true">包含3个连续号码</option>
            <option value="false">不包含连续号码</option>
          </select>
        </div>
        <div>
          <label for="hasSpacedConsecutive" class="block text-sm font-medium text-gray-700">红球隔开连续号码</label>
          <select
            id="hasSpacedConsecutive"
            v-model="filters.hasSpacedConsecutive"
            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="">全部</option>
            <option value="true">包含3个隔开连续号码</option>
            <option value="false">不包含隔开连续号码</option>
          </select>
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
    
    <!-- 数据表格 - 桌面端 -->
    <div class="hidden sm:block bg-white shadow rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">期号</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开奖日期</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">红球</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">蓝球</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">奖池金额(元)</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">详情</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                加载中...
              </td>
            </tr>
            <tr v-else-if="data.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                暂无数据
              </td>
            </tr>
            <tr v-for="item in data" :key="item.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ item.issue }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDateToLocal(item.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-1">
                  <span
                    v-for="ball in getRedBalls(item)"
                    :key="ball"
                    :class="[
                      'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold',
                      isInConsecutiveGroup(item, ball) || isInSpacedConsecutiveGroup(item, ball) ? 'bg-yellow-500' : 'bg-red-500'
                    ]"
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
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button
                  @click="showDetails(item)"
                  class="text-indigo-600 hover:text-indigo-900"
                  title="查看详情"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 数据卡片 - 移动端 -->
    <div class="sm:hidden space-y-4">
      <!-- 加载状态 -->
      <div v-if="loading" class="bg-white shadow rounded-lg p-4 text-center">
        <p class="text-sm text-gray-500">加载中...</p>
      </div>
      
      <!-- 无数据状态 -->
      <div v-else-if="data.length === 0" class="bg-white shadow rounded-lg p-4 text-center">
        <p class="text-sm text-gray-500">暂无数据</p>
      </div>
      
      <!-- 数据卡片 -->
      <div v-else v-for="item in data" :key="item.id" class="bg-white shadow rounded-lg overflow-hidden">
        <div class="p-4">
          <!-- 期号和日期 -->
          <div class="flex justify-between items-start mb-3">
            <div>
              <h3 class="text-base font-medium text-gray-900">第 {{ item.issue }} 期</h3>
              <p class="text-xs text-gray-500 mt-1">{{ formatDateToLocal(item.date) }}</p>
            </div>
            <button
              @click="showDetails(item)"
              class="text-indigo-600 hover:text-indigo-900"
              title="查看详情"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </button>
          </div>
          
          <!-- 开奖号码 -->
          <div class="mb-3">
            <div class="flex items-center">
              <div class="flex gap-1">
                <span
                  v-for="ball in getRedBalls(item)"
                  :key="ball"
                  :class="[
                    'w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold',
                    isInConsecutiveGroup(item, ball) || isInSpacedConsecutiveGroup(item, ball) ? 'bg-yellow-500' : 'bg-red-500'
                  ]"
                >
                  {{ ball }}
                </span>
              </div>
              <span class="mx-2 text-gray-400">+</span>
              <span class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold inline-block">
                {{ item.blueBall }}
              </span>
            </div>
          </div>
          
          <!-- 奖池金额 -->
          <div class="flex justify-between items-center">
            <span class="text-xs text-gray-500">奖池金额</span>
            <span class="text-sm font-medium text-gray-900">{{ formatMoney(item.prizePool) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 分页 -->
    <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          @click="prevPage"
          :disabled="pagination.page === 1"
          class="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        <div class="text-sm text-gray-700 flex items-center">
          <span class="font-medium">{{ pagination.page }}</span> / <span>{{ pagination.totalPages }}</span>
        </div>
        <button
          @click="nextPage"
          :disabled="pagination.page >= pagination.totalPages"
          class="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    
    <!-- 详情弹框 -->
    <transition
      name="modal-fade"
      enter-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="showDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" @click.self="closeDetailModal">
        <transition
          name="modal-slide"
          enter-active-class="transition-all duration-300 ease-out"
          enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition-all duration-300 ease-in"
          leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0"
        >
          <div class="relative top-10 sm:top-20 mx-auto p-4 sm:p-5 border w-11/12 sm:w-10/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[90vh] flex flex-col">
            <div class="flex-shrink-0">
              <div class="flex items-center justify-between mb-3 sm:mb-4">
                <h3 class="text-base sm:text-lg leading-6 font-medium text-gray-900">开奖详情 - {{ selectedItem?.issue }}</h3>
                <button
                  @click="closeDetailModal"
                  class="text-gray-400 hover:text-gray-500"
                >
                  <svg class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div v-if="selectedItem" class="flex-grow overflow-y-auto pr-1 -mr-1">
              <div class="space-y-3 sm:space-y-4">
                <!-- 基本信息 -->
                <div class="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-500 mb-2">基本信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs sm:text-sm text-gray-600">期号:</span>
                      <span class="text-xs sm:text-sm font-medium">{{ selectedItem.issue }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs sm:text-sm text-gray-600">开奖日期:</span>
                      <span class="text-xs sm:text-sm font-medium">{{ formatDateToLocal(selectedItem.date) }}</span>
                    </div>
                    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span class="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-0">红球:</span>
                      <div class="flex gap-1">
                        <span
                          v-for="ball in getRedBalls(selectedItem)"
                          :key="ball"
                          :class="[
                            'w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-white text-xs font-bold',
                            isInConsecutiveGroup(selectedItem, ball) || isInSpacedConsecutiveGroup(selectedItem, ball) ? 'bg-yellow-500' : 'bg-red-500'
                          ]"
                        >
                          {{ ball }}
                        </span>
                      </div>
                    </div>
                    <div class="flex justify-between items-center">
                      <span class="text-xs sm:text-sm text-gray-600">蓝球:</span>
                      <span class="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold inline-block">
                        {{ selectedItem.blueBall }}
                      </span>
                    </div>
                  </div>
                </div>
                
                <!-- 销售信息 -->
                <div class="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 class="text-sm font-medium text-gray-500 mb-2">销售信息</h4>
                  <div class="space-y-2">
                    <div class="flex justify-between">
                      <span class="text-xs sm:text-sm text-gray-600">销售总额:</span>
                      <span class="text-xs sm:text-sm font-medium">{{ formatMoney(selectedItem.salesAmount) }} 元</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-xs sm:text-sm text-gray-600">奖池金额:</span>
                      <span class="text-xs sm:text-sm font-medium">{{ formatMoney(selectedItem.prizePool) }} 元</span>
                    </div>
                  </div>
                </div>
                
                <!-- 奖项信息 - 可折叠 -->
                <div class="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <div
                    class="flex items-center justify-between mb-2 cursor-pointer"
                    @click="showPrizeDetails = !showPrizeDetails"
                  >
                    <h4 class="text-sm font-medium text-gray-500">奖项信息</h4>
                    <svg
                      :class="{'rotate-180': showPrizeDetails}"
                      class="h-5 w-5 transform transition-transform duration-300 text-indigo-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  
                  <!-- 奖项详情 - 移动端可折叠 -->
                  <transition
                    name="slide"
                    enter-active-class="transition-all duration-300 ease-in-out"
                    enter-from-class="max-h-0 opacity-0"
                    enter-to-class="max-h-96 opacity-100"
                    leave-active-class="transition-all duration-300 ease-in-out"
                    leave-from-class="max-h-96 opacity-100"
                    leave-to-class="max-h-0 opacity-0"
                  >
                    <div v-show="showPrizeDetails" class="mt-2 space-y-3 overflow-hidden">
                      <div class="border-l-4 border-yellow-400 pl-3 sm:pl-4">
                        <h5 class="text-sm font-medium text-gray-700">一等奖</h5>
                        <div class="mt-2 space-y-1">
                          <div class="text-xs sm:text-sm text-gray-600">中奖注数: {{ selectedItem.firstPrizeWinners || 0 }}</div>
                          <div class="text-xs sm:text-sm text-gray-600">单注奖金: {{ formatMoney(selectedItem.firstPrizeSingleAmountCents) }} 元</div>
                        </div>
                      </div>
                      <div class="border-l-4 border-gray-400 pl-3 sm:pl-4">
                        <h5 class="text-sm font-medium text-gray-700">二等奖</h5>
                        <div class="mt-2 space-y-1">
                          <div class="text-xs sm:text-sm text-gray-600">中奖注数: {{ selectedItem.secondPrizeWinners || 0 }}</div>
                          <div class="text-xs sm:text-sm text-gray-600">单注奖金: {{ formatMoney(selectedItem.secondPrizeSingleAmountCents) }} 元</div>
                        </div>
                      </div>
                      <div class="border-l-4 border-green-400 pl-3 sm:pl-4">
                        <h5 class="text-sm font-medium text-gray-700">三等奖</h5>
                        <div class="mt-2 space-y-1">
                          <div class="text-xs sm:text-sm text-gray-600">中奖注数: {{ selectedItem.thirdPrizeWinners || 0 }}</div>
                          <div class="text-xs sm:text-sm text-gray-600">单注奖金: {{ formatMoney(selectedItem.thirdPrizeSingleAmountCents) }} 元</div>
                        </div>
                      </div>
                    </div>
                  </transition>
                  
                  <!-- 奖项详情 - 桌面端始终显示 -->
                  <div class="hidden sm:block mt-2">
                    <div class="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
                      <div class="border-l-4 border-yellow-400 pl-3 sm:pl-4">
                        <h5 class="text-sm font-medium text-gray-700">一等奖</h5>
                        <div class="mt-2 space-y-1">
                          <div class="text-xs sm:text-sm text-gray-600">中奖注数: {{ selectedItem.firstPrizeWinners || 0 }}</div>
                          <div class="text-xs sm:text-sm text-gray-600">单注奖金: {{ formatMoney(selectedItem.firstPrizeSingleAmountCents) }} 元</div>
                        </div>
                      </div>
                      <div class="border-l-4 border-gray-400 pl-3 sm:pl-4">
                        <h5 class="text-sm font-medium text-gray-700">二等奖</h5>
                        <div class="mt-2 space-y-1">
                          <div class="text-xs sm:text-sm text-gray-600">中奖注数: {{ selectedItem.secondPrizeWinners || 0 }}</div>
                          <div class="text-xs sm:text-sm text-gray-600">单注奖金: {{ formatMoney(selectedItem.secondPrizeSingleAmountCents) }} 元</div>
                        </div>
                      </div>
                      <div class="border-l-4 border-green-400 pl-3 sm:pl-4">
                        <h5 class="text-sm font-medium text-gray-700">三等奖</h5>
                        <div class="mt-2 space-y-1">
                          <div class="text-xs sm:text-sm text-gray-600">中奖注数: {{ selectedItem.thirdPrizeWinners || 0 }}</div>
                          <div class="text-xs sm:text-sm text-gray-600">单注奖金: {{ formatMoney(selectedItem.thirdPrizeSingleAmountCents) }} 元</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="flex-shrink-0 mt-4 sm:mt-6 flex justify-end">
              <button
                @click="closeDetailModal"
                class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
              >
                关闭
              </button>
            </div>
          </div>
        </transition>
      </div>
    </transition>
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
  endDate: '',
  hasConsecutive: '',
  hasSpacedConsecutive: ''
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

// 详情弹框相关
const showDetailModal = ref(false)
const selectedItem = ref(null)
const showPrizeDetails = ref(false) // 控制奖项信息折叠状态

// 显示详情弹框
const showDetails = (item) => {
  selectedItem.value = item
  showDetailModal.value = true
  // 重置奖项信息折叠状态
  showPrizeDetails.value = false
}

// 关闭详情弹框
const closeDetailModal = () => {
  showDetailModal.value = false
  selectedItem.value = null
}

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

// 检测是否有3个连续号码
const hasConsecutiveNumbers = (item) => {
  const redBalls = getRedBalls(item)
  
  for (let i = 0; i < redBalls.length - 2; i++) {
    // 检查是否有3个连续号码
    if (redBalls[i] + 1 === redBalls[i + 1] && redBalls[i + 1] + 1 === redBalls[i + 2]) {
      return true
    }
  }
  
  return false
}

// 获取连续的3个号码
const getConsecutiveNumbers = (item) => {
  const redBalls = getRedBalls(item)
  const consecutiveGroups = []
  
  for (let i = 0; i < redBalls.length - 2; i++) {
    // 检查是否有3个连续号码
    if (redBalls[i] + 1 === redBalls[i + 1] && redBalls[i + 1] + 1 === redBalls[i + 2]) {
      consecutiveGroups.push([redBalls[i], redBalls[i + 1], redBalls[i + 2]])
    }
  }
  
  return consecutiveGroups
}

// 检测是否有3个隔开连续号码（如 13 15 17，2 4 6）
const hasSpacedConsecutiveNumbers = (item) => {
  const redBalls = getRedBalls(item)
  
  for (let i = 0; i < redBalls.length - 2; i++) {
    // 检查是否有3个隔开连续号码（间隔为1）
    if (redBalls[i] + 2 === redBalls[i + 1] && redBalls[i + 1] + 2 === redBalls[i + 2]) {
      return true
    }
  }
  
  return false
}

// 获取隔开连续的3个号码
const getSpacedConsecutiveNumbers = (item) => {
  const redBalls = getRedBalls(item)
  const spacedConsecutiveGroups = []
  
  for (let i = 0; i < redBalls.length - 2; i++) {
    // 检查是否有3个隔开连续号码（间隔为1）
    if (redBalls[i] + 2 === redBalls[i + 1] && redBalls[i + 1] + 2 === redBalls[i + 2]) {
      spacedConsecutiveGroups.push([redBalls[i], redBalls[i + 1], redBalls[i + 2]])
    }
  }
  
  return spacedConsecutiveGroups
}

// 检查号码是否在隔开连续号码组中
const isInSpacedConsecutiveGroup = (item, ball) => {
  const spacedConsecutiveGroups = getSpacedConsecutiveNumbers(item)
  
  for (const group of spacedConsecutiveGroups) {
    if (group.includes(ball)) {
      return true
    }
  }
  
  return false
}

// 检查号码是否在连续号码组中
const isInConsecutiveGroup = (item, ball) => {
  const consecutiveGroups = getConsecutiveNumbers(item)
  
  for (const group of consecutiveGroups) {
    if (group.includes(ball)) {
      return true
    }
  }
  
  return false
}

// 格式化金额
const formatMoney = (amount) => {
  if (!amount) return '-'
  return new Intl.NumberFormat('zh-CN').format(amount)
}

// 格式化日期为本地时间（年月日 周几）
const formatDateToLocal = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekDay = weekDays[date.getDay()]
  
  return `${year}年${month}月${day}日（${weekDay}）`
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
