const path = require("path");
const { exec } = require("child_process");
const https = require("https");
const axios = require("axios");
const chalk = require("chalk");
const ora = require("ora");
const args = process.argv.slice(2); // 获取所有命令行参数，忽略前两个参数(node 和 script 路径)
const isSSR = args.includes("ssr"); // 检查是否传递了 ssr 参数
const { TuziKey } = require("./secretKeyLocal.js");
// const { TuziKey } = require("./secretKey.js");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // 忽略SSL证书验证
});

const serverUrl = "https://www.tuziki.com/deploy"; // 服务器地址和端口
const projectRoot = path.resolve(__dirname, "../"); // node-express-blog目录

// 在execShellCommand函数中，使用了Node.js的exec函数来执行Shell命令。exec函数在命令完成时调用其回调函数。在这个函数中，通过返回一个Promise并在命令成功执行（或出现错误）时解析（或拒绝）它，我们可以确保命令的顺序性和异步执行的正确性
function execShellCommand(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, { cwd: projectRoot }, (error, stdout, stderr) => {
      if (error) {
        console.warn(error);
        reject(error);
      }
      resolve(stdout ? stdout : stderr);
    });
  });
}

async function hasChanges() {
  try {
    const status = await execShellCommand("git status --porcelain");
    return status !== ""; // 如果有更改，返回true
  } catch (error) {
    console.log(chalk.red(`检查更改时出错${error}`));
    return false; // 发生错误时，假设没有更改
  }
}

async function deploy() {
  const spinner = ora(chalk.yellow(`努力搬运中...`)); // 菊花loading开始，推送开始
  try {
    // 检查是否有本地更改
    spinner.start();
    if (await hasChanges()) {
      console.log(chalk.magenta(`正在添加文件...`));
      await execShellCommand("git add .");
      console.log(chalk.cyan(`正在提交更改`));
      const commitMessage =
        args.length > 1 ? args.slice(1).join(" ") : "文件更新";
      await execShellCommand(`git commit -m "${commitMessage}"`);
    }

    // 执行Git推送
    console.log(chalk.blueBright(`正在推送到远程仓库...`));
    await execShellCommand("git push");

    // 发送更新通知的POST请求
    console.log(chalk.redBright(`已通知服务端正在拼命操作...`));
    const notifData = { updateWeb: true };
    if (isSSR) {
      notifData.updateSSR = true;
    }
    const response = await axios.post(serverUrl, notifData, {
      httpsAgent,
      headers: {
        "x-deploy-key": TuziKey, // 使用与服务端相同的密钥
      },
    });
    console.log(chalk.green(`服务端返回：`, response.data.message));
    spinner.succeed(
      chalk.greenBright(`😯部署成功 Happy🌹 🌹 🌹 🌹 🌹 🌹 🌹 🌹`)
    );
    spinner.stop();
  } catch (error) {
    console.log(chalk.red(`部署失败：${error}`));
    spinner.stop();
  }
}

deploy();
