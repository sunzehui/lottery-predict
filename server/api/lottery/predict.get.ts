import { defineEventHandler, getQuery, createError } from 'h3'
import { PredictionAlgorithmService } from '../../services/PredictionAlgorithm'

export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const algorithm = query.algorithm as string || 'frequency' // 默认使用频率分析算法
    const count = parseInt(query.count as string) || 5 // 默认生成5组预测号码

    // 验证算法类型
    const validAlgorithms = ['frequency', 'trend', 'coldHot', 'mixed']
    if (!validAlgorithms.includes(algorithm)) {
      return createError({
        statusCode: 400,
        statusMessage: '无效的算法类型'
      })
    }

    // 验证预测数量
    if (count < 1 || count > 20) {
      return createError({
        statusCode: 400,
        statusMessage: '预测数量必须在1-20之间'
      })
    }

    // 获取下一期期号
    const nextIssue = await PredictionAlgorithmService['getNextIssue']()
    if (!nextIssue) {
      return createError({
        statusCode: 500,
        statusMessage: '无法获取下一期期号'
      })
    }

    // 生成预测结果
    const predictions = []

    for (let i = 0; i < count; i++) {
      let prediction

      try {
        switch (algorithm) {
          case 'frequency':
            prediction = await PredictionAlgorithmService.generateFrequencyPrediction(nextIssue)
            break
          case 'trend':
            prediction = await PredictionAlgorithmService.generateTrendPrediction(nextIssue)
            break
          case 'coldHot':
            prediction = await PredictionAlgorithmService.generateColdHotPrediction(nextIssue)
            break
          case 'mixed':
            const weights = await PredictionAlgorithmService['getAlgorithmWeights']()
            prediction = await PredictionAlgorithmService.generateMixedPrediction(nextIssue, weights)
            break
          default:
            prediction = await PredictionAlgorithmService.generateFrequencyPrediction(nextIssue)
        }

        if (prediction) {
          // 验证预测结果
          if (!prediction.issue || !prediction.predictDate || !prediction.redBalls ||
            !Array.isArray(prediction.redBalls) || prediction.redBalls.length !== 6 ||
            prediction.blueBall === undefined || prediction.blueBall === null ||
            prediction.confidence === undefined || prediction.confidence === null ||
            !prediction.algorithm) {
            console.error(`第${i + 1}个预测结果数据不完整:`, prediction)
            continue // 跳过这个预测结果，继续生成下一个
          }

          // 保存预测结果到数据库
          try {
            await PredictionAlgorithmService.savePrediction(prediction)
            predictions.push(prediction)
          } catch (saveError) {
            console.error(`保存第${i + 1}个预测结果失败:`, saveError)
            // 即使保存失败，也仍然返回预测结果，只是不保存到数据库
            predictions.push(prediction)
          }
        } else {
          console.error(`第${i + 1}个预测结果生成失败`)
        }
      } catch (predictionError) {
        console.error(`生成第${i + 1}个预测结果时出错:`, predictionError)
        // 如果某个预测生成失败，继续尝试生成下一个
      }
    }

    // 如果没有任何预测结果生成成功，返回错误
    if (predictions.length === 0) {
      return createError({
        statusCode: 500,
        statusMessage: '无法生成任何预测结果'
      })
    }

    return {
      success: true,
      data: {
        algorithm,
        count,
        issue: nextIssue,
        predictions,
        generatedAt: new Date().toISOString()
      }
    }
  } catch (error) {
    console.error('生成预测失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '生成预测失败'
    })
  }
})
