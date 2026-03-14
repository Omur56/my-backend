import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const accessorySchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => uuidv4() },
 priorityType: {
  type: String,
  enum: ["free", "vip", "premium"],
  default: "free",
},
priority: {
  type: Number,
  enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
  default: 3,
},
vipExpireAt: Date,

  vipExpireAt: {
  type: Date,
  default: null
},
 isActive: { type: Boolean, default: true },
  data: { type: Date, default: Date.now },
  title: { type: String, required: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  price: { type: String, required: true },
  location: { type: String, required: true },
  images: [String],
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contact: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
  },
  liked: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
});

const Accessory = mongoose.model("Accessory", accessorySchema);
export default Accessory;
