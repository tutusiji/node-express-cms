const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    title: { type: String },
    slogan: { type: String },
    summary: { type: String },
    icon: { type: String },
    banner: { type: String },
    welcome: { type: String },
    coryright: { type: String },
    beian: { type: String },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Site", schema);
