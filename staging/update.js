const koa = require("koa");
const Router = require("koa-router");
const koaBody = require("koa-body");
const { exec } = require("child-process");

const app = new koa();
const router = new Router();

app.use(koaBody());

router.post('/deploy', async (ctx , next)=>{
    const { update } = ctx.request.body
    if (update) {
        try {
            await execShellCommand("git pull", "/var/www/node-express-blog");
            await execShellCommand("pm2 restart server/index.js", "/var/www/node-express-blog");
            ctx.status = 200
            ctx.body = {
                message: "Update successful",
                update,
            }
        } catch (error) {
            ctx.status = 500;
            ctx.body = { message: "Deployment failed", error: error.message };
        }
    }
})

app.use(router.routes()).use(router.allowedMethods());
const port = 3109
app.listen(port, () => console.log(`Server started on port${port}`));

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