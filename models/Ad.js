

import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";


const AdSchema = new mongoose.Schema({
   id: { type: String, required: true, default: uuidv4 }, // ✅ düzəldildi
  title: { type: String, required: true },
  link: { type: String, required: true },// burada xəta gəlir
  images: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } 
});


export default mongoose.model("Ad", AdSchema);