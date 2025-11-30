#!/bin/bash

# 完整诊断脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "完整系统诊断"
echo "==========================================${NC}"
echo ""

# 1. 系统信息
echo -e "${BLUE}1️⃣  系统信息...${NC}"
echo "操作系统: $(lsb_release -d 2>/dev/null | cut -f2)"
echo "内核版本: $(uname -r)"
echo "运行时间: $(uptime -p)"
echo ""

# 2. nginx 诊断
echo -e "${BLUE}2️⃣  nginx 诊断...${NC}"
echo "nginx 版本: $(nginx -v 2>&1)"
echo "nginx 状态: $(systemctl is-active nginx)"
echo "nginx 进程:"
ps aux | grep nginx | grep -v grep | head -3
echo ""

# 3. PM2 诊断
echo -e "${BLUE}3️⃣  PM2 诊断...${NC}"
echo "PM2 版本: $(pm2 -v)"
echo "PM2 进程列表:"
pm2 list
echo ""

# 4. 端口诊断
echo -e "${BLUE}4️⃣  端口诊断...${NC}"
echo "监听的端口:"
ss -tuln | grep -E ":(80|443|3000|3111|3567)" || echo "未找到相关端口"
echo ""

# 5. 连接诊断
echo -e "${BLUE}5️⃣  连接诊断...${NC}"
echo "测试 localhost:3111..."
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
echo "HTTP 状态码: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "${GREEN}✅ 连接成功${NC}"
else
    echo -e "${RED}❌ 连接失败${NC}"
fi
echo ""

# 6. nginx 配置诊断
echo -e "${BLUE}6️⃣  nginx 配置诊断...${NC}"
echo "测试配置..."
if sudo nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}✅ 配置正确${NC}"
else
    echo -e "${RED}❌ 配置有问题${NC}"
    sudo nginx -t
fi
echo ""

# 7. 文件诊断
echo -e "${BLUE}7️⃣  文件诊断...${NC}"
echo "web-ssr 目录:"
ls -la "$PROJECT_PATH/web-ssr/" | head -10
echo ""
echo "dist 目录:"
if [ -d "$PROJECT_PATH/web-ssr/dist" ]; then
    echo -e "${GREEN}✅ dist 目录存在${NC}"
    ls -la "$PROJECT_PATH/web-ssr/dist/"
else
    echo -e "${RED}❌ dist 目录不存在${NC}"
fi
echo ""

# 8. 日志诊断
echo -e "${BLUE}8️⃣  日志诊断...${NC}"
echo "nginx 错误日志（最近 10 行）:"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "无权限查看"
echo ""
echo "ssr-app 日志（最近 20 行）:"
pm2 logs ssr-app --lines 20 --nostream 2>/dev/null || echo "无日志"
echo ""

# 9. 内存诊断
echo -e "${BLUE}9️⃣  内存诊断...${NC}"
echo "内存使用情况:"
free -h
echo ""
echo "进程内存使用:"
ps aux | grep -E "(node|nginx)" | grep -v grep | awk '{print $2, $6, $11}' | head -10
echo ""

# 10. 磁盘诊断
echo -e "${BLUE}🔟 磁盘诊断...${NC}"
echo "磁盘使用情况:"
df -h | grep -E "(^Filesystem|/$)"
echo ""

echo -e "${BLUE}=========================================="
echo "诊断完成"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}问题排查建议：${NC}"
echo ""

# 检查常见问题
if ! systemctl is-active --quiet nginx; then
    echo "❌ nginx 未运行"
    echo "   执行: sudo systemctl start nginx"
    echo ""
fi

if ! pm2 list | grep -q "ssr-app.*online"; then
    echo "❌ ssr-app 未运行"
    echo "   执行: pm2 start pm2-ecosystem.config.js --only ssr-app"
    echo ""
fi

if ! ss -tuln | grep -q ":3111"; then
    echo "❌ 端口 3111 未监听"
    echo "   执行: pm2 logs ssr-app"
    echo ""
fi

RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3111 2>&1)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
if [ "$HTTP_CODE" != "200" ] && [ "$HTTP_CODE" != "301" ] && [ "$HTTP_CODE" != "302" ]; then
    echo "❌ 本地连接失败"
    echo "   执行: bash debug-ssr.sh"
    echo ""
fi

if ! sudo nginx -t 2>&1 | grep -q "successful"; then
    echo "❌ nginx 配置有问题"
    echo "   执行: bash fix-proxy-conf.sh"
    echo ""
fi

echo "如果以上都正常，访问网站应该可以正常访问"
echo ""
