module.exports = (app) => {
  const express = require("express");
  const jwt = require("jsonwebtoken");
  const assert = require("http-assert");
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
  router.get("/", authMiddleware(), async (req, res) => {
    const queryOptions = {};
    if (req.Model.modelName === "Category") {
      queryOptions.populate = "parent";
    }
    const model = await req.Model.find().setOptions(queryOptions).limit(10);

    
    // populate 关联取出
    res.send(model);
  });

  // 分类详情
  router.get("/:id", async (req, res) => {
    const model = await req.Model.findById(req.params.id);
    res.send(model);
  });

  app.use(
    "/admin/api/rest/:resource",
    authMiddleware(),
    resourceMiddleware(),
    router
  );

  //   文件上传
  const multer = require("multer");
  const upload = multer({ dest: path.posix.join(__dirname, "..", "uploads") }); //__dirname 绝对地址
  app.post(
    "/admin/api/upload",
    authMiddleware(),
    upload.single("file"),
    async (req, res) => {
      const file = req.file;
      file.url = `http://localhost:3000/uploads/${file.filename}`;
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
      app.get("secret"),
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
