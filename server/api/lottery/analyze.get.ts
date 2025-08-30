import { defineEventHandler, readBody, getQuery, createError } from 'h3'
import { AnalysisModel } from '../../models/Analysis'
import { LotteryResultModel } from '../../models/LotteryResult'

export interface NumberFrequency {
  number: number
  frequency: number
  frequencyPercentage: number
}

export interface AnalysisResult {
  redBalls: number[]
  blueBall: number
  frequency: number // 出现频率百分比
  occurrences: number // 历史出现次数
  averageInterval: number // 平均间隔期数
  recentOccurrences?: Array<{
    issue: string
    date: string
  }>
  redBallFrequency: NumberFrequency[]
  blueBallFrequency: NumberFrequency

  // 新增中奖概率相关字段
  prizeProbability?: {
    firstPrize: number // 一等奖概率 (百分比)
    secondPrize: number // 二等奖概率 (百分比)
    thirdPrize: number // 三等奖概率 (百分比)
    anyPrize: number // 任何奖项概率 (百分比)
  }
  matchStatistics?: {
    averageRedBallMatches: number // 平均红球匹配数
    blueBallMatchRate: number // 蓝球匹配率 (百分比)
    redBallMatchDistribution: { [key: number]: number } // 红球匹配数分布
    recentMatches: Array<{
      issue: string
      date: string
      redBallMatches: number
      blueBallMatch: boolean
      prizeLevel?: string
    }>
  }
}

export default defineEventHandler(async (event) => {
  try {
    // 尝试从请求体获取数据（GET请求）
    let redBalls, blueBall

    const query = getQuery(event)

    // 处理查询参数中的数组
    if (query.redBalls) {
      if (Array.isArray(query.redBalls)) {
        redBalls = query.redBalls.map(Number)
      } else {
        // 如果是单个值，转换为数组
        redBalls = [Number(query.redBalls)]
      }
    }

    if (query.blueBall) {
      blueBall = Number(query.blueBall)
    }

    // 验证输入
    if (!Array.isArray(redBalls) || redBalls.length !== 6) {
      return createError({
        statusCode: 400,
        statusMessage: '请提供6个红球号码'
      })
    }

    if (typeof blueBall !== 'number' || blueBall < 1 || blueBall > 16) {
      return createError({
        statusCode: 400,
        statusMessage: '蓝球号码必须在1-16之间'
      })
    }

    // 验证红球号码范围
    for (const ball of redBalls) {
      if (typeof ball !== 'number' || ball < 1 || ball > 33) {
        return createError({
          statusCode: 400,
          statusMessage: '红球号码必须在1-33之间'
        })
      }
    }

    // 验证红球号码是否重复
    const uniqueRedBalls = new Set(redBalls)
    if (uniqueRedBalls.size !== redBalls.length) {
      return createError({
        statusCode: 400,
        statusMessage: '红球号码不能重复'
      })
    }

    // 获取总期数
    const totalIssuesResult = await LotteryResultModel.getTotalCount()
    const totalIssues = totalIssuesResult.count

    // 查询这组号码在历史中的出现情况
    const occurrences = await LotteryResultModel.getNumberCombinationOccurrences(
      redBalls.sort((a, b) => a - b),
      blueBall
    )

    // 计算出现频率
    const frequency = totalIssues > 0 ? (occurrences.length / totalIssues) * 100 : 0

    // 计算平均间隔
    let averageInterval = 0
    if (occurrences.length > 1) {
      const sortedOccurrences = [...occurrences].sort((a, b) =>
        parseInt(a.issue) - parseInt(b.issue)
      )

      let totalInterval = 0
      for (let i = 1; i < sortedOccurrences.length; i++) {
        totalInterval += parseInt(sortedOccurrences[i].issue) - parseInt(sortedOccurrences[i - 1].issue)
      }

      averageInterval = Math.round(totalInterval / (sortedOccurrences.length - 1))
    } else if (occurrences.length === 1 && totalIssues > 0) {
      // 如果只出现了一次，计算从该期到最近一期的平均间隔
      const latestIssue = await LotteryResultModel.getLatestIssue()
      const occurrenceIssue = parseInt(occurrences[0].issue)
      if (latestIssue && occurrenceIssue) {
        averageInterval = Math.round((parseInt(latestIssue) - occurrenceIssue) / 2)
      }
    }

    // 获取最近出现记录
    const recentOccurrences = [...occurrences]
      .sort((a, b) => parseInt(b.issue) - parseInt(a.issue))
      .slice(0, 6)
      .map(occ => ({
        issue: occ.issue,
        date: occ.date
      }))

    // 获取每个红球的频率数据
    const redBallFrequency: NumberFrequency[] = []
    const redFrequencyData = await AnalysisModel.getFrequency('red')

    for (const ball of redBalls) {
      const ballData = redFrequencyData.find(item => item.ballNumber === ball)
      const frequency = ballData ? ballData.frequency : 0
      const frequencyPercentage = totalIssues > 0 ? (frequency / totalIssues) * 100 : 0

      redBallFrequency.push({
        number: ball,
        frequency,
        frequencyPercentage
      })
    }

    // 获取蓝球的频率数据
    const blueBallFrequency: NumberFrequency = {
      number: blueBall,
      frequency: 0,
      frequencyPercentage: 0
    }

    const blueFrequencyData = await AnalysisModel.getFrequency('blue')
    const blueBallData = blueFrequencyData.find(item => item.ballNumber === blueBall)

    if (blueBallData) {
      blueBallFrequency.frequency = blueBallData.frequency
      blueBallFrequency.frequencyPercentage = totalIssues > 0 ?
        (blueBallData.frequency / totalIssues) * 100 : 0
    }

    // 计算中奖概率和号码重合度
    const overlapData = await LotteryResultModel.calculateNumberOverlap(
      redBalls,
      blueBall,
      { limit: 100 } // 分析最近100期
    )

    // 计算中奖概率
    const prizeProbability = {
      firstPrize: overlapData.totalIssues > 0 ? (overlapData.firstPrizeMatches / overlapData.totalIssues) * 100 : 0,
      secondPrize: overlapData.totalIssues > 0 ? (overlapData.secondPrizeMatches / overlapData.totalIssues) * 100 : 0,
      thirdPrize: overlapData.totalIssues > 0 ? (overlapData.thirdPrizeMatches / overlapData.totalIssues) * 100 : 0,
      anyPrize: overlapData.totalIssues > 0 ?
        ((overlapData.firstPrizeMatches + overlapData.secondPrizeMatches + overlapData.thirdPrizeMatches) / overlapData.totalIssues) * 100 : 0
    }

    // 构建匹配统计信息
    const matchStatistics = {
      averageRedBallMatches: overlapData.averageRedBallMatches,
      blueBallMatchRate: overlapData.blueBallMatchRate,
      redBallMatchDistribution: overlapData.redBallMatchDistribution,
      recentMatches: [...overlapData.detailedMatches]
        .sort((a, b) => b.redBallMatches - a.redBallMatches) // 按红球匹配数降序排序
        .slice(0, 10) // 只返回匹配数量最多的10期详细匹配信息
    }

    // 构建返回结果
    const result: AnalysisResult = {
      redBalls: redBalls.sort((a, b) => a - b),
      blueBall,
      frequency,
      occurrences: occurrences.length,
      averageInterval,
      recentOccurrences,
      redBallFrequency,
      blueBallFrequency,
      prizeProbability,
      matchStatistics
    }

    return {
      success: true,
      data: result
    }
  } catch (error) {
    console.error('号码分析失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '号码分析失败'
    })
  }
})

