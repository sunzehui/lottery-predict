import { defineEventHandler } from 'h3'
import { query } from '../../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // 获取导出历史记录
    const sql = `
      SELECT 
        id,
        export_type as type,
        export_format as format,
        file_name as filename,
        file_path as path,
        file_size as size,
        export_params as params,
        created_at as exportTime
      FROM export_history
      ORDER BY created_at DESC
      LIMIT 100
    `

    const results = await query(sql)

    // 格式化结果，添加下载URL
    const historyRecords = (results as any[]).map(record => ({
      id: record.id,
      type: record.type,
      format: record.format,
      filename: record.filename,
      size: record.size,
      exportTime: record.exportTime,
      downloadUrl: record.path || `/api/lottery/export/download/${record.id}`
    }))

    return {
      success: true,
      data: historyRecords
    }
  } catch (error) {
    console.error('获取导出历史记录失败:', error)

    return {
      success: false,
      message: '获取导出历史记录失败'
    }
  }
})
