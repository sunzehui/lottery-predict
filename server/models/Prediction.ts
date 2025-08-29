export interface Prediction {
  id?: number
  issue: string
  predictDate: string
  redBalls: number[]
  blueBall: number
  confidence: number
  algorithmType: 'frequency' | 'trend' | 'coldHot' | 'mixed'
  createdAt?: string
  updatedAt?: string
}

export interface PredictionEvaluation {
  id?: number
  predictionId: number
  redHits: number
  blueHit: boolean
  accuracy: number
  evaluatedAt?: string
}

export class PredictionModel {
  // 创建预测结果
  static async create(data: Omit<Prediction, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    try {
      const { query } = await import('../utils/database')

      // 验证数据完整性
      if (!data) {
        throw new Error('预测数据对象为空')
      }

      if (!data.issue) {
        throw new Error('预测数据缺少期号')
      }

      if (!data.predictDate) {
        throw new Error('预测数据缺少预测日期')
      }

      if (!data.redBalls || !Array.isArray(data.redBalls)) {
        throw new Error('预测数据缺少红球数组')
      }

      if (data.redBalls.length !== 6) {
        throw new Error(`预测数据红球数量不正确，期望6个，实际${data.redBalls.length}个`)
      }

      // 验证每个红球
      for (let i = 0; i < data.redBalls.length; i++) {
        const ball = data.redBalls[i]
        if (typeof ball !== 'number' || ball < 1 || ball > 33) {
          throw new Error(`预测数据第${i + 1}个红球无效: ${ball}`)
        }
      }

      // 检查红球是否重复
      const uniqueRedBalls = new Set(data.redBalls)
      if (uniqueRedBalls.size !== data.redBalls.length) {
        throw new Error('预测数据红球有重复')
      }

      if (data.blueBall === undefined || data.blueBall === null) {
        throw new Error('预测数据缺少蓝球')
      }

      if (typeof data.blueBall !== 'number' || data.blueBall < 1 || data.blueBall > 16) {
        throw new Error(`预测数据蓝球无效: ${data.blueBall}`)
      }

      if (data.confidence === undefined || data.confidence === null) {
        throw new Error('预测数据缺少置信度')
      }

      if (typeof data.confidence !== 'number' || data.confidence < 0 || data.confidence > 100) {
        throw new Error(`预测数据置信度无效: ${data.confidence}`)
      }

      if (!data.algorithmType) {
        throw new Error('预测数据缺少算法类型')
      }

      const validAlgorithmTypes = ['frequency', 'trend', 'coldHot', 'mixed']
      if (!validAlgorithmTypes.includes(data.algorithmType)) {
        throw new Error(`预测数据算法类型无效: ${data.algorithmType}`)
      }

      const sql = `
        INSERT INTO predictions
        (issue, predict_date, red_ball_1, red_ball_2, red_ball_3, red_ball_4, red_ball_5, red_ball_6, blue_ball, confidence, algorithm_type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      const params = [
        data.issue,
        data.predictDate,
        data.redBalls[0],
        data.redBalls[1],
        data.redBalls[2],
        data.redBalls[3],
        data.redBalls[4],
        data.redBalls[5],
        data.blueBall,
        data.confidence,
        data.algorithmType
      ]

      const result = await query(sql, params)
      return (result as any).insertId
    } catch (error) {
      console.error('创建预测结果失败:', error)
      throw error
    }
  }

  // 根据期号和算法类型获取预测结果
  static async getByIssueAndAlgorithm(issue: string, algorithmType: string): Promise<Prediction | null> {
    const { query } = await import('../utils/database')

    const sql = 'SELECT * FROM predictions WHERE issue = ? AND algorithm_type = ?'
    const results = await query(sql, [issue, algorithmType])

    if ((results as any[]).length === 0) {
      return null
    }

    const row = (results as any[])[0]
    return this.mapRowToPrediction(row)
  }

  // 获取最新预测结果
  static async getLatest(algorithmType: string = 'mixed'): Promise<Prediction | null> {
    const { query } = await import('../utils/database')

    const sql = 'SELECT * FROM predictions WHERE algorithm_type = ? ORDER BY predict_date DESC LIMIT 1'
    const results = await query(sql, [algorithmType])

    if ((results as any[]).length === 0) {
      return null
    }

    const row = (results as any[])[0]
    return this.mapRowToPrediction(row)
  }

  // 获取预测结果列表
  static async getList(options: {
    page?: number
    size?: number
    algorithmType?: string
    startDate?: string
    endDate?: string
    issue?: string
  } = {}): Promise<{ data: Prediction[], total: number }> {
    const { query } = await import('../utils/database')

    const page = options.page || 1
    const size = options.size || 10
    const offset = (page - 1) * size

    let whereClause = ''
    const params: any[] = []

    if (options.algorithmType) {
      whereClause += ' AND algorithm_type = ?'
      params.push(options.algorithmType)
    }

    if (options.issue) {
      whereClause += ' AND issue = ?'
      params.push(options.issue)
    }

    if (options.startDate) {
      whereClause += ' AND predict_date >= ?'
      params.push(options.startDate)
    }

    if (options.endDate) {
      whereClause += ' AND predict_date <= ?'
      params.push(options.endDate)
    }

    // 获取总数
    const countSql = `SELECT COUNT(*) as total FROM predictions WHERE 1=1 ${whereClause}`
    const countResults = await query(countSql, params)
    const total = (countResults as any[])[0].total

    // 获取数据
    const dataSql = `
      SELECT * FROM predictions 
      WHERE 1=1 ${whereClause}
      ORDER BY predict_date DESC
      LIMIT ? OFFSET ?
    `
    const dataParams = [...params, size, offset]
    const results = await query(dataSql, dataParams)

    const data = (results as any[]).map(row => this.mapRowToPrediction(row))

    return { data, total }
  }

  // 获取预测历史（包含评估结果）
  static async getHistoryWithEvaluation(options: {
    page?: number
    size?: number
    algorithmType?: string
  } = {}): Promise<{ data: (Prediction & { evaluation?: PredictionEvaluation })[], total: number }> {
    const { query } = await import('../utils/database')

    const page = options.page || 1
    const size = options.size || 10
    const offset = (page - 1) * size

    let whereClause = ''
    const params: any[] = []

    if (options.algorithmType) {
      whereClause += ' AND p.algorithm_type = ?'
      params.push(options.algorithmType)
    }

    // 获取总数
    const countSql = `
      SELECT COUNT(*) as total 
      FROM predictions p
      WHERE 1=1 ${whereClause}
    `
    const countResults = await query(countSql, params)
    const total = (countResults as any[])[0].total

    // 获取数据
    const dataSql = `
      SELECT 
        p.*,
        pe.id as evaluation_id,
        pe.red_hits,
        pe.blue_hit,
        pe.accuracy,
        pe.evaluated_at
      FROM predictions p
      LEFT JOIN prediction_evaluations pe ON p.id = pe.prediction_id
      WHERE 1=1 ${whereClause}
      ORDER BY p.predict_date DESC
      LIMIT ? OFFSET ?
    `
    const dataParams = [...params, size, offset]
    const results = await query(dataSql, dataParams)

    const data = (results as any[]).map(row => {
      const prediction = this.mapRowToPrediction(row)
      let evaluation: PredictionEvaluation | undefined

      if (row.evaluation_id) {
        evaluation = {
          id: row.evaluation_id,
          predictionId: prediction.id!,
          redHits: row.red_hits,
          blueHit: row.blue_hit === 1,
          accuracy: row.accuracy,
          evaluatedAt: row.evaluated_at
        }
      }

      return { ...prediction, evaluation }
    })

    return { data, total }
  }

  // 创建预测评估
  static async createEvaluation(data: Omit<PredictionEvaluation, 'id' | 'evaluatedAt'>): Promise<number> {
    const { query } = await import('../utils/database')

    const sql = `
      INSERT INTO prediction_evaluations 
      (prediction_id, red_hits, blue_hit, accuracy)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      red_hits = VALUES(red_hits),
      blue_hit = VALUES(blue_hit),
      accuracy = VALUES(accuracy)
    `

    const params = [
      data.predictionId,
      data.redHits,
      data.blueHit ? 1 : 0,
      data.accuracy
    ]

    const result = await query(sql, params)
    return (result as any).insertId
  }

  // 获取预测准确率统计
  static async getAccuracyStats(algorithmType: string = 'mixed'): Promise<{
    totalPredictions: number
    avgRedHits: number
    blueHitRate: number
    maxRedHits: number
    maxBlueHits: boolean
  }> {
    const { query } = await import('../utils/database')

    const sql = `
      SELECT 
        COUNT(*) as total_predictions,
        AVG(pe.red_hits) as avg_red_hits,
        SUM(CASE WHEN pe.blue_hit = 1 THEN 1 ELSE 0 END) / COUNT(*) as blue_hit_rate,
        MAX(pe.red_hits) as max_red_hits,
        MAX(CASE WHEN pe.blue_hit = 1 THEN 1 ELSE 0 END) as max_blue_hits
      FROM predictions p
      JOIN prediction_evaluations pe ON p.id = pe.prediction_id
      WHERE p.algorithm_type = ?
    `

    const results = await query(sql, [algorithmType])
    const row = (results as any[])[0]

    return {
      totalPredictions: row.total_predictions,
      avgRedHits: parseFloat(parseFloat(row.avg_red_hits).toFixed(2)),
      blueHitRate: parseFloat((row.blue_hit_rate * 100).toFixed(2)),
      maxRedHits: row.max_red_hits,
      maxBlueHits: row.max_blue_hits === 1
    }
  }

  // 将数据库行映射为 Prediction 对象
  private static mapRowToPrediction(row: any): Prediction {
    return {
      id: row.id,
      issue: row.issue,
      predictDate: row.predict_date,
      redBalls: [
        row.red_ball_1,
        row.red_ball_2,
        row.red_ball_3,
        row.red_ball_4,
        row.red_ball_5,
        row.red_ball_6
      ],
      blueBall: row.blue_ball,
      confidence: parseFloat(row.confidence),
      algorithmType: row.algorithm_type,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }
  }
}
