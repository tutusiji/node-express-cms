#!/bin/bash

# 快速重启 web-ssr 脚本
PROJECT_PATH="/var/www/node-express-blog"

echo "🔄 重启 web-ssr..."
echo ""

# 删除旧进程
echo "1️⃣  删除旧进程..."
pm2 delete ssr-app 2>/dev/null || true

# 等待一秒
sleep 1

# 重新启动
echo "2️⃣  启动新进程..."
cd "$PROJECT_PATH"
pm2 start pm2-ecosystem.config.js --only ssr-app

# 等待启动
sleep 2

# 查看状态
echo ""
echo "3️⃣  查看状态..."
pm2 list | grep ssr-app

echo ""
echo "4️⃣  查看日志..."
pm2 logs ssr-app --lines 20

echo ""
echo "✅ 完成！"
