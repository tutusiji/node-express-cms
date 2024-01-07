const { exec } = require("child_process");
const https = require("https");
const axios = require("axios");
const path = require("path");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // 忽略SSL证书验证
});

const serverUrl = "https://www.tuziki.com/deploy"; // 服务器地址和端口
const projectRoot = path.resolve(__dirname, "../"); // node-express-blog目录

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
    console.error("检查更改时出错:", error);
    return false; // 发生错误时，假设没有更改
  }
}

async function deploy() {
  try {
    // 检查是否有本地更改
    if (await hasChanges()) {
      console.log("正在添加文件...");
      await execShellCommand("git add .");
      console.log("正在提交更改...");
      await execShellCommand('git commit -m "文件更新"');
    }

    // 执行Git推送
    console.log("正在推送到远程仓库...");
    await execShellCommand("git push");

    // 发送更新通知的POST请求
    console.log("正在发送更新通知...");
    const response = await axios.post(
      serverUrl,
      { update: true },
      { httpsAgent }
    );
    console.log("部署成功:", response.data);
  } catch (error) {
    console.error("部署失败:", error);
  }
}

deploy();
