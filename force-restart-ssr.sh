#!/bin/bash

# 强制重启 ssr-app 脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "强制重启 ssr-app"
echo "==========================================${NC}"
echo ""

# 1. 杀死所有 node 进程（谨慎使用）
echo -e "${BLUE}1️⃣  停止所有 PM2 进程...${NC}"
pm2 stop all
sleep 2
echo -e "${GREEN}✅ 已停止${NC}"
echo ""

# 2. 删除 ssr-app
echo -e "${BLUE}2️⃣  删除 ssr-app 进程...${NC}"
pm2 delete ssr-app 2>/dev/null || true
sleep 1
echo -e "${GREEN}✅ 已删除${NC}"
echo ""

# 3. 清理日志
echo -e "${BLUE}3️⃣  清理日志...${NC}"
pm2 flush
echo -e "${GREEN}✅ 已清理${NC}"
echo ""

# 4. 启动所有进程
echo -e "${BLUE}4️⃣  启动所有进程...${NC}"
cd "$PROJECT_PATH"
pm2 start pm2-ecosystem.config.js
sleep 5
echo -e "${GREEN}✅ 已启动${NC}"
echo ""

# 5. 检查状态
echo -e "${BLUE}5️⃣  检查状态...${NC}"
pm2 list
echo ""

# 6. 检查端口
echo -e "${BLUE}6️⃣  检查端口...${NC}"
echo "端口 3000 (server):"
ss -tuln | grep ":3000" && echo "✅ 正在监听" || echo "❌ 未监听"
echo ""
echo "端口 3111 (ssr-app):"
ss -tuln | grep ":3111" && echo "✅ 正在监听" || echo "❌ 未监听"
echo ""

# 7. 测试连接
echo -e "${BLUE}7️⃣  测试连接...${NC}"
echo "测试 http://localhost:3111"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
echo "HTTP 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ 连接成功${NC}"
else
    echo -e "${RED}❌ 连接失败${NC}"
    echo ""
    echo "查看日志:"
    pm2 logs ssr-app --lines 50 --nostream
fi
echo ""

# 8. 重新加载 nginx
echo -e "${BLUE}8️⃣  重新加载 nginx...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✅ nginx 已重新加载${NC}"
else
    echo -e "${YELLOW}⚠️  需要 sudo 权限${NC}"
fi
echo ""

echo -e "${BLUE}=========================================="
echo "✅ 重启完成"
echo "==========================================${NC}"
echo ""
echo "现在访问网站测试"
echo ""
