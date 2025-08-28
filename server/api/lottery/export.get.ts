import { defineEventHandler, getQuery, createError, setHeader } from 'h3'
import { LotteryResultModel } from '../../models/LotteryResult'
import { PredictionModel } from '../../models/Prediction'
import { query } from '../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const queryParams = getQuery(event)
    const type = queryParams.type as string || 'history' // 默认导出历史数据
    const format = queryParams.format as string || 'json' // 默认导出为JSON格式
    const startDate = queryParams.startDate as string
    const endDate = queryParams.endDate as string

    // 验证导出类型
    const validTypes = ['history', 'predictions', 'analysis']
    if (!validTypes.includes(type)) {
      return createError({
        statusCode: 400,
        statusMessage: '无效的导出类型'
      })
    }

    // 验证导出格式
    const validFormats = ['json', 'csv', 'excel']
    if (!validFormats.includes(format)) {
      return createError({
        statusCode: 400,
        statusMessage: '无效的导出格式'
      })
    }

    let data: any[] | { message: string; timestamp: string }
    let filename: string
    let exportId: string

    // 生成唯一的导出ID
    exportId = 'export_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

    switch (type) {
      case 'history':
        // 获取历史数据
        const historyResult = await LotteryResultModel.getList({
          page: 1,
          size: 1000, // 限制导出数量
          startDate,
          endDate
        })
        data = historyResult.data
        filename = `lottery_history_${new Date().toISOString().split('T')[0]}.${format}`
        break
      case 'predictions':
        // 获取预测数据
        const predictionResult = await PredictionModel.getList({
          page: 1,
          size: 1000,
          startDate,
          endDate
        })
        data = predictionResult.data
        filename = `lottery_predictions_${new Date().toISOString().split('T')[0]}.${format}`
        break
      case 'analysis':
        // 获取分析数据（这里简化处理，实际应用中可能需要更复杂的逻辑）
        const analysisData = {
          message: '分析数据导出功能需要更复杂的实现，这里仅作为示例',
          timestamp: new Date().toISOString()
        }
        data = analysisData
        filename = `lottery_analysis_${new Date().toISOString().split('T')[0]}.${format}`
        break
      default:
        data = []
        filename = `lottery_data_${new Date().toISOString().split('T')[0]}.${format}`
    }

    // 准备导出参数
    const exportParams = {
      startDate,
      endDate,
      type,
      format
    }

    // 保存导出历史记录
    try {
      const sql = `
        INSERT INTO export_history
        (id, export_type, export_format, file_name, file_path, file_size, export_params, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `

      // 计算文件大小（估算）
      let fileSize = 0
      if (format === 'json') {
        fileSize = Buffer.byteLength(JSON.stringify(data), 'utf8')
      } else if (format === 'csv' && Array.isArray(data)) {
        fileSize = Buffer.byteLength(convertToCSV(data), 'utf8')
      } else {
        fileSize = Buffer.byteLength(JSON.stringify(data), 'utf8')
      }

      await query(sql, [
        exportId,
        type,
        format,
        filename,
        `/api/lottery/export/download/${exportId}`,
        fileSize,
        JSON.stringify(exportParams)
      ])
    } catch (error) {
      console.error('保存导出历史记录失败:', error)
      // 即使保存历史记录失败，也继续返回导出结果
    }

    // 返回包含URL和文件名的JSON对象
    return {
      success: true,
      message: '数据导出成功',
      data: {
        id: exportId,
        filename: filename,
        downloadUrl: `/api/lottery/export/download/${exportId}`,
        type: type,
        format: format,
        size: format === 'json' ? Buffer.byteLength(JSON.stringify(data), 'utf8') :
          format === 'csv' && Array.isArray(data) ? Buffer.byteLength(convertToCSV(data), 'utf8') :
            Buffer.byteLength(JSON.stringify(data), 'utf8'),
        exportTime: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('数据导出失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '数据导出失败'
    })
  }
})

// 获取内容类型
function getContentType(format: string): string {
  switch (format) {
    case 'json':
      return 'application/json'
    case 'csv':
      return 'text/csv'
    case 'excel':
      return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    default:
      return 'application/json'
  }
}

// 转换为CSV格式
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return ''
  }

  // 获取表头
  const headers = Object.keys(data[0])

  // 创建CSV内容
  let csv = headers.join(',') + '\n'

  // 添加数据行
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // 处理包含逗号或引号的值
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value
    })
    csv += values.join(',') + '\n'
  })

  return csv
}
