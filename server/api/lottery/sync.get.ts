import { defineEventHandler, getQuery, createError } from 'h3'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { LotteryResultModel } from '../../models/LotteryResult'
import { join } from 'path'

import { readFile } from 'node:fs/promises';
import { AnalysisModel } from '~/server/models/Analysis'

// 目标网址的基础部分，期号会动态变化
const BASE_URL: string = 'https://sports.163.com/caipiao/lottery/ssq/'

// 定义抓取到的双色球数据结构
interface LotteryData {
  issue: string
  date: string // YYYY-MM-DD 格式
  redBalls: number[]
  blueBall: number
  prizePool?: number // 单位：元
  salesAmount?: number // 单位：元
  firstPrizeWinners?: number
  firstPrizeSingleAmount?: number // 单位：元
  secondPrizeWinners?: number
  secondPrizeSingleAmount?: number // 单位：元
  thirdPrizeWinners?: number
  thirdPrizeSingleAmount?: number // 单位：元
}

/**
 * 从指定 URL 抓取双色球开奖信息
 * @param {string} url 目标网页 URL
 * @returns {Promise<LotteryData | null>} 包含开奖信息的对象，如果抓取失败则返回 null
 */
async function scrapeLotteryInfo(url: string): Promise<LotteryData | null> {
  try {
    console.log(`正在抓取网址: ${url}`)
    const response = await axios.get<string>(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 10000 // 10秒超时
    })
    const html: string = response.data

    // 如果是在开发环境，可以选择保存HTML到本地文件用于调试
    if (process.env.NODE_ENV === 'development') {
      try {
        const fs = await import('node:fs/promises')
        const jsonFilePath = join(process.cwd(), 'test.html')
        await fs.writeFile(jsonFilePath, html, 'utf-8')
        console.log(`HTML已保存到: ${jsonFilePath}`)
      } catch (err) {
        console.warn('无法保存HTML文件:', err)
      }
    }

    const $: cheerio.CheerioAPI = cheerio.load(html)

    // 提取期号 - 从下拉菜单中获取
    const issueText: string = $('.dropdown span:contains("期")').first().text().trim()
    console.log('期号文本:', issueText)
    const issueMatch: RegExpExecArray | null = /(\d+)期/.exec(issueText)

    // 提取开奖日期 - 从包含"开奖日期:"的span中获取
    const dateText: string = $('span:contains("开奖日期:")').first().text().trim()
    console.log('日期文本:', dateText)
    const dateMatch: RegExpExecArray | null = /开奖日期:\s*(\d{4}-\d{2}-\d{2})/.exec(dateText)

    const issue: string | null = issueMatch ? issueMatch[1] : null
    const date: string | null = dateMatch ? dateMatch[1] : null
    console.log('解析的期号:', issue, '解析的日期:', date)

    // 调试：检查HTML结构
    console.log('=== 调试信息 ===')
    console.log('HTML中所有包含"期"的span元素:')
    $('span:contains("期")').each((i, el) => {
      console.log(`  ${i}: ${$(el).text().trim()}`)
    })

    console.log('HTML中所有包含"开奖日期"的元素:')
    $('*:contains("开奖日期")').each((i, el) => {
      console.log(`  ${i}: ${$(el).prop('tagName')} - ${$(el).text().trim()}`)
    })

    // 检查页面标题，确认是否是正确的开奖页面
    const pageTitle = $('title').text().trim()
    console.log('页面标题:', pageTitle)
    if (!pageTitle.includes('双色球') || !pageTitle.includes('开奖')) {
      console.warn('页面标题不包含"双色球"或"开奖"，可能不是正确的开奖页面')
    }

    // 提取红球号码 - 从class为lottery-ball bg-red-1的span元素中获取
    const redBallsTemp: number[] = []
    $('.lottery-ball.bg-red-1').each((i: number, el: any) => {
      const ballNumber = parseInt($(el).text().trim(), 10)
      if (!isNaN(ballNumber)) {
        redBallsTemp.push(ballNumber) // 转换为整数
        console.log(`红球 ${i + 1}:`, ballNumber)
      }
    })

    // 确保红球有 6 个，并按升序排列
    if (redBallsTemp.length === 6) {
      redBallsTemp.sort((a, b) => a - b)
      console.log('排序后的红球:', redBallsTemp)
    } else {
      console.warn(`未能从 ${url} 提取到 6 个红球，只找到 ${redBallsTemp.length} 个。`)

      // 调试：检查HTML中所有红球元素
      console.log('HTML中所有红球相关元素:')
      $('[class*="red"]').each((i, el) => {
        console.log(`  ${i}: ${$(el).prop('className')} - ${$(el).text().trim()}`)
      })

      return null
    }

    // 提取蓝球号码 - 从class为lottery-ball bg-blue的span元素中获取
    const blueBallText = $('.lottery-ball.bg-blue').first().text().trim()
    const blueBall: number = parseInt(blueBallText, 10)
    console.log('蓝球文本:', blueBallText, '解析的蓝球:', blueBall)

    // 调试：检查HTML中所有蓝球元素
    if (isNaN(blueBall)) {
      console.log('HTML中所有蓝球相关元素:')
      $('[class*="blue"]').each((i, el) => {
        console.log(`  ${i}: ${$(el).prop('className')} - ${$(el).text().trim()}`)
      })
    }

    // 提取销售金额和奖池
    let salesAmount = 0
    let prizePool = 0

    // 提取销售金额 - 查找包含"本期全国销售金额"的div，然后找到其中的金额
    const salesContainer = $('div:contains("本期全国销售金额")').closest('div')
    const salesText = salesContainer.find('span.font-oswald.text-red.text-2xl').first().text().trim()
    console.log('销售金额文本:', salesText)
    const salesMatch = /([\d.]+)亿/.exec(salesText)
    if (salesMatch) {
      salesAmount = parseFloat(salesMatch[1]) * 100000000 // 转换为元
      console.log('解析的销售金额:', salesAmount)
    } else {
      console.log('未能解析销售金额')
    }

    // 提取奖池 - 查找包含"奖池滚存"的div，然后找到其中的金额
    const prizePoolContainer = $('div:contains("奖池滚存")').closest('div')
    const prizePoolText = prizePoolContainer.find('span.font-oswald.text-red.text-2xl').first().text().trim()
    console.log('奖池文本:', prizePoolText)
    const prizePoolMatch = /([\d.]+)亿/.exec(prizePoolText)
    if (prizePoolMatch) {
      prizePool = parseFloat(prizePoolMatch[1]) * 100000000 // 转换为元
      console.log('解析的奖池:', prizePool)
    } else {
      console.log('未能解析奖池，尝试备用方法')

      // 备用方法：查找所有金额然后取第二个
      const allAmounts: number[] = []
      $('span.font-oswald.text-red.text-2xl').each((i: number, el: any) => {
        const text = $(el).text().trim()
        const match = /([\d.]+)亿/.exec(text)
        if (match) {
          allAmounts.push(parseFloat(match[1]))
        }
      })

      console.log('找到的所有金额:', allAmounts)

      // 第一个金额是销售金额，第二个是奖池
      if (allAmounts.length >= 2) {
        prizePool = allAmounts[1] * 100000000 // 转换为元
        console.log('使用备用方法解析的奖池:', prizePool)
      } else {
        console.log('备用方法也未能解析奖池')
      }
    }

    // 提取奖项信息
    let firstPrizeWinners = 0
    let firstPrizeSingleAmount = 0
    let secondPrizeWinners = 0
    let secondPrizeSingleAmount = 0
    let thirdPrizeWinners = 0
    let thirdPrizeSingleAmount = 0

    // 查找奖项表格 - 找到包含奖项信息的表格
    const prizeTables = $('table')
    console.log('找到表格数量:', prizeTables.length)

    // 遍历所有表格，找到包含奖项信息的表格
    prizeTables.each((tableIndex: number, table: any) => {
      const headers = $(table).find('th')
      let isPrizeTable = false

      // 检查表头是否包含"奖项"、"中奖注数"、"单注奖金"等关键词
      headers.each((i: number, header: any) => {
        const headerText = $(header).text().trim()
        if (headerText.includes('奖项') || headerText.includes('中奖注数') || headerText.includes('单注奖金')) {
          isPrizeTable = true
        }
      })

      if (isPrizeTable) {
        console.log(`找到奖项表格 ${tableIndex + 1}`)
        const prizeRows = $(table).find('tbody tr')
        console.log('奖项表格行数:', prizeRows.length)

        prizeRows.each((i: number, el: any) => {
          const cells = $(el).find('td')
          if (cells.length >= 3) {
            const prizeName = $(cells[0]).text().trim()
            const winnersText = $(cells[1]).text().trim()
            const amountText = $(cells[2]).text().trim().replace(/,/g, '')

            const winners = parseInt(winnersText, 10) || 0
            const amount = parseInt(amountText, 10) || 0

            console.log(`奖项 ${i + 1}: ${prizeName}, 中奖人数: ${winners}, 单注奖金: ${amount}`)

            if (prizeName === '一等奖') {
              firstPrizeWinners = winners
              firstPrizeSingleAmount = amount
            } else if (prizeName === '二等奖') {
              secondPrizeWinners = winners
              secondPrizeSingleAmount = amount
            } else if (prizeName === '三等奖') {
              thirdPrizeWinners = winners
              thirdPrizeSingleAmount = amount
            }
          }
        })
      }
    })

    console.log('最终解析结果:', {
      issue,
      date,
      redBalls: redBallsTemp,
      blueBall,
      salesAmount,
      prizePool,
      firstPrizeWinners,
      firstPrizeSingleAmount,
      secondPrizeWinners,
      secondPrizeSingleAmount,
      thirdPrizeWinners,
      thirdPrizeSingleAmount
    })

    if (issue && date && redBallsTemp.length === 6 && !isNaN(blueBall)) {
      return {
        issue: issue,
        date: date,
        redBalls: redBallsTemp,
        blueBall: blueBall,
        prizePool: prizePool,
        salesAmount: salesAmount,
        firstPrizeWinners: firstPrizeWinners,
        firstPrizeSingleAmount: firstPrizeSingleAmount,
        secondPrizeWinners: secondPrizeWinners,
        secondPrizeSingleAmount: secondPrizeSingleAmount,
        thirdPrizeWinners: thirdPrizeWinners,
        thirdPrizeSingleAmount: thirdPrizeSingleAmount
      }
    } else {
      console.warn(`未能从 ${url} 提取完整的开奖信息。可能缺少期号、日期、红球或蓝球。`)
      console.warn(`期号: ${issue}, 日期: ${date}, 红球: ${redBallsTemp.join(',')}, 蓝球: ${blueBall}`)
      return null
    }

  } catch (error: any) {
    console.error(`抓取 ${url} 失败:`, error.message)
    return null
  }
}

/**
 * 将开奖信息保存到数据库
 * @param {LotteryData} data 开奖信息对象
 * @returns {Promise<boolean>} 是否成功保存
 */
async function saveToDatabase(data: LotteryData): Promise<boolean> {
  try {
    // 使用 LotteryResultModel 的批量创建方法
    const result = await LotteryResultModel.batchCreate([{
      issue: data.issue,
      date: data.date,
      redBalls: data.redBalls,
      blueBall: data.blueBall,
      prizePool: data.prizePool || 0,
      salesAmount: data.salesAmount || 0,
      firstPrizeWinners: data.firstPrizeWinners || 0,
      firstPrizeSingleAmountCents: (data.firstPrizeSingleAmount || 0) * 100, // 转换为分
      secondPrizeWinners: data.secondPrizeWinners || 0,
      secondPrizeSingleAmountCents: (data.secondPrizeSingleAmount || 0) * 100, // 转换为分
      thirdPrizeWinners: data.thirdPrizeWinners || 0,
      thirdPrizeSingleAmountCents: (data.thirdPrizeSingleAmount || 0) * 100 // 转换为分
    }])
    await AnalysisModel.updateFrequency(data.issue)
    return result > 0
  } catch (err: any) {
    console.error(`保存期号 ${data.issue} 到数据库失败:`, err.message)
    throw err
  }
}

