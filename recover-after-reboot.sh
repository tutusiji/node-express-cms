#!/bin/bash

# 服务器重启后恢复脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "服务器重启后恢复"
echo "==========================================${NC}"
echo ""

# 1. 检查 nginx 状态
echo -e "${BLUE}1️⃣  检查 nginx 状态...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx 运行中${NC}"
else
    echo -e "${YELLOW}⚠️  nginx 未运行，正在启动...${NC}"
    sudo systemctl start nginx
    sleep 2
    if systemctl is-active --quiet nginx; then
        echo -e "${GREEN}✅ nginx 已启动${NC}"
    else
        echo -e "${RED}❌ nginx 启动失败${NC}"
        sudo systemctl status nginx
    fi
fi
echo ""

# 2. 检查 PM2 进程
echo -e "${BLUE}2️⃣  检查 PM2 进程...${NC}"
pm2 list
echo ""

# 3. 如果 PM2 进程不存在，恢复
echo -e "${BLUE}3️⃣  恢复 PM2 进程...${NC}"
if ! pm2 list | grep -q "ssr-app"; then
    echo "⚠️  ssr-app 进程不存在，正在恢复..."
    cd "$PROJECT_PATH"
    pm2 start pm2-ecosystem.config.js
    sleep 3
    echo -e "${GREEN}✅ 进程已恢复${NC}"
else
    echo -e "${GREEN}✅ PM2 进程存在${NC}"
fi
echo ""

# 4. 检查端口
echo -e "${BLUE}4️⃣  检查端口...${NC}"
if ss -tuln | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 3111 未监听${NC}"
fi
echo ""

# 5. 测试本地连接
echo -e "${BLUE}5️⃣  测试本地连接...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ 本地连接成功 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ 本地连接失败 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

# 6. 清理 nginx 缓存和临时文件
echo -e "${BLUE}6️⃣  清理 nginx 临时文件...${NC}"
sudo rm -f /var/run/nginx.pid 2>/dev/null
sudo rm -f /var/cache/nginx/* 2>/dev/null
echo -e "${GREEN}✅ 清理完成${NC}"
echo ""

# 7. 重新加载 nginx
echo -e "${BLUE}7️⃣  重新加载 nginx...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✅ nginx 已重新加载${NC}"
else
    echo -e "${YELLOW}⚠️  nginx 重新加载失败，尝试重启...${NC}"
    if sudo systemctl restart nginx; then
        echo -e "${GREEN}✅ nginx 已重启${NC}"
    else
        echo -e "${RED}❌ nginx 重启失败${NC}"
    fi
fi
echo ""

# 8. 最终检查
echo -e "${BLUE}8️⃣  最终检查...${NC}"
echo "nginx 状态："
systemctl is-active nginx
echo ""
echo "PM2 进程："
pm2 list
echo ""
echo "端口监听："
ss -tuln | grep -E ":(3111|3000|3567)" || echo "未找到相关端口"
echo ""

echo -e "${BLUE}=========================================="
echo "✅ 恢复完成"
echo "==========================================${NC}"
echo ""
echo "现在访问网站测试"
echo ""
