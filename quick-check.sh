#!/bin/bash

# 快速检查脚本
# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "快速检查"
echo "==========================================${NC}"
echo ""

# 1. 检查端口
echo -e "${BLUE}1️⃣  检查端口 3111...${NC}"
if ss -tuln | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 3111 未监听${NC}"
fi
echo ""

# 2. 本地测试
echo -e "${BLUE}2️⃣  本地测试连接...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP 状态码: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ 本地连接成功${NC}"
    echo "响应内容前 100 字符："
    echo "$BODY" | head -c 100
    echo ""
else
    echo -e "${RED}❌ 本地连接失败${NC}"
    echo "响应内容："
    echo "$BODY"
fi
echo ""

# 3. 检查 nginx 配置
echo -e "${BLUE}3️⃣  检查 nginx 配置...${NC}"
echo "查找 3111 配置："
grep -r "3111" /etc/nginx/ 2>/dev/null | head -5 || echo "未找到 3111 配置"
echo ""

# 4. 检查 nginx 状态
echo -e "${BLUE}4️⃣  检查 nginx 状态...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx 运行中${NC}"
else
    echo -e "${RED}❌ nginx 未运行${NC}"
fi
echo ""

# 5. 查看 nginx 错误日志
echo -e "${BLUE}5️⃣  nginx 错误日志（最近 10 行）...${NC}"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "无权限查看"
echo ""

# 6. 查看 ssr-app 日志
echo -e "${BLUE}6️⃣  ssr-app 日志（最近 20 行）...${NC}"
pm2 logs ssr-app --lines 20 --nostream 2>/dev/null || echo "无日志"
echo ""

echo -e "${BLUE}=========================================="
echo "检查完成"
echo "==========================================${NC}"
