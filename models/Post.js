// const mongoose = require("mongoose");

// const PostSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   description: String,
//   images: [String],
//   createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
// }, { timestamps: true });

// module.exports = mongoose.model("Post", PostSchema);


import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    images: [String],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Post = mongoose.model("Post", PostSchema);
export default Post;
