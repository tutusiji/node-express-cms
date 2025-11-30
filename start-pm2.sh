#!/bin/bash

# PM2 一键启动脚本（推荐使用）
# 项目路径
PROJECT_PATH="/var/www/node-express-blog"

echo "=========================================="
echo "PM2 项目启动脚本"
echo "=========================================="

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ PM2 未安装，正在安装..."
    npm install -g pm2
fi

# 进入项目目录
cd "$PROJECT_PATH" || exit 1

# 创建日志目录
mkdir -p logs

echo ""
echo "🚀 启动所有服务..."
cd "$PROJECT_PATH"

# 使用生态系统配置文件启动
pm2 start pm2-ecosystem.config.js

echo ""
echo "=========================================="
echo "✅ 所有项目已启动！"
echo "=========================================="
echo ""
echo "📊 PM2 进程列表："
pm2 list
echo ""
echo "📝 常用命令："
echo "  pm2 logs              # 查看所有日志"
echo "  pm2 logs server       # 查看 server 日志"
echo "  pm2 logs server-gpt   # 查看 server-gpt 日志"
echo "  pm2 logs ssr-app      # 查看 ssr-app 日志"
echo ""
echo "  pm2 stop all          # 停止所有服务"
echo "  pm2 restart all       # 重启所有服务"
echo "  pm2 delete all        # 删除所有服务"
echo ""
echo "  pm2 monit             # 监控资源使用"
echo "  pm2 save              # 保存当前进程列表"
echo "  pm2 startup           # 设置开机自启"
echo ""
