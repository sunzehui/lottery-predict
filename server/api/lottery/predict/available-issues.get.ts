import { defineEventHandler, getQuery, createError } from 'h3'
import { PredictionModel } from '../../../models/Prediction'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const limit = parseInt(query.limit as string) || 10

    // 验证限制参数
    if (limit < 1 || limit > 100) {
      return createError({
        statusCode: 400,
        statusMessage: '限制数量必须在1-100之间'
      })
    }

    // 获取可用期数列表
    const { query: dbQuery } = await import('../../../utils/database')

    // 查询最近有预测记录的期数，按期号降序排列
    const sql = `
      SELECT DISTINCT issue
      FROM predictions
      ORDER BY CAST(issue AS UNSIGNED) DESC
      LIMIT ?
    `

    const results = await dbQuery(sql, [limit])

    // 提取期号列表
    const issues = (results as any[]).map(row => row.issue)

    return {
      success: true,
      data: issues
    }
  } catch (error) {
    console.error('获取可用期数列表失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '获取可用期数列表失败'
    })
  }
})
