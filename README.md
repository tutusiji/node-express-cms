# WebFlex CMS 内容发布引擎

## 项目信息
源码：https://github.com/tutusiji/node-express-cms

网址：https://www.tuziki.com

项目介绍：WebFlex CMS内容发布引擎——一个创新的内容管理系统，致力于简化网站、信息门户、独立站点的创建、管理和发布。它提供直观的用户界面、灵活的内容组织工具，服务端渲染以及SEO优化，以及高效的自动化部署功能。旨在为内容创作者和开发者提供流畅、高效的网站构建体验。后续将持续完成低代码搭建，可配置化的数据上报等功能。

## Web 用户端

<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/dd825e09374ee989c56c1f1a30c3583f.png'>

### Web用户端

技术栈：vue3 + typescript + vite + pinia + tailwind + sass + SSR

spa 方案在 web 目录下，ssr 方案在 web-ssr 目录下。

主要实现功能：

> 1.  web 端可配置导航菜单，即博客文章分类
> 2.  文章写入，关联博客文章分类，查询列表即博客文章列表
> 3.  文章列表分页查询
> 4.  广告 banner、其它数据接口，可自定义
> 5.  简单的响应式适配
> 6.  采用服务端渲染 SSR，有利于 SEO 优化

因为 web 打包之后的目录在 web 根目录之外（会移动到 server 中），这里的 vite 配置在 build 时的 outDir 没法清空之前已经移动过去的文件，需要单独做处理
引入`import { rmSync } from "fs" ` 用 node 的 rmSync 文件操作来删除之前构建的文件

```js
 if (command === "build") {
   // 在构建之前删除 /../server/web 目录
   const outDir = fileURLToPath(new URL("../server/web", import.meta.url));
   rmSync(outDir, { recursive: true, force: true });
 }
```

### 服务端渲染 SSR

ssr 相关操作：

```js
// 在web-ssr目录下，执行：
npm install
npm run dev    本地环境开发
npm run build  打包生产环境
npm run serve  运行生产环境
```

服务端需要配置 pm2 运行时环境：sys.config.cjs，执行 `pm2 restart sys.config.cjs`

```js
module.exports = {
  apps: [
    {
      name: 'ssr-app',
      script: 'server-ssr.js',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
```

## Admin 管理端

<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/20240114073704.png'>
<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/111111111120240114073735.png'>
<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/76ee2ebd29257e4370379212e3ed32f8.png'>

### Admin 管理端

技术栈：vue2 + elementui + webpack + sass

主要实现功能：

> 1.  创建、查询、修改、删除分类以及关联子分类
> 2.  文章、banner、其它数据增删改查
> 3.  图片上传下载
> 4.  管理员登录，管理
> 5.  登录 jwt 鉴权，路由限制
> 6.  集成chatGPT、百度千帆大模型优化精简文章摘要、优化内容显示
> 7.  站点配置信息管理、全站字体包管理

## Server 服务端

技术栈：nodejs + expressjs + MongoDB

主要实现功能：

> 1.  创建、查询、修改、删除分类、关联子分类、文章、其它数据、列表分页查询
> 2.  通用 CRUD 接口封装
> 3.  中间件封装，登录鉴权
> 4.  图片数据的 OSS 存储，文件上传下载
> 5.  根据内容文本按需动态打包出个性化精简字体包
> 6.  web 用户端和 admin 管理端打包之后的文件会自动到 server 端里面，当启动 server 服务时，会由 express 定义 web 端和 admin 端的入口路由，SSR用户端的页面由SSR的server管理

### 脚手架工具——服务端自动化部署

服务端安装 git 来拉取代码，并执行 pm2 持久化运行。这里另外封装了一个 nodejs 文件上传脚本在服务端运行，与原有的 server 服务独立开，以便迁移或者完成一些其他操作比如文件备份、log 输出等

服务端：`staging\update.js` // 接收更新指令，拉取 git 更新文件，进行备份、打包、重启 pm2 服务。这里的 update.js 也需要持久化运行`pm2 restart staging\update.js`

本地： `staging\deploy.js` // 发送更新指令，推送 git 文件（推送失败记得挂代理^\_^）

> 本地的 `deploy.js` 可以集成到 package.json 中 `"deploy": "node ../staging/deploy.js"` 从来可以简化操作，直接运行 `npm run deploy`

<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/20240112025907.png'>

SSR 更新策略：`npm run deploy -- ssr`,会自动提交本地 git 到服务端，并通知服务端进行备份、打包、重启 pm2 服务等操作.

git 代理配置

```shell
git config --global http.proxy "socks://127.0.0.1:10808"
git config --global https.proxy "socks://127.0.0.1:10808"
```

这里，需要注意两点：

