#!/bin/bash

# PM2 管理脚本
PROJECT_PATH="/var/www/node-express-blog"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

show_menu() {
    echo ""
    echo "=========================================="
    echo "PM2 项目管理工具"
    echo "=========================================="
    echo "1. 启动所有服务"
    echo "2. 停止所有服务"
    echo "3. 重启所有服务"
    echo "4. 查看进程列表"
    echo "5. 查看所有日志"
    echo "6. 查看 server 日志"
    echo "7. 查看 server-gpt 日志"
    echo "8. 查看 ssr-app 日志"
    echo "9. 监控资源使用"
    echo "10. 删除所有服务"
    echo "11. 设置开机自启"
    echo "12. 保存进程列表"
    echo "0. 退出"
    echo "=========================================="
    echo ""
}

case "$1" in
    start)
        echo -e "${GREEN}启动所有服务...${NC}"
        cd "$PROJECT_PATH"
        pm2 start pm2-ecosystem.config.js
        pm2 list
        ;;
    stop)
        echo -e "${YELLOW}停止所有服务...${NC}"
        pm2 stop all
        pm2 list
        ;;
    restart)
        echo -e "${GREEN}重启所有服务...${NC}"
        pm2 restart all
        pm2 list
        ;;
    list)
        echo -e "${GREEN}进程列表：${NC}"
        pm2 list
        ;;
    logs)
        echo -e "${GREEN}查看所有日志...${NC}"
        pm2 logs
        ;;
    logs-server)
        echo -e "${GREEN}查看 server 日志...${NC}"
        pm2 logs server
        ;;
    logs-gpt)
        echo -e "${GREEN}查看 server-gpt 日志...${NC}"
        pm2 logs server-gpt
        ;;
    logs-ssr)
        echo -e "${GREEN}查看 ssr-app 日志...${NC}"
        pm2 logs ssr-app
        ;;
    monit)
        echo -e "${GREEN}监控资源使用...${NC}"
        pm2 monit
        ;;
    delete)
        echo -e "${RED}删除所有服务...${NC}"
        read -p "确认删除所有服务？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            pm2 delete all
            echo -e "${GREEN}已删除所有服务${NC}"
        fi
        ;;
    startup)
        echo -e "${GREEN}设置开机自启...${NC}"
        pm2 startup
        pm2 save
        echo -e "${GREEN}开机自启已设置${NC}"
        ;;
    save)
        echo -e "${GREEN}保存进程列表...${NC}"
        pm2 save
        echo -e "${GREEN}进程列表已保存${NC}"
        ;;
    *)
        show_menu
        read -p "请选择操作 (0-12): " choice
        case $choice in
            1) bash "$0" start ;;
            2) bash "$0" stop ;;
            3) bash "$0" restart ;;
            4) bash "$0" list ;;
            5) bash "$0" logs ;;
            6) bash "$0" logs-server ;;
            7) bash "$0" logs-gpt ;;
            8) bash "$0" logs-ssr ;;
            9) bash "$0" monit ;;
            10) bash "$0" delete ;;
            11) bash "$0" startup ;;
            12) bash "$0" save ;;
            0) echo "退出"; exit 0 ;;
            *) echo -e "${RED}无效选择${NC}" ;;
        esac
        ;;
esac
