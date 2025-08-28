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

    console.log('查询红球频率数据...')
    const [redResults] = await connection.execute(
      'SELECT ball_type, ball_number, frequency, last_appearance_issue FROM number_frequency WHERE ball_type = "red" ORDER BY ball_number LIMIT 5'
    )
    console.log('红球频率数据（前5个）:', redResults)

    console.log('\n查询蓝球频率数据...')
    const [blueResults] = await connection.execute(
      'SELECT ball_type, ball_number, frequency, last_appearance_issue FROM number_frequency WHERE ball_type = "blue" ORDER BY ball_number LIMIT 5'
    )
    console.log('蓝球频率数据（前5个）:', blueResults)

    console.log('\n查询总记录数...')
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM number_frequency')
    console.log('总记录数:', (countResult as any[])[0].total)

    console.log('\n数据验证成功！')

    process.exit(0)
  } catch (error) {
    console.error('测试失败:', error)
    process.exit(1)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

// 执行主函数
main()
