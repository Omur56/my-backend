import mongoose from "mongoose";
import { checkExpiredListings } from "./utils/checkExpiredListings.js";

// MongoDB-ə qoşul
mongoose.connect(
  "mongodb+srv://Omur9696:elanlar123@cluster0.pyjgrvq.mongodb.net/elanlar?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => {
  console.log("MongoDB connected ✅");
  checkExpiredListings().then(() => mongoose.disconnect());
})
.catch(err => console.error("MongoDB connection error:", err));