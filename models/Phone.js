// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const phoneSchema = new mongoose.Schema({
//   id: {
//     type: Number,
//     unique: true,
//     default: uuidv4,
//   },
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
//   title: String,
//   brand: String,
//   model: String,
//   price: String,
//   location: String,
//   color: String,
//   storage: String,
//   rom: String,
//   sim_card: String,
//   images: [String],
//   description: String,
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

// const Phone = mongoose.model("Phone", phoneSchema);
// export default Phone;




import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const phoneSchema = new mongoose.Schema({
  id: {
    type: String, // uuidv4 string qaytarır, Number ola bilməz
    unique: true,
    default: () => uuidv4(), // default funksiyanı çağırırıq
  },
  priorityType: {
    type: String,
    enum: ["free", "vip", "premium"],
    default: "free",
  },
  priority: {
    type: Number,
    enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
    default: 0, // 3 deyil, 0 qoyuruq ki enum xəta verməsin
  },
  vipExpireAt: {
    type: Date,
    default: null,
  },
  priorityExpires: {
    type: Date,
    default: null,
  },
  isActive: { type: Boolean, default: true },
  images: [String], // tək dəfə saxladıq
  title: String,
  brand: String,
  model: String,
  price: String,
  location: String,
  color: String,
  storage: String,
  rom: String,
  sim_card: String,
  description: String,
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

const Phone = mongoose.model("Phone", phoneSchema);
export default Phone;