#!/bin/bash

# 测试 web-ssr 启动脚本
PROJECT_PATH="/var/www/node-express-blog"

echo "=========================================="
echo "测试 web-ssr 启动"
echo "=========================================="
echo ""

cd "$PROJECT_PATH/web-ssr" || exit 1

echo "1️⃣  检查 package.json..."
if grep -q '"type": "module"' package.json; then
    echo "✅ package.json 已配置为 ES 模块"
else
    echo "❌ package.json 未配置为 ES 模块"
fi

echo ""
echo "2️⃣  检查 server-ssr.js..."
if [ -f server-ssr.js ]; then
    echo "✅ server-ssr.js 文件存在"
else
    echo "❌ server-ssr.js 文件不存在"
    exit 1
fi

echo ""
echo "3️⃣  检查依赖..."
if [ -d node_modules ]; then
    echo "✅ node_modules 存在"
else
    echo "⚠️  node_modules 不存在，需要安装依赖"
fi

echo ""
echo "4️⃣  尝试直接启动 server-ssr.js..."
echo "按 Ctrl+C 停止测试"
echo ""

timeout 5 node server-ssr.js 2>&1 || true

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="
echo ""
echo "如果看到 'http://localhost:3111' 说明启动成功"
echo ""
echo "现在尝试用 PM2 启动："
echo "  pm2 start pm2-ecosystem.config.js"
echo "  pm2 logs ssr-app"
