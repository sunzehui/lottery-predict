import { defineEventHandler, getRouterParam, setHeader, createError } from 'h3'
import { LotteryResultModel } from '../../../../models/LotteryResult'
import { PredictionModel } from '../../../../models/Prediction'
import { query } from '../../../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // 获取导出ID
    const exportId = getRouterParam(event, 'id')

    if (!exportId) {
      return createError({
        statusCode: 400,
        statusMessage: '缺少导出ID'
      })
    }

    // 查询导出记录
    const exportRecords = await query('SELECT * FROM export_history WHERE id = ?', [exportId]) as any[]

    if (exportRecords.length === 0) {
      return createError({
        statusCode: 404,
        statusMessage: '导出记录不存在'
      })
    }

    const exportRecord = exportRecords[0]
    const exportParams = JSON.parse(exportRecord.export_params || '{}')

    // 根据导出类型和格式重新生成数据
    let data: any[] | { message: string; timestamp: string }

    switch (exportRecord.export_type) {
      case 'history':
        // 获取历史数据
        const historyResult = await LotteryResultModel.getList({
          page: 1,
          size: 1000, // 限制导出数量
          startDate: exportParams.startDate,
          endDate: exportParams.endDate
        })
        data = historyResult.data
        break
      case 'predictions':
        // 获取预测数据
        const predictionResult = await PredictionModel.getList({
          page: 1,
          size: 1000,
          startDate: exportParams.startDate,
          endDate: exportParams.endDate
        })
        data = predictionResult.data
        break
      case 'analysis':
        // 获取分析数据（这里简化处理，实际应用中可能需要更复杂的逻辑）
        const analysisData = {
          message: '分析数据导出功能需要更复杂的实现，这里仅作为示例',
          timestamp: new Date().toISOString()
        }
        data = analysisData
        break
      default:
        data = []
    }

    // 设置响应头
    setHeader(event, 'Content-Type', getContentType(exportRecord.export_format))
    setHeader(event, 'Content-Disposition', `attachment; filename="${exportRecord.file_name}"`)

    // 根据格式返回数据
    if (exportRecord.export_format === 'json') {
      return JSON.stringify(data, null, 2)
    } else if (exportRecord.export_format === 'csv') {
      // 只有数组类型的数据才能转换为CSV
      if (Array.isArray(data)) {
        return convertToCSV(data)
      } else {
        return 'Message,Date\n' + data.message + ',' + data.timestamp
      }
    } else if (exportRecord.export_format === 'excel') {
      // Excel格式需要额外的库支持，这里简化处理
      return JSON.stringify(data, null, 2)
    }

    return data
  } catch (error) {
    console.error('文件下载失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '文件下载失败'
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
