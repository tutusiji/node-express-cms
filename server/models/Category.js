const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String },
  pageName: { type: String },
  pageId: { type: String },
  parent: {
    type: mongoose.SchemaTypes.ObjectId, // 关联id
    ref: "Category",
  },
});

// 按 name 查找父分类（/blog/menu、/blog/list 高频）
schema.index({ name: 1 });

schema.virtual("children", {
  localField: "_id",
  foreignField: "parent",
  justOne: false,
  ref: "Category",
});

schema.virtual("newsList", {
  localField: "_id",
  foreignField: "categories",
  justOne: false,
  ref: "Article",
});

module.exports = mongoose.model("Category", schema);
