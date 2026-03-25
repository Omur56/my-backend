// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const HomeAndGardenSchema = new mongoose.Schema({
//   id: { type: String, required: true, default: () => uuidv4() },
//   data: { type: Date, default: Date.now },
//   priorityType: {
//     type: String,
//     enum: ["free", "vip", "premium"],
//     default: "free",
//   },
//   priority: {
//     type: Number,
//     enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
//     default: 3,
//   },
//   vipExpireAt: Date,

//   vipExpireAt: {
//     type: Date,
//     default: null,
//   },
//   priorityExpires: { type: Date, default: null },
//   isActive: { type: Boolean, default: true },
//   images: [String],
//   model: String,
//   category: String,
//   title: String,
//   description: String,
//   brand: String,
//   price: String,
//   images: [String],
//   location: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   contact: {
//     name: String,
//     email: String,
//     phone: String,
//   },
//   liked: { type: Boolean, default: false },
//   favorite: { type: Boolean, default: false },
// });

// const HomeAndGarden = mongoose.model("HomeAndGarden", HomeAndGardenSchema);
// export default HomeAndGarden;


import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const HomeAndGardenSchema = new mongoose.Schema({
  id: { 
    type: String, 
    required: true, 
    default: () => uuidv4() 
  },
  data: { type: Date, default: Date.now },
  priorityType: {
    type: String,
    enum: ["free", "vip", "premium"],
    default: "free",
  },
  priority: {
    type: Number,
    enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
    default: 0, // 3 deyil, 0 qoyuruq ki enum xətası olmasın
  },
  vipExpireAt: { type: Date, default: null },
  priorityExpires: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  images: [String],
  model: String,
  category: String,
  title: String,
  description: String,
  brand: String,
  price: String,
  location: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contact: {
    name: String,
    email: String,
    phone: String,
  },
  liked: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
});

const HomeAndGarden = mongoose.model("HomeAndGarden", HomeAndGardenSchema);
export default HomeAndGarden;