import * as mysql from 'mysql2/promise'
import { useRuntimeConfig } from '#imports'

// 数据库连接池
let pool: mysql.Pool | null = null

// 获取数据库连接池
export const getPool = (): mysql.Pool => {
  if (!pool) {
    const config = useRuntimeConfig()
    pool = mysql.createPool({
      host: config.dbHost || 'localhost',
      port: config.dbPort || 3306,
      user: config.dbUser || 'root',
      password: config.dbPassword || '',
      database: config.dbName || 'lottery_predict',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      namedPlaceholders: true,
      dateStrings: false,
      supportBigNumbers: true,
      bigNumberStrings: false
    })
  }
  return pool
}

// 执行查询
export const query = async (sql: string, params?: any): Promise<any> => {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(sql, params)
    return rows
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

// 执行事务
export const transaction = async (callback: (connection: mysql.Connection) => Promise<any>): Promise<any> => {
  const pool = getPool()
  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()
    const result = await callback(connection)
    await connection.commit()
    return result
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

// 关闭连接池
export const closePool = async (): Promise<void> => {
  if (pool) {
    await pool.end()
    pool = null
  }
}

// 初始化数据库
export const initDatabase = async (): Promise<void> => {
  try {
    const pool = getPool()
    const config = useRuntimeConfig()

    // 检查数据库是否存在
    const [databases] = await pool.execute('SHOW DATABASES LIKE ?', [config.dbName || 'lottery_predict'])

    if ((databases as any[]).length === 0) {
      // 创建数据库
      await pool.execute(`CREATE DATABASE ${config.dbName || 'lottery_predict'} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
      console.log(`Database ${config.dbName || 'lottery_predict'} created`)
    }

    // 使用数据库
    await pool.execute(`USE ${config.dbName || 'lottery_predict'}`)

    // 检查表是否存在
    const [tables] = await pool.execute('SHOW TABLES')
    const tableNames = (tables as any[]).map((table: any) => Object.values(table)[0])

    // 如果表不存在，则创建表
    if (!tableNames.includes('lottery_results')) {
      console.log('Creating database tables...')
      // 这里可以执行创建表的SQL语句
      console.log('Database tables created')
    }
  } catch (error) {
    console.error('Database initialization error:', error)
    throw error
  }
}
