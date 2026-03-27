// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const RealEstateSchema = new mongoose.Schema({
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
//   priorityExpires: { type: Date, default: null },
//   vipExpireAt: {
//     type: Date,
//     default: null,
//   },
//   isActive: { type: Boolean, default: true },
//   images: [String],
//   title_type: String,
//   type_building: String,
//   field: String,
//   number_of_rooms: String,
//   location: String,
//   city: String,
//   price: String,
//   data: Date,
//   description: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   data: { type: Date, default: Date.now },
//   contact: {
//     name: String,
//     email: String,
//     phone: String,
//   },
//   liked: Boolean,
//   favorite: Boolean,
//   data: Date,
//   images: [String],
// });

// const RealEstate = mongoose.model("RealEstate", RealEstateSchema);
// export default RealEstate;

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RealEstateSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => uuidv4() },
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
  vipExpireAt: { type: Date, default: null },
  priorityExpires: { type: Date, default: null },
  isActive: { type: Boolean, default: true },
  images: [String],
  title_type: String,
  type_building: String,
  field: String,
  number_of_rooms: String,
  location: String,
  city: String,
  price: String,
  description: String,
  data: Date,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contact: {
    name: String,
    email: String,
    phone: String,
  },
  liked: Boolean,
  favorite: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const RealEstate = mongoose.model("RealEstate", RealEstateSchema);
export default RealEstate;
