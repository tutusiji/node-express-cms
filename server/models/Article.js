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
    slotStatus: { type: Boolean },
    dateDisplay: { type: Boolean },
    categories: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Category" }],
    body: { type: String },
    tags: [{ type: mongoose.SchemaTypes.ObjectId, ref: "Tag" }],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Article", schema);
