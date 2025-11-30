#!/bin/bash

# 检查和修复 ssr 构建的脚本
PROJECT_PATH="/var/www/node-express-blog/web-ssr"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "SSR 构建检查"
echo "==========================================${NC}"
echo ""

cd "$PROJECT_PATH" || exit 1

# 1. 检查 dist 目录
echo -e "${BLUE}1️⃣  检查 dist 目录...${NC}"
if [ -d dist ]; then
    echo -e "${GREEN}✅ dist 目录存在${NC}"
    echo ""
    echo "dist 目录结构："
    ls -la dist/
    echo ""
    
    # 检查关键文件
    echo "关键文件检查："
    [ -d dist/client ] && echo "  ✅ dist/client 存在" || echo "  ❌ dist/client 不存在"
    [ -d dist/server ] && echo "  ✅ dist/server 存在" || echo "  ❌ dist/server 不存在"
    [ -f dist/client/index.html ] && echo "  ✅ dist/client/index.html 存在" || echo "  ❌ dist/client/index.html 不存在"
    [ -f dist/server/entry-server.js ] && echo "  ✅ dist/server/entry-server.js 存在" || echo "  ❌ dist/server/entry-server.js 不存在"
    [ -f dist/client/ssr-manifest.json ] && echo "  ✅ dist/client/ssr-manifest.json 存在" || echo "  ❌ dist/client/ssr-manifest.json 不存在"
else
    echo -e "${RED}❌ dist 目录不存在${NC}"
    echo ""
    echo -e "${YELLOW}需要构建项目...${NC}"
    echo ""
    
    # 2. 检查依赖
    echo -e "${BLUE}2️⃣  检查依赖...${NC}"
    if [ ! -d node_modules ]; then
        echo "⚠️  node_modules 不存在，正在安装..."
        npm install
        echo -e "${GREEN}✅ 依赖安装完成${NC}"
    else
        echo -e "${GREEN}✅ node_modules 存在${NC}"
    fi
    echo ""
    
    # 3. 构建项目
    echo -e "${BLUE}3️⃣  构建项目...${NC}"
    echo "执行: npm run build"
    npm run build
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 构建成功${NC}"
    else
        echo -e "${RED}❌ 构建失败${NC}"
        exit 1
    fi
    echo ""
    
    # 4. 验证构建结果
    echo -e "${BLUE}4️⃣  验证构建结果...${NC}"
    if [ -d dist ]; then
        echo -e "${GREEN}✅ dist 目录已创建${NC}"
        echo ""
        echo "dist 目录结构："
        ls -la dist/
    else
        echo -e "${RED}❌ dist 目录创建失败${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}=========================================="
echo "检查完成"
echo "==========================================${NC}"
echo ""
echo "现在可以启动 ssr-app："
echo "  pm2 start pm2-ecosystem.config.js --only ssr-app"
echo ""
