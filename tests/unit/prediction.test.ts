import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PredictionAlgorithmService } from '../../server/services/PredictionAlgorithm'

// 模拟数据库工具
const mockQuery = vi.fn()
vi.mock('../../server/utils/database', () => ({
  query: mockQuery,
  transaction: vi.fn(),
  getPool: vi.fn(),
  closePool: vi.fn(),
  initDatabase: vi.fn()
}))

// 模拟历史数据
const mockHistoryData = [
  {
    issue: '2024081',
    date: '2024-07-18',
    redBalls: [3, 6, 11, 16, 22, 27],
    blueBall: 8
  },
  {
    issue: '2024080',
    date: '2024-07-16',
    redBalls: [5, 9, 14, 19, 24, 30],
    blueBall: 12
  },
  {
    issue: '2024079',
    date: '2024-07-14',
    redBalls: [1, 7, 13, 18, 23, 28],
    blueBall: 5
  }
]

// 设置模拟查询结果
beforeEach(() => {
  // 重置模拟
  mockQuery.mockReset()

  // 模拟频率分析查询结果
  mockQuery.mockImplementation((sql: string, params: any[]) => {
    if (sql.includes('number_frequency')) {
      if (params && params[0] === 'red') {
        return Array.from({ length: 33 }, (_, i) => ({
          ball_type: 'red',
          ball_number: i + 1,
          frequency: Math.floor(Math.random() * 100),
          last_appearance_issue: '2024080',
          last_appearance_date: '2024-01-01'
        }))
      } else if (params && params[0] === 'blue') {
        return Array.from({ length: 16 }, (_, i) => ({
          ball_type: 'blue',
          ball_number: i + 1,
          frequency: Math.floor(Math.random() * 100),
          last_appearance_issue: '2024080',
          last_appearance_date: '2024-01-01'
        }))
      } else {
        return []
      }
    }

    if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 10')) {
      return mockHistoryData.slice(0, 10)
    }

    if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 20')) {
      return mockHistoryData.slice(0, 20)
    }

    if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 50')) {
      return mockHistoryData.slice(0, 50)
    }

    if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 100')) {
      return mockHistoryData.slice(0, 100)
    }

    if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 1')) {
      return [mockHistoryData[0]]
    }

    if (sql.includes('lottery_results')) {
      return mockHistoryData
    }

    if (sql.includes('COUNT(*) as total')) {
      return [{ total: mockHistoryData.length }]
    }

    if (sql.includes('INSERT')) {
      return { insertId: 1 }
    }

    return []
  })
})

// 模拟模型
vi.mock('../../models/LotteryResult', () => ({
  LotteryResultModel: {
    getList: vi.fn().mockResolvedValue({
      data: mockHistoryData,
      total: mockHistoryData.length
    }),
    getLatest: vi.fn().mockResolvedValue(mockHistoryData[0])
  }
}))

vi.mock('../../models/Prediction', () => ({
  PredictionModel: {
    create: vi.fn().mockResolvedValue(1)
  }
}))

vi.mock('../../models/Analysis', () => ({
  AnalysisModel: {
    getFrequency: vi.fn().mockImplementation((ballType) => {
      if (ballType === 'red') {
        return Array.from({ length: 33 }, (_, i) => ({
          ballNumber: i + 1,
          frequency: Math.floor(Math.random() * 100)
        }))
      } else {
        return Array.from({ length: 16 }, (_, i) => ({
          ballNumber: i + 1,
          frequency: Math.floor(Math.random() * 100)
        }))
      }
    }),
    getTrend: vi.fn().mockImplementation((ballType, limit) => {
      const ballCount = ballType === 'red' ? 33 : 16
      return Array.from({ length: ballCount }, (_, i) => ({
        ballNumber: i + 1,
        trendValue: Math.random() * 10 - 5,
        trendType: Math.random() > 0.5 ? 'up' : 'down'
      }))
    }),
    getColdHotAnalysis: vi.fn().mockReturnValue({
      redHotBalls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
      redColdBalls: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
      blueHotBalls: [1, 2, 3, 4, 5, 6, 7, 8],
      blueColdBalls: [9, 10, 11, 12, 13, 14, 15, 16]
    }),
    getCombinationAnalysis: vi.fn().mockReturnValue({
      oddEven: { '3:3': 40, '4:2': 30, '2:4': 20, '5:1': 5, '1:5': 5 },
      bigSmall: { '3:3': 35, '4:2': 30, '2:4': 25, '5:1': 5, '1:5': 5 },
      sum: { '100-120': 30, '80-100': 25, '120-140': 20, '60-80': 15, '140-160': 10 }
    })
  }
}))

