<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold mb-4">{{ title }}</h3>
    
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 热号 -->
      <div>
        <h4 class="text-md font-medium mb-2">热号 (高频号码)</h4>
        <div>
          <h5 class="text-sm font-medium mb-1">红球热号</h5>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="num in coldHotData.hot.red"
              :key="'red-hot-'+num"
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
              v-for="num in coldHotData.hot.blue"
              :key="'blue-hot-'+num"
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
              v-for="num in coldHotData.cold.red"
              :key="'red-cold-'+num"
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
              v-for="num in coldHotData.cold.blue"
              :key="'blue-cold-'+num"
              class="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-sm"
            >
              {{ num }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
// 属性定义
const props = defineProps({
  title: {
    type: String,
    default: '冷热号分析'
  },
  coldHotData: {
    type: Object,
    default: () => ({
      hot: { red: [], blue: [] },
      cold: { red: [], blue: [] }
    })
  }
})
</script>
