console.log('env', process.env.DB_HOST);
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss'
  ],
  runtimeConfig: {
    // 服务器端可用的私有密钥
    dbHost: process.env.DB_HOST || '127.0.0.1',
    dbPort: Number(process.env.DB_PORT) || 3306,
    dbUser: process.env.DB_USER || 'lottery',
    dbPassword: process.env.DB_PASSWORD || 'lottery',
    dbName: process.env.DB_NAME || 'lottery',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin123', // 管理员密码，从环境变量中读取
    // 公共密钥，也可用于客户端
    public: {
      apiBase: '/api'
    }
  },
  nitro: {
    // 配置 Nitro 服务器
    preset: 'node-server'
  },
  css: [
    '~/assets/css/main.css'
  ],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
})