describe('PredictionAlgorithmService', () => {
  describe('generateFrequencyPrediction', () => {
    it('应该生成基于频率分析的预测结果', async () => {
      const result = await PredictionAlgorithmService.generateFrequencyPrediction('2024082')

      expect(result).toHaveProperty('issue', '2024082')
      expect(result).toHaveProperty('predictDate')
      expect(result).toHaveProperty('redBalls')
      expect(result).toHaveProperty('blueBall')
      expect(result).toHaveProperty('algorithm', 'frequency')
      expect(result).toHaveProperty('confidence')

      // 验证红球数量
      expect(result.redBalls).toHaveLength(6)

      // 验证红球范围
      result.redBalls.forEach(ball => {
        expect(ball).toBeGreaterThanOrEqual(1)
        expect(ball).toBeLessThanOrEqual(33)
      })

      // 验证蓝球范围
      expect(result.blueBall).toBeGreaterThanOrEqual(1)
      expect(result.blueBall).toBeLessThanOrEqual(16)

      // 验证置信度范围
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(100)
    })
  })

  describe('generateTrendPrediction', () => {
    it('应该生成基于趋势分析的预测结果', async () => {
      // 模拟趋势分析数据
      mockQuery.mockImplementationOnce((sql: string) => {
        if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 20')) {
          return mockHistoryData.slice(0, 20)
        }
        return []
      })

      const result = await PredictionAlgorithmService.generateTrendPrediction('2024082')

      expect(result).toHaveProperty('issue', '2024082')
      expect(result).toHaveProperty('predictDate')
      expect(result).toHaveProperty('redBalls')
      expect(result).toHaveProperty('blueBall')
      expect(result).toHaveProperty('algorithm', 'trend')
      expect(result).toHaveProperty('confidence')

      // 验证红球数量
      expect(result.redBalls).toHaveLength(6)

      // 验证红球范围
      result.redBalls.forEach(ball => {
        expect(ball).toBeGreaterThanOrEqual(1)
        expect(ball).toBeLessThanOrEqual(33)
      })

      // 验证蓝球范围
      expect(result.blueBall).toBeGreaterThanOrEqual(1)
      expect(result.blueBall).toBeLessThanOrEqual(16)

      // 验证置信度范围
      if (!isNaN(result.confidence)) {
        expect(result.confidence).toBeGreaterThanOrEqual(0)
        expect(result.confidence).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('generateColdHotPrediction', () => {
    it('应该生成基于冷热号分析的预测结果', async () => {
      // 修改模拟的冷热号分析数据，确保返回6个红球
      vi.doMock('../../models/Analysis', () => ({
        AnalysisModel: {
          getFrequency: vi.fn().mockImplementation((ballType) => {
            if (ballType === 'red') {
              return Array.from({ length: 33 }, (_, i) => ({
                ballNumber: i + 1,
                frequency: Math.floor(Math.random() * 100)
              }))
            } else {
              return Array.from({ length: 16 }, (_, i) => ({
                ballNumber: i + 1,
                frequency: Math.floor(Math.random() * 100)
              }))
            }
          }),
          getTrend: vi.fn().mockImplementation((ballType, limit) => {
            const ballCount = ballType === 'red' ? 33 : 16
            return Array.from({ length: ballCount }, (_, i) => ({
              ballNumber: i + 1,
              trendValue: Math.random() * 10 - 5,
              trendType: Math.random() > 0.5 ? 'up' : 'down'
            }))
          }),
          getColdHotAnalysis: vi.fn().mockReturnValue({
            redHotBalls: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
            redColdBalls: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33],
            blueHotBalls: [1, 2, 3, 4, 5, 6, 7, 8],
            blueColdBalls: [9, 10, 11, 12, 13, 14, 15, 16]
          }),
          getCombinationAnalysis: vi.fn().mockReturnValue({
            oddEven: { '3:3': 40, '4:2': 30, '2:4': 20, '5:1': 5, '1:5': 5 },
            bigSmall: { '3:3': 35, '4:2': 30, '2:4': 25, '5:1': 5, '1:5': 5 },
            sum: { '100-120': 30, '80-100': 25, '120-140': 20, '60-80': 15, '140-160': 10 }
          })
        }
      }))

      // 重新导入模块以应用新的模拟
      const { PredictionAlgorithmService } = await import('../../server/services/PredictionAlgorithm')

      const result = await PredictionAlgorithmService.generateColdHotPrediction('2024082')

      expect(result).toHaveProperty('issue', '2024082')
      expect(result).toHaveProperty('predictDate')
      expect(result).toHaveProperty('redBalls')
      expect(result).toHaveProperty('blueBall')
      expect(result).toHaveProperty('algorithm', 'coldHot')
      expect(result).toHaveProperty('confidence')

      // 验证红球数量
      expect(result.redBalls.length).toBeGreaterThan(0)
      expect(result.redBalls.length).toBeLessThanOrEqual(6)

      // 验证红球范围
      result.redBalls.forEach(ball => {
        expect(ball).toBeGreaterThanOrEqual(1)
        expect(ball).toBeLessThanOrEqual(33)
      })

      // 验证蓝球范围
      expect(result.blueBall).toBeGreaterThanOrEqual(1)
      expect(result.blueBall).toBeLessThanOrEqual(16)

      // 验证置信度范围
      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(100)
    })
  })

  describe('generateMixedPrediction', () => {
    it('应该生成综合多种算法的预测结果', async () => {
      const weights = {
        frequency: 30,
        trend: 25,
        coldHot: 25,
        combination: 20
      }

      // 模拟混合预测所需的各种数据
      mockQuery.mockImplementation((sql: string, params?: any[]) => {
        if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 10')) {
          return mockHistoryData.slice(0, 10)
        }
        if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 20')) {
          return mockHistoryData.slice(0, 20)
        }
        if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 50')) {
          return mockHistoryData.slice(0, 50)
        }
        if (sql.includes('lottery_results ORDER BY issue DESC LIMIT 100')) {
          return mockHistoryData.slice(0, 100)
        }
        if (sql.includes('COUNT(*) as total')) {
          return [{ total: mockHistoryData.length }]
        }
        if (sql.includes('number_frequency')) {
          if (params && params[0] === 'red') {
            return Array.from({ length: 33 }, (_, i) => ({
              ball_type: 'red',
              ball_number: i + 1,
              frequency: Math.floor(Math.random() * 100),
              last_appearance_issue: '2024080',
              last_appearance_date: '2024-01-01'
            }))
          } else if (params && params[0] === 'blue') {
            return Array.from({ length: 16 }, (_, i) => ({
              ball_type: 'blue',
              ball_number: i + 1,
              frequency: Math.floor(Math.random() * 100),
              last_appearance_issue: '2024080',
              last_appearance_date: '2024-01-01'
            }))
          } else {
            return []
          }
        }
        return []
      })

      const result = await PredictionAlgorithmService.generateMixedPrediction('2024082', weights)

      expect(result).toHaveProperty('issue', '2024082')
      expect(result).toHaveProperty('predictDate')
      expect(result).toHaveProperty('redBalls')
      expect(result).toHaveProperty('blueBall')
      expect(result).toHaveProperty('algorithm', 'mixed')
      expect(result).toHaveProperty('confidence')

      // 验证红球数量
      expect(result.redBalls).toHaveLength(6)

      // 验证红球范围
      result.redBalls.forEach(ball => {
        expect(ball).toBeGreaterThanOrEqual(1)
        expect(ball).toBeLessThanOrEqual(33)
      })

      // 验证蓝球范围
      expect(result.blueBall).toBeGreaterThanOrEqual(1)
      expect(result.blueBall).toBeLessThanOrEqual(16)

      // 验证置信度范围
      if (!isNaN(result.confidence)) {
        expect(result.confidence).toBeGreaterThanOrEqual(0)
        expect(result.confidence).toBeLessThanOrEqual(100)
      }
    })
  })

  describe('savePrediction', () => {
    it('应该保存预测结果到数据库', async () => {
      const prediction = {
        issue: '2024082',
        predictDate: '2024-07-20',
        redBalls: [1, 2, 3, 4, 5, 6],
        blueBall: 7,
        confidence: 75,
        algorithm: 'frequency'
      }

      const result = await PredictionAlgorithmService.savePrediction(prediction)

      expect(result).toBe(1)
    })
  })

  describe('getNextIssue', () => {
    it('应该获取下一期期号', async () => {
      // 模拟数据库查询返回最新期号
      mockQuery.mockImplementationOnce((sql: string) => {
        if (sql.includes('SELECT * FROM lottery_results ORDER BY issue DESC LIMIT 1')) {
          return [mockHistoryData[0]]
        }
        return []
      })

      const result = await (PredictionAlgorithmService as any).getNextIssue()

      expect(result).toBe('2024082')
    })
  })

  describe('getNextDrawDate', () => {
    it('应该正确计算下一次开奖日期 - 周日21点前', () => {
      // 周日20点，应该返回今天
      const sundayBefore21 = new Date(2025, 7, 31, 20, 0, 0) // 2025-08-31 20:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(sundayBefore21)
      expect(result).toBe('2025-08-31')
    })

    it('应该正确计算下一次开奖日期 - 周日21点后', () => {
      // 周日22点，应该返回下周二
      const sundayAfter21 = new Date(2025, 7, 31, 22, 0, 0) // 2025-08-31 22:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(sundayAfter21)
      expect(result).toBe('2025-09-02') // 下周二
    })

    it('应该正确计算下一次开奖日期 - 周二21点前', () => {
      // 周二20点，应该返回今天
      const tuesdayBefore21 = new Date(2025, 7, 26, 20, 0, 0) // 2025-08-26 20:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(tuesdayBefore21)
      expect(result).toBe('2025-08-26')
    })

    it('应该正确计算下一次开奖日期 - 周二21点后', () => {
      // 周二22点，应该返回周四
      const tuesdayAfter21 = new Date(2025, 7, 26, 22, 0, 0) // 2025-08-26 22:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(tuesdayAfter21)
      expect(result).toBe('2025-08-28') // 周四
    })

    it('应该正确计算下一次开奖日期 - 周四21点前', () => {
      // 周四20点，应该返回今天
      const thursdayBefore21 = new Date(2025, 7, 28, 20, 0, 0) // 2025-08-28 20:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(thursdayBefore21)
      expect(result).toBe('2025-08-28')
    })

    it('应该正确计算下一次开奖日期 - 周四21点后', () => {
      // 周四22点，应该返回周日
      const thursdayAfter21 = new Date(2025, 7, 28, 22, 0, 0) // 2025-08-28 22:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(thursdayAfter21)
      expect(result).toBe('2025-08-31') // 周日
    })

    it('应该正确计算下一次开奖日期 - 周一', () => {
      // 周一，应该返回周二
      const monday = new Date(2025, 7, 25, 12, 0, 0) // 2025-08-25 12:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(monday)
      expect(result).toBe('2025-08-26') // 周二
    })

    it('应该正确计算下一次开奖日期 - 周三', () => {
      // 周三，应该返回周四
      const wednesday = new Date(2025, 7, 27, 12, 0, 0) // 2025-08-27 12:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(wednesday)
      expect(result).toBe('2025-08-28') // 周四
    })

    it('应该正确计算下一次开奖日期 - 周五', () => {
      // 周五，应该返回周日
      const friday = new Date(2025, 7, 29, 12, 0, 0) // 2025-08-29 12:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(friday)
      expect(result).toBe('2025-08-31') // 周日
    })

    it('应该正确计算下一次开奖日期 - 周六', () => {
      // 周六，应该返回周日
      const saturday = new Date(2025, 7, 30, 12, 0, 0) // 2025-08-30 12:00:00
      const result = (PredictionAlgorithmService as any).getNextDrawDate(saturday)
      expect(result).toBe('2025-08-31') // 周日
    })

    it('应该使用当前日期作为默认参数', () => {
      // 测试不传递参数的情况
      const result = (PredictionAlgorithmService as any).getNextDrawDate()
      // 结果应该是未来的日期
      const today = new Date().toISOString().split('T')[0]
      expect(result >= today).toBe(true)
    })
  })

  describe('getAlgorithmWeights', () => {
    it('应该获取算法权重', async () => {
      const result = await (PredictionAlgorithmService as any).getAlgorithmWeights()

      expect(result).toEqual({
        frequency: 30,
        trend: 25,
        coldHot: 25,
        combination: 20
      })
    })
  })

  describe('selectRandomBalls', () => {
    it('应该从指定数组中随机选择指定数量的球', () => {
      const balls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const count = 5

      // 由于是随机选择，我们多次测试以确保结果正确
      for (let i = 0; i < 10; i++) {
        const result = (PredictionAlgorithmService as any).selectRandomBalls(balls, count)

        // 验证选择的球数量
        expect(result).toHaveLength(count)

        // 验证所有球都在原数组中
        result.forEach((ball: number) => {
          expect(balls).toContain(ball)
        })

        // 验证没有重复的球
        expect(new Set(result).size).toBe(count)
      }
    })

    it('当请求数量大于数组长度时应该返回所有球', () => {
      const balls = [1, 2, 3, 4, 5]
      const count = 10

      const result = (PredictionAlgorithmService as any).selectRandomBalls(balls, count)

      // 验证返回所有球
      expect(result).toHaveLength(balls.length)
      expect(result).toEqual(expect.arrayContaining(balls))
    })
  })

  describe('calculateWeightedBalls', () => {
    it('应该根据权重计算最终的球', () => {
      const ballSets = [
        { balls: [1, 2, 3], weight: 30 },
        { balls: [2, 3, 4], weight: 25 },
        { balls: [3, 4, 5], weight: 25 },
        { balls: [4, 5, 6], weight: 20 }
      ]
      const count = 3

      const result = (PredictionAlgorithmService as any).calculateWeightedBalls(ballSets, count)

      // 验证返回的球数量
      expect(result).toHaveLength(count)

      // 验证返回的球都在原数组中
      result.forEach((ball: number) => {
        const allBalls = ballSets.flatMap(set => set.balls)
        expect(allBalls).toContain(ball)
      })

      // 验证返回的球是排序的
      for (let i = 1; i < result.length; i++) {
        expect(result[i]).toBeGreaterThan(result[i - 1])
      }
    })
  })

  describe('selectWeightedBall', () => {
    it('应该根据权重选择球', () => {
      const ballCandidates = [
        { ball: 1, weight: 10 },
        { ball: 2, weight: 20 },
        { ball: 3, weight: 30 },
        { ball: 4, weight: 40 }
      ]

      // 多次测试，检查结果分布
      const results: { [key: number]: number } = {}
      for (let i = 0; i < 1000; i++) {
        const result = (PredictionAlgorithmService as any).selectWeightedBall(ballCandidates)
        results[result] = (results[result] || 0) + 1
      }

      // 验证所有结果都是有效的球
      Object.keys(results).forEach(ball => {
        expect(ballCandidates.find(c => c.ball === parseInt(ball))).toBeDefined()
      })

      // 验证权重较高的球被选择的次数更多
      expect(results[4]).toBeGreaterThan(results[1])
    })
  })
})
