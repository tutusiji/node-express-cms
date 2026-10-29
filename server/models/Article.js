const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: { type: String },
    date: { type: String },
    summary: { type: String },
    prompt: { type: String },
    words: { type: Number },
    status: { type: Boolean },
    single: { type: Boolean },
    slotName: { type: String },
    author: { type: String },
    slotStatus: { type: Boolean },
    dateDisplay: { type: Boolean },
    categories: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Category" }],
    coverImage: { type: String },
    body: { type: String },
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Tag" }],
  },
  {
    timestamps: true,
  }
);

// 列表页高频查询：按分类/标签取文章并按时间排序
schema.index({ categories: 1, date: -1 });
schema.index({ tags: 1, date: -1 });

module.exports = mongoose.model("Article", schema);
