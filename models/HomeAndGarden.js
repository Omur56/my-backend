// import mongoose from "mongoose";

// const HomeAndGardenSchema = new mongoose.Schema({
//   category: String,
//   model: String,
//   title: String,
//   description: String,
//   brand: String,
//   price: String,
//   images: [String],
//   location: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   contact: {
//     name: String,
//     email: String,
//     phone: String,
//   },
//   liked: {
//     type: Boolean,
//     default: false,
//   },
//   favorite: {
//     type: Boolean,
//     default: false,
//   },
//   data: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const HomeAndGarden = mongoose.model("HomeAndGarden", HomeAndGardenSchema);
// export default HomeAndGarden;



import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const HomeAndGardenSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    default: uuidv4,
  },
  data: { type: Date, default: Date.now },
  model: String,
  category: String,
  title: String,
  description: String,
  brand: String,
  price: String,
  images: [String],
  location: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  contact: {
    name: String,
    email: String,
    phone: String,
  },
  liked: { type: Boolean, default: false },
  favorite: { type: Boolean, default: false },
  
});

const HomeAndGarden = mongoose.model("HomeAndGarden", HomeAndGardenSchema);
export default HomeAndGarden;
