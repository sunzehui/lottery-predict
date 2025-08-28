import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // 读取请求体
    const body = await readBody(event)
    const { password } = body

    if (!password) {
      return {
        success: false,
        message: '请提供密码'
      }
    }

    // 从运行时配置中获取管理员密码
    const config = useRuntimeConfig()
    const adminPassword = config.adminPassword

    // 验证密码
    if (password === adminPassword) {
      return {
        success: true,
        message: '密码验证成功'
      }
    } else {
      return {
        success: false,
        message: '密码错误'
      }
    }
  } catch (error) {
    console.error('密码验证失败:', error)
    return {
      success: false,
      message: '验证失败，请重试'
    }
  }
})
