import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const ClothingSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    default: uuidv4,
  },
  _id: String,
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
  data: { type: Date, default: Date.now },
});

const Clothing = mongoose.model("Clothing", ClothingSchema);
export default Clothing;
