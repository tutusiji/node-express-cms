#!/bin/bash

# 诊断 502 错误脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "502 错误诊断工具"
echo "==========================================${NC}"
echo ""

# 1. 检查 PM2 进程
echo -e "${BLUE}1️⃣  检查 PM2 进程状态...${NC}"
pm2 list
echo ""

# 2. 检查 ssr-app 是否运行
echo -e "${BLUE}2️⃣  检查 ssr-app 进程...${NC}"
if pm2 list | grep -q "ssr-app"; then
    STATUS=$(pm2 list | grep "ssr-app" | awk '{print $NF}')
    if [ "$STATUS" = "online" ]; then
        echo -e "${GREEN}✅ ssr-app 进程运行中${NC}"
    else
        echo -e "${RED}❌ ssr-app 进程状态异常: $STATUS${NC}"
    fi
else
    echo -e "${RED}❌ ssr-app 进程不存在${NC}"
fi
echo ""

# 3. 检查端口监听
echo -e "${BLUE}3️⃣  检查端口监听...${NC}"
if netstat -tuln 2>/dev/null | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
elif ss -tuln 2>/dev/null | grep -q ":3111"; then
    echo -e "${GREEN}✅ 端口 3111 正在监听${NC}"
else
    echo -e "${RED}❌ 端口 3111 未监听${NC}"
fi
echo ""

# 4. 测试本地连接
echo -e "${BLUE}4️⃣  测试本地连接...${NC}"
if curl -s http://localhost:3111 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ 本地连接成功${NC}"
else
    echo -e "${RED}❌ 本地连接失败${NC}"
fi
echo ""

# 5. 查看 ssr-app 日志
echo -e "${BLUE}5️⃣  查看 ssr-app 最近日志...${NC}"
pm2 logs ssr-app --lines 30 --nostream 2>/dev/null || echo "无日志"
echo ""

# 6. 检查 nginx 配置
echo -e "${BLUE}6️⃣  检查 nginx 配置...${NC}"
if [ -f /etc/nginx/nginx.conf ]; then
    echo -e "${GREEN}✅ nginx 配置文件存在${NC}"
    echo ""
    echo "nginx 代理配置（查找 3111 端口）："
    grep -r "3111" /etc/nginx/ 2>/dev/null || echo "未找到 3111 配置"
else
    echo -e "${YELLOW}⚠️  nginx 配置文件不存在${NC}"
fi
echo ""

# 7. 检查 nginx 状态
echo -e "${BLUE}7️⃣  检查 nginx 状态...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ nginx 运行中${NC}"
else
    echo -e "${RED}❌ nginx 未运行${NC}"
fi
echo ""

# 8. 测试 nginx 配置
echo -e "${BLUE}8️⃣  测试 nginx 配置...${NC}"
if nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ nginx 配置正确${NC}"
else
    echo -e "${RED}❌ nginx 配置有问题${NC}"
    nginx -t
fi
echo ""

echo -e "${BLUE}=========================================="
echo "诊断完成"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}常见问题和解决方案：${NC}"
echo ""
echo "1️⃣  如果 ssr-app 进程不存在或状态异常："
echo "   bash restart-ssr.sh"
echo ""
echo "2️⃣  如果端口 3111 未监听："
echo "   pm2 logs ssr-app  # 查看详细错误"
echo ""
echo "3️⃣  如果本地连接失败："
echo "   cd /var/www/node-express-blog/web-ssr"
echo "   node server-ssr.js  # 直接测试启动"
echo ""
echo "4️⃣  如果 nginx 配置有问题："
echo "   sudo nginx -t  # 检查配置"
echo "   sudo systemctl reload nginx  # 重新加载"
echo ""
