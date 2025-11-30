#!/bin/bash

# 修复 proxy.conf 脚本
# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "修复 nginx proxy.conf"
echo "==========================================${NC}"
echo ""

PROXY_CONF="/etc/nginx/nginxconfig.io/proxy.conf"

# 1. 备份原文件
echo -e "${BLUE}1️⃣  备份原文件...${NC}"
if [ -f "$PROXY_CONF" ]; then
    sudo cp "$PROXY_CONF" "$PROXY_CONF.bak.$(date +%s)"
    echo -e "${GREEN}✅ 备份完成${NC}"
else
    echo -e "${YELLOW}⚠️  原文件不存在，将创建新文件${NC}"
fi
echo ""

# 2. 创建正确的 proxy.conf
echo -e "${BLUE}2️⃣  创建正确的 proxy.conf...${NC}"
sudo bash -c 'cat > /etc/nginx/nginxconfig.io/proxy.conf' << 'EOF'
# Proxy settings
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $server_name;

# Timeouts
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;

# Buffering
proxy_buffering off;
proxy_request_buffering off;
EOF

echo -e "${GREEN}✅ proxy.conf 已创建${NC}"
echo ""

# 3. 显示新配置
echo -e "${BLUE}3️⃣  新配置内容...${NC}"
sudo cat "$PROXY_CONF"
echo ""

# 4. 测试 nginx 配置
echo -e "${BLUE}4️⃣  测试 nginx 配置...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ nginx 配置正确${NC}"
else
    echo -e "${RED}❌ nginx 配置有问题${NC}"
    sudo nginx -t
    echo ""
    echo "恢复备份..."
    LATEST_BAK=$(ls -t "$PROXY_CONF.bak."* 2>/dev/null | head -1)
    if [ ! -z "$LATEST_BAK" ]; then
        sudo cp "$LATEST_BAK" "$PROXY_CONF"
        echo "已恢复"
    fi
    exit 1
fi
echo ""

# 5. 重新加载 nginx
echo -e "${BLUE}5️⃣  重新加载 nginx...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✅ nginx 已重新加载${NC}"
else
    echo -e "${RED}❌ nginx 重新加载失败${NC}"
    exit 1
fi
echo ""

# 6. 测试连接
echo -e "${BLUE}6️⃣  测试连接...${NC}"
sleep 2

echo "测试本地连接..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ 本地连接成功 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ 本地连接失败 (HTTP $HTTP_CODE)${NC}"
fi
echo ""

echo -e "${BLUE}=========================================="
echo "✅ 修复完成"
echo "==========================================${NC}"
echo ""
echo "现在访问网站应该可以正常访问"
echo ""
