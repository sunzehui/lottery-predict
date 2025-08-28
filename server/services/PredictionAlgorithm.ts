import { LotteryResultModel } from '../models/LotteryResult'
import { PredictionModel } from '../models/Prediction'
import { AnalysisModel } from '../models/Analysis'

export interface PredictionResult {
  issue: string
  predictDate: string
  redBalls: number[]
  blueBall: number
  confidence: number
  algorithm: string
}

export interface AlgorithmWeights {
  frequency: number
  trend: number
  coldHot: number
  combination: number
}

export class PredictionAlgorithmService {
  // 生成预测结果
  static async generatePrediction(issue?: string): Promise<PredictionResult | null> {
    try {
      // 获取下一期期号
      const nextIssue = issue || await this.getNextIssue()
      if (!nextIssue) {
        return null
      }

      // 获取算法权重
      const weights = await this.getAlgorithmWeights()

      // 使用混合算法生成预测
      const mixedPrediction = await this.generateMixedPrediction(nextIssue, weights)

      return mixedPrediction
    } catch (error) {
      console.error('生成预测失败:', error)
      return null
    }
  }

  // 使用频率分析生成预测
  static async generateFrequencyPrediction(issue: string): Promise<PredictionResult> {
    // 获取红球频率分析
    const redFrequency = await AnalysisModel.getFrequency('red')

    // 获取蓝球频率分析
    const blueFrequency = await AnalysisModel.getFrequency('blue')

    // 按频率排序，选择频率较高的号码
    const sortedRedBalls = redFrequency
      .sort((a, b) => b.frequency - a.frequency)
      .map(item => item.ballNumber)

    const sortedBlueBalls = blueFrequency
      .sort((a, b) => b.frequency - a.frequency)
      .map(item => item.ballNumber)

    // 从高频号码中随机选择6个红球
    const selectedRedBalls = this.selectRandomBalls(sortedRedBalls.slice(0, 15), 6)

    // 从高频号码中随机选择1个蓝球
    const selectedBlueBall = this.selectRandomBalls(sortedBlueBalls.slice(0, 8), 1)[0]

    // 计算置信度（基于频率）
    const redConfidence = this.calculateFrequencyConfidence(selectedRedBalls, redFrequency)
    const blueConfidence = this.calculateFrequencyConfidence([selectedBlueBall], blueFrequency)
    const confidence = (redConfidence * 0.85 + blueConfidence * 0.15)

    return {
      issue,
      predictDate: new Date().toISOString().split('T')[0],
      redBalls: selectedRedBalls,
      blueBall: selectedBlueBall,
      confidence,
      algorithm: 'frequency'
    }
  }

  // 使用趋势分析生成预测
  static async generateTrendPrediction(issue: string): Promise<PredictionResult> {
    // 获取红球趋势分析
    const redTrends = await AnalysisModel.getTrend('red', 20)

    // 获取蓝球趋势分析
    const blueTrends = await AnalysisModel.getTrend('blue', 20)

    // 按趋势值排序，选择上升趋势的号码
    const sortedRedBalls = redTrends
      .filter(trend => trend.trendType === 'up' || trend.trendType === 'stable')
      .sort((a, b) => b.trendValue - a.trendValue)
      .map(item => item.ballNumber)

    const sortedBlueBalls = blueTrends
      .filter(trend => trend.trendType === 'up' || trend.trendType === 'stable')
      .sort((a, b) => b.trendValue - a.trendValue)
      .map(item => item.ballNumber)

    // 从趋势较好的号码中随机选择6个红球
    const selectedRedBalls = this.selectRandomBalls(sortedRedBalls.slice(0, 15), 6)

    // 从趋势较好的号码中随机选择1个蓝球
    const selectedBlueBall = this.selectRandomBalls(sortedBlueBalls.slice(0, 8), 1)[0]

    // 计算置信度（基于趋势）
    const redConfidence = this.calculateTrendConfidence(selectedRedBalls, redTrends)
    const blueConfidence = this.calculateTrendConfidence([selectedBlueBall], blueTrends)
    const confidence = (redConfidence * 0.85 + blueConfidence * 0.15)

    return {
      issue,
      predictDate: new Date().toISOString().split('T')[0],
      redBalls: selectedRedBalls,
      blueBall: selectedBlueBall,
      confidence,
      algorithm: 'trend'
    }
  }

