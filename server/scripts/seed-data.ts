import * as mysql from 'mysql2/promise'

// 数据库配置
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'lottery',
  password: 'lottery',
  database: 'lottery'
}

// 生成示例双色球数据
const generateSampleData = () => {
  const sampleData = []
  const currentYear = 2025
  const currentMonth = 8
  const currentDay = 27

  // 生成最近30期的数据
  for (let i = 30; i >= 1; i--) {
    const date = new Date(currentYear, currentMonth - 1, currentDay - i)
    const issue = `${currentYear}${String(Math.floor((currentMonth - 1) * 4.3) + i).padStart(3, '0')}`

    // 生成随机但合理的红球
    const redBalls: number[] = []
    while (redBalls.length < 6) {
      const ball = Math.floor(Math.random() * 33) + 1
      if (!redBalls.includes(ball)) {
        redBalls.push(ball)
      }
    }
    redBalls.sort((a, b) => a - b)

    // 生成随机蓝球
    const blueBall = Math.floor(Math.random() * 16) + 1

    sampleData.push({
      issue,
      date: date.toISOString().split('T')[0],
      redBalls,
      blueBall,
      prizePool: Math.floor(Math.random() * 500000000) + 200000000, // 2-7亿之间的奖池
      salesAmount: Math.floor(Math.random() * 300000000) + 100000000 // 1-4亿之间的销售额
    })
  }

  return sampleData
}

// 主函数
const main = async () => {
  let connection: mysql.Connection | null = null

  try {
    console.log('连接数据库...')
    connection = await mysql.createConnection(dbConfig)

    console.log('生成示例数据...')
    const sampleData = generateSampleData()

    console.log('插入示例数据...')
    let insertedCount = 0

    for (const data of sampleData) {
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

      const [result] = await connection.execute(sql, params)
      if ((result as any).affectedRows > 0) {
        insertedCount++
      }
    }

    console.log(`成功插入 ${insertedCount} 条历史数据`)
    console.log('数据填充完成！')

    process.exit(0)
  } catch (error) {
    console.error('数据填充失败:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 执行主函数
main()
