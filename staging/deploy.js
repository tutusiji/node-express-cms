const axios = require("axios");

const serverUrl = "https://www.tuziki.com:3111/deploy"; // 服务器地址和端口

axios
  .post(serverUrl, { update: true })
  .then((response) => {
    console.log("Deployment response:", response.data);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
  });
