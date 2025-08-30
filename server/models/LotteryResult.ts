export interface LotteryResult {
  id?: number
  issue: string
  date: string
  redBalls: number[]
  blueBall: number
  prizePool?: number
  salesAmount?: number
  firstPrizeWinners?: number
  firstPrizeSingleAmountCents?: number
  secondPrizeWinners?: number
  secondPrizeSingleAmountCents?: number
  thirdPrizeWinners?: number
  thirdPrizeSingleAmountCents?: number
  createdAt?: string
  updatedAt?: string
}

export class LotteryResultModel {
  // 创建开奖结果
  static async create(data: Omit<LotteryResult, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const { query } = await import('../utils/database')

    const sql = `
      INSERT INTO lottery_results 
      (issue, date, red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball, prize_pool, sales_amount)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `

    const params = [
      data.issue,
      data.date,
      data.redBalls[0],
      data.redBalls[1],
      data.redBalls[2],
      data.redBalls[3],
      data.redBalls[4],
      data.redBalls[5],
      data.blueBall,
      (data.prizePool || 0) * 100, // 转换为分
      (data.salesAmount || 0) * 100  // 转换为分
    ]

    const result = await query(sql, params)
    return (result as any).insertId
  }

  // 根据期号获取开奖结果
  static async getByIssue(issue: string): Promise<LotteryResult | null> {
    const { query } = await import('../utils/database')

    const sql = 'SELECT * FROM lottery_results WHERE issue = ?'
    const results = await query(sql, [issue])

    if ((results as any[]).length === 0) {
      return null
    }

    const row = (results as any[])[0]
    return this.mapRowToLotteryResult(row)
  }

  // 获取最新开奖结果
  static async getLatest(): Promise<LotteryResult | null> {
    const { query } = await import('../utils/database')

    const sql = 'SELECT * FROM lottery_results ORDER BY issue DESC LIMIT 1'
    const results = await query(sql)

    if ((results as any[]).length === 0) {
      return null
    }

    const row = (results as any[])[0]
    return this.mapRowToLotteryResult(row)
  }

  // 获取总期数
  static async getTotalCount(): Promise<{ count: number }> {
    const { query } = await import('../utils/database')

    const sql = 'SELECT COUNT(*) as count FROM lottery_results'
    const results = await query(sql)

    return { count: (results as any[])[0].count }
  }

  // 获取最新期号
  static async getLatestIssue(): Promise<string | null> {
    const { query } = await import('../utils/database')

    const sql = 'SELECT issue FROM lottery_results ORDER BY issue DESC LIMIT 1'
    const results = await query(sql)

    return (results as any[]).length > 0 ? (results as any[])[0].issue : null
  }

  // 获取特定号码组合的出现记录
  static async getNumberCombinationOccurrences(
    redBalls: number[],
    blueBall: number
  ): Promise<LotteryResult[]> {
    const { query } = await import('../utils/database')

    // 确保红球已排序
    const sortedRedBalls = [...redBalls].sort((a, b) => a - b)

    // 构建SQL查询，查找完全匹配的号码组合
    const sql = `
      SELECT * FROM lottery_results
      WHERE red_ball_1 = ? AND red_ball_2 = ? AND red_ball_3 = ? AND
            red_ball_4 = ? AND red_ball_5 = ? AND red_ball_6 = ? AND blue_ball = ?
      ORDER BY issue DESC
    `

    const params = [
      sortedRedBalls[0],
      sortedRedBalls[1],
      sortedRedBalls[2],
      sortedRedBalls[3],
      sortedRedBalls[4],
      sortedRedBalls[5],
      blueBall
    ]

    const results = await query(sql, params)

    return (results as any[]).map(row => this.mapRowToLotteryResult(row))
  }

