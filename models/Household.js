// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const HouseHoldSchema = new mongoose.Schema({
//   id: { type: String, required: true, default: () => uuidv4() },
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
//   category: String,
//   title: String,
//   description: String,
//   type_of_goods: String,
//   location: String,
//   price: String,
//   images: [String],
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   data: { type: Date, default: Date.now },
//   contact: {
//     name: String,
//     email: String,
//     phone: String,
//   },
//   data: Date,
//   liked: {
//     type: Boolean,
//     default: false,
//   },
//   favorite: {
//     type: Boolean,
//     default: false,
//   },
// });

// const HouseHold = mongoose.model("HouseHold", HouseHoldSchema);
// export default HouseHold;



import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const HouseHoldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => uuidv4(),
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
  images: [String],
  category: String,
  title: String,
  description: String,
  type_of_goods: String,
  location: String,
  price: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  data: { type: Date, default: Date.now },
  contact: {
    name: String,
    email: String,
    phone: String,
  },
  liked: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
});

const HouseHold = mongoose.model("HouseHold", HouseHoldSchema);
export default HouseHold;