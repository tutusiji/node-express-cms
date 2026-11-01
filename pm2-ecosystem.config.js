module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/index.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'cluster',
      // watch 已关闭：递归监视 uploads/fonts（2000+ 文件）与 node_modules 消耗大量
      // inotify 资源，曾引发重启循环；部署后手动 pm2 restart 即可
      watch: false,
      // 崩溃熔断：连续 10 次快速崩溃后停止，防止 spawn 风暴拖死整机
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production',
        // 从 shell 环境继承，密钥不落仓库：服务器上 export JWT_SECRET=... 后再 pm2 start
        JWT_SECRET: process.env.JWT_SECRET,
        CORS_ORIGINS: process.env.CORS_ORIGINS
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '500M'
    },
    {
      name: 'ssr-app',
      script: './web-ssr/server-ssr.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 5000,
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/ssr-app-error.log',
      out_file: './logs/ssr-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      max_memory_restart: '400M'
    }
  ]
};
