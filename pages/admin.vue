<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8 text-center">双色球开奖结果管理</h1>
    
    <!-- 密码验证 -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 class="text-xl font-semibold mb-4">管理员登录</h2>
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700 mb-1">密码</label>
        <input 
          v-model="password" 
          type="password" 
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入管理员密码"
          @keyup.enter="verifyPassword"
        >
      </div>
      <button 
        @click="verifyPassword" 
        :disabled="loading"
        class="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {{ loading ? '验证中...' : '登录' }}
      </button>
      <div v-if="error" class="mt-4 text-red-600 text-sm">{{ error }}</div>
    </div>
    
    <!-- 管理界面 -->
    <div v-else class="bg-white rounded-lg shadow-md p-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold">添加开奖结果</h2>
        <button 
          @click="logout" 
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          退出登录
        </button>
      </div>
      
      <form @submit.prevent="submitResult" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">期号</label>
            <input 
              v-model="formData.issue" 
              type="text" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：2024001"
              required
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">开奖日期</label>
            <input 
              v-model="formData.date" 
              type="date" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">红球（请输入6个1-33之间的不重复数字）</label>
          <div class="grid grid-cols-3 md:grid-cols-6 gap-2">
            <input 
              v-for="(ball, index) in formData.redBalls" 
              :key="index"
              v-model="formData.redBalls[index]" 
              type="number" 
              min="1" 
              max="33"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="红球"
              required
            >
          </div>
        </div>
        
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">蓝球（请输入1个1-16之间的数字）</label>
          <input 
            v-model="formData.blueBall" 
            type="number" 
            min="1" 
            max="16"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="蓝球"
            required
          >
        </div>
        
        <div class="flex justify-end">
          <button 
            type="submit" 
            :disabled="loading"
            class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? '提交中...' : '提交' }}
          </button>
        </div>
      </form>
      
      <!-- 成功提示 -->
      <div v-if="success" class="mt-6 bg-green-50 border-l-4 border-green-500 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-green-700">{{ success }}</p>
          </div>
        </div>
      </div>
      
      <!-- 错误提示 -->
      <div v-if="error" class="mt-6 bg-red-50 border-l-4 border-red-500 p-4">
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
  </div>
</template>

<script setup>
// 设置页面标题
useHead({
  title: '双色球预测分析系统 - 管理员'
})

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { postWithTimeout } from '~/utils/apiUtils'

const router = useRouter()

// 认证状态
const isAuthenticated = ref(false)
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

// 表单数据
const formData = ref({
  issue: '',
  date: '',
  redBalls: ['', '', '', '', '', ''],
  blueBall: ''
})


// 验证密码
async function verifyPassword() {
  try {
    loading.value = true
    error.value = ''
    
    // 调用后端API验证密码
    const response = await postWithTimeout('/api/auth/verify', {
      password: password.value
    })
    
    if (response.success) {
      isAuthenticated.value = true
      password.value = ''
      
      // 设置今天的日期为默认值
      const today = new Date()
      formData.value.date = formatDate(today)
    } else {
      error.value = response.message || '密码错误，请重试'
    }
  } catch (err) {
    error.value = err.data?.message || err.message || '验证失败，请重试'
  } finally {
    loading.value = false
  }
}

// 退出登录
function logout() {
  isAuthenticated.value = false
  router.push('/')
}

// 提交开奖结果
async function submitResult() {
  try {
    loading.value = true
    error.value = ''
    success.value = ''
    
    // 验证表单数据
    if (!validateForm()) {
      return
    }
    
    // 准备提交数据
    const data = {
      issue: formData.value.issue,
      date: formData.value.date,
      redBalls: formData.value.redBalls.map(Number),
      blueBall: Number(formData.value.blueBall)
    }
    
    // 调用API保存数据
    const response = await postWithTimeout('/api/lottery/result', data)
    
    if (response.success) {
      success.value = '开奖结果添加成功！'
      
      // 重置表单
      resetForm()
    } else {
      error.value = response.message || '添加失败，请重试'
    }
  } catch (err) {
    error.value = err.data?.message || err.message || '添加失败，请重试'
  } finally {
    loading.value = false
  }
}

// 验证表单
function validateForm() {
  // 验证期号
  if (!formData.value.issue) {
    error.value = '请输入期号'
    return false
  }
  
  // 验证日期
  if (!formData.value.date) {
    error.value = '请选择开奖日期'
    return false
  }
  
  // 验证红球
  const redBalls = formData.value.redBalls.map(Number)
  if (redBalls.some(ball => isNaN(ball) || ball < 1 || ball > 33)) {
    error.value = '红球必须是1-33之间的数字'
    return false
  }
  
  // 检查红球是否重复
  const uniqueRedBalls = new Set(redBalls)
  if (uniqueRedBalls.size !== 6) {
    error.value = '红球不能重复'
    return false
  }
  
  // 验证蓝球
  const blueBall = Number(formData.value.blueBall)
  if (isNaN(blueBall) || blueBall < 1 || blueBall > 16) {
    error.value = '蓝球必须是1-16之间的数字'
    return false
  }
  
  return true
}

// 重置表单
function resetForm() {
  formData.value = {
    issue: '',
    date: formatDate(new Date()),
    redBalls: ['', '', '', '', '', ''],
    blueBall: ''
  }
}

// 格式化日期
function formatDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 检查是否已登录
onMounted(() => {
  // 这里可以添加检查本地存储的认证状态
  // const auth = localStorage.getItem('adminAuth')
  // if (auth === 'true') {
  //   isAuthenticated.value = true
  // }
})
</script>