1. 有时会直接在服务端做一些文件的操作，打断点，看日志，导致 git 提交时会有冲突，可以强行拉取远端文件`git reset --hard origin/master` 当然解决冲突也是可以的
2. 运行本地 nodejs 脚本通过接口发送更新指令到服务端，Node.js 在处理 HTTPS 请求时，会验证 SSL 证书的有效性。如果证书有问题（如自签名、过期或不被信任的发行机构），Node.js 默认会拒绝连接，并显示类似的错误。所以接口会调不通，如果在服务端运行`curl -X POST -H "Content-Type: application/json" -d '{"update": true}' http://localhost:3567/deploy`能够正常返回，而公网接口无法访问则多半是 SSL 证书校验不通过，或者是端口未开启或者占用。这里因为是本地发起，可以绕过校验，也可以将证书文件的 cert.pem 文件添加到 axios 的请求 httpsAgent 中去，两种方式都可以，这里为了简单就先采用绕过的方法。

#### deploy.js :

```js
const https = require('https');
......

const httpsAgent = new https.Agent({
  rejectUnauthorized: false // 忽略SSL证书验证
});
......

```

> 到这里，此项目的编译&部署就只有两个操作了：会自动提交本地 git 到服务端，并通知服务端进行备份、打包、重启 pm2 服务等操作

```shell
npm run build
npm run deploy
npm run deploy -- ssr  // 发布SSR的文件
```

### 数据备份

#### 方案一：增量备份

只备份自上次备份以来发生变化的文件。这可以通过各种备份工具来实现，如 rsync，它支持增量备份。

```js
const backupCmd = `rsync -av --delete /var/www/node-express-blog/ /var/www/backup/node-express-blog/`; 
```

这个命令将只同步变化的文件到备份目录，并删除源目录中已删除的文件。

排除大文件或目录：如果知道某些文件或目录（如 node_modules，日志文件等）不需要备份，可以在备份时排除它们。

```js
 const backupCmd = `tar --exclude='node_modules' --exclude='path/to/large/dir' -czvf /var/www/backup/node-express-blog-${timestamp}.tar.gz .`;
```

#### 方案二：git tag release 版本控制器

使用 Git 标签（tag）来标记发布（release）版本。

1. 确定版本号:
   确定一个新的版本号。通常遵循 语义化版本控制 规则，格式如 v1.0.0。

2. 创建标签:
   在 Git 仓库中创建一个新的标签并且将其推送到远程仓库。

3. 关联消息:
   给标签添加一个描述性的消息，说明这个版本的重要更改或发布说明。

```js
async function createGitTagAndPush() {
  const version = "v" + new Date().toISOString().split('T')[0]; // 生成版本号，如 v2024-01-12
  const message = "Release " + version;

  try {
    // 确保所有更改都已提交
    await execShellCommand("git add .", "/var/www/node-express-blog");
    await execShellCommand('git commit -m "Prepare for release"', "/var/www/node-express-blog");

    // 创建标签
    await execShellCommand(`git tag -a ${version} -m "${message}"`, "/var/www/node-express-blog");

    // 推送标签到远程仓库
    await execShellCommand(`git push origin ${version}`, "/var/www/node-express-blog");

    console.log(`Tagged release ${version} and pushed to remote repository.`);
  } catch (error) {
    console.error(`Failed to create or push git tag: ${error.message}`);
  }
}

createGitTagAndPush();
```

#### 回滚操作：

```js
async function rollbackToTag(tagName) {
  try {
    // 检出标签对应的代码
    await execShellCommand(`git fetch --tags`, "/var/www/node-express-blog");
    await execShellCommand(`git checkout tags/${tagName}`, "/var/www/node-express-blog");

    await execShellCommand("npm run build", "/var/www/node-express-blog");

    // 重启应用以使更改生效
    await execShellCommand("pm2 restart all", "/var/www/node-express-blog");

    console.log(`Successfully rolled back to ${tagName}.`);
  } catch (error) {
    console.error(`Failed to rollback to ${tagName}: ${error.message}`);
  }
}

// 回滚到标签 v2024-01-12
rollbackToTag('v2024-01-12');
```

关于备份与回滚的操作，还需要完善接口，将服务端的git信息提取出来返回给到用户端，用户选择回滚到指定的版本，再选择做build操作，还是直接 restart...

#### 浏览器与 Node.js 的差异

浏览器通常包含一个预置的、可信任的证书颁发机构列表，并且可能对一些常见问题（如某些类型的证书链问题）更为宽容。而 Node.js 在处理 HTTPS 请求时，默认会执行更严格的证书验证。这就是为什么在浏览器中可以正常访问某些 HTTPS 网站，而在 Node.js 中却可能会遇到证书验证错误。

### Linux 服务端软件操作:

```
1、建议用ubantu 20+,node版本保持较新
2、nginx反向代理，做服务端本地的路由映射，也可以做文件夹路径的映射
3、git，在linux服务器中更新代码
4、持久化运行node，用pm2
5、服务端安装mongodb-server
6、开发时需要注意文件上传模块的路径问题，windows与Linux不同，文件及图片可以配置OSS管理资源
```

### mongodb 操作

导出：

Linux 上`mongodump -d 数据库名`,这样导出是二进制文件，在导入时需要用 导入：`mongorestore`

windows 用户可以使用 MongoDB 的客户端程序，一键导出即可

如果只想要单个集合的数据可以这样：`mongoexport -d=node-vue-moba --collection=articles --out=articles.json`

启动 mongodb 服务`net start mongodb`

