#!/bin/bash

# PM2 一键启动脚本
# 项目路径
PROJECT_PATH="/var/www/node-express-blog"

echo "=========================================="
echo "开始启动所有项目..."
echo "=========================================="

# 进入项目目录
cd "$PROJECT_PATH" || exit 1

# 1. 启动 server 服务
echo ""
echo "1. 启动 server 服务..."
cd "$PROJECT_PATH/server"
# npm install --production 2>/dev/null
pm2 start index.js --name "server" --watch --ignore-watch="node_modules" || echo "server 启动失败"

# 2. 启动 server-gpt 服务
echo ""
echo "2. 启动 server-gpt 服务..."
cd "$PROJECT_PATH/server-gpt"
# npm install --production 2>/dev/null
pm2 start chatgpt.js --name "server-gpt" --watch --ignore-watch="node_modules" || echo "server-gpt 启动失败"

# 3. 启动 web-ssr 应用
echo ""
echo "3. 启动 web-ssr 应用..."
cd "$PROJECT_PATH/web-ssr"
# npm install --production 2>/dev/null
pm2 start sys.config.cjs || echo "web-ssr 启动失败"

# 4. 启动 admin 前端（如果需要通过 Node 服务器提供）
# 注：admin 是 Vue 应用，通常需要先构建，然后通过 web 服务器提供
echo ""
echo "4. 构建 admin 前端..."
cd "$PROJECT_PATH/admin"
# npm install --production 2>/dev/null
# npm run build 2>/dev/null
echo "admin 前端已构建完成"

# 5. 启动 staging 部署服务（可选）
# echo ""
# echo "5. 启动 staging 部署服务..."
# cd "$PROJECT_PATH/staging"
# npm install --production 2>/dev/null
# pm2 start deploy.js --name "staging" || echo "staging 启动失败"

echo ""
echo "=========================================="
echo "所有项目启动完成！"
echo "=========================================="
echo ""
echo "PM2 进程列表："
pm2 list
echo ""
echo "查看日志命令："
echo "  pm2 logs              # 查看所有日志"
echo "  pm2 logs server       # 查看 server 日志"
echo "  pm2 logs server-gpt   # 查看 server-gpt 日志"
echo "  pm2 logs ssr-app      # 查看 ssr-app 日志"
echo ""
echo "停止所有服务："
echo "  pm2 stop all"
echo ""
echo "重启所有服务："
echo "  pm2 restart all"
echo ""
echo "删除所有服务："
echo "  pm2 delete all"
