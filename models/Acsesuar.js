import mongoose from "mongoose";

const accessorySchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
  },
  data: { type: Date, default: Date.now }, // yalnız bir dəfə
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
