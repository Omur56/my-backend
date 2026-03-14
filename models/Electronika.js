import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
});

const electronikaSchema = new mongoose.Schema({
  id: { type: String, required: true, default: () => uuidv4() },
  data: { type: Date, default: Date.now },
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
  images: [String],
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