  // 计算号码与历史记录的重合度
  static async calculateNumberOverlap(
    redBalls: number[],
    blueBall: number,
    options?: {
      limit?: number
      startDate?: string
      endDate?: string
    }
  ): Promise<{
    firstPrizeMatches: number
    secondPrizeMatches: number
    thirdPrizeMatches: number
    totalIssues: number
    averageRedBallMatches: number
    redBallMatchDistribution: { [key: number]: number }
    blueBallMatchRate: number
    detailedMatches: Array<{
      issue: string
      date: string
      redBallMatches: number
      blueBallMatch: boolean
      prizeLevel?: string
    }>
  }> {
    const { query } = await import('../utils/database')

    // 基础SQL查询
    let sql = `
      SELECT issue, date, red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball
      FROM lottery_results
    `

    const params: any[] = []

    // 添加日期过滤条件
    if (options?.startDate || options?.endDate) {
      if (options.startDate) {
        sql += ' WHERE date >= ?'
        params.push(options.startDate)
      }
      if (options.endDate) {
        sql += options.startDate ? ' AND date <= ?' : ' WHERE date <= ?'
        params.push(options.endDate)
      }
    }

    // 添加limit限制
    if (options?.limit) {
      sql += options.startDate || options.endDate ? ' AND' : ' WHERE'
      sql += ' issue >= (SELECT MAX(issue) FROM lottery_results) - ?'
      params.push(options.limit)
    }

    sql += ' ORDER BY issue DESC'

    const results = await query(sql, params) as any[]

    // 初始化统计变量
    let firstPrizeMatches = 0
    let secondPrizeMatches = 0
    let thirdPrizeMatches = 0
    let totalRedBallMatches = 0
    let blueBallMatches = 0
    const redBallMatchDistribution: { [key: number]: number } = {}

    // 初始化红球匹配分布
    for (let i = 0; i <= 6; i++) {
      redBallMatchDistribution[i] = 0
    }

    const detailedMatches: Array<{
      issue: string
      date: string
      redBallMatches: number
      blueBallMatch: boolean
      prizeLevel?: string
    }> = []

    // 分析每期数据
    results.forEach(row => {
      const historicalRedBalls = [
        row.red_ball_1,
        row.red_ball_2,
        row.red_ball_3,
        row.red_ball_4,
        row.red_ball_5,
        row.red_ball_6
      ]

      // 计算红球匹配数
      let redBallMatches = 0
      for (const ball of redBalls) {
        if (historicalRedBalls.includes(ball)) {
          redBallMatches++
        }
      }

      // 计算蓝球是否匹配
      const blueBallMatch = blueBall === row.blue_ball

      // 更新统计
      totalRedBallMatches += redBallMatches
      redBallMatchDistribution[redBallMatches]++
      if (blueBallMatch) {
        blueBallMatches++
      }

      // 判断中奖等级
      let prizeLevel: string | undefined
      if (redBallMatches === 6 && blueBallMatch) {
        prizeLevel = '一等奖'
      } else if (redBallMatches === 6) {
        prizeLevel = '二等奖'
      } else if (redBallMatches >= 5 && blueBallMatch) {
        prizeLevel = '三等奖'
      } else if ((redBallMatches === 5 && !blueBallMatch) || (redBallMatches === 4 && blueBallMatch)) {

        prizeLevel = '四等奖'

        firstPrizeMatches++
      } else if ((redBallMatches === 3 && blueBallMatch) || (redBallMatches === 4 && !blueBallMatch)) {
        prizeLevel = '五等奖'

        secondPrizeMatches++
      } else if (blueBallMatch) {
        prizeLevel = '六等奖'
        thirdPrizeMatches++
      }

      detailedMatches.push({
        issue: row.issue,
        date: row.date,
        redBallMatches,
        blueBallMatch,
        prizeLevel
      })
    })

    // 计算平均值和概率
    const totalIssues = results.length
    const averageRedBallMatches = totalIssues > 0 ? totalRedBallMatches / totalIssues : 0
    const blueBallMatchRate = totalIssues > 0 ? (blueBallMatches / totalIssues) * 100 : 0

    return {
      firstPrizeMatches,
      secondPrizeMatches,
      thirdPrizeMatches,
      totalIssues,
      averageRedBallMatches,
      redBallMatchDistribution,
      blueBallMatchRate,
      detailedMatches
    }
  }

