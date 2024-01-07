const Koa = require("koa");
const Router = require("koa-router");
const { koaBody } = require("koa-body");
const { exec } = require("child_process");

const app = new Koa();
const router = new Router();

app.use(koaBody());

// 部署路由
router.post("/deploy", async (ctx, next) => {
    console.log(object);
  const { update } = ctx.request.body;

  if (update) {
    try {
      // 执行 git pull
      await execShellCommand("git pull", "/var/www/node-express-blog");
      // 重新启动PM2进程
      await execShellCommand(
        "pm2 restart server/index.js",
        "/var/www/node-express-blog"
      );

      ctx.status = 200;
      ctx.body = { message: "Deployment successful" };
    } catch (error) {
      ctx.status = 500;
      ctx.body = { message: "Deployment failed", error: error.message };
    }
  } else {
    ctx.status = 400;
    ctx.body = { message: "Invalid request" };
  }
});

app.use(router.routes()).use(router.allowedMethods());

const port = 3567; // 可以根据需要更改端口
app.listen(port, () => {
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
