import { defineEventHandler, readBody, createError } from 'h3'
import { AnalysisModel } from '../../models/Analysis'

export default defineEventHandler(async (event) => {
  try {
    // 读取请求体
    const body = await readBody(event)

    // 验证请求数据
    const { issue, date, redBalls, blueBall } = body

    if (!issue || !date || !redBalls || !blueBall) {
      return createError({
        statusCode: 400,
        statusMessage: '缺少必要参数'
      })
    }

    // 验证红球
    if (!Array.isArray(redBalls) || redBalls.length !== 6) {
      return createError({
        statusCode: 400,
        statusMessage: '红球必须是6个数字'
      })
    }

    // 验证红球范围
    if (redBalls.some(ball => isNaN(ball) || ball < 1 || ball > 33)) {
      return createError({
        statusCode: 400,
        statusMessage: '红球必须是1-33之间的数字'
      })
    }

    // 检查红球是否重复
    const uniqueRedBalls = new Set(redBalls)
    if (uniqueRedBalls.size !== 6) {
      return createError({
        statusCode: 400,
        statusMessage: '红球不能重复'
      })
    }

    // 验证蓝球
    if (isNaN(blueBall) || blueBall < 1 || blueBall > 16) {
      return createError({
        statusCode: 400,
        statusMessage: '蓝球必须是1-16之间的数字'
      })
    }

    // 检查期号是否已存在
    const { query } = await import('../../utils/database')
    const checkSql = 'SELECT issue FROM lottery_results WHERE issue = ?'
    const existingResults = await query(checkSql, [issue])

    if (existingResults.length > 0) {
      return createError({
        statusCode: 400,
        statusMessage: '该期号已存在'
      })
    }

    // 排序红球
    const sortedRedBalls = [...redBalls].sort((a, b) => a - b)

    // 插入数据
    const insertSql = `
      INSERT INTO lottery_results
      (issue, date, red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
    `

    const params = [
      issue,
      date,
      sortedRedBalls[0],
      sortedRedBalls[1],
      sortedRedBalls[2],
      sortedRedBalls[3],
      sortedRedBalls[4],
      sortedRedBalls[5],
      blueBall
    ]

    await query(insertSql, params)

    // 更新号码频率统计
    await AnalysisModel.updateFrequency(issue)

    return {
      success: true,
      message: '开奖结果添加成功',
      data: {
        issue,
        date,
        redBalls: sortedRedBalls,
        blueBall
      }
    }
  } catch (error) {
    console.error('保存开奖结果失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '保存开奖结果失败'
    })
  }
})
