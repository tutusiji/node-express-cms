#!/bin/bash

# 检查 nginx proxy 配置脚本
# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "nginx proxy 配置检查"
echo "==========================================${NC}"
echo ""

# 1. 检查 proxy.conf 文件
echo -e "${BLUE}1️⃣  检查 proxy.conf 文件...${NC}"
PROXY_CONF="/etc/nginx/nginxconfig.io/proxy.conf"

if [ -f "$PROXY_CONF" ]; then
    echo -e "${GREEN}✅ 文件存在: $PROXY_CONF${NC}"
    echo ""
    echo "文件内容："
    cat "$PROXY_CONF"
else
    echo -e "${RED}❌ 文件不存在: $PROXY_CONF${NC}"
fi
echo ""

# 2. 检查 security.conf
echo -e "${BLUE}2️⃣  检查 security.conf 文件...${NC}"
SECURITY_CONF="/etc/nginx/nginxconfig.io/security.conf"

if [ -f "$SECURITY_CONF" ]; then
    echo -e "${GREEN}✅ 文件存在: $SECURITY_CONF${NC}"
    echo ""
    echo "文件内容："
    cat "$SECURITY_CONF"
else
    echo -e "${RED}❌ 文件不存在: $SECURITY_CONF${NC}"
fi
echo ""

# 3. 检查 general.conf
echo -e "${BLUE}3️⃣  检查 general.conf 文件...${NC}"
GENERAL_CONF="/etc/nginx/nginxconfig.io/general.conf"

if [ -f "$GENERAL_CONF" ]; then
    echo -e "${GREEN}✅ 文件存在: $GENERAL_CONF${NC}"
    echo ""
    echo "文件内容（前 50 行）："
    head -50 "$GENERAL_CONF"
else
    echo -e "${RED}❌ 文件不存在: $GENERAL_CONF${NC}"
fi
echo ""

# 4. 测试本地连接
echo -e "${BLUE}4️⃣  测试本地连接...${NC}"
echo "测试 http://localhost:3111"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | head -n -1)

echo "HTTP 状态码: $HTTP_CODE"
if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ 本地连接成功${NC}"
else
    echo -e "${RED}❌ 本地连接失败${NC}"
    echo "响应内容："
    echo "$BODY" | head -20
fi
echo ""

# 5. 测试 nginx 配置
echo -e "${BLUE}5️⃣  测试 nginx 配置...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ nginx 配置正确${NC}"
else
    echo -e "${RED}❌ nginx 配置有问题${NC}"
    sudo nginx -t
fi
echo ""

# 6. 查看 nginx 错误日志
echo -e "${BLUE}6️⃣  nginx 错误日志（最近 20 行）...${NC}"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "无权限查看"
echo ""

# 7. 查看 nginx 访问日志
echo -e "${BLUE}7️⃣  nginx 访问日志（最近 10 行）...${NC}"
sudo tail -10 /var/log/nginx/access.log 2>/dev/null || echo "无权限查看"
echo ""

echo -e "${BLUE}=========================================="
echo "检查完成"
echo "==========================================${NC}"
