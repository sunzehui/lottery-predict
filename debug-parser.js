const { readFile } = require('node:fs/promises')
const cheerio = require('cheerio')

async function debugParser() {
  try {
    const html = await readFile('test.html', 'utf-8')
    const $ = cheerio.load(html)

    console.log('=== 调试解析器 ===\n')

    // 1. 检查期号提取
    console.log('1. 检查期号提取:')
    const issueText = $('span:contains("期")').first().text().trim()
    console.log('期号文本:', issueText)
    const issueMatch = /(\d+)期/.exec(issueText)
    const issue = issueMatch ? issueMatch[1] : null
    console.log('解析的期号:', issue)

    // 调试：检查HTML中所有包含"期"的span元素
    console.log('\nHTML中所有包含"期"的span元素:')
    $('span:contains("期")').each((i, el) => {
      console.log(`  ${i}: ${$(el).text().trim()}`)
    })

    // 2. 检查日期提取
    console.log('\n2. 检查日期提取:')
    const dateText = $('span:contains("开奖日期")').first().text().trim()
    console.log('日期文本:', dateText)
    const dateMatch = /开奖日期:\s*(\d{4}-\d{2}-\d{2})/.exec(dateText)
    const date = dateMatch ? dateMatch[1] : null
    console.log('解析的日期:', date)

    // 调试：检查HTML中所有包含"开奖日期"的元素
    console.log('\nHTML中所有包含"开奖日期"的元素:')
    $('*:contains("开奖日期")').each((i, el) => {
      console.log(`  ${i}: ${$(el).prop('tagName')} - ${$(el).text().trim()}`)
    })

    // 3. 检查红球提取
    console.log('\n3. 检查红球提取:')
    const redBallsTemp = []
    $('.lottery-ball.bg-red-1').each((i, el) => {
      const ballNumber = parseInt($(el).text().trim(), 10)
      redBallsTemp.push(ballNumber)
      console.log(`红球 ${i + 1}:`, ballNumber)
    })
    console.log('红球总数:', redBallsTemp.length)

    // 调试：检查HTML中所有红球相关元素
    console.log('\nHTML中所有红球相关元素:')
    $('[class*="red"]').each((i, el) => {
      console.log(`  ${i}: ${$(el).prop('className')} - ${$(el).text().trim()}`)
    })

    // 4. 检查蓝球提取
    console.log('\n4. 检查蓝球提取:')
    const blueBallText = $('.lottery-ball.bg-blue').first().text().trim()
    const blueBall = parseInt(blueBallText, 10)
    console.log('蓝球文本:', blueBallText, '解析的蓝球:', blueBall)

    // 调试：检查HTML中所有蓝球相关元素
    console.log('\nHTML中所有蓝球相关元素:')
    $('[class*="blue"]').each((i, el) => {
      console.log(`  ${i}: ${$(el).prop('className')} - ${$(el).text().trim()}`)
    })

    // 5. 检查销售金额和奖池提取
    console.log('\n5. 检查销售金额和奖池提取:')
    const allAmounts = []
    $('span.font-oswald.text-red.text-2xl').each((i, el) => {
      const text = $(el).text().trim()
      console.log(`金额 ${i + 1}:`, text)
      const match = /([\d.]+)亿/.exec(text)
      if (match) {
        allAmounts.push(parseFloat(match[1]))
      }
    })

    const salesAmount = allAmounts.length >= 1 ? allAmounts[0] * 100000000 : 0
    const prizePool = allAmounts.length >= 2 ? allAmounts[1] * 100000000 : 0

    console.log('\n解析的销售金额:', salesAmount)
    console.log('解析的奖池:', prizePool)

    // 6. 检查最终结果
    console.log('\n6. 最终结果:')
    console.log({
      issue,
      date,
      redBalls: redBallsTemp,
      blueBall,
      salesAmount,
      prizePool,
      isValid: issue && date && redBallsTemp.length === 6 && !isNaN(blueBall)
    })
  } catch (error) {
    console.error('调试失败:', error)
  }
}

debugParser()
