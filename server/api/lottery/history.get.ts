import { defineEventHandler, getQuery, createError } from 'h3'
import { LotteryResultModel } from '../../models/LotteryResult'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const size = parseInt(query.size as string) || 10
    const issue = query.issue as string
    const startDate = query.startDate as string
    const endDate = query.endDate as string
    const hasConsecutive = query.hasConsecutive as string
    const hasSpacedConsecutive = query.hasSpacedConsecutive as string

    // 获取历史数据
    const result = await LotteryResultModel.getList({
      page,
      size,
      issue,
      startDate,
      endDate,
      hasConsecutive,
      hasSpacedConsecutive
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
    console.error('获取历史数据失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '获取历史数据失败'
    })
  }
})
