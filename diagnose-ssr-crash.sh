#!/bin/bash

# 诊断 ssr-app 崩溃脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "ssr-app 崩溃诊断"
echo "==========================================${NC}"
echo ""

# 1. 检查 ssr-app 进程
echo -e "${BLUE}1️⃣  检查 ssr-app 进程...${NC}"
if pm2 list | grep -q "ssr-app"; then
    STATUS=$(pm2 list | grep "ssr-app" | awk '{print $(NF-1)}')
    echo "进程状态: $STATUS"
    
    if [ "$STATUS" = "online" ]; then
        echo -e "${GREEN}✅ 进程运行中${NC}"
    else
        echo -e "${RED}❌ 进程状态异常${NC}"
    fi
else
    echo -e "${RED}❌ 进程不存在${NC}"
fi
echo ""

# 2. 查看 ssr-app 日志
echo -e "${BLUE}2️⃣  查看 ssr-app 日志...${NC}"
echo "完整日志（最近 100 行）:"
pm2 logs ssr-app --lines 100 --nostream 2>/dev/null || echo "无日志"
echo ""

# 3. 查看错误日志
echo -e "${BLUE}3️⃣  查看错误日志...${NC}"
echo "错误日志（最近 50 行）:"
pm2 logs ssr-app --err --lines 50 --nostream 2>/dev/null || echo "无错误日志"
echo ""

# 4. 检查端口
echo -e "${BLUE}4️⃣  检查端口 3111...${NC}"
if ss -tuln | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 3111 未监听${NC}"
fi
echo ""

# 5. 直接测试启动
echo -e "${BLUE}5️⃣  直接测试启动 server-ssr.js...${NC}"
cd "$PROJECT_PATH/web-ssr"
echo "输出内容（5 秒后停止）:"
echo "---"
timeout 5 node server-ssr.js 2>&1 || true
echo "---"
echo ""

# 6. 检查依赖
echo -e "${BLUE}6️⃣  检查依赖...${NC}"
if [ -d node_modules ]; then
    echo -e "${GREEN}✅ node_modules 存在${NC}"
    echo "关键依赖检查:"
    [ -d node_modules/express ] && echo "  ✅ express" || echo "  ❌ express"
    [ -d node_modules/vue ] && echo "  ✅ vue" || echo "  ❌ vue"
    [ -d node_modules/vite ] && echo "  ✅ vite" || echo "  ❌ vite"
else
    echo -e "${RED}❌ node_modules 不存在${NC}"
fi
echo ""

# 7. 检查 dist 目录
echo -e "${BLUE}7️⃣  检查 dist 目录...${NC}"
if [ -d dist ]; then
    echo -e "${GREEN}✅ dist 目录存在${NC}"
    [ -f dist/server/entry-server.js ] && echo "  ✅ dist/server/entry-server.js" || echo "  ❌ dist/server/entry-server.js"
    [ -f dist/client/index.html ] && echo "  ✅ dist/client/index.html" || echo "  ❌ dist/client/index.html"
else
    echo -e "${RED}❌ dist 目录不存在${NC}"
fi
echo ""

# 8. 检查内存
echo -e "${BLUE}8️⃣  检查内存...${NC}"
echo "系统内存:"
free -h | head -2
echo ""
echo "ssr-app 进程内存:"
PID=$(pm2 list | grep ssr-app | awk '{print $NF}' | head -1)
if [ ! -z "$PID" ]; then
    ps aux | grep $PID | grep -v grep | awk '{print "  PID: " $2 ", 内存: " $6 "KB"}'
fi
echo ""

echo -e "${BLUE}=========================================="
echo "诊断完成"
echo "==========================================${NC}"
echo ""