可视化工具https://www.mongodb.com/try/download/compass

数据操作工具，导入导出等https://www.mongodb.com/try/download/database-tools

二进制导入/导出工具 mongodump、mongorestore 以及 bsondump

数据导入/导出工具 mongoimport 以及 mongoexport

诊断工具 mongostat 以及 mongotop

批量插入数据

```sql
mongo
show dbs
use 数据库名
db.articles.updateMany(
  {},
  { $set: { dateDisplay: true } }
);
exit
```

### nginx 配置

测试：`nginx -t`

重启：`nginx -s reload`

启用 nginx 之后 https 的接口和链接会自动走 443 端口再转发，也就是说需要用到的端口都要额外的配置转发

```nginx
# Web spa nginx页面配置
location /deploy {
    proxy_pass            http://localhost:3567;
    proxy_set_header Host $host;
    include               nginxconfig.io/proxy.conf;
}

location / {
    proxy_pass            http://127.0.0.1:3000;
    proxy_set_header Host $host;
    include               nginxconfig.io/proxy.conf;
}
```
若启用SSR方案，则需要注意 SSR 的服务接管了web页面的入口，这里需要对前后端的路由重新定义：

```nginx
    # 部署脚本 proxy
	location /deploy {
        proxy_pass            http://localhost:3567;
        proxy_set_header Host $host;
        include               nginxconfig.io/proxy.conf;
    }

    # API服务 路由
	location ~ ^/(web|admin)/api {
	    proxy_pass http://127.0.0.1:3000;
	    proxy_set_header Host $host;
	    include nginxconfig.io/proxy.conf;
	}
	# 静态文件服务 - 管理端
	location /admin {
	    proxy_pass http://127.0.0.1:3000/admin;
	    proxy_set_header Host $host;
	    include nginxconfig.io/proxy.conf;
	}

	# 静态文件服务 - 上传文件
	location /uploads {
	    proxy_pass http://127.0.0.1:3000/uploads;
	    proxy_set_header Host $host;
	    include nginxconfig.io/proxy.conf;
	}

     # 主页面SSR服务 - server-ssr.js
	location / {
	    proxy_pass http://localhost:3111;
	    proxy_set_header Host $host;
	    include nginxconfig.io/proxy.conf;
	}
```


### pm2 指令

```shell
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

### 字体图标
使用百度Fontmin-v0.2.0 对特殊文本字符进行字体包的提取。

<img src="https://hkroom.oss-cn-shenzhen.aliyuncs.com/_20240113053919.png">

这里已经集成Fontmin插件到server端。

当用户在admin端创建新的文章内容之后，点击【字体管理】栏目，上传自己喜欢的字体包文件，任何命名都可但必须是ttf格式的，不传默认内置是腾讯体。

之后，点击【全站文本提取】按钮，全站提取目前只提取导航菜单、文章标题、logo文字、slogan、welcome的文字内容。不必在意重复的字符，生成的字体包文件会自动去重。

提取完成之后再点击【生成并部署字体包】按钮，会调用字体包的抽取工具流程。会将生成的字体包最终打包放在指定的web端assets/fonts/目录下的CustomFont.ttf文件，web端页面组件默认会调用这个字体，此时这个定制的字体包只有几十kb，相比原先的10MB已经小了很多了！
```css
@font-face {
  font-family: 'CustomFont';
  src: url('../assets/fonts/CustomFont.ttf') format('truetype');
  font-style: normal;
  font-weight: normal;
}
.welcome {
  font-family: 'CustomFont';
  padding: 10px;
}
```

<img src='https://hkroom.oss-cn-shenzhen.aliyuncs.com/f19f382fe517009f8c45c81f1a7f59a7.png'>

英文字母、常用字符集合：``
！!-<>》？?&%#@~*()+,，。.=_——`·1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM{}【】[]<>/|\$^、〉〈"'“”；:``

@lastest: ``
Tuziki的个人记录泛技术小项目关于乘风破浪激流勇进你好！欢迎来看Tuziki !No.1234567890-阅读全文 >>》？?&%#@~*()+,，。._——qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM``

### PS：一些去除工程运行时错误的方法
```shell
# Unix (Linux, macOS, Git bash 等)
export NODE_OPTIONS=--openssl-legacy-provider

# Windows
set NODE_OPTIONS=--openssl-legacy-provider

# PowerShell
$env:NODE_OPTIONS = "--openssl-legacy-provider"

# 另外一个方法是在项目的 package.json 文件里将
"start": "react-scripts start"
# 替换成：
"start": "react-scripts --openssl-legacy-provider start"
````

### TODO 
1. 优化脚手架工具，优化全站数据备份、回滚操作流程
4. 开发个性化loading组件
9. uploading上传脚本单独开发部署，舍弃OSS存储
10. 字体包操作的UI调整，补充字符做存储
11. 虚拟列表、上拉加载数据
12. 文章列表添加缩略图
13. 小项目列表添加功能性按钮，可玩指数、实现进度，UI样式调整
14. web-ssr端页面组件的数据缓存隔离优化
15. 写一份详细的项目开发文档、使用规范、部署流程