#!/bin/bash

# nginx 配置修复脚本
# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "nginx 配置修复"
echo "==========================================${NC}"
echo ""

# 1. 检查 nginx 配置文件位置
echo -e "${BLUE}1️⃣  查找 nginx 配置文件...${NC}"

CONFIG_FILE=""
if [ -f /etc/nginx/sites-enabled/default ]; then
    CONFIG_FILE="/etc/nginx/sites-enabled/default"
    echo -e "${GREEN}✅ 找到: $CONFIG_FILE${NC}"
elif [ -f /etc/nginx/conf.d/default.conf ]; then
    CONFIG_FILE="/etc/nginx/conf.d/default.conf"
    echo -e "${GREEN}✅ 找到: $CONFIG_FILE${NC}"
elif [ -f /etc/nginx/nginx.conf ]; then
    CONFIG_FILE="/etc/nginx/nginx.conf"
    echo -e "${GREEN}✅ 找到: $CONFIG_FILE${NC}"
else
    echo -e "${RED}❌ 未找到 nginx 配置文件${NC}"
    exit 1
fi
echo ""

# 2. 备份原配置
echo -e "${BLUE}2️⃣  备份原配置...${NC}"
sudo cp "$CONFIG_FILE" "$CONFIG_FILE.bak.$(date +%s)"
echo -e "${GREEN}✅ 备份完成${NC}"
echo ""

# 3. 检查是否已有 3111 配置
echo -e "${BLUE}3️⃣  检查现有配置...${NC}"
if grep -q "3111" "$CONFIG_FILE"; then
    echo -e "${YELLOW}⚠️  已存在 3111 配置${NC}"
    echo "现有配置："
    grep -A 10 "3111" "$CONFIG_FILE"
else
    echo -e "${YELLOW}⚠️  未找到 3111 配置，需要添加${NC}"
fi
echo ""

# 4. 创建新配置
echo -e "${BLUE}4️⃣  创建新的 nginx 配置...${NC}"

NEW_CONFIG='server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # SSR 应用
    location / {
        proxy_pass http://localhost:3111;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }
}'

# 5. 更新配置文件
echo -e "${BLUE}5️⃣  更新 nginx 配置...${NC}"

if [ "$CONFIG_FILE" = "/etc/nginx/sites-enabled/default" ]; then
    # 替换整个 server 块
    sudo bash -c "cat > $CONFIG_FILE" << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # SSR 应用
    location / {
        proxy_pass http://localhost:3111;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF
else
    sudo bash -c "cat > $CONFIG_FILE" << 'EOF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # SSR 应用
    location / {
        proxy_pass http://localhost:3111;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
        
        # 缓冲设置
        proxy_buffering off;
        proxy_request_buffering off;
    }
}
EOF
fi

echo -e "${GREEN}✅ 配置已更新${NC}"
echo ""

# 6. 测试 nginx 配置
echo -e "${BLUE}6️⃣  测试 nginx 配置...${NC}"
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ nginx 配置正确${NC}"
else
    echo -e "${RED}❌ nginx 配置有问题${NC}"
    sudo nginx -t
    echo ""
    echo "恢复备份..."
    sudo cp "$CONFIG_FILE.bak.$(ls -t $CONFIG_FILE.bak.* 2>/dev/null | head -1 | sed 's/.*\.//')" "$CONFIG_FILE"
    exit 1
fi
echo ""

# 7. 重新加载 nginx
echo -e "${BLUE}7️⃣  重新加载 nginx...${NC}"
if sudo systemctl reload nginx; then
    echo -e "${GREEN}✅ nginx 已重新加载${NC}"
else
    echo -e "${RED}❌ nginx 重新加载失败${NC}"
    exit 1
fi
echo ""

# 8. 验证
echo -e "${BLUE}8️⃣  验证配置...${NC}"
echo "查看更新后的配置："
sudo cat "$CONFIG_FILE"
echo ""

echo -e "${BLUE}=========================================="
echo "✅ 配置修复完成"
echo "==========================================${NC}"
echo ""
echo "现在访问网站应该可以正常访问"
echo ""
