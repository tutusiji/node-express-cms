### 个人信息门户CMS开发
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

 因为web打包之后的目录在web根目录之外（会移动到server中），这里的vite配置在build时的outDir没法清空之前已经移动过去的文件，需要单独做处理
 引入``import { rmSync } from "fs" `` 用node的rmSync文件操作来删除之前构建的文件
 ```
  if (command === "build") {
    // 在构建之前删除 /../server/web 目录
    const outDir = fileURLToPath(new URL("../server/web", import.meta.url));
    rmSync(outDir, { recursive: true, force: true });
  }
 ```

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

### 服务端文件更新策略
服务端安装git来拉取代码，并执行pm2持久化运行，这里可以另外封装了一个nodejs文件上传脚本在服务端运行，与原有的server服务独立开，以便迁移或者完成一些其他操作比如文件备份、log输出等

服务端：`` staging\update.js ``  // 接收更新指令，拉取git更新文件，重启pm2服务
本地：  `` staging\deploy.js ``  // 发送更新指令，推送git文件
> 本地的 ``deploy.js`` 可以集成到package.json 中 `` "deploy": "node ../staging/deploy.js" `` 从来可以简化操作，直接运行 ``npm run deploy``

这里，需要注意两点：
1. 有时会直接在服务端做一些文件的操作，打断点，看日志，导致git提交时会有冲突，可以强行拉取远端文件``git reset --hard origin/master`` 当然解决冲突也是可以的
2. 运行本地nodejs脚本通过接口发送更新指令到服务端，Node.js在处理HTTPS请求时，会验证SSL证书的有效性。如果证书有问题（如自签名、过期或不被信任的发行机构），Node.js默认会拒绝连接，并显示类似的错误。所以接口会调不通，如果在服务端运行``curl -X POST -H "Content-Type: application/json" -d '{"update": true}' http://localhost:3567/deploy``能够正常返回，而公网接口无法访问则多半是SSL证书校验不通过，这里因为是本地发起，可以绕过校验，也可以将证书文件的cert.pem文件添加到axios的请求httpsAgent中去，两种方式都可以，这里为了简单就先采用绕过的方法
```
const https = require('https');
............

const httpsAgent = new https.Agent({  
  rejectUnauthorized: false // 忽略SSL证书验证
});
............

```
#### 浏览器与Node.js的差异
浏览器通常包含一个预置的、可信任的证书颁发机构列表，并且可能对一些常见问题（如某些类型的证书链问题）更为宽容。而Node.js在处理HTTPS请求时，默认会执行更严格的证书验证。这就是为什么在浏览器中可以正常访问某些HTTPS网站，而在Node.js中却可能会遇到证书验证错误。

### 服务端操作:
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




