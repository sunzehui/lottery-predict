import { defineEventHandler, getRouterParam } from 'h3'
import { query } from '../../../../utils/database'

export default defineEventHandler(async (event) => {
  try {
    const id = getRouterParam(event, 'id')

    if (!id) {
      return {
        success: false,
        message: '缺少记录ID'
      }
    }

    // 删除导出记录
    const sql = 'DELETE FROM export_history WHERE id = ?'
    await query(sql, [id])

    return {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    console.error('删除导出记录失败:', error)

    return {
      success: false,
      message: '删除导出记录失败'
    }
  }
})
