const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const { exec } = require("child_process");

const app = new Koa();
const router = new Router();

app.use(koaBody());

// 部署路由
router.post("/deploy", async (ctx, next) => {
  const { updateWeb, updateSSR } = ctx.request.body;
  if (updateWeb) {
    try {
      // 创建备份
      // const timestamp = new Date().toISOString().replace(/[-:.]/g, "");
      // const backupCmd = `tar -czvf /var/www/backup/node-express-blog-${timestamp}.tar.gz .`;
      // await execShellCommand(backupCmd, "/var/www/node-express-blog");
      // console.log("Backup created successfully.");

      // 执行 git pull
      await execShellCommand("git pull", "/var/www/node-express-blog");

      // 判断是否为ssr的操作
      if (updateSSR) {
        await execShellCommand(
          "npm run build",
          "/var/www/node-express-blog/web-ssr"
        );
        await execShellCommand(
          "pm2 restart sys.config.cjs",
          "/var/www/node-express-blog/web-ssr"
        );
      }else{
        // 重新启动服务端的PM2进程
        await execShellCommand(
          "pm2 restart sys.config.cjs",
          "/var/www/node-express-blog/server"
        );
      }

      ctx.status = 200;
      ctx.body = { message: "Server update and restart successful!" };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: "server failed", error: error.message };
    }
  } else {
    ctx.status = 400;
    ctx.body = { message: "Invalid request" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const port = 3567; // 可以根据需要更改端口
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on port ${port}-kkk`);
});

function execShellCommand(cmd, cwd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd }, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error}`);
        return reject(error);
      }
      console.log(`Output: ${stdout}`);
      resolve(stdout);
    });
  });
}
