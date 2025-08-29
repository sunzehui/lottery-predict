import { defineEventHandler, getQuery, createError } from 'h3'
import { PredictionModel } from '../../../models/Prediction'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const size = parseInt(query.size as string) || 10
    const algorithmType = query.algorithmType as string
    const issue = query.issue as string

    // 验证分页参数
    if (page < 1) {
      return createError({
        statusCode: 400,
        statusMessage: '页码必须大于0'
      })
    }

    if (size < 1 || size > 100) {
      return createError({
        statusCode: 400,
        statusMessage: '每页数量必须在1-100之间'
      })
    }

    // 获取预测历史数据
    const result = await PredictionModel.getList({
      page,
      size,
      algorithmType,
      issue
    })

    return {
      success: true,
      data: result.data,
      pagination: {
        page,
        size,
        total: result.total,
        totalPages: Math.ceil(result.total / size)
      }
    }
  } catch (error) {
    console.error('获取预测历史失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '获取预测历史失败'
    })
  }
})
