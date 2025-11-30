#!/bin/bash

# PM2 自启管理脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

show_menu() {
    echo ""
    echo -e "${BLUE}=========================================="
    echo "PM2 开机自启管理"
    echo "==========================================${NC}"
    echo "1. 启动服务并设置开机自启"
    echo "2. 查看自启状态"
    echo "3. 取消开机自启"
    echo "4. 更新自启配置"
    echo "5. 查看 PM2 进程"
    echo "0. 退出"
    echo -e "${BLUE}==========================================${NC}"
    echo ""
}

enable_autostart() {
    echo -e "${GREEN}启动服务并设置开机自启...${NC}"
    cd "$PROJECT_PATH" || exit 1
    
    # 启动服务
    pm2 start pm2-ecosystem.config.js
    
    # 保存进程列表
    pm2 save
    
    # 设置开机自启
    pm2 startup
    
    echo ""
    echo -e "${GREEN}✅ 开机自启已启用${NC}"
    pm2 list
}

check_autostart() {
    echo -e "${GREEN}检查自启状态...${NC}"
    echo ""
    
    # 检查 PM2 进程
    echo -e "${BLUE}当前 PM2 进程：${NC}"
    pm2 list
    echo ""
    
    # 检查自启配置
    echo -e "${BLUE}自启配置信息：${NC}"
    if [ -f ~/.pm2/conf.js ]; then
        echo "✅ PM2 配置文件存在"
    else
        echo "❌ PM2 配置文件不存在"
    fi
    
    if systemctl is-enabled pm2-root &> /dev/null; then
        echo "✅ PM2 systemd 服务已启用"
    else
        echo "⚠️  PM2 systemd 服务未启用"
    fi
}

disable_autostart() {
    echo -e "${YELLOW}取消开机自启...${NC}"
    read -p "确认取消开机自启？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        pm2 unstartup
        echo -e "${GREEN}✅ 开机自启已取消${NC}"
    else
        echo "已取消操作"
    fi
}

update_autostart() {
    echo -e "${GREEN}更新自启配置...${NC}"
    cd "$PROJECT_PATH" || exit 1
    
    # 保存当前进程列表
    pm2 save
    
    echo -e "${GREEN}✅ 自启配置已更新${NC}"
    pm2 list
}

show_processes() {
    echo -e "${GREEN}PM2 进程列表：${NC}"
    pm2 list
    echo ""
    echo -e "${GREEN}进程详细信息：${NC}"
    pm2 info server 2>/dev/null || echo "server 进程不存在"
}

case "$1" in
    enable)
        enable_autostart
        ;;
    check)
        check_autostart
        ;;
    disable)
        disable_autostart
        ;;
    update)
        update_autostart
        ;;
    list)
        show_processes
        ;;
    *)
        show_menu
        read -p "请选择操作 (0-5): " choice
        case $choice in
            1) enable_autostart ;;
            2) check_autostart ;;
            3) disable_autostart ;;
            4) update_autostart ;;
            5) show_processes ;;
            0) echo "退出"; exit 0 ;;
            *) echo -e "${RED}无效选择${NC}" ;;
        esac
        ;;
esac
