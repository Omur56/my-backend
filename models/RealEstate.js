

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const RealEstateSchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    default: uuidv4,
  },
  title_type: String,
  type_building: String,
  field: String,
  number_of_rooms: String,
  location: String,
  city: String,
  price: String,
  data: Date,
  description: String,
   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
   data: { type: Date, default: Date.now },
  contact: {
    name: String,
    email: String,
    phone: String,
  
  },  liked: Boolean,
    favorite: Boolean,
    data: Date,
  images: [String], 
});

const RealEstate = mongoose.model("RealEstate", RealEstateSchema);
export default RealEstate;
