#!/bin/bash

# nginx 配置检查脚本
# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "nginx 配置检查"
echo "==========================================${NC}"
echo ""

# 1. 检查 nginx 是否安装
echo -e "${BLUE}1️⃣  检查 nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${GREEN}✅ nginx 已安装${NC}"
    nginx -v
else
    echo -e "${RED}❌ nginx 未安装${NC}"
    exit 1
fi
echo ""

# 2. 检查 nginx 状态
echo -e "${BLUE}2️⃣  检查 nginx 状态...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx 运行中${NC}"
else
    echo -e "${RED}❌ nginx 未运行${NC}"
    echo "启动 nginx: sudo systemctl start nginx"
fi
echo ""

# 3. 检查 nginx 配置文件
echo -e "${BLUE}3️⃣  检查 nginx 配置文件...${NC}"
if [ -f /etc/nginx/nginx.conf ]; then
    echo -e "${GREEN}✅ /etc/nginx/nginx.conf 存在${NC}"
else
    echo -e "${RED}❌ /etc/nginx/nginx.conf 不存在${NC}"
fi
echo ""

# 4. 查找 3111 端口配置
echo -e "${BLUE}4️⃣  查找 3111 端口配置...${NC}"
FOUND=0
for file in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*; do
    if [ -f "$file" ] && grep -q "3111" "$file"; then
        echo -e "${GREEN}✅ 找到配置文件: $file${NC}"
        echo ""
        echo "配置内容："
        grep -A 5 -B 5 "3111" "$file"
        FOUND=1
    fi
done

if [ $FOUND -eq 0 ]; then
    echo -e "${YELLOW}⚠️  未找到 3111 端口配置${NC}"
    echo ""
    echo "需要配置 nginx 反向代理，示例配置："
    echo ""
    cat << 'EOF'
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3111;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
fi
echo ""

# 5. 测试 nginx 配置
echo -e "${BLUE}5️⃣  测试 nginx 配置...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ nginx 配置正确${NC}"
else
    echo -e "${RED}❌ nginx 配置有问题${NC}"
    nginx -t
fi
echo ""

# 6. 检查端口 3111
echo -e "${BLUE}6️⃣  检查端口 3111...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3111" || ss -tuln 2>/dev/null | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 3111 未监听${NC}"
    echo "需要启动 ssr-app: pm2 start pm2-ecosystem.config.js --only ssr-app"
fi
echo ""

# 7. 测试本地连接
echo -e "${BLUE}7️⃣  测试本地连接...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1 | tail -1)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "301" ] || [ "$RESPONSE" = "302" ]; then
    echo -e "${GREEN}✅ 本地连接成功 (HTTP $RESPONSE)${NC}"
else
    echo -e "${RED}❌ 本地连接失败 (HTTP $RESPONSE)${NC}"
fi
echo ""

echo -e "${BLUE}=========================================="
echo "检查完成"
echo "==========================================${NC}"
echo ""
