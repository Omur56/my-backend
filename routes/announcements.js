// import express from "express";
// import Announcement from "../models/Announcement.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Upgrade elanı VIP / Premium etmək üçün
// router.post("/upgrade/:id", authMiddleware, async (req, res) => {
//   try {
//     const { type } = req.body; // "vip" və ya "premium"
//     const listingId = req.params.id;
//     const userId = req.user.id; // authMiddleware-də decoded id varsa

//     const ad = await Announcement.findById(listingId);
//     if (!ad) return res.status(404).json({ message: "Elan tapılmadı" });

//     if (ad.userId.toString() !== userId) {
//       return res.status(403).json({ message: "Yalnız öz elanınızı yeniləyə bilərsiniz" });
//     }

//     // Yalnız "vip" və "premium" qəbul et
//     if (!["vip", "premium"].includes(type)) {
//       return res.status(400).json({ message: "Yanlış upgrade tipi" });
//     }

//     ad.priorityType = type;
//     if (type === "vip") ad.priority = 2;
//     if (type === "premium") ad.priority = 1;

//     await ad.save();

//     res.json({ message: "Uğurla yeniləndi", ad });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server xətası" });
//   }
// });

// export default router;


// // import mongoose from "mongoose";
// // import { v4 as uuidv4 } from "uuid";

// // const announcementSchema = new mongoose.Schema({
// //   id: { type: String, default: () => uuidv4() },
// //   modfikasiya: String,
// //   color: String,
// //   city: String,
// //   category: String,
// //   brand: String,
// //   model: String,
// //   ban_type: String,
// //   year: String,
// //   price: String,
// //   location: String,
// //   images: [String],
// //   mainImage: String,
// //   userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
// //   description: String,
// //   type: { type: String, enum: ["free", "vip", "premium"], default: "free" }
// // }, { timestamps: true });

// // export default mongoose.model("Announcement", announcementSchema);


import express from "express";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Upgrade elanı VIP / Premium etmək üçün
router.post("/upgrade/:id", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // "vip" və ya "premium"
    const listingId = req.params.id;

    // decoded içində id yoxdursa, bunu yoxla
    const userId = req.user.id || req.user._id; 
    if (!userId) return res.status(401).json({ message: "User ID tapılmadı" });

    const ad = await Announcement.findById(listingId);
    if (!ad) return res.status(404).json({ message: "Elan tapılmadı" });

    if (ad.userId.toString() !== userId) {
      return res.status(403).json({ message: "Yalnız öz elanınızı yeniləyə bilərsiniz" });
    }

    if (!["vip", "premium"].includes(type)) {
      return res.status(400).json({ message: "Yanlış upgrade tipi" });
    }

    ad.priorityType = type;
    ad.priority = type === "vip" ? 2 : 1;

    await ad.save();

    res.json({ message: "Uğurla yeniləndi", ad });
  } catch (err) {
    console.error("Upgrade Error:", err);
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
});

export default router;