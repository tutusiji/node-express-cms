#!/bin/bash

# PM2 开机自启设置脚本
PROJECT_PATH="/var/www/node-express-blog"

echo "=========================================="
echo "设置 PM2 开机自启"
echo "=========================================="
echo ""

# 进入项目目录
cd "$PROJECT_PATH" || exit 1

# 1. 启动所有服务
echo "1️⃣  启动所有服务..."
pm2 start pm2-ecosystem.config.js
echo ""

# 2. 保存当前进程列表
echo "2️⃣  保存进程列表..."
pm2 save
echo ""

# 3. 设置开机自启
echo "3️⃣  设置开机自启..."
pm2 startup

echo ""
echo "=========================================="
echo "✅ 开机自启设置完成！"
echo "=========================================="
echo ""
echo "验证设置："
pm2 list
echo ""
echo "📌 说明："
echo "  - 系统重启后，PM2 会自动启动所有服务"
echo "  - 如需取消开机自启，执行：pm2 unstartup"
echo "  - 如需更新自启配置，重新执行此脚本"
echo ""
