const https = require("https");
const axios = require("axios");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false, // 忽略SSL证书验证
});

const serverUrl = "https://www.tuziki.com/deploy"; // 服务器地址和端口

const deploy = async () => {
  try {
    const response = await axios.post(
      serverUrl,
      {
        update: true,
      },
      { httpsAgent },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Deployment local response:", response.data);
  } catch (error) {
    console.error("Deployment local failed:", error.message);
  }
};

deploy();
