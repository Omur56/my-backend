// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const ClothingSchema = new mongoose.Schema({
//   id: { type: String, required: true, default: () => uuidv4() },

//   title: String,
//   type: String,
//   description: String,
//   priorityType: {
//     type: String,
//     enum: ["free", "vip", "premium"],
//     default: "free",
//   },
//   priorityExpires: { type: Date, default: null },
//   priority: {
//     type: Number,
//     enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
//     default: 0,
//   },
//   vipExpireAt: Date,

//   vipExpireAt: {
//     type: Date,
//     default: null,
//   },
//   isActive: { type: Boolean, default: true },
//   images: [String],
//   price: String,
//   category: String,
//   condition: String,
//   size: String,
//   color: String,
//   brand: String,
//   location: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   contact: {
//     name: String,
//     email: String,
//     phone: String,
//   },
//   liked: { type: Boolean, default: false },
//   favorite: { type: Boolean, default: false },
//   data: { type: Date, default: Date.now },
// });

// const Clothing = mongoose.model("Clothing", ClothingSchema);
// export default Clothing;



import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ClothingSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => uuidv4() },
  
  title: String,
  type: String,
  description: String,
  
  priorityType: {
    type: String,
    enum: ["free", "vip", "premium"],
    default: "free",
  },
  priority: {
    type: Number,
    enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
    default: 0,
  },
  priorityExpires: { type: Date, default: null },
  vipExpireAt: { type: Date, default: null },
  
  isActive: { type: Boolean, default: true },
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
  data: { type: Date, default: Date.now },
});

const Clothing = mongoose.model("Clothing", ClothingSchema);
export default Clothing;