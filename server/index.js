const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

// JWT 密钥从环境变量读取，禁止硬编码进仓库
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error("[FATAL] 缺少环境变量 JWT_SECRET，服务拒绝启动");
  process.exit(1);
}
app.set("secret", JWT_SECRET);

// CORS 白名单：通过环境变量配置，逗号分隔；无 Origin 的请求（curl/服务端调用）放行
const allowedOrigins = (
  process.env.CORS_ORIGINS || "https://www.tuziki.com,https://tuziki.com"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(null, false);
    },
  })
);
app.use(express.json());
// app.use("/", express.static(__dirname + "/web"));
app.use("/admin", express.static(__dirname + "/admin"));
app.use("/uploads", express.static(__dirname + "/uploads"));

require("./plugins/db")(app);
require("./routes/admin")(app);
require("./routes/web")(app);

app.listen(3000, () => {
  console.log("http://localhost:3000");
});
