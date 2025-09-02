import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const phoneSchema = new mongoose.Schema({
id:{
  type:Number,
  unique:true,
  default: uuidv4,
},
  title: String,
  brand: String,
  model: String,
  price: String,
  location: String,
  color: String,
  storage: String,
  rom: String,
  sim_card: String,
  images: [String],
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
