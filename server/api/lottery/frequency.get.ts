import { AnalysisModel } from '~/server/models/Analysis'

export default defineEventHandler(async (event) => {
  try {
    // 获取红球频率数据
    const redFrequency = await AnalysisModel.getFrequency('red')

    // 获取蓝球频率数据
    const blueFrequency = await AnalysisModel.getFrequency('blue')

    return {
      success: true,
      data: {
        red: redFrequency,
        blue: blueFrequency
      }
    }
  } catch (error) {
    console.error('获取号码频率数据失败:', error)
    return {
      success: false,
      error: '获取号码频率数据失败'
    }
  }
})
