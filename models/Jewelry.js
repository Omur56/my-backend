import mongoose from "mongoose";

const jewelrySchema = new mongoose.Schema({
  title: String,
  cateqory: String,
  type_of_goods: String,
  price: String,
  location: String,
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

const Jewelry = mongoose.model("Jewelry", jewelrySchema);
export default Jewelry;
