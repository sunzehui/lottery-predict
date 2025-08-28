<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    
    <div class="mb-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span class="text-sm">实际开奖</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm">预测结果</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 红球预测对比 -->
      <div>
        <h4 class="text-md font-medium mb-2">红球预测对比</h4>
        <div class="relative" style="height: 300px;">
          <canvas ref="redChartCanvas"></canvas>
        </div>
        
        <div class="mt-4">
          <h5 class="text-sm font-medium mb-2">红球预测准确率</h5>
          <div class="space-y-2">
            <div class="flex items-center">
              <div class="w-24 text-sm">命中号码:</div>
              <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-green-600 h-2.5 rounded-full" 
                  :style="{ width: `${redAccuracy.hit}%` }"
                ></div>
              </div>
              <div class="w-12 text-right text-sm font-medium">{{ redAccuracy.hit }}%</div>
            </div>
            <div class="flex items-center">
              <div class="w-24 text-sm">位置准确:</div>
              <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-blue-600 h-2.5 rounded-full" 
                  :style="{ width: `${redAccuracy.position}%` }"
                ></div>
              </div>
              <div class="w-12 text-right text-sm font-medium">{{ redAccuracy.position }}%</div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h5 class="text-sm font-medium mb-1">命中号码</h5>
          <div class="flex flex-wrap gap-1">
            <span 
              v-for="num in redHitNumbers" 
              :key="num"
              class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm"
            >
              {{ num }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- 蓝球预测对比 -->
      <div>
        <h4 class="text-md font-medium mb-2">蓝球预测对比</h4>
        <div class="relative" style="height: 300px;">
          <canvas ref="blueChartCanvas"></canvas>
        </div>
        
        <div class="mt-4">
          <h5 class="text-sm font-medium mb-2">蓝球预测准确率</h5>
          <div class="space-y-2">
            <div class="flex items-center">
              <div class="w-24 text-sm">命中号码:</div>
              <div class="flex-1 bg-gray-200 rounded-full h-2.5">
                <div 
                  class="bg-green-600 h-2.5 rounded-full" 
                  :style="{ width: `${blueAccuracy.hit}%` }"
                ></div>
              </div>
              <div class="w-12 text-right text-sm font-medium">{{ blueAccuracy.hit }}%</div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <h5 class="text-sm font-medium mb-1">
            {{ blueHitNumber ? '命中号码' : '未命中' }}
          </h5>
          <div v-if="blueHitNumber" class="flex flex-wrap gap-1">
            <span class="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
              {{ blueHitNumber }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="showStats" class="mt-6">
      <h4 class="text-md font-medium mb-2">预测统计</h4>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="text-sm text-gray-500">预测期数</div>
          <div class="text-2xl font-bold">{{ predictionStats.total }}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="text-sm text-gray-500">平均红球命中</div>
          <div class="text-2xl font-bold">{{ predictionStats.avgRedHits }}</div>
        </div>
        <div class="bg-gray-50 p-4 rounded-md">
          <div class="text-sm text-gray-500">蓝球命中率</div>
          <div class="text-2xl font-bold">{{ predictionStats.blueHitRate }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue'

// 属性定义
const props = defineProps({
  title: {
    type: String,
    default: '预测结果对比'
  },
  actualResult: {
    type: Object,
    default: () => ({ redBalls: [], blueBall: 0 })
  },
  predictionResult: {
    type: Object,
    default: () => ({ redBalls: [], blueBall: 0 })
  },
  predictionStats: {
    type: Object,
    default: () => ({
      total: 0,
      avgRedHits: 0,
      blueHitRate: 0
    })
  },
  showStats: {
    type: Boolean,
    default: true
  }
})

// 图表实例
const redChartInstance = ref(null)
const blueChartInstance = ref(null)

// Canvas 元素引用
const redChartCanvas = ref(null)
const blueChartCanvas = ref(null)

// 计算红球命中号码
const redHitNumbers = computed(() => {
  if (!props.actualResult.redBalls || !props.predictionResult.redBalls) {
    return []
  }
  
  return props.actualResult.redBalls.filter(num => 
    props.predictionResult.redBalls.includes(num)
  )
})

// 计算蓝球命中号码
const blueHitNumber = computed(() => {
  if (!props.actualResult.blueBall || !props.predictionResult.blueBall) {
    return null
  }
  
  return props.actualResult.blueBall === props.predictionResult.blueBall 
    ? props.actualResult.blueBall 
    : null
})

// 计算红球准确率
const redAccuracy = computed(() => {
  if (!props.actualResult.redBalls || !props.predictionResult.redBalls) {
    return { hit: 0, position: 0 }
  }
  
  // 命中率
  const hitCount = redHitNumbers.value.length
  const hitRate = Math.round((hitCount / 6) * 100)
  
  // 位置准确率
  let positionCount = 0
  props.actualResult.redBalls.forEach((num, index) => {
    if (props.predictionResult.redBalls[index] === num) {
      positionCount++
    }
  })
  const positionRate = Math.round((positionCount / 6) * 100)
  
  return { hit: hitRate, position: positionRate }
})

// 计算蓝球准确率
const blueAccuracy = computed(() => {
  if (!props.actualResult.blueBall || !props.predictionResult.blueBall) {
    return { hit: 0 }
  }
  
  const hitRate = props.actualResult.blueBall === props.predictionResult.blueBall ? 100 : 0
  return { hit: hitRate }
})

// 监听数据变化
watch([() => props.actualResult, () => props.predictionResult], () => {
  if (redChartInstance.value && blueChartInstance.value) {
    updateCharts()
  }
}, { deep: true })

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

// 初始化图表
function initCharts() {
  if (!redChartCanvas.value || !blueChartCanvas.value) return
  
  // 动态导入 Chart.js
  import('chart.js/auto').then(({ default: Chart }) => {
    // 初始化红球图表
    const redCtx = redChartCanvas.value.getContext('2d')
    redChartInstance.value = new Chart(redCtx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 33 }, (_, i) => i + 1),
        datasets: [
          {
            label: '实际开奖',
            data: Array.from({ length: 33 }, (_, i) => 
              props.actualResult.redBalls?.includes(i + 1) ? 1 : 0
            ),
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          },
          {
            label: '预测结果',
            data: Array.from({ length: 33 }, (_, i) => 
              props.predictionResult.redBalls?.includes(i + 1) ? 1 : 0
            ),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.raw
                return value === 1 ? `${label}: 选中` : `${label}: 未选中`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value === 1 ? '选中' : '未选中'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: '号码'
            }
          }
        }
      }
    })
    
    // 初始化蓝球图表
    const blueCtx = blueChartCanvas.value.getContext('2d')
    blueChartInstance.value = new Chart(blueCtx, {
      type: 'bar',
      data: {
        labels: Array.from({ length: 16 }, (_, i) => i + 1),
        datasets: [
          {
            label: '实际开奖',
            data: Array.from({ length: 16 }, (_, i) => 
              props.actualResult.blueBall === i + 1 ? 1 : 0
            ),
            backgroundColor: 'rgba(34, 197, 94, 0.7)',
            borderColor: 'rgba(34, 197, 94, 1)',
            borderWidth: 1
          },
          {
            label: '预测结果',
            data: Array.from({ length: 16 }, (_, i) => 
              props.predictionResult.blueBall === i + 1 ? 1 : 0
            ),
            backgroundColor: 'rgba(59, 130, 246, 0.7)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.raw
                return value === 1 ? `${label}: 选中` : `${label}: 未选中`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 1,
            ticks: {
              stepSize: 1,
              callback: function(value) {
                return value === 1 ? '选中' : '未选中'
              }
            }
          },
          x: {
            title: {
              display: true,
              text: '号码'
            }
          }
        }
      }
    })
  })
}