  // 使用冷热号分析生成预测
  static async generateColdHotPrediction(issue: string): Promise<PredictionResult> {
    // 获取冷热号分析
    const coldHotAnalysis = await AnalysisModel.getColdHotAnalysis()

    // 从热号中选择大部分号码，从冷号中选择少量号码
    const redHotBalls = coldHotAnalysis.redHotBalls
    const redColdBalls = coldHotAnalysis.redColdBalls
    const blueHotBalls = coldHotAnalysis.blueHotBalls
    const blueColdBalls = coldHotAnalysis.blueColdBalls

    // 选择红球：4个热号 + 2个冷号
    const selectedHotRedBalls = this.selectRandomBalls(redHotBalls, 4)
    const selectedColdRedBalls = this.selectRandomBalls(redColdBalls, 2)
    const selectedRedBalls = [...selectedHotRedBalls, ...selectedColdRedBalls].sort((a, b) => a - b)

    // 选择蓝球：70%概率选择热号，30%概率选择冷号
    let selectedBlueBall: number
    if (Math.random() < 0.7 && blueHotBalls.length > 0) {
      selectedBlueBall = this.selectRandomBalls(blueHotBalls, 1)[0]
    } else if (blueColdBalls.length > 0) {
      selectedBlueBall = this.selectRandomBalls(blueColdBalls, 1)[0]
    } else {
      selectedBlueBall = Math.floor(Math.random() * 16) + 1
    }

    // 计算置信度（基于冷热号分析）
    const confidence = 65 + Math.random() * 15 // 65-80之间的随机置信度

    return {
      issue,
      predictDate: new Date().toISOString().split('T')[0],
      redBalls: selectedRedBalls,
      blueBall: selectedBlueBall,
      confidence,
      algorithm: 'coldHot'
    }
  }

  // 使用组合分析生成预测
  static async generateCombinationPrediction(issue: string): Promise<PredictionResult> {
    // 获取组合分析
    const combinationAnalysis = await AnalysisModel.getCombinationAnalysis(100)

    // 获取历史数据
    const historyData = await LotteryResultModel.getList({ size: 50 })

    // 分析历史数据的组合特征
    const oddEvenDistribution = this.analyzeDistribution(combinationAnalysis.oddEven)
    const bigSmallDistribution = this.analyzeDistribution(combinationAnalysis.bigSmall)
    const sumDistribution = this.analyzeDistribution(combinationAnalysis.sum)

    // 根据分布特征选择号码
    const selectedRedBalls = this.selectBallsByCombination(
      oddEvenDistribution,
      bigSmallDistribution,
      sumDistribution
    )

    // 随机选择蓝球
    const selectedBlueBall = Math.floor(Math.random() * 16) + 1

    // 计算置信度（基于组合分析）
    const confidence = 60 + Math.random() * 20 // 60-80之间的随机置信度

    return {
      issue,
      predictDate: new Date().toISOString().split('T')[0],
      redBalls: selectedRedBalls,
      blueBall: selectedBlueBall,
      confidence,
      algorithm: 'combination'
    }
  }

  // 使用混合算法生成预测
  static async generateMixedPrediction(issue: string, weights: AlgorithmWeights): Promise<PredictionResult> {
    try {
      // 使用各种算法生成预测
      const frequencyPrediction = await this.generateFrequencyPrediction(issue)
      const trendPrediction = await this.generateTrendPrediction(issue)
      const coldHotPrediction = await this.generateColdHotPrediction(issue)
      const combinationPrediction = await this.generateCombinationPrediction(issue)

      // 验证所有预测结果都有效
      if (!frequencyPrediction || !trendPrediction || !coldHotPrediction || !combinationPrediction) {
        throw new Error('部分预测算法返回无效结果')
      }

      // 根据权重计算最终预测
      const finalRedBalls = this.calculateWeightedBalls(
        [
          { balls: frequencyPrediction.redBalls, weight: weights.frequency },
          { balls: trendPrediction.redBalls, weight: weights.trend },
          { balls: coldHotPrediction.redBalls, weight: weights.coldHot },
          { balls: combinationPrediction.redBalls, weight: weights.combination }
        ],
        6
      )

      // 确保红球数量为6个
      if (!finalRedBalls || finalRedBalls.length !== 6) {
        throw new Error('混合算法生成的红球数量不正确')
      }

      // 根据权重计算最终蓝球
      const blueBallCandidates = [
        { ball: frequencyPrediction.blueBall, weight: weights.frequency },
        { ball: trendPrediction.blueBall, weight: weights.trend },
        { ball: coldHotPrediction.blueBall, weight: weights.coldHot },
        { ball: combinationPrediction.blueBall, weight: weights.combination }
      ]

      const finalBlueBall = this.selectWeightedBall(blueBallCandidates)

      // 验证蓝球有效
      if (!finalBlueBall || finalBlueBall < 1 || finalBlueBall > 16) {
        throw new Error('混合算法生成的蓝球无效')
      }

      // 计算加权置信度
      const confidence = (
        frequencyPrediction.confidence * weights.frequency +
        trendPrediction.confidence * weights.trend +
        coldHotPrediction.confidence * weights.coldHot +
        combinationPrediction.confidence * weights.combination
      ) / 100

      // 验证置信度有效
      if (isNaN(confidence) || confidence < 0 || confidence > 100) {
        throw new Error('混合算法生成的置信度无效')
      }

      return {
        issue,
        predictDate: new Date().toISOString().split('T')[0],
        redBalls: finalRedBalls,
        blueBall: finalBlueBall,
        confidence,
        algorithm: 'mixed'
      }
    } catch (error) {
      console.error('混合算法生成预测失败:', error)
      // 如果混合算法失败，回退到频率算法
      console.log('回退到频率算法')
      return await this.generateFrequencyPrediction(issue)
    }
  }

