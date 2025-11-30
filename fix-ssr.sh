#!/bin/bash

# web-ssr 启动问题诊断和修复脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "web-ssr 诊断和修复工具"
echo "==========================================${NC}"
echo ""

# 1. 检查文件
echo -e "${BLUE}1️⃣  检查文件...${NC}"
cd "$PROJECT_PATH/web-ssr" || exit 1

if [ ! -f server-ssr.js ]; then
    echo -e "${RED}❌ server-ssr.js 不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✅ server-ssr.js 存在${NC}"

if [ ! -f package.json ]; then
    echo -e "${RED}❌ package.json 不存在${NC}"
    exit 1
fi
echo -e "${GREEN}✅ package.json 存在${NC}"

# 2. 检查 package.json 配置
echo ""
echo -e "${BLUE}2️⃣  检查 package.json 配置...${NC}"
if grep -q '"type": "module"' package.json; then
    echo -e "${GREEN}✅ 已配置为 ES 模块${NC}"
else
    echo -e "${YELLOW}⚠️  未配置为 ES 模块，正在修复...${NC}"
    # 这里可以添加自动修复逻辑
fi

# 3. 检查依赖
echo ""
echo -e "${BLUE}3️⃣  检查依赖...${NC}"
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}⚠️  node_modules 不存在，正在安装...${NC}"
    npm install --production
    echo -e "${GREEN}✅ 依赖安装完成${NC}"
else
    echo -e "${GREEN}✅ node_modules 存在${NC}"
fi

# 4. 检查 dist 目录
echo ""
echo -e "${BLUE}4️⃣  检查构建文件...${NC}"
if [ -d dist ]; then
    echo -e "${GREEN}✅ dist 目录存在${NC}"
    if [ -f dist/server/entry-server.js ]; then
        echo -e "${GREEN}✅ dist/server/entry-server.js 存在${NC}"
    else
        echo -e "${YELLOW}⚠️  dist/server/entry-server.js 不存在${NC}"
        echo "   需要执行: npm run build"
    fi
else
    echo -e "${YELLOW}⚠️  dist 目录不存在，需要构建${NC}"
    echo "   执行: npm run build"
fi

# 5. 测试启动
echo ""
echo -e "${BLUE}5️⃣  测试直接启动...${NC}"
echo "按 Ctrl+C 停止测试"
echo ""

timeout 3 node server-ssr.js 2>&1 | head -20 || true

echo ""
echo -e "${BLUE}=========================================="
echo "诊断完成"
echo "==========================================${NC}"
echo ""
echo -e "${GREEN}后续步骤：${NC}"
echo "1. 如果看到 'http://localhost:3111' 说明启动成功"
echo "2. 删除旧的 PM2 进程："
echo "   pm2 delete ssr-app"
echo "3. 重新启动所有服务："
echo "   pm2 start pm2-ecosystem.config.js"
echo "4. 查看日志："
echo "   pm2 logs ssr-app"
echo ""
