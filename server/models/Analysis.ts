export interface NumberFrequency {
  ballType: 'red' | 'blue'
  ballNumber: number
  frequency: number
  lastAppearanceIssue?: string
  lastAppearanceDate?: string
}

export interface NumberTrend {
  ballType: 'red' | 'blue'
  ballNumber: number
  issue: string
  trendValue: number
  trendType: 'up' | 'down' | 'stable'
}

export interface ColdHotAnalysis {
  redHotBalls: number[]
  redColdBalls: number[]
  blueHotBalls: number[]
  blueColdBalls: number[]
}

export interface CombinationAnalysis {
  oddEven: { [key: string]: number }
  bigSmall: { [key: string]: number }
  sum: { [key: string]: number }
  consecutive: { [key: string]: number }
}

export class AnalysisModel {
  // 获取号码频率统计
  static async getFrequency(ballType: 'red' | 'blue' = 'red'): Promise<NumberFrequency[]> {
    const { query } = await import('../utils/database')

    const sql = `
      SELECT ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date
      FROM number_frequency
      WHERE ball_type = ?
      ORDER BY ball_number
    `

    const results = await query(sql, [ballType])
    return (results as any[]).map(row => ({
      ballType: row.ball_type,
      ballNumber: row.ball_number,
      frequency: row.frequency,
      lastAppearanceIssue: row.last_appearance_issue,
      lastAppearanceDate: row.last_appearance_date
    }))
  }

  // 更新号码频率统计
  static async updateFrequency(issue: string): Promise<void> {
    const { query } = await import('../utils/database')

    // 调用存储过程更新频率统计
    await query('CALL UpdateNumberFrequency(?)', [issue])
  }

  // 获取号码趋势
  static async getTrend(ballType: 'red' | 'blue' = 'red', limit: number = 20): Promise<NumberTrend[]> {
    const { query } = await import('../utils/database')

    const maxNumber = ballType === 'red' ? 33 : 16

    const trends: NumberTrend[] = []

    // 获取最近limit期的数据
    const sql = `
      SELECT issue, red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball
      FROM lottery_results
      ORDER BY issue DESC
      LIMIT ?
    `

    const results = await query(sql, [limit])
    const history = results as any[]

    // 为每个号码计算趋势
    for (let num = 1; num <= maxNumber; num++) {
      const appearances: number[] = []

      history.forEach((row, index) => {
        let appeared = false

        if (ballType === 'red') {
          for (let i = 1; i <= 6; i++) {
            if (row[`red_ball_${i}`] === num) {
              appeared = true
              break
            }
          }
        } else {
          appeared = row.blue_ball === num
        }

        if (appeared) {
          appearances.push(limit - index) // 最近的期号权重更高
        }
      })

      // 计算趋势值和趋势类型
      let trendValue = 0
      let trendType: 'up' | 'down' | 'stable' = 'stable'

      if (appearances.length > 0) {
        // 计算加权平均值
        const totalWeight = appearances.reduce((sum, weight) => sum + weight, 0)
        trendValue = totalWeight / appearances.length

        // 判断趋势类型
        const recentAppearances = appearances.filter(weight => weight > limit / 2).length
        const totalAppearances = appearances.length

        if (recentAppearances / totalAppearances > 0.6) {
          trendType = 'up'
        } else if (recentAppearances / totalAppearances < 0.3) {
          trendType = 'down'
        }
      }

      trends.push({
        ballType,
        ballNumber: num,
        issue: history[0]?.issue || '',
        trendValue,
        trendType
      })
    }

    return trends
  }