  // 保存预测结果到数据库
  static async savePrediction(prediction: PredictionResult): Promise<number> {
    try {
      // 验证预测结果数据完整性
      if (!prediction) {
        throw new Error('预测结果对象为空')
      }

      if (!prediction.issue) {
        throw new Error('预测结果缺少期号')
      }

      if (!prediction.predictDate) {
        throw new Error('预测结果缺少预测日期')
      }

      if (!prediction.redBalls || !Array.isArray(prediction.redBalls)) {
        throw new Error('预测结果缺少红球数组')
      }

      if (prediction.redBalls.length !== 6) {
        throw new Error(`预测结果红球数量不正确，期望6个，实际${prediction.redBalls.length}个`)
      }

      // 验证每个红球
      for (let i = 0; i < prediction.redBalls.length; i++) {
        const ball = prediction.redBalls[i]
        if (typeof ball !== 'number' || ball < 1 || ball > 33) {
          throw new Error(`预测结果第${i + 1}个红球无效: ${ball}`)
        }
      }

      // 检查红球是否重复
      const uniqueRedBalls = new Set(prediction.redBalls)
      if (uniqueRedBalls.size !== prediction.redBalls.length) {
        throw new Error('预测结果红球有重复')
      }

      if (prediction.blueBall === undefined || prediction.blueBall === null) {
        throw new Error('预测结果缺少蓝球')
      }

      if (typeof prediction.blueBall !== 'number' || prediction.blueBall < 1 || prediction.blueBall > 16) {
        throw new Error(`预测结果蓝球无效: ${prediction.blueBall}`)
      }

      if (prediction.confidence === undefined || prediction.confidence === null) {
        throw new Error('预测结果缺少置信度')
      }

      if (typeof prediction.confidence !== 'number' || prediction.confidence < 0 || prediction.confidence > 100) {
        throw new Error(`预测结果置信度无效: ${prediction.confidence}`)
      }

      if (!prediction.algorithm) {
        throw new Error('预测结果缺少算法类型')
      }

      return await PredictionModel.create({
        issue: prediction.issue,
        predictDate: prediction.predictDate,
        redBalls: prediction.redBalls,
        blueBall: prediction.blueBall,
        confidence: prediction.confidence,
        algorithmType: prediction.algorithm as any
      })
    } catch (error) {
      console.error('保存预测结果失败:', error)
      throw error
    }
  }

  // 获取下一期期号
  private static async getNextIssue(): Promise<string | null> {
    try {
      const latest = await LotteryResultModel.getLatest()
      if (!latest || !latest.issue) {
        return '2025081' // 默认期号
      }

      const latestIssue = parseInt(latest.issue)
      if (isNaN(latestIssue)) {
        return '2025081' // 默认期号
      }

      return (latestIssue + 1).toString()
    } catch (error) {
      console.error('获取下一期期号失败:', error)
      return null
    }
  }

  // 获取算法权重
  private static async getAlgorithmWeights(): Promise<AlgorithmWeights> {
    // 这里可以从数据库或配置文件中获取权重
    // 默认权重
    return {
      frequency: 30,
      trend: 25,
      coldHot: 25,
      combination: 20
    }
  }

