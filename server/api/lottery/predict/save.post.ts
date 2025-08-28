import { defineEventHandler, readBody, createError } from 'h3'
import { PredictionModel } from '../../../models/Prediction'

export default defineEventHandler(async (event) => {
  try {
    // 读取请求体
    const body = await readBody(event)

    // 验证请求数据
    if (!body || !Array.isArray(body.predictions) || body.predictions.length === 0) {
      return createError({
        statusCode: 400,
        statusMessage: '无效的请求数据，缺少预测结果数组'
      })
    }

    // 保存每个预测结果
    const savedIds = []
    const errors = []

    for (let i = 0; i < body.predictions.length; i++) {
      const prediction = body.predictions[i]

      try {
        // 验证预测结果数据
        if (!prediction.issue || !prediction.predictDate || !prediction.redBalls ||
          !Array.isArray(prediction.redBalls) || prediction.redBalls.length !== 6 ||
          prediction.blueBall === undefined || prediction.blueBall === null ||
          prediction.confidence === undefined || prediction.confidence === null ||
          !prediction.algorithm) {
          errors.push(`第${i + 1}个预测结果数据不完整`)
          continue
        }

        // 检查是否已经存在相同的预测结果
        const existingPrediction = await PredictionModel.getByIssueAndAlgorithm(
          prediction.issue,
          prediction.algorithm
        )

        let id
        // if (existingPrediction) {
        // 如果已存在，使用现有ID
        // id = existingPrediction.id
        // } else {
        // 如果不存在，创建新的预测结果
        id = await PredictionModel.create({
          issue: prediction.issue,
          predictDate: prediction.predictDate,
          redBalls: prediction.redBalls,
          blueBall: prediction.blueBall,
          confidence: prediction.confidence,
          algorithmType: prediction.algorithm
        })
        // }

        savedIds.push(id)
      } catch (error) {
        console.error(`保存第${i + 1}个预测结果失败:`, error)
        errors.push(`第${i + 1}个预测结果保存失败: ${error.message}`)
      }
    }

    // 如果没有任何预测结果保存成功，返回错误
    if (savedIds.length === 0) {
      return createError({
        statusCode: 500,
        statusMessage: '无法保存任何预测结果',
        data: { errors }
      })
    }

    return {
      success: true,
      data: {
        savedCount: savedIds.length,
        totalCount: body.predictions.length,
        errors: errors.length > 0 ? errors : undefined
      }
    }
  } catch (error) {
    console.error('保存预测结果失败:', error)

    return createError({
      statusCode: 500,
      statusMessage: '保存预测结果失败'
    })
  }
})
