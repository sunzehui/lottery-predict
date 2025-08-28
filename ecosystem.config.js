module.exports = {
  apps: [
    {
      name: 'lottery-predict',
      script: 'node',
      args: '.output/server/index.mjs',
      cwd: './',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_USER: 'lottery',
        DB_PASSWORD: 'lottery',
        DB_NAME: 'lottery',
        ADMIN_PASSWORD: 'admin123'
      },
      env_development: {
        NODE_ENV: 'development',
        DB_HOST: '127.0.0.1',
        DB_PORT: 3306,
        DB_USER: 'lottery',
        DB_PASSWORD: 'lottery',
        DB_NAME: 'lottery',
        ADMIN_PASSWORD: 'admin123'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git', '.nuxt', '.output']
    }
  ]
}
