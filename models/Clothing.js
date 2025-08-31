// const mongoose = require("mongoose");

// const ClothingSchema = new mongoose.Schema({
//   id: {
//     type: Number,
//     unique: true,
//   },
//   title: String,
//   type: String,
//   description: String,
//   images: [String],
//   price: String,
//   category: String,
//   condition: String,
//   size: String,
//   color: String,
//   brand: String,
//   location: String,
//   contact: {
//     name: String,
//     email: String,
//     phone: String,
//   },
//   liked: {
//     type: Boolean,
//     default: false,
//   },
//   favorite: {
//     type: Boolean,
//     default: false,
//   },

//   data: {
//     type: Date,
//     default: Date.now,
//   },
// });

// module.exports = mongoose.model("Clothing", ClothingSchema);

import mongoose from "mongoose";

const ClothingSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  title: String,
  type: String,
  description: String,
  images: [String],
  price: String,
  category: String,
  condition: String,
  size: String,
  color: String,
  brand: String,
  location: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contact: {
    name: String,
    email: String,
    phone: String,
  },
  liked: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  date: { type: Date, default: Date.now },
});

const Clothing = mongoose.model("Clothing", ClothingSchema);
export default Clothing;
