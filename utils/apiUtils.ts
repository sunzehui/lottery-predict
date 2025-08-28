/**
 * API请求工具类，包含超时处理功能
 */

// API请求超时时间（毫秒）
const API_TIMEOUT = 5000

/**
 * 带超时功能的API请求
 * @param url API地址
 * @param options 请求选项
 * @returns Promise响应
 */
export async function fetchWithTimeout(url: string, options: any = {}) {
  // 创建超时控制器
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)
  
  try {
    // 合并请求选项，添加超时信号
    const fetchOptions = {
      ...options,
      signal: controller.signal
    }
    
    // 发起请求
    const response = await $fetch(url, fetchOptions)
    
    // 清除超时定时器
    clearTimeout(timeoutId)
    
    return response
  } catch (error: any) {
    // 清除超时定时器
    clearTimeout(timeoutId)
    
    // 检查是否是超时错误
    if (error.name === 'AbortError' || error.code === 'ABORT_ERR') {
      throw createError({
        statusCode: 408,
        statusMessage: '请求超时，请检查网络连接后重试'
      })
    }
    
    // 其他错误直接抛出
    throw error
  }
}

/**
 * 带超时功能的GET请求
 * @param url API地址
 * @param params 查询参数
 * @returns Promise响应
 */
export async function getWithTimeout(url: string, params: any = {}) {
  return fetchWithTimeout(url, {
    method: 'GET',
    params
  })
}

/**
 * 带超时功能的POST请求
 * @param url API地址
 * @param data 请求数据
 * @returns Promise响应
 */
export async function postWithTimeout(url: string, data: any = {}) {
  return fetchWithTimeout(url, {
    method: 'POST',
    body: data
  })
}
