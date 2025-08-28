export default defineNuxtPlugin(() => {
  // 在应用启动时加载环境变量
  const runtimeConfig = useRuntimeConfig()

  // 设置环境变量到 runtimeConfig
  runtimeConfig.dbHost = process.env.DB_HOST || '127.0.0.1'
  runtimeConfig.dbPort = Number(process.env.DB_PORT) || 3306
  runtimeConfig.dbUser = process.env.DB_USER || 'lottery'
  runtimeConfig.dbPassword = process.env.DB_PASSWORD || 'lottery'
  runtimeConfig.dbName = process.env.DB_NAME || 'lottery'
  runtimeConfig.adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
})
