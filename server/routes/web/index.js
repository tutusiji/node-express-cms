module.exports = (app) => {
  const router = require("express").Router();
  const mongoose = require("mongoose");
  // const Article = require('../../models/Article')
  const Category = mongoose.model("Category");
  const Article = mongoose.model("Article");
  const Site = mongoose.model("Site");
  const Hero = mongoose.model("Hero");
  const Ad = mongoose.model("Ad");
  const Tag = mongoose.model("Tag");

  // router.get("/blog/menu", async (req, res) => {
  //   const parent = await Category.findOne({
  //     name: "博客文章",
  //   });
  //   // 聚合查询
  //   const cats = await Category.aggregate([{ $match: { parent: parent._id } }]);
  //   res.send(cats);
  // });
  // 导航菜单
  router.post("/blog/menu", async (req, res) => {
    try {
      const { parentName } = req.body;
      // 从请求中获取分类名称

      // 验证分类名称参数是否存在
      if (!parentName) {
        return res
          .status(400)
          .send("Missing required query parameter: category");
      }

      // 查找指定的分类
      const parentCategory = await Category.findOne({ name: parentName });

      if (!parentCategory) {
        return res.status(404).send("Category not found");
      }

      // 查找所有以该分类为父分类的子分类
      const subCategories = await Category.find({ parent: parentCategory._id });

      // 返回子分类列表
      res.send(subCategories);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // 文章列表
  router.post("/blog/list", async (req, res) => {
    try {
      const {
        categoryName,
        page = 1,
        limit = 10,
        searchText,
        tagName,
        tagId,
      } = req.body;

      const skip = (page - 1) * limit;
      let articles = [];
      let totalItems = 0;

      if (categoryName && !tagName && !tagId && !searchText) {
        // 使用聚合管道查询特定分类的文章
        const category = await Category.findOne({ name: categoryName });
        if (!category) {
          return res.status(404).send("Category not found");
        }

        const aggregationPipeline = [
          { $match: { _id: category._id } },
          {
            $lookup: {
              from: "articles",
              localField: "_id",
              foreignField: "categories",
              as: "relatedArticles",
            },
          },
          { $unwind: "$relatedArticles" },
          { $match: { "relatedArticles.status": { $ne: false } } }, // 使用模糊搜索查询条件
          { $replaceRoot: { newRoot: "$relatedArticles" } },
          { $sort: { date: -1 } },
          { $skip: skip },
          { $limit: limit },
          // { $project: { title: 1, body: 1, date: 1, tags: 1, categories: 1 } }, // 排除文档中的字段
        ];

        articles = await Category.aggregate(aggregationPipeline);
        totalItems = await Article.countDocuments({ categories: category._id });
        // 添加 serialNumber
        articles = articles.map((article, index) => ({
          ...article,
          serialNumber: totalItems - skip - index,
        }));
      } else {
        // 对于 searchText 或 tagName/tagId 的查询
        let query = {};
        if (searchText) {
          query.$or = [
            { title: { $regex: searchText, $options: "i" } },
            { body: { $regex: searchText, $options: "i" } },
          ];
        }
        // if (tagName) {
        //   const tag = await Tag.findOne({ name: tagName });
        //   if (tag) {
        //     query.tags = tag._id;
        //   } else {
        //     return res.send({
        //       list: articles,
        //       currentPage: page,
        //       limit,
        //       totalItems,
        //       totalPages: Math.ceil(totalItems / limit),
        //     });
        //   }
        // } else if (tagId) {
        //   query.tags = mongoose.Types.ObjectId(tagId);
        // }
        if (tagName) {
          const tag = await Tag.findOne({ name: tagName });
          // 如果标签不存在，则返回空数据集
          if (!tag) {
            return res.send({
              list: articles,
              currentPage: page,
              limit,
              totalItems,
              totalPages: Math.ceil(totalItems / limit),
            });
          } else {
            query.tags = tag._id;
          }
        }
        // 添加过滤掉 status 为 false 的文档的条件
        query.status = { $ne: false };

        articles = await Article.find(query)
          .skip(skip)
          .limit(limit)
          .sort({ date: -1 });
        totalItems = await Article.countDocuments(query);
        // 添加 serialNumber
        articles = articles.map((article, index) => ({
          ...article.toObject(),
          serialNumber: totalItems - skip - index,
        }));
      }

      const totalPages = Math.ceil(totalItems / limit);

      res.send({
        list: articles,
        currentPage: page,
        limit,
        totalItems,
        totalPages,
      });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // 查询所有标签
  router.get("/tagsList", async (req, res) => {
    try {
      const tags = await Tag.find().select("name");
      res.send(tags);
    } catch (error) {
      res.status(500).send({ message: "Error retrieving tags", error });
    }
  });

  // 搜索接口 （暂时不用）
  router.post("/blog/search", async (req, res) => {
    try {
      // 从请求体中获取分类名称和分页参数
      const { parentName, categoryName, page, limit, searchText } = req.body;

      // 验证分类名称参数是否存在
      if (!parentName || !categoryName) {
        return res.status(400).send("Missing required query parameters");
      }

      // 转换分页参数为整数，并提供默认值
      const pageNumber = parseInt(page, 10) || 1;
      const limitNumber = parseInt(limit, 10) || 10;
      // 计算跳过的文档数量
      const skip = (pageNumber - 1) * limit;

      // 查找父分类
      const parent = await Category.findOne({ name: parentName });
      if (!parent) {
        return res.status(404).send("Parent category not found");
      }

      // 构建模糊搜索查询条件
      let matchQuery = { "list.status": { $ne: false } }; // 过滤掉 status 为 false 的文档
      if (searchText) {
        matchQuery = {
          ...matchQuery,
          $or: [
            { "list.title": { $regex: searchText, $options: "i" } },
            { "list.content": { $regex: searchText, $options: "i" } },
          ],
        };
      }

      // 聚合查询指定的子分类并实现分页
      const result = await Category.aggregate([
        { $match: { parent: parent._id, name: categoryName } },
        {
          $lookup: {
            from: "articles",
            localField: "_id",
            foreignField: "categories",
            as: "list",
          },
        },
        { $unwind: "$list" },
        { $match: matchQuery }, // 使用模糊搜索查询条件
        {
          $sort: { "list.date": -1 }, // 添加排序步骤，按照文章的创建日期降序排列
        },
        { $skip: skip },
        { $limit: limit },
        {
          $group: {
            _id: "$_id",
            list: { $push: "$list" },
          },
        },
        {
          $addFields: {
            list: { $slice: ["$list", limit] },
          },
        },
      ]);

      // 查找子分类 计算总数
      const category = await Category.findOne({
        name: categoryName,
        parent: parent._id,
      });
      if (!category) {
        return res.status(404).send("Category not found");
      }
      const totalCount = await Article.countDocuments({
        categories: category._id,
        status: { $ne: false }, // 过滤掉 status 为 false 的文档
      });

      // 计算当前页面的第一个元素在整个列表中的位置（倒序开始的位置）
      const startSerial = totalCount - (pageNumber - 1) * limitNumber;
      // 计算总页数
      const totalPages = Math.ceil(totalCount / limitNumber);

      // 添加倒序序列号 倒序
      if (result.length > 0 && result[0].list) {
        for (let i = 0; i < result[0].list.length; i++) {
          // 从startSerial开始递减
          result[0].list[i].serialNumber = startSerial - i;
        }
      }

      // 返回查询结果的第一个元素或空对象
      // currentPage: 当前页码。
      // limit: 每页的条目数。
      // totalItems: 总条目数。
      // totalPages: 总页数。
      const response = {
        list: result.length > 0 ? result[0].list : [],
        currentPage: pageNumber,
        limit: limitNumber,
        totalItems: totalCount,
        category: parent._id,
        totalPages: totalPages,
      };
      res.send(response);
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });

  // 获取站点信息的接口
  router.get("/site/webInfo", async (req, res) => {
    try {
      const siteInfo = await Site.findOne({});
      if (!siteInfo) {
        // 如果没有找到站点信息，返回404错误
        return res.status(404).send({ message: "没有找到站点信息." });
      }
      res.send(siteInfo);
    } catch (error) {
      // 错误处理
      res
        .status(500)
        .send({ message: "Error retrieving site information", error });
    }
  });

  // 广告列表接口
  router.get("/adsList", async (req, res) => {
    try {
      const adList = await Ad.find({}); // 获取所有广告
      if (!adList || adList.length === 0) {
        // 如果没有找到广告，返回404错误
        return res.status(404).send({ message: "没有找到广告信息." });
      }
      res.send(adList);
    } catch (error) {
      // 错误处理
      res.status(500).send({ message: "Error retrieving ads", error });
    }
  });

  // 新闻列表接口
  router.get("/news/list", async (req, res) => {
    // const parent = await Category.findOne({
    //   name: '博客文章'
    // }).populate({
    //   path: 'children',
    //   populate: {
    //     path: 'newsList'
    //   }
    // }).lean()
    const parent = await Category.findOne({
      name: "博客文章",
    });
    const cats = await Category.aggregate([
      // 聚合查询
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "articles",
          localField: "_id",
          foreignField: "categories",
          as: "newsList",
        },
      },
      {
        $addFields: {
          newsList: { $slice: ["$newsList", 10] },
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门",
      newsList: await Article.find()
        .where({
          categories: { $in: subCats },
        })
        .populate("categories")
        .limit(5)
        .lean(),
    });

    cats.map((cat) => {
      cat.newsList.map((news) => {
        news.categoryName =
          cat.name === "热门" ? news.categories[0].name : cat.name;
        return news;
      });
      return cat;
    });
    res.send(cats);
  });

  // 角色列表接口
  router.get("/heroes/list", async (req, res) => {
    const parent = await Category.findOne({
      name: "英雄分类",
    });
    const cats = await Category.aggregate([
      { $match: { parent: parent._id } },
      {
        $lookup: {
          from: "heroes",
          localField: "_id",
          foreignField: "categories",
          as: "heroList",
        },
      },
    ]);
    const subCats = cats.map((v) => v._id);
    cats.unshift({
      name: "热门",
      heroList: await Hero.find()
        .where({
          categories: { $in: subCats },
        })
        .limit(10)
        .lean(),
    });

    res.send(cats);
  });

  // 文章详情，包括相同分类的前后文章
  router.get("/articles/:id", async (req, res) => {
    try {
      const currentArticle = await Article.findById(req.params.id).lean();

      if (!currentArticle) {
        return res.status(404).send("文章未找到");
      }

      // 获取当前文章所属分类
      const categoryId = currentArticle.categories[0];

      // 查找前一篇文章：发布时间早于当前文章的最新一篇
      const nextArticle = await Article.findOne({
        categories: categoryId,
        date: { $lt: currentArticle.date },
        status: true,
      })
        .sort({ date: -1 }) // 按时间倒序
        .select("_id title")
        .lean();

      // 查找后一篇文章：发布时间晚于当前文章的最早一篇
      const prevArticle = await Article.findOne({
        categories: categoryId,
        date: { $gt: currentArticle.date },
        status: true,
      })
        .sort({ date: 1 }) // 按时间顺序
        .select("_id title")
        .lean();

      // 构建响应数据
      const response = {
        ...currentArticle,
        prevArticle: prevArticle || null,
        nextArticle: nextArticle || null,
      };

      res.send(response);
    } catch (error) {
      res.status(500).send({ message: "Error 没有查询到相关id", error });
    }
  });

  function getFileNameWithLowerCaseExtension(fileName) {
    // 移除文件名中的所有空格
    const sanitizedFileName = fileName.replace(/\s+/g, "");

    const lastDotIndex = sanitizedFileName.lastIndexOf(".");
    if (lastDotIndex === -1) return sanitizedFileName; // 没有扩展名的情况

    const name = sanitizedFileName.substring(0, lastDotIndex);
    const extension = sanitizedFileName.substring(lastDotIndex).toLowerCase(); // 只转换扩展名为小写

    return name + extension;
  }

  //  字体包文件上传
  //__dirname 绝对地址
  // 设置 Multer 存储引擎
  const multer = require("multer");
  const path = require("path");
  const iconv = require("iconv-lite");
  // console.log("__dirname=====", __dirname);
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // 设置文件存储位置
      cb(null, path.join(__dirname, "..", "..", "uploads/fonts"));
    },
    filename: function (req, file, cb) {
      // cb(null, file.originalname); // 保持原始文件名
      // cb(null, "AnyFonts.ttf");
      const decodedName = iconv.decode(
        Buffer.from(
          getFileNameWithLowerCaseExtension(file.originalname),
          "binary"
        ),
        "utf-8"
      );
      cb(null, decodedName);
    },
  });
  const uploadFonts = multer({ storage: storage }).single("file");

  router.post("/uploadFonts", uploadFonts, async (req, res) => {
    const file = req.file;
    console.log("file=====", file);
    // 更新文件 URL
    file.url = `//${req.get("host")}/uploads/fonts/${file.filename}`;
    // file.url = `${req.protocol}://${req.get("host")}/uploads/fonts/${
    //   file.filename
    // }`;
    res.send(file);
  });

  // 字体包 生成
  const Fontmin = require("fontmin");
  var rename = require("gulp-rename");
  router.post("/createFonts", async (req, res) => {
    const words = req.body.words;
    const fontName = req.body.fontOriginName.split(".")[0];
    // console.log(words, fontName);
    try {
      const fontmin = new Fontmin()
        .src(path.join(__dirname, "..", "..", `uploads/fonts/${fontName}.ttf`))
        .dest(path.join(__dirname, "..", "..", `uploads/fonts`))
        // .use(Fontmin.ttf2woff()) // 转换为 WOFF 格式
        .use(
          Fontmin.glyph({
            text: words,
            hinting: true, // keep ttf hint info (fpgm, prep, cvt). default = true
          })
        )
        .use(rename(`${fontName}-lite.ttf`));
      // .use(
      //   Fontmin.rename({
      //     ext: ".ttf",
      //     basename: `${fontName}-lite`, // 新的基础文件名
      //   })
      // );
      fontmin.run(async function (err, files) {
        res.send({
          name: `${fontName}-lite.ttf`,
          url: `//${req.get("host")}/uploads/fonts/${fontName}-lite.ttf`,
          message: "Fonts processed and ssr server restarted.",
        });
        if (err) {
          console.error(err);
          return res
            .status(500)
            .send({ message: "Error 字体包生成错误1", error: err });
        }
        // console.log(files[0]);
        // => { contents: <Buffer 00 01 00 ...> }
      });
    } catch (error) {
      // 错误处理
      res.status(500).send({ message: "Error 字体包生成错误2", error });
    }
  });

  router.get("/heroes/:id", async (req, res) => {
    const data = await Hero.findById(req.params.id)
      .populate("categories items1 items2 partners.hero")
      .lean();
    res.send(data);
  });

  app.use("/web/api", router);
};