  // 从号码池中随机选择指定数量的号码
  private static selectRandomBalls(balls: number[], count: number): number[] {
    if (balls.length <= count) {
      return [...balls].sort((a, b) => a - b)
    }

    const selected: number[] = []
    const available = [...balls]

    while (selected.length < count) {
      const randomIndex = Math.floor(Math.random() * available.length)
      selected.push(available[randomIndex])
      available.splice(randomIndex, 1)
    }

    return selected.sort((a, b) => a - b)
  }

  // 计算频率置信度
  private static calculateFrequencyConfidence(balls: number[], frequencyData: any[]): number {
    let totalFrequency = 0
    let maxFrequency = 0

    frequencyData.forEach(item => {
      totalFrequency += item.frequency
      if (item.frequency > maxFrequency) {
        maxFrequency = item.frequency
      }
    })

    let selectedFrequency = 0
    balls.forEach(ball => {
      const item = frequencyData.find(f => f.ballNumber === ball)
      if (item) {
        selectedFrequency += item.frequency
      }
    })

    const avgFrequency = totalFrequency / frequencyData.length
    const confidence = (selectedFrequency / balls.length) / maxFrequency * 100

    return Math.min(95, Math.max(50, confidence))
  }

  // 计算趋势置信度
  private static calculateTrendConfidence(balls: number[], trendData: any[]): number {
    let totalTrendValue = 0
    let maxTrendValue = 0

    trendData.forEach(item => {
      totalTrendValue += item.trendValue
      if (item.trendValue > maxTrendValue) {
        maxTrendValue = item.trendValue
      }
    })

    let selectedTrendValue = 0
    balls.forEach(ball => {
      const item = trendData.find(t => t.ballNumber === ball)
      if (item) {
        selectedTrendValue += item.trendValue
      }
    })

    const avgTrendValue = totalTrendValue / trendData.length
    const confidence = (selectedTrendValue / balls.length) / maxTrendValue * 100

    return Math.min(95, Math.max(50, confidence))
  }

  // 分析分布
  private static analyzeDistribution(distribution: { [key: string]: number }): { [key: string]: number } {
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0)
    const result: { [key: string]: number } = {}

    Object.entries(distribution).forEach(([key, count]) => {
      result[key] = count / total
    })

