// const mongoose = require("mongoose");

// const contactSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   phone: String,
// });

// const electronikaSchema = new mongoose.Schema({
//   id: {
//     type: Number,
//     unique: true,
//   },
//    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    
//   category: String,
//   title: String,
//   title: { type: String, required: true },
//   brand: String,
//   model: String,
//   price: String,
//   location: String,
//   images: [String], 
//   description: String,
//   contact: contactSchema,
//   liked: { type: Boolean, default: false },
//   favorite: { type: Boolean, default: false },
//   data: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model("Electronika", electronikaSchema);


import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

const electronikaSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  data: { type: Date, default: Date.now },
  category: String,
  title: String,
  brand: String,
  model: String,
  price: String,
  location: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  images: [String], 
  description: String,
  
  contact: contactSchema,
  liked: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  data: { type: Date, default: Date.now },
});

const Electronika = mongoose.model("Electronika", electronikaSchema);
export default Electronika;
