### 个人信息站点CMS开发
https://www.tuziki.com/

## Web 用户端
<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/web1fewq23f43675.png'>
技术栈：vue3 + typescript + vite + pinia + tailwind + sass

主要实现功能：
>1. web端可配置导航菜单，即博客文章分类
>2. 文章写入，关联博客文章分类，查询列表即博客文章列表
>3. 文章列表分页查询
>4. 广告banner、其它数据接口，可自定义
>5. 简单的响应式适配

## Admin 管理端
<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/admin1fwqfewqf.png'>

技术栈：vue2 + elementui + webpack + sass

主要实现功能：
>1. 创建、查询、修改、删除分类以及关联子分类
>2. 文章、banner、其它数据增删改查
>3. 图片上传下载
>4. 管理员登录，管理
>5. 登录jwt鉴权，路由限制

## Server 服务端
技术栈：nodejs + expressjs + MongoDB

主要实现功能：
>1. 创建、查询、修改、删除分类、关联子分类、文章、其它数据、列表分页查询
>2. 通用CRUD接口封装
>3. 中间件封装，登录鉴权
>4. 图片数据的OSS存储
>5. web用户端和admin管理端打包之后的文件会自动到server端里面，当启动server服务时，会由express定义web端和admin端的入口路由

服务端操作:
```
1、建议用ubantu 20+,node版本保持较新
2、nginx反向代理，做服务端本地的路由映射，也可以做文件夹路径的映射
3、git，在linux服务器中更新代码
4、持久化运行node，用pm2 
5、服务端安装mongodb-server
6、开发时需要注意文件上传模块的路径问题，windows与Linux不同，文件及图片可以配置OSS管理资源
```

### mongodb操作

导出：

Linux上``mongodump -d 数据库名``,这样导出是二进制文件，在导入时需要用 导入：``mongorestore`` 

windows用户可以使用MongoDB的客户端程序，一键导出即可

如果只想要单个集合的数据可以这样：``mongoexport -d=node-vue-moba --collection=articles --out=articles.json``

启动mongodb服务``net start mongodb``

可视化工具https://www.mongodb.com/try/download/compass

数据操作工具，导入导出等https://www.mongodb.com/try/download/database-tools

二进制导入/导出工具 mongodump、mongorestore 以及 bsondump

数据导入/导出工具 mongoimport 以及 mongoexport

诊断工具 mongostat 以及 mongotop

批量插入数据
```
mongo
show dbs
use 数据库名
db.articles.updateMany(
  {},
  { $set: { dateDisplay: true } }
);
exit
```

### nginx 指令
测试：`` nginx -t ``

重启：`` nginx -s reload ``

### pm2 指令
```
npm install pm2 -g     # 命令行安装 pm2 
pm2 start app.js -i 4  # 后台运行pm2，启动4个实例。可以把 'max' 参数传递给 start，实际进程数目依赖于cpu的核心数目
pm2 start app.js --name my-api # 命名进程
pm2 start app.js --name my-api --watch # 添加进程监视，在文件改变的时候会重新启动程序
pm2 list               # 显示所有进程状态
pm2 monit              # 监视所有进程
pm2 logs               # 显示所有进程日志
pm2 logs my-api        # 显示指定任务的日志
pm2 describe my-api    # 查看某个进程具体情况
pm2 stop all           # 停止所有进程
pm2 restart all        # 重启所有进程
pm2 reload all         # 0 秒停机重载进程 (用于 NETWORKED 进程)
pm2 stop 0             # 停止指定的进程
pm2 restart 0          # 重启指定的进程
pm2 startup ubuntu     # 产生 init 脚本，保持 pm2 开机自启
pm2 web                # 运行健壮的 computer API endpoint (http://localhost:9615)
pm2 delete 0           # 杀死指定的进程
pm2 delete all         # 杀死全部进程
```