    return result
  }

  // 根据组合分析选择号码
  private static selectBallsByCombination(
    oddEvenDistribution: { [key: string]: number },
    bigSmallDistribution: { [key: string]: number },
    sumDistribution: { [key: string]: number }
  ): number[] {
    // 选择最可能的奇偶比
    const oddEvenRatio = this.selectMostLikelyRatio(oddEvenDistribution)
    const [oddCount, evenCount] = oddEvenRatio.split(':').map(Number)

    // 选择最可能的大小比
    const bigSmallRatio = this.selectMostLikelyRatio(bigSmallDistribution)
    const [bigCount, smallCount] = bigSmallRatio.split(':').map(Number)

    // 生成候选号码
    const candidates: number[] = []

    // 添加奇数
    while (candidates.filter(b => b % 2 === 1).length < oddCount) {
      const ball = Math.floor(Math.random() * 33) + 1
      if (ball % 2 === 1 && !candidates.includes(ball)) {
        candidates.push(ball)
      }
    }

    // 添加偶数
    while (candidates.filter(b => b % 2 === 0).length < evenCount) {
      const ball = Math.floor(Math.random() * 33) + 1
      if (ball % 2 === 0 && !candidates.includes(ball)) {
        candidates.push(ball)
      }
    }

    // 调整大小比
    while (candidates.filter(b => b > 16).length < bigCount) {
      const smallBallIndex = candidates.findIndex(b => b <= 16)
      if (smallBallIndex !== -1) {
        candidates[smallBallIndex] = Math.floor(Math.random() * 17) + 17 // 17-33
      }
    }

    while (candidates.filter(b => b <= 16).length < smallCount) {
      const bigBallIndex = candidates.findIndex(b => b > 16)
      if (bigBallIndex !== -1) {
        candidates[bigBallIndex] = Math.floor(Math.random() * 16) + 1 // 1-16
      }
    }

    return candidates.sort((a, b) => a - b)
  }

  // 选择最可能的比率
  private static selectMostLikelyRatio(distribution: { [key: string]: number }): string {
    let maxProbability = 0
    let selectedRatio = '3:3' // 默认比率

    Object.entries(distribution).forEach(([ratio, probability]) => {
      if (probability > maxProbability) {
        maxProbability = probability
        selectedRatio = ratio
      }
    })

    return selectedRatio
  }

  // 计算加权号码
  private static calculateWeightedBalls(ballSets: { balls: number[], weight: number }[], count: number): number[] {
    try {
      // 验证输入参数
      if (!ballSets || ballSets.length === 0) {
        throw new Error('球集合为空')
      }

      if (count <= 0) {
        throw new Error('计数必须大于0')
      }

      // 计算每个号码的权重
      const ballWeights: { [key: number]: number } = {}

      ballSets.forEach(set => {
        if (!set.balls || !Array.isArray(set.balls)) {
          console.warn('跳过无效的球集合')
          return
        }

        set.balls.forEach(ball => {
          if (typeof ball !== 'number' || ball < 1 || ball > 33) {
            console.warn(`跳过无效的球号码: ${ball}`)
            return
          }

          if (!ballWeights[ball]) {
            ballWeights[ball] = 0
          }
          ballWeights[ball] += set.weight || 0
        })
      })

      // 如果没有有效的球，生成随机球
      if (Object.keys(ballWeights).length === 0) {
        console.warn('没有有效的加权球，生成随机球')
        return this.generateRandomBalls(count, 1, 33)
      }

      // 按权重排序
      const sortedBalls = Object.entries(ballWeights)
        .sort((a, b) => b[1] - a[1])
        .map(entry => parseInt(entry[0]))

      // 如果排序后的球数量不足，补充随机球
      if (sortedBalls.length < count) {
        console.warn(`加权球数量不足(${sortedBalls.length} < ${count})，补充随机球`)
        const additionalBalls = this.generateRandomBalls(
          count - sortedBalls.length,
          1,
          33,
          sortedBalls
        )
        return [...sortedBalls, ...additionalBalls].sort((a, b) => a - b)
      }

      // 选择前count个号码
      return sortedBalls.slice(0, count).sort((a, b) => a - b)
    } catch (error) {
      console.error('计算加权球失败:', error)
      // 如果计算失败，生成随机球
      console.log('回退到生成随机球')
      return this.generateRandomBalls(count, 1, 33)
    }
  }

  // 生成随机球
  private static generateRandomBalls(count: number, min: number, max: number, exclude: number[] = []): number[] {
    const balls: number[] = []

    while (balls.length < count) {
      const ball = Math.floor(Math.random() * (max - min + 1)) + min
      if (!balls.includes(ball) && !exclude.includes(ball)) {
        balls.push(ball)
      }
    }

    return balls.sort((a, b) => a - b)
  }

  // 选择加权球
  private static selectWeightedBall(ballCandidates: { ball: number, weight: number }[]): number {
    try {
      // 验证输入参数
      if (!ballCandidates || ballCandidates.length === 0) {
        throw new Error('球候选列表为空')
      }

      // 过滤无效的候选球
      const validCandidates = ballCandidates.filter(candidate =>
        candidate &&
        typeof candidate.ball === 'number' &&
        candidate.ball >= 1 &&
        candidate.ball <= 16 &&
        typeof candidate.weight === 'number' &&
        candidate.weight >= 0
      )

      if (validCandidates.length === 0) {
        throw new Error('没有有效的球候选')
      }

      // 计算总权重
      const totalWeight = validCandidates.reduce((sum, candidate) => sum + candidate.weight, 0)

      if (totalWeight <= 0) {
        // 如果所有权重都是0，随机选择一个
        const randomIndex = Math.floor(Math.random() * validCandidates.length)
        return validCandidates[randomIndex].ball
      }

      // 生成随机数
      const random = Math.random() * totalWeight

      // 根据权重选择球
      let cumulativeWeight = 0
      for (const candidate of validCandidates) {
        cumulativeWeight += candidate.weight
        if (random <= cumulativeWeight) {
          return candidate.ball
        }
      }

      // 如果由于浮点精度问题没有选中，返回最后一个
      return validCandidates[validCandidates.length - 1].ball
    } catch (error) {
      console.error('选择加权球失败:', error)
      // 如果选择失败，返回随机蓝球
      console.log('回退到生成随机蓝球')
      return Math.floor(Math.random() * 16) + 1
    }
  }
}