  // 获取开奖结果列表
  static async getList(options: {
    page?: number
    size?: number
    issue?: string
    startDate?: string
    endDate?: string
    hasConsecutive?: string
    hasSpacedConsecutive?: string
  } = {}): Promise<{ data: LotteryResult[], total: number }> {
    const { query } = await import('../utils/database')

    const page = options.page || 1
    const size = options.size || 10
    const offset = (page - 1) * size

    let whereClause = ''
    const params: any[] = []

    if (options.issue) {
      whereClause += ' AND issue = ?'
      params.push(options.issue)
    }

    if (options.startDate) {
      whereClause += ' AND date >= ?'
      params.push(options.startDate)
    }

    if (options.endDate) {
      whereClause += ' AND date <= ?'
      params.push(options.endDate)
    }

    // 处理连续号码过滤
    let consecutiveFilter = ''
    if (options.hasConsecutive === 'true') {
      // 查找包含3个连续号码的记录
      consecutiveFilter = `
        AND (
          (red_ball_1 + 1 = red_ball_2 AND red_ball_2 + 1 = red_ball_3) OR
          (red_ball_2 + 1 = red_ball_3 AND red_ball_3 + 1 = red_ball_4) OR
          (red_ball_3 + 1 = red_ball_4 AND red_ball_4 + 1 = red_ball_5) OR
          (red_ball_4 + 1 = red_ball_5 AND red_ball_5 + 1 = red_ball_6)
        )
      `
    } else if (options.hasConsecutive === 'false') {
      // 查找不包含3个连续号码的记录
      consecutiveFilter = `
        AND NOT (
          (red_ball_1 + 1 = red_ball_2 AND red_ball_2 + 1 = red_ball_3) OR
          (red_ball_2 + 1 = red_ball_3 AND red_ball_3 + 1 = red_ball_4) OR
          (red_ball_3 + 1 = red_ball_4 AND red_ball_4 + 1 = red_ball_5) OR
          (red_ball_4 + 1 = red_ball_5 AND red_ball_5 + 1 = red_ball_6)
        )
      `
    }

    // 处理隔开连续号码过滤
    let spacedConsecutiveFilter = ''
    if (options.hasSpacedConsecutive === 'true') {
      // 查找包含3个隔开连续号码的记录（如 13 15 17，2 4 6）
      spacedConsecutiveFilter = `
        AND (
          (red_ball_1 + 2 = red_ball_2 AND red_ball_2 + 2 = red_ball_3) OR
          (red_ball_2 + 2 = red_ball_3 AND red_ball_3 + 2 = red_ball_4) OR
          (red_ball_3 + 2 = red_ball_4 AND red_ball_4 + 2 = red_ball_5) OR
          (red_ball_4 + 2 = red_ball_5 AND red_ball_5 + 2 = red_ball_6)
        )
      `
    } else if (options.hasSpacedConsecutive === 'false') {
      // 查找不包含3个隔开连续号码的记录
      spacedConsecutiveFilter = `
        AND NOT (
          (red_ball_1 + 2 = red_ball_2 AND red_ball_2 + 2 = red_ball_3) OR
          (red_ball_2 + 2 = red_ball_3 AND red_ball_3 + 2 = red_ball_4) OR
          (red_ball_3 + 2 = red_ball_4 AND red_ball_4 + 2 = red_ball_5) OR
          (red_ball_4 + 2 = red_ball_5 AND red_ball_5 + 2 = red_ball_6)
        )
      `
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM lottery_results WHERE 1=1 ${whereClause} ${consecutiveFilter} ${spacedConsecutiveFilter}`
    const countResults = await query(countSql, params)
    const total = (countResults as any[])[0].total

    // 获取数据
    const dataSql = `
      SELECT * FROM lottery_results
      WHERE 1=1 ${whereClause} ${consecutiveFilter} ${spacedConsecutiveFilter}
      ORDER BY issue DESC
      LIMIT ? OFFSET ?
    `
    const dataParams = [...params, size, offset]
    const results = await query(dataSql, dataParams)

    const data = (results as any[]).map(row => this.mapRowToLotteryResult(row))

    return { data, total }
  }

  // 更新开奖结果
  static async update(issue: string, data: Partial<LotteryResult>): Promise<boolean> {
    const { query } = await import('../utils/database')

    const fields: string[] = []
    const params: any[] = []

    if (data.redBalls) {
      fields.push('red_ball_1 = ?, red_ball_2 = ?, red_ball_3 = ?, red_ball_4 = ?, red_ball_5 = ?, red_ball_6 = ?')
      params.push(...data.redBalls)
    }

    if (data.blueBall !== undefined) {
      fields.push('blue_ball = ?')
      params.push(data.blueBall)
    }

    if (data.prizePool !== undefined) {
      fields.push('prize_pool = ?')
      params.push(data.prizePool * 100)
    }

    if (data.salesAmount !== undefined) {
      fields.push('sales_amount = ?')
      params.push(data.salesAmount * 100)
    }

    if (fields.length === 0) {
      return false
    }

    params.push(issue)

    const sql = `UPDATE lottery_results SET ${fields.join(', ')} WHERE issue = ?`
    const result = await query(sql, params)

    return (result as any).affectedRows > 0
  }

  // 删除开奖结果
  static async delete(issue: string): Promise<boolean> {
    const { query } = await import('../utils/database')

    const sql = 'DELETE FROM lottery_results WHERE issue = ?'
    const result = await query(sql, [issue])

    return (result as any).affectedRows > 0
  }

  // 批量创建开奖结果
  static async batchCreate(dataList: Omit<LotteryResult, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<number> {
    const { transaction } = await import('../utils/database')

    let insertedCount = 0

    await transaction(async (connection) => {
      for (const data of dataList) {
        const sql = `
          INSERT INTO lottery_results 
          (issue, date, red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball, prize_pool, sales_amount)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
          red_ball_1 = VALUES(red_ball_1),
          red_ball_2 = VALUES(red_ball_2),
          red_ball_3 = VALUES(red_ball_3),
          red_ball_4 = VALUES(red_ball_4),
          red_ball_5 = VALUES(red_ball_5),
          red_ball_6 = VALUES(red_ball_6),
          blue_ball = VALUES(blue_ball),
          prize_pool = VALUES(prize_pool),
          sales_amount = VALUES(sales_amount)
        `

        const params = [
          data.issue,
          data.date,
          data.redBalls[0],
          data.redBalls[1],
          data.redBalls[2],
          data.redBalls[3],
          data.redBalls[4],
          data.redBalls[5],
          data.blueBall,
          (data.prizePool || 0) * 100, // 转换为分
          (data.salesAmount || 0) * 100  // 转换为分
        ]

        const result = await connection.execute(sql, params)
        if ((result as any)[0].affectedRows > 0) {
          insertedCount++
        }
      }
    })

    return insertedCount
  }

  // 将数据库行映射为 LotteryResult 对象
  private static mapRowToLotteryResult(row: any): LotteryResult {
    return {
      id: row.id,
      issue: row.issue,
      date: row.date,
      redBalls: [
        row.red_ball_1,
        row.red_ball_2,
        row.red_ball_3,
        row.red_ball_4,
        row.red_ball_5,
        row.red_ball_6
      ],
      blueBall: row.blue_ball,
      prizePool: row.prize_pool ? row.prize_pool / 100 : undefined, // 转换为元
      salesAmount: row.sales_amount ? row.sales_amount / 100 : undefined, // 转换为元
      firstPrizeWinners: row.first_prize_winners,
      firstPrizeSingleAmountCents: row.first_prize_single_amount_cents ? row.first_prize_single_amount_cents / 100 : undefined, // 转换为元
      secondPrizeWinners: row.second_prize_winners,
      secondPrizeSingleAmountCents: row.second_prize_single_amount_cents ? row.second_prize_single_amount_cents / 100 : undefined, // 转换为元
      thirdPrizeWinners: row.third_prize_winners,
      thirdPrizeSingleAmountCents: row.third_prize_single_amount_cents ? row.third_prize_single_amount_cents / 100 : undefined, // 转换为元
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
