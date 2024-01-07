const axios = require("axios");

const serverUrl = "http://119.23.228.99:3567/deploy"; // 服务器地址和端口

const deploy = async () => {
  try {
    const response = await axios.post(
      serverUrl,
      {
        update: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Deployment local response:", response);
  } catch (error) {
    console.error("Deployment local failed:", error.message);
  }
};

deploy();
