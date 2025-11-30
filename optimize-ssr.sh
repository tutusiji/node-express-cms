#!/bin/bash

# SSR 性能优化脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=========================================="
echo "SSR 性能优化"
echo "==========================================${NC}"
echo ""

# 1. 检查当前状态
echo -e "${BLUE}1️⃣  检查当前状态...${NC}"
pm2 list | grep ssr-app
echo ""

# 2. 检查内存使用
echo -e "${BLUE}2️⃣  检查内存使用...${NC}"
PID=$(pm2 list | grep ssr-app | awk '{print $NF}' | head -1)
if [ ! -z "$PID" ]; then
    ps aux | grep $PID | grep -v grep
fi
echo ""

# 3. 停止 ssr-app
echo -e "${BLUE}3️⃣  停止 ssr-app...${NC}"
pm2 stop ssr-app
sleep 2
echo -e "${GREEN}✅ 已停止${NC}"
echo ""

# 4. 更新 PM2 配置，添加内存限制
echo -e "${BLUE}4️⃣  更新 PM2 配置...${NC}"
cat > "$PROJECT_PATH/pm2-ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: 'server',
      script: './server/index.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/server-error.log',
      out_file: './logs/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['server'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '500M'
    },
    {
      name: 'server-gpt',
      script: './server-gpt/chatgpt.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production'
      },
      error_file: './logs/server-gpt-error.log',
      out_file: './logs/server-gpt-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['server-gpt'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '300M'
    },
    {
      name: 'ssr-app',
      script: './web-ssr/server-ssr.js',
      cwd: '/var/www/node-express-blog',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        NODE_OPTIONS: '--max-old-space-size=256'
      },
      error_file: './logs/ssr-app-error.log',
      out_file: './logs/ssr-app-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      watch: ['web-ssr'],
      ignore_watch: ['node_modules', 'logs'],
      max_memory_restart: '300M',
      kill_timeout: 5000
    }
  ]
};
EOF
echo -e "${GREEN}✅ 配置已更新${NC}"
echo ""

# 5. 删除旧进程
echo -e "${BLUE}5️⃣  删除旧进程...${NC}"
pm2 delete ssr-app
sleep 1
echo -e "${GREEN}✅ 已删除${NC}"
echo ""

# 6. 启动新进程
echo -e "${BLUE}6️⃣  启动新进程...${NC}"
cd "$PROJECT_PATH"
pm2 start pm2-ecosystem.config.js --only ssr-app
sleep 3
echo -e "${GREEN}✅ 已启动${NC}"
echo ""

# 7. 检查状态
echo -e "${BLUE}7️⃣  检查状态...${NC}"
pm2 list | grep ssr-app
echo ""

# 8. 监控内存
echo -e "${BLUE}8️⃣  监控内存（10 秒）...${NC}"
for i in {1..5}; do
    echo "检查 $i/5..."
    pm2 list | grep ssr-app | awk '{print "  内存: " $NF}'
    sleep 2
done
echo ""

echo -e "${BLUE}=========================================="
echo "✅ 优化完成"
echo "==========================================${NC}"
echo ""
echo "优化内容："
echo "  • 添加内存限制: 300M"
echo "  • 设置 Node.js 堆大小: 256M"
echo "  • 添加 kill_timeout: 5000ms"
echo ""
echo "现在访问网站测试"
echo ""
