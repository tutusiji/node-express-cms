const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // 确保标签名称是唯一的
  },
});

// 虚拟字段，用于关联文章
tagSchema.virtual("articlesList", {
  localField: "_id",
  foreignField: "tags",
  justOne: false,
  ref: "Article",
});

module.exports = mongoose.model("Tag", tagSchema);
