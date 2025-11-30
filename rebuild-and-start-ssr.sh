#!/bin/bash

# 重建并启动 ssr-app 的完整脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "SSR 完整重建和启动"
echo "==========================================${NC}"
echo ""

# 1. 停止旧进程
echo -e "${BLUE}1️⃣  停止旧进程...${NC}"
pm2 delete ssr-app 2>/dev/null || true
sleep 1
echo -e "${GREEN}✅ 完成${NC}"
echo ""

# 2. 进入目录
cd "$PROJECT_PATH/web-ssr" || exit 1

# 3. 安装依赖
echo -e "${BLUE}2️⃣  安装依赖...${NC}"
if [ ! -d node_modules ]; then
    echo "正在安装 npm 依赖..."
    npm install
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ 依赖已存在${NC}"
fi
echo ""

# 4. 构建项目
echo -e "${BLUE}3️⃣  构建项目...${NC}"
echo "执行: npm run build"
echo ""
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 构建失败${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 构建完成${NC}"
echo ""

# 5. 验证构建
echo -e "${BLUE}4️⃣  验证构建文件...${NC}"
if [ -f dist/server/entry-server.js ] && [ -f dist/client/index.html ]; then
    echo -e "${GREEN}✅ 构建文件完整${NC}"
else
    echo -e "${RED}❌ 构建文件不完整${NC}"
    exit 1
fi
echo ""

# 6. 启动 ssr-app
echo -e "${BLUE}5️⃣  启动 ssr-app...${NC}"
cd "$PROJECT_PATH"
pm2 start pm2-ecosystem.config.js --only ssr-app
sleep 3
echo ""

# 7. 检查状态
echo -e "${BLUE}6️⃣  检查启动状态...${NC}"
if pm2 list | grep -q "ssr-app.*online"; then
    echo -e "${GREEN}✅ ssr-app 已启动${NC}"
else
    echo -e "${RED}❌ ssr-app 启动失败${NC}"
    echo ""
    echo "查看日志："
    pm2 logs ssr-app --lines 50 --nostream
    exit 1
fi
echo ""

# 8. 检查端口
echo -e "${BLUE}7️⃣  检查端口...${NC}"
sleep 2
if netstat -tuln 2>/dev/null | grep -q ":3111" || ss -tuln 2>/dev/null | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 3111 未监听${NC}"
    echo ""
    echo "查看日志："
    pm2 logs ssr-app --lines 50 --nostream
    exit 1
fi
echo ""

# 9. 测试连接
echo -e "${BLUE}8️⃣  测试本地连接...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1 | tail -1)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ 本地连接成功 (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}❌ 本地连接失败 (HTTP $RESPONSE)${NC}"
fi
echo ""

# 10. 重新加载 nginx
echo -e "${BLUE}9️⃣  重新加载 nginx...${NC}"
if sudo systemctl reload nginx 2>/dev/null; then
    echo -e "${GREEN}✅ nginx 已重新加载${NC}"
else
    echo -e "${YELLOW}⚠️  需要 sudo 权限重新加载 nginx${NC}"
    echo "   执行: sudo systemctl reload nginx"
fi
echo ""

echo -e "${BLUE}=========================================="
echo "✅ 完成！"
echo "==========================================${NC}"
echo ""
echo "现在访问网站应该可以正常访问"
echo ""
echo "如果仍有问题，查看日志："
echo "  pm2 logs ssr-app"
echo ""
