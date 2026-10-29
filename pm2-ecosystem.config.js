module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/index.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        // 从 shell 环境继承，密钥不落仓库：服务器上 export JWT_SECRET=... 后再 pm2 start
        JWT_SECRET: process.env.JWT_SECRET,
        CORS_ORIGINS: process.env.CORS_ORIGINS
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['server'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '500M'
    },
    {
      name: 'server-gpt',
      script: './server-gpt/chatgpt.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/server-gpt-error.log',
      out_file: './logs/server-gpt-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['server-gpt'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '300M'
    },
    {
      name: 'ssr-app',
      script: './web-ssr/server-ssr.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/ssr-app-error.log',
      out_file: './logs/ssr-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['web-ssr'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '400M'
    }
  ]
};