// 更新图表
function updateCharts() {
  if (!redChartInstance.value || !blueChartInstance.value) return
  
  // 更新红球图表数据
  redChartInstance.value.data.datasets[0].data = Array.from({ length: 33 }, (_, i) => 
    props.actualResult.redBalls?.includes(i + 1) ? 1 : 0
  )
  redChartInstance.value.data.datasets[1].data = Array.from({ length: 33 }, (_, i) => 
    props.predictionResult.redBalls?.includes(i + 1) ? 1 : 0
  )
  redChartInstance.value.update()
  
  // 更新蓝球图表数据
  blueChartInstance.value.data.datasets[0].data = Array.from({ length: 16 }, (_, i) => 
    props.actualResult.blueBall === i + 1 ? 1 : 0
  )
  blueChartInstance.value.data.datasets[1].data = Array.from({ length: 16 }, (_, i) => 
    props.predictionResult.blueBall === i + 1 ? 1 : 0
  )
  blueChartInstance.value.update()
}

// 组件卸载时销毁图表
onBeforeUnmount(() => {
  if (redChartInstance.value) {
    redChartInstance.value.destroy()
    redChartInstance.value = null
  }
  
  if (blueChartInstance.value) {
    blueChartInstance.value.destroy()
    blueChartInstance.value = null
  }
})
</script>
