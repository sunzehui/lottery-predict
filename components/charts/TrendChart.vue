<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    
    <div class="mb-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span class="text-sm">红球和值</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm">蓝球</span>
        </div>
      </div>
    </div>
    
    <div class="relative" style="height: 400px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-if="showStats" class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="text-md font-medium mb-2">趋势统计</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>上升趋势:</span>
            <span class="font-medium">{{ trendStats.up }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>下降趋势:</span>
            <span class="font-medium">{{ trendStats.down }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>平稳趋势:</span>
            <span class="font-medium">{{ trendStats.stable }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="text-md font-medium mb-2">和值统计</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>最高和值:</span>
            <span class="font-medium">{{ sumStats.max }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>最低和值:</span>
            <span class="font-medium">{{ sumStats.min }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>平均和值:</span>
            <span class="font-medium">{{ sumStats.avg }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="text-md font-medium mb-2">蓝球统计</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>最高蓝球:</span>
            <span class="font-medium">{{ blueStats.max }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>最低蓝球:</span>
            <span class="font-medium">{{ blueStats.min }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>平均蓝球:</span>
            <span class="font-medium">{{ blueStats.avg }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'

// 属性定义
const props = defineProps({
  title: {
    type: String,
    default: '号码趋势变化'
  },
  trendData: {
    type: Array,
    default: () => []
  },
  trendStats: {
    type: Object,
    default: () => ({ up: 0, down: 0, stable: 0 })
  },
  sumStats: {
    type: Object,
    default: () => ({ max: 0, min: 0, avg: 0 })
  },
  blueStats: {
    type: Object,
    default: () => ({ max: 0, min: 0, avg: 0 })
  },
  showStats: {
    type: Boolean,
    default: true
  }
})

// 图表实例
const chartInstance = ref(null)

// Canvas 元素引用
const chartCanvas = ref(null)

// 监听数据变化
watch(() => props.trendData, () => {
  if (chartInstance.value) {
    updateChart()
  }
}, { deep: true })

// 组件挂载后初始化图表
onMounted(() => {
  nextTick(() => {
    initChart()
  })
})

// 初始化图表
function initChart() {
  if (!chartCanvas.value) return
  
  // 动态导入 Chart.js
  import('chart.js/auto').then(({ default: Chart }) => {
    const ctx = chartCanvas.value.getContext('2d')
    
    // 准备数据
    const labels = props.trendData.map(item => item.issue)
    const sumData = props.trendData.map(item => {
      return item.redBalls.reduce((sum, num) => sum + num, 0)
    })
    const blueData = props.trendData.map(item => item.blueBall)
    
    // 创建图表
    chartInstance.value = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: '红球和值',
            data: sumData,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderColor: 'rgba(239, 68, 68, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(239, 68, 68, 1)',
            pointBorderColor: '#fff',
            pointRadius: 4,
            tension: 0.1,
            yAxisID: 'y'
          },
          {
            label: '蓝球',
            data: blueData,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointRadius: 4,
            tension: 0.1,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                const index = context[0].dataIndex
                return `期号: ${labels[index]}`
              },
              label: function(context) {
                const label = context.dataset.label || ''
                const value = context.raw
                return `${label}: ${value}`
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: '红球和值'
            },
            min: 20,
            max: 200
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: '蓝球'
            },
            min: 1,
            max: 16,
            grid: {
              drawOnChartArea: false
            }
          },
          x: {
            title: {
              display: true,
              text: '期号'
            }
          }
        }
      }
    })
  })
}

// 更新图表
function updateChart() {
  if (!chartInstance.value) return
  
  // 准备数据
  const labels = props.trendData.map(item => item.issue)
  const sumData = props.trendData.map(item => {
    return item.redBalls.reduce((sum, num) => sum + num, 0)
  })
  const blueData = props.trendData.map(item => item.blueBall)
  
  // 更新图表数据
  chartInstance.value.data.labels = labels
  chartInstance.value.data.datasets[0].data = sumData
  chartInstance.value.data.datasets[1].data = blueData
  
  // 更新图表
  chartInstance.value.update()
}

// 组件卸载时销毁图表
onBeforeUnmount(() => {
  if (chartInstance.value) {
    chartInstance.value.destroy()
    chartInstance.value = null
  }
})
</script>