// Nuxt3 API 接口
export default defineEventHandler(async (event) => {
  try {
    // 获取查询参数
    const query = getQuery(event)
    const drawId = query.drawId as string
    const key = query.key as string
    if (key != 'sunzehui_k') {
      return createError({
        statusCode: 403,
        statusMessage: '无权限访问'
      })
    }

    if (!drawId) {
      return createError({
        statusCode: 400,
        statusMessage: '缺少必要参数：drawId'
      })
    }

    // 验证期号格式
    if (!/^\d{7}$/.test(drawId)) {
      return createError({
        statusCode: 400,
        statusMessage: '期号格式不正确，应为7位数字'
      })
    }

    const url: string = `${BASE_URL}${drawId}`
    console.log(`开始同步期号 ${drawId} 的数据...`)

    // 抓取数据
    const lotteryData: LotteryData | null = await scrapeLotteryInfo(url)

    if (!lotteryData) {
      return createError({
        statusCode: 404,
        statusMessage: '未获取到有效开奖数据，请检查期号是否正确'
      })
    }

    // 保存到数据库
    const saveResult = await saveToDatabase(lotteryData)

    if (saveResult) {
      return {
        success: true,
        message: `成功同步期号 ${drawId} 的开奖数据`,
        data: {
          issue: lotteryData.issue,
          date: lotteryData.date,
          redBalls: lotteryData.redBalls,
          blueBall: lotteryData.blueBall
        }
      }
    } else {
      return createError({
        statusCode: 500,
        statusMessage: '数据保存失败'
      })
    }
  } catch (error: any) {
    console.error('同步开奖数据失败:', error)
    return createError({
      statusCode: 500,
      statusMessage: '同步开奖数据失败: ' + error.message
    })
  }
})
