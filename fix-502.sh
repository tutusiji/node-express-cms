#!/bin/bash

# 快速修复 502 错误脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "502 错误快速修复"
echo "==========================================${NC}"
echo ""

# 1. 停止 ssr-app
echo -e "${BLUE}1️⃣  停止 ssr-app...${NC}"
pm2 stop ssr-app 2>/dev/null || true
sleep 1

# 2. 删除 ssr-app
echo -e "${BLUE}2️⃣  删除 ssr-app 进程...${NC}"
pm2 delete ssr-app 2>/dev/null || true
sleep 1

# 3. 清理日志
echo -e "${BLUE}3️⃣  清理日志...${NC}"
pm2 flush 2>/dev/null || true

# 4. 重新启动
echo -e "${BLUE}4️⃣  重新启动 ssr-app...${NC}"
cd "$PROJECT_PATH"
pm2 start pm2-ecosystem.config.js --only ssr-app

# 5. 等待启动
sleep 3

# 6. 检查状态
echo ""
echo -e "${BLUE}5️⃣  检查状态...${NC}"
pm2 list | grep ssr-app

# 7. 测试连接
echo ""
echo -e "${BLUE}6️⃣  测试本地连接...${NC}"
if curl -s http://localhost:3111 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 本地连接成功${NC}"
else
    echo -e "${RED}❌ 本地连接失败，查看日志...${NC}"
    pm2 logs ssr-app --lines 50 --nostream
fi

# 8. 重新加载 nginx
echo ""
echo -e "${BLUE}7️⃣  重新加载 nginx...${NC}"
if sudo systemctl reload nginx 2>/dev/null; then
    echo -e "${GREEN}✅ nginx 已重新加载${NC}"
else
    echo -e "${YELLOW}⚠️  需要 sudo 权限重新加载 nginx${NC}"
    echo "   执行: sudo systemctl reload nginx"
fi

echo ""
echo -e "${BLUE}=========================================="
echo "修复完成"
echo "==========================================${NC}"
echo ""
echo "现在访问网站，如果仍然 502，执行："
echo "  bash diagnose-502.sh"
echo ""
