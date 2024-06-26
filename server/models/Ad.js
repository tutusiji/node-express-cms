const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: { type: String },
  items: [
    {
      title: { type: String },
      image: { type: String },
      url: { type: String },
      target: { type: Boolean, default: false },
    },
  ],
});

module.exports = mongoose.model("Ad", schema);
