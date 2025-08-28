import * as mysql from 'mysql2/promise'

// 数据库配置
const dbConfig = {
  host: '127.0.0.1',
  port: 3306,
  user: 'lottery',
  password: 'lottery',
  database: 'lottery'
}

// 主函数
const main = async () => {
  let connection: mysql.Connection | null = null

  try {
    console.log('连接数据库...')
    connection = await mysql.createConnection(dbConfig)

    console.log('检查 lottery_results 表中是否有数据...')
    const [countResult] = await connection.execute('SELECT COUNT(*) as count FROM lottery_results')
    const count = (countResult as any[])[0].count

    if (count === 0) {
      console.log('lottery_results 表中没有数据，请先运行 seed-data.ts 脚本填充历史数据')
      process.exit(1)
    }

    console.log(`找到 ${count} 条历史数据，开始计算号码频率...`)

    // 清空 number_frequency 表
    console.log('清空 number_frequency 表...')
    await connection.execute('TRUNCATE TABLE number_frequency')

    // 获取所有历史数据
    console.log('获取所有历史数据...')
    const [results] = await connection.execute('SELECT * FROM lottery_results ORDER BY issue ASC')
    const lotteryResults = results as any[]

    // 初始化号码频率统计
    const redFrequency: { [key: number]: { count: number, lastIssue: string, lastDate: string } } = {}
    const blueFrequency: { [key: number]: { count: number, lastIssue: string, lastDate: string } } = {}

    // 初始化红球频率统计
    for (let i = 1; i <= 33; i++) {
      redFrequency[i] = { count: 0, lastIssue: '', lastDate: '' }
    }

    // 初始化蓝球频率统计
    for (let i = 1; i <= 16; i++) {
      blueFrequency[i] = { count: 0, lastIssue: '', lastDate: '' }
    }

    // 统计号码频率
    console.log('统计号码频率...')
    lotteryResults.forEach(result => {
      // 统计红球
      for (let i = 1; i <= 6; i++) {
        const ballNumber = result[`red_ball_${i}`]
        redFrequency[ballNumber].count++
        redFrequency[ballNumber].lastIssue = result.issue
        redFrequency[ballNumber].lastDate = result.date
      }

      // 统计蓝球
      const blueBall = result.blue_ball
      blueFrequency[blueBall].count++
      blueFrequency[blueBall].lastIssue = result.issue
      blueFrequency[blueBall].lastDate = result.date
    })

    // 插入红球频率数据
    console.log('插入红球频率数据...')
    for (let i = 1; i <= 33; i++) {
      const freq = redFrequency[i]
      const sql = `
        INSERT INTO number_frequency 
        (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
        VALUES (?, ?, ?, ?, ?)
      `
      await connection.execute(sql, ['red', i, freq.count, freq.lastIssue, freq.lastDate])
    }

    // 插入蓝球频率数据
    console.log('插入蓝球频率数据...')
    for (let i = 1; i <= 16; i++) {
      const freq = blueFrequency[i]
      const sql = `
        INSERT INTO number_frequency 
        (ball_type, ball_number, frequency, last_appearance_issue, last_appearance_date)
        VALUES (?, ?, ?, ?, ?)
      `
      await connection.execute(sql, ['blue', i, freq.count, freq.lastIssue, freq.lastDate])
    }

    console.log('号码频率数据填充完成！')

    process.exit(0)
  } catch (error) {
    console.error('填充号码频率数据失败:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 执行主函数
main()
