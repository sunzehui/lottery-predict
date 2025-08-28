// 模拟 Nuxt.js 的 #imports
export const useRuntimeConfig = () => ({
  dbHost: 'localhost',
  dbPort: 3306,
  dbUser: 'root',
  dbPassword: '',
  dbName: 'lottery_predict_test',
  public: {
    apiBase: '/api'
  }
})
