import express from "express";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 İstifadəçinin öz elanları
router.get("/my-announcements", authMiddleware, async (req, res) => {
  try {
    // req.user.id istifadə et
    const announcements = await Announcement.find({ userId: req.user.id });
    res.json(announcements);
  } catch (error) {
    console.error("My announcements xətası:", error);
    res.status(500).json({ message: "Server xətası" });
  }
});

export default router;






// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const announcementSchema = new mongoose.Schema({
//   id: { type: String, default: () => uuidv4() },
//   modfikasiya: String,
//   color: String,
//   city: String,
//   category: String,
//   brand: String,
//   model: String,
//   ban_type: String,
//   year: String,
//   price: String,
//   location: String,
//   images: [String],
//   mainImage: String,
//   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   description: String,
//   type: { type: String, enum: ["free", "vip", "premium"], default: "free" }
// }, { timestamps: true });

// export default mongoose.model("Announcement", announcementSchema);