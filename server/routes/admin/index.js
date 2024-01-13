module.exports = (app) => {
  const express = require("express");
  const jwt = require("jsonwebtoken");
  const assert = require("http-assert");
  const request = require("request");
  // const OpenAI = require("openai");
  const AdminUser = require("../../models/AdminUser");

  const path = require("path");
  const router = express.Router({
    mergeParams: true, // 合并参数
  });

  // 登录校验中间件
  const authMiddleware = require("../../middleware/auth");
  // 资源中间件
  const resourceMiddleware = require("../../middleware/resource");

  // 创建分类
  router.post("/", async (req, res) => {
    const model = await req.Model.create(req.body);
    res.send(model);
  });

  // 编辑更新 分类
  router.put("/:id", async (req, res) => {
    // findByIdAndUpdate; 查找相关id
    const model = await req.Model.findByIdAndUpdate(req.params.id, req.body);
    res.send(model);
  });

  // 删除分类
  router.delete("/:id", async (req, res) => {
    await req.Model.findByIdAndDelete(req.params.id, req.body);
    res.send({
      success: true,
    });
  });

  // 分类列表
  router.get("/", async (req, res) => {
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    const items = await req.Model.find().setOptions(queryOptions).limit(100);
    res.send(items);
  });

  // 带分页的文章 articles 列表
  router.post("/list", async (req, res) => {
    try {
      // 从请求体中获取分页参数
      const { page, limit } = req.body;

      // 转换分页参数为整数，并提供默认值
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;

      // 计算跳过的文档数量
      const skip = (pageNumber - 1) * limitNumber;

      const queryOptions = {};
      if (req.Model.modelName === "Category") {
        queryOptions.populate = "parent";
      }

      // 查询指定范围的文档并应用其他选项
      const items = await req.Model.find()
        .setOptions(queryOptions)
        .sort({ date: -1 }) // 按照日期降序排序
        .skip(skip)
        .limit(limitNumber);

      // 获取总条目数
      const totalCount = await req.Model.countDocuments();

      // 返回查询结果和分页信息
      res.send({
        list: items,
        currentPage: pageNumber,
        limit: limitNumber,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // 分类详情
  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });

  // 文章摘要生成
  // 配置 OpenAI
  // const { OPENAI_API_KEY } = require("./openaiKeyLocal.js");
  // const openai = new OpenAI({
  //   apiKey: OPENAI_API_KEY, // This is the default and can be omitted
  // });
  // router.post("/:id/summary", async (req, res) => {
  //   try {
  //     const articleContent = req.params.summaryText;

  //     const gptResponse = await openai.chat.completions.create({
  //       model: "text-davinci-003", // 或者选择适合您需求的模型
  //       prompt: `Summarize the following article: ${articleContent}`,
  //       max_tokens: 200, // 设置生成摘要的最大长度
  //     });

  //     const summary = gptResponse.data.choices[0].text.trim();

  //     res.json({ summary });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).send("Error generating article summary");
  //   }
  // });

  // baidu ai
  const { AK, SK } = require("./openaiKeyLocal.js");
  function getAccessToken() {
    let options = {
      method: "POST",
      url:
        "https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=" +
        AK +
        "&client_secret=" +
        SK,
    };
    return new Promise((resolve, reject) => {
      request(options, (error, response) => {
        if (error) {
          reject(error);
        } else {
          resolve(JSON.parse(response.body).access_token);
        }
      });
    });
  }
  router.post("/:id/summary", async (req, res) => {
    try {
      const articleContent = req.body.summaryText;
      const prompt = req.body.prompt;
      // console.log("articleContent===", req.body);
      var options = {
        method: "POST",
        url:
          "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/completions_pro?access_token=" +
          (await getAccessToken()),
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: `${prompt}${articleContent}`,
            },
          ],
          disable_search: false,
          enable_citation: false,
        }),
      };

      request(options, function (error, response) {
        if (error) throw new Error(error);
        // console.log("=======", response.body);
        res.json(response.body);
      });
    } catch (error) {
      console.error(error);
      res.status(500).send("Error generating article summary");
    }
  });

  app.use(
    "/admin/api/rest/:resource",
    authMiddleware(),
    resourceMiddleware(),
    router
  );

  //   文件上传
  // const multer = require("multer");
  // const upload = multer({ dest: path.posix.join(__dirname, "..", "uploads") }); //__dirname 绝对地址
  // app.post(
  //   "/admin/api/upload",
  //   authMiddleware(),
  //   upload.single("file"),
  //   async (req, res) => {
  //     const file = req.file;
  //     file.url = `http://tuziki.com/uploads/${file.filename}`;
  //     res.send(file);
  //   }
  // );
  const multer = require("multer");
  const MAO = require("multer-aliyun-oss");
  const {
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    secure,
  } = require("./ossLocal.js");
  const upload = multer({
    storage: MAO({
      config: {
        region,
        accessKeyId,
        accessKeySecret,
        bucket,
        secure,
      },
      // to set path prefix for files, could be string or function
      destination: "",
    }),
  });

  app.post(
    "/admin/api/upload",
    authMiddleware(),
    upload.single("file"),
    async (req, res) => {
      const file = req.file;
      // file.url = `http://tuziki.com/uploads/${file.filename}`;
      res.send(file);
    }
  );

  // 登录路由
  app.post("/admin/api/login", async (req, res) => {
    const { username, password } = req.body;
    // 1. 根据用户名和密码查询用户信息
    const user = await AdminUser.findOne({ username }).select("+password");
    assert(user, 422, "该用户不存在");
    // if (!user) {
    //   return res.status(422).send({
    //     message: "该用户不存在",
    //   });
    // }
    // 2. 校验密码
    const bcrypt = require("bcrypt");
    const isValid = bcrypt.compareSync(password, user.password);
    // const salt = await bcrypt.genSalt(10);
    // const hashedPassword = await bcrypt.hash(password, salt);
    assert(isValid, 422, "密码错误");
    // if (!isValid) {
    //   return res.status(422).send({
    //     message: "密码错误",
    //   });
    // }

    // 3、返回token
    const token = jwt.sign(
      {
        id: user._id,
      },
      app.get("secret")
      // { expiresIn: "1h" } // token 过期时间
    );
    res.send({
      token,
    });

    // res.send("ok");
  });

  // 错误处理函数
  app.use(async (err, req, res, next) => {
    res.status(err.status || 500).send({
      message: err.message,
    });
  });
};
