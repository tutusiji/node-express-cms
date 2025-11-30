# 502 Bad Gateway 故障排查指南

## 快速诊断

```bash
# 1. 运行诊断脚本
bash diagnose-502.sh

# 2. 如果诊断显示问题，运行修复脚本
bash fix-502.sh

# 3. 检查 nginx 配置
bash check-nginx.sh
```

## 常见原因和解决方案

### 1️⃣ ssr-app 进程未运行

**症状**：
- `pm2 list` 中看不到 ssr-app 或状态为 stopped/errored

**解决方案**：
```bash
# 查看错误日志
pm2 logs ssr-app

# 删除并重新启动
pm2 delete ssr-app
pm2 start pm2-ecosystem.config.js --only ssr-app

# 等待 3 秒后检查
sleep 3
pm2 list
```

### 2️⃣ 端口 3111 未监听

**症状**：
- `netstat -tuln | grep 3111` 或 `ss -tuln | grep 3111` 无输出

**解决方案**：
```bash
# 查看详细错误
pm2 logs ssr-app --lines 100

# 检查依赖是否完整
cd /var/www/node-express-blog/web-ssr
npm install --production

# 检查构建文件
ls -la dist/

# 如果 dist 不存在，需要构建
npm run build

# 重新启动
pm2 restart ssr-app
```

### 3️⃣ 本地连接失败

**症状**：
- `curl http://localhost:3111` 返回错误

**解决方案**：
```bash
# 直接测试启动
cd /var/www/node-express-blog/web-ssr
node server-ssr.js

# 查看是否有错误信息
# 按 Ctrl+C 停止

# 检查日志
pm2 logs ssr-app --lines 50
```

### 4️⃣ nginx 配置问题

**症状**：
- nginx 配置中没有 3111 端口的代理配置

**解决方案**：

#### 检查现有配置
```bash
# 查找 nginx 配置文件
grep -r "3111" /etc/nginx/

# 查看 nginx 配置
cat /etc/nginx/sites-enabled/default
# 或
cat /etc/nginx/conf.d/default.conf
```

#### 添加反向代理配置

编辑 `/etc/nginx/sites-available/default` 或 `/etc/nginx/conf.d/default.conf`：

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    # SSR 应用
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
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

#### 重新加载 nginx
```bash
# 测试配置
sudo nginx -t

# 重新加载
sudo systemctl reload nginx

# 或重启
sudo systemctl restart nginx
```

### 5️⃣ 其他后端服务问题

**症状**：
- ssr-app 运行但返回 502

**解决方案**：
```bash
# 检查 server 服务是否运行
pm2 list | grep server

# 如果 server 未运行，启动它
pm2 start pm2-ecosystem.config.js --only server

# 查看 server 日志
pm2 logs server

# 检查 server 依赖的数据库连接
# 查看 server/index.js 中的数据库配置
```

## 完整故障排查流程

### 第一步：检查进程
```bash
pm2 list
```

**预期结果**：
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ id │ name      │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 0  │ server    │ default     │ 1.0.0   │ cluster │ 12345    │ 1m     │ 0    │
│ 1  │ server-gpt│ default     │ 1.0.0   │ fork    │ 12346    │ 1m     │ 0    │
│ 2  │ ssr-app   │ default     │ 2.1.1   │ fork    │ 12347    │ 1m     │ 0    │
└─────────────────────────────────────────────────────────────────────────────┘
```

如果 ssr-app 状态不是 `online`，执行：
```bash
pm2 logs ssr-app
```

### 第二步：检查端口
```bash
netstat -tuln | grep 3111
# 或
ss -tuln | grep 3111
```

**预期结果**：
```
tcp        0      0 0.0.0.0:3111            0.0.0.0:*               LISTEN
```

### 第三步：测试本地连接
```bash
curl -v http://localhost:3111
```

**预期结果**：
- 返回 HTML 内容或重定向

### 第四步：检查 nginx
```bash
sudo nginx -t
```

**预期结果**：
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 第五步：查看 nginx 日志
```bash
# 错误日志
sudo tail -f /var/log/nginx/error.log

# 访问日志
sudo tail -f /var/log/nginx/access.log
```

## 快速修复命令

```bash
# 一键修复
bash fix-502.sh

# 或手动执行
pm2 delete ssr-app
pm2 start pm2-ecosystem.config.js --only ssr-app
sleep 3
sudo systemctl reload nginx
```

## 监控和预防

### 实时监控
```bash
# 监控进程
pm2 monit

# 查看日志
pm2 logs ssr-app --follow
```

### 定期检查
```bash
# 每小时检查一次
(crontab -l 2>/dev/null; echo "0 * * * * bash /var/www/node-express-blog/diagnose-502.sh >> /var/log/ssr-check.log 2>&1") | crontab -
```

## 获取帮助

如果问题仍未解决，收集以下信息：

```bash
# 1. 进程状态
pm2 list > /tmp/pm2-status.txt

# 2. 日志
pm2 logs ssr-app --lines 100 > /tmp/ssr-logs.txt

# 3. 端口状态
netstat -tuln | grep 3111 > /tmp/port-status.txt

# 4. nginx 配置
cat /etc/nginx/sites-enabled/default > /tmp/nginx-config.txt

# 5. nginx 错误日志
sudo tail -100 /var/log/nginx/error.log > /tmp/nginx-error.txt
```

然后查看这些文件找出问题。
