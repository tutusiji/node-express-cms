const express = require("express");
const OpenAI = require("openai");
const cors = require("cors");
const app = express();
const port = 3527;

// 引入 OpenAI API 密钥
const { OPENAI_API_KEY } = require("./openaiKeyLocal.js");

// 域名检查中间件
// 配置 CORS
const corsOptions = {
  origin: [
    "http://localhost:8080",
    "http://localhost:3527",
    "https://www.tuziki.com",
  ],
};
// 使用 CORS 中间件
app.use(cors(corsOptions));
// 设置以解析 JSON 请求体
app.use(express.json());

// 创建 OpenAI 实例
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: "org-XbGS1lae8b4kXum6hfc2ezg8",
});
// 文章摘要接口，仅允许来自指定域名的请求
app.post("/:id/summary", async (req, res) => {
  try {
    const articleContent = req.body.summaryText;

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // 选择合适的模型
      messages: [
        {
          role: "user",
          content: `Summarize the following article:\n\n${articleContent}`,
        },
      ],
      max_tokens: 200, // 设置生成摘要的最大长度
    });
    for await (const chunk of stream) {
      process.stdout.write(chunk.choices[0]?.delta?.content || "");
    }

    const summary = gptResponse.data.choices[0].text.trim();

    res.json({ summary });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error generating article summary");
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
