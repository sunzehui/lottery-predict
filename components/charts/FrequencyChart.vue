<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    
    <div class="mb-4">
      <div class="flex items-center space-x-4">
        <div class="flex items-center">
          <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span class="text-sm">红球</span>
        </div>
        <div class="flex items-center">
          <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span class="text-sm">蓝球</span>
        </div>
      </div>
    </div>
    
    <div class="relative" style="height: 400px;">
      <canvas ref="chartCanvas"></canvas>
    </div>
    
    <div v-if="showStats" class="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="text-md font-medium mb-2">红球统计</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>最高频率:</span>
            <span class="font-medium">{{ redStats.max }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>最低频率:</span>
            <span class="font-medium">{{ redStats.min }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>平均频率:</span>
            <span class="font-medium">{{ redStats.avg }}</span>
          </div>
        </div>
      </div>
      
      <div class="bg-gray-50 p-4 rounded-md">
        <h4 class="text-md font-medium mb-2">蓝球统计</h4>
        <div class="space-y-1">
          <div class="flex justify-between text-sm">
            <span>最高频率:</span>
            <span class="font-medium">{{ blueStats.max }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>最低频率:</span>
            <span class="font-medium">{{ blueStats.min }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span>平均频率:</span>
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
    default: '号码频率分布'
  },
  redFrequency: {
    type: Object,
    default: () => ({})
  },
  blueFrequency: {
    type: Object,
    default: () => ({})
  },
  redStats: {
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
watch([() => props.redFrequency, () => props.blueFrequency], () => {
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
    const redLabels = Object.keys(props.redFrequency).map(Number).sort((a, b) => a - b)
    const blueLabels = Object.keys(props.blueFrequency).map(Number).sort((a, b) => a - b)
    
    const redData = redLabels.map(label => props.redFrequency[label])
    const blueData = blueLabels.map(label => props.blueFrequency[label])
    
    // 创建图表
    chartInstance.value = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: redLabels,
        datasets: [
          {
            label: '红球频率',
            data: redData,
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
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
                return `频率: ${context.raw}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: '出现次数'
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
function updateChart() {
  if (!chartInstance.value) return
  
  // 准备数据
  const redLabels = Object.keys(props.redFrequency).map(Number).sort((a, b) => a - b)
  const blueLabels = Object.keys(props.blueFrequency).map(Number).sort((a, b) => a - b)
  
  const redData = redLabels.map(label => props.redFrequency[label])
  const blueData = blueLabels.map(label => props.blueFrequency[label])
  
  // 更新图表数据
  chartInstance.value.data.labels = redLabels
  chartInstance.value.data.datasets[0].data = redData
  
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