  // 获取冷热号分析
  static async getColdHotAnalysis(hotThreshold: number = 3, coldThreshold: number = 30): Promise<ColdHotAnalysis> {
    const { query } = await import('../utils/database')

    // 获取最近10期的数据
    const recentSql = `
      SELECT red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball
      FROM lottery_results
      ORDER BY issue DESC
      LIMIT 10
    `

    const recentResults = await query(recentSql) as any[]

    // 统计红球出现次数
    const redCount: { [key: number]: number } = {}
    for (let i = 1; i <= 33; i++) {
      redCount[i] = 0
    }

    recentResults.forEach(row => {
      for (let i = 1; i <= 6; i++) {
        const ball = row[`red_ball_${i}`]
        redCount[ball]++
      }
    })

    // 统计蓝球出现次数
    const blueCount: { [key: number]: number } = {}
    for (let i = 1; i <= 16; i++) {
      blueCount[i] = 0
    }

    recentResults.forEach(row => {
      const ball = row.blue_ball
      blueCount[ball]++
    })

    // 获取最后出现期号
    const lastAppearanceSql = `
      SELECT
        ball_type,
        ball_number,
        last_appearance_issue,
        last_appearance_date
      FROM number_frequency
    `

    const lastAppearanceResults = await query(lastAppearanceSql) as any[]

    const lastAppearance: { [key: string]: string } = {}
    lastAppearanceResults.forEach(row => {
      lastAppearance[`${row.ball_type}_${row.ball_number}`] = row.last_appearance_issue
    })

    // 获取最新期号
    const latestSql = 'SELECT issue FROM lottery_results ORDER BY issue DESC LIMIT 1'
    const latestResults = await query(latestSql) as any[]
    const latestIssue = latestResults.length > 0 && latestResults[0] && latestResults[0].issue ? latestResults[0].issue : '2025000'

    // 计算冷热号
    const redHotBalls: number[] = []
    const redColdBalls: number[] = []
    const blueHotBalls: number[] = []
    const blueColdBalls: number[] = []

    // 红球热号
    for (let i = 1; i <= 33; i++) {
      if (redCount[i] >= hotThreshold) {
        redHotBalls.push(i)
      }
    }

    // 红球冷号
    for (let i = 1; i <= 33; i++) {
      const lastIssue = lastAppearance[`red_${i}`]
      if (lastIssue && lastIssue.trim() !== '') {
        const lastIssueNum = parseInt(lastIssue)
        const latestIssueNum = parseInt(latestIssue)

        if (!isNaN(lastIssueNum) && !isNaN(latestIssueNum)) {
          const issueDiff = latestIssueNum - lastIssueNum
          if (issueDiff >= coldThreshold) {
            redColdBalls.push(i)
          }
        } else {
          // 如果期号格式不正确，视为冷号
          redColdBalls.push(i)
        }
      } else {
        // 如果没有最后出现期号记录，视为冷号
        redColdBalls.push(i)
      }
    }

    // 蓝球热号
    for (let i = 1; i <= 16; i++) {
      if (blueCount[i] >= hotThreshold) {
        blueHotBalls.push(i)
      }
    }

    // 蓝球冷号
    for (let i = 1; i <= 16; i++) {
      const lastIssue = lastAppearance[`blue_${i}`]
      if (lastIssue && lastIssue.trim() !== '') {
        const lastIssueNum = parseInt(lastIssue)
        const latestIssueNum = parseInt(latestIssue)

        if (!isNaN(lastIssueNum) && !isNaN(latestIssueNum)) {
          const issueDiff = latestIssueNum - lastIssueNum
          if (issueDiff >= coldThreshold) {
            blueColdBalls.push(i)
          }
        } else {
          // 如果期号格式不正确，视为冷号
          blueColdBalls.push(i)
        }
      } else {
        // 如果没有最后出现期号记录，视为冷号
        blueColdBalls.push(i)
      }
    }

    return {
      redHotBalls,
      redColdBalls,
      blueHotBalls,
      blueColdBalls
    }
  }

  // 获取组合分析
  static async getCombinationAnalysis(limit: number = 100): Promise<CombinationAnalysis> {
    const { query } = await import('../utils/database')

    // 获取最近limit期的数据
    const sql = `
      SELECT red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball
      FROM lottery_results
      ORDER BY issue DESC
      LIMIT ?
    `

    const results = await query(sql, [limit]) as any[]

    // 初始化统计数据
    const oddEven: { [key: string]: number } = {}
    const bigSmall: { [key: string]: number } = {}
    const sum: { [key: string]: number } = {}
    const consecutive: { [key: string]: number } = {}

    // 初始化奇偶比统计
    for (let i = 0; i <= 6; i++) {
      oddEven[`${i}:6`] = 0
    }

    // 初始化大小比统计
    for (let i = 0; i <= 6; i++) {
      bigSmall[`${i}:6`] = 0
    }

    // 初始化和值统计
    for (let i = 21; i <= 200; i += 10) {
      sum[`${i}-${i + 9}`] = 0
    }

    // 初始化连号统计
    consecutive['无连号'] = 0
    for (let i = 2; i <= 6; i++) {
      consecutive[`${i}连号`] = 0
    }

    // 分析每期数据
    results.forEach(row => {
      const redBalls = [
        row.red_ball_1,
        row.red_ball_2,
        row.red_ball_3,
        row.red_ball_4,
        row.red_ball_5,
        row.red_ball_6
      ].sort((a, b) => a - b)

      // 奇偶比分析
      const oddCount = redBalls.filter(ball => ball % 2 === 1).length
      oddEven[`${oddCount}:6-${6 - oddCount}`]++

      // 大小比分析（1-16为小，17-33为大）
      const bigCount = redBalls.filter(ball => ball > 16).length
      bigSmall[`${bigCount}:6-${6 - bigCount}`]++

      // 和值分析
      const sumValue = redBalls.reduce((sum, ball) => sum + ball, 0)
      const sumRange = Math.floor(sumValue / 10) * 10
      sum[`${sumRange}-${sumRange + 9}`]++

      // 连号分析
      let maxConsecutive = 1
      let currentConsecutive = 1

      for (let i = 1; i < redBalls.length; i++) {
        if (redBalls[i] === redBalls[i - 1] + 1) {
          currentConsecutive++
          maxConsecutive = Math.max(maxConsecutive, currentConsecutive)
        } else {
          currentConsecutive = 1
        }
      }

      if (maxConsecutive === 1) {
        consecutive['无连号']++
      } else {
        consecutive[`${maxConsecutive}连号`]++
      }
    })

    return {
      oddEven,
      bigSmall,
      sum,
      consecutive
    }
  }

  // 保存号码趋势
  static async saveTrend(trends: NumberTrend[]): Promise<void> {
    const { query } = await import('../utils/database')

    // 批量插入趋势数据
    for (const trend of trends) {
      const sql = `
        INSERT INTO number_trends 
        (ball_type, ball_number, issue, trend_value, trend_type)
        VALUES (?, ?, ?, ?, ?)
      `

      const params = [
        trend.ballType,
        trend.ballNumber,
        trend.issue,
        trend.trendValue,
        trend.trendType
      ]

      await query(sql, params)
    }
  }
}
