import { defineEventHandler } from 'h3'
import { query } from '../../../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    // 清空导出历史记录
    const sql = 'DELETE FROM export_history'
    await query(sql)

    return {
      success: true,
      message: '清空成功'
    }
  } catch (error) {
    console.error('清空导出历史记录失败:', error)

    return {
      success: false,
      message: '清空导出历史记录失败'
    }
  }
})
