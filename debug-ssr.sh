#!/bin/bash

# 深度诊断 ssr-app 脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "ssr-app 深度诊断"
echo "==========================================${NC}"
echo ""

# 1. 删除旧进程
echo -e "${BLUE}1️⃣  清理旧进程...${NC}"
pm2 delete ssr-app 2>/dev/null || true
sleep 2

# 2. 进入目录
cd "$PROJECT_PATH/web-ssr" || exit 1

# 3. 检查文件
echo -e "${BLUE}2️⃣  检查文件...${NC}"
echo "server-ssr.js: $([ -f server-ssr.js ] && echo '✅ 存在' || echo '❌ 不存在')"
echo "package.json: $([ -f package.json ] && echo '✅ 存在' || echo '❌ 不存在')"
echo "dist 目录: $([ -d dist ] && echo '✅ 存在' || echo '❌ 不存在')"
echo ""

# 4. 检查依赖
echo -e "${BLUE}3️⃣  检查依赖...${NC}"
if [ ! -d node_modules ]; then
    echo "⚠️  node_modules 不存在，正在安装..."
    npm install --production
    echo "✅ 依赖安装完成"
else
    echo "✅ node_modules 存在"
fi
echo ""

# 5. 直接测试启动
echo -e "${BLUE}4️⃣  直接测试启动 server-ssr.js...${NC}"
echo "输出内容（按 Ctrl+C 停止）："
echo "---"
timeout 5 node server-ssr.js 2>&1 || true
echo "---"
echo ""

# 6. 用 PM2 启动
echo -e "${BLUE}5️⃣  用 PM2 启动...${NC}"
cd "$PROJECT_PATH"
pm2 start pm2-ecosystem.config.js --only ssr-app
sleep 3

# 7. 查看进程状态
echo -e "${BLUE}6️⃣  查看进程状态...${NC}"
pm2 list | grep ssr-app
echo ""

# 8. 查看详细日志
echo -e "${BLUE}7️⃣  查看详细日志...${NC}"
echo "错误日志："
pm2 logs ssr-app --err --lines 50 --nostream 2>/dev/null || echo "无错误日志"
echo ""
echo "完整日志："
pm2 logs ssr-app --lines 50 --nostream 2>/dev/null || echo "无日志"
echo ""

# 9. 查看进程信息
echo -e "${BLUE}8️⃣  查看进程详细信息...${NC}"
pm2 info ssr-app 2>/dev/null || echo "进程不存在"
echo ""

# 10. 检查端口
echo -e "${BLUE}9️⃣  检查端口...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3111"; then
    echo "✅ 端口 3111 正在监听"
elif ss -tuln 2>/dev/null | grep -q ":3111"; then
    echo "✅ 端口 3111 正在监听"
else
    echo "❌ 端口 3111 未监听"
fi
echo ""

echo -e "${BLUE}=========================================="
echo "诊断完成"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}如果看到错误信息，请检查：${NC}"
echo "1. 是否有缺失的依赖"
echo "2. dist 目录是否存在"
echo "3. 是否有权限问题"
echo ""
