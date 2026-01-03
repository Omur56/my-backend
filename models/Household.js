import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const HouseHoldSchema = new mongoose.Schema({
 id: { type: String, required: true, default: () => uuidv4() },
  category: String,
  title: String,
  description: String,
  type_of_goods: String,
  location: String,
  price: String,
  images: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  data: { type: Date, default: Date.now },
  contact: {
    name: String,
    email: String,
    phone: String,
  },
  data: Date,
  liked: {
    type: Boolean,
    default: false,
  },
  favorite: {
    type: Boolean,
    default: false,
  },
});

const HouseHold = mongoose.model("HouseHold", HouseHoldSchema);
export default HouseHold;
