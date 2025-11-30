#!/bin/bash

# PM2 一键启动脚本 - 最简版
PROJECT_PATH="/var/www/node-express-blog"

cd "$PROJECT_PATH" || exit 1

echo "🚀 启动所有服务..."
pm2 start pm2-ecosystem.config.js

echo ""
echo "✅ 启动完成！"
pm2 list
