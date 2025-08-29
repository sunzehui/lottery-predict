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

  // 获取开奖结果列表
  static async getList(options: {
    page?: number
    size?: number
    issue?: string
    startDate?: string
    endDate?: string
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

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM lottery_results WHERE 1=1 ${whereClause}`
    const countResults = await query(countSql, params)
    const total = (countResults as any[])[0].total

    // 获取数据
    const dataSql = `
      SELECT * FROM lottery_results 
      WHERE 1=1 ${whereClause}
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
