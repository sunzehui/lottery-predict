import { defineEventHandler, getQuery, createError } from 'h3'
import { AnalysisModel } from '../../models/Analysis'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const type = query.type as string || 'frequency' // 默认使用频率分析
    const ballType = query.ballType as string || 'red' // 默认分析红球
    const limit = parseInt(query.limit as string) || 100 // 默认分析最近100期

    // 验证分析类型
    const validTypes = ['frequency', 'trend', 'coldHot', 'combination', 'distribution']
    if (!validTypes.includes(type)) {
      return createError({
        statusCode: 400,
        statusMessage: '无效的分析类型'
      })
    }

    // 验证球类型
    const validBallTypes = ['red', 'blue']
    if (!validBallTypes.includes(ballType)) {
      return createError({
        statusCode: 400,
        statusMessage: '无效的球类型'
      })
    }

    // 验证分析期数
    if (limit < 10 || limit > 500) {
      return createError({
        statusCode: 400,
        statusMessage: '分析期数必须在10-500之间'
      })
    }

    let result

    switch (type) {
      case 'frequency':
        result = await AnalysisModel.getFrequency(ballType as 'red' | 'blue')
        break
      case 'trend':
        result = await AnalysisModel.getTrend(ballType as 'red' | 'blue', limit)
        break
      case 'coldHot':
        result = await AnalysisModel.getColdHotAnalysis()
        break
      case 'combination':
        result = await AnalysisModel.getCombinationAnalysis(limit)
        break
      case 'distribution':
        // 使用频率分析作为分布分析
        result = await AnalysisModel.getFrequency(ballType as 'red' | 'blue')
        break
      default:
        result = await AnalysisModel.getFrequency(ballType as 'red' | 'blue')
    }

    return {
      success: true,
      data: {
        type,
        ballType,
        limit,
        result,
        analyzedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('数据分析失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '数据分析失败'
    })
  }
})
