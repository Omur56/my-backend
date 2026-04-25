
// import express from "express";
// import Announcement from "../models/Announcement.js";
// import authMiddleware from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Upgrade elanı VIP / Premium etmək üçün
// router.post("/upgrade/:id", authMiddleware, async (req, res) => {
//   try {
//     const { type } = req.body; // "vip" və ya "premium"
//     const listingId = req.params.id;

//     // decoded içində id yoxdursa, bunu yoxla
//     const userId = req.user.id || req.user._id; 
//     if (!userId) return res.status(401).json({ message: "User ID tapılmadı" });

//     const ad = await Announcement.findById(listingId);
//     if (!ad) return res.status(404).json({ message: "Elan tapılmadı" });

//     if (ad.userId.toString() !== userId) {
//       return res.status(403).json({ message: "Yalnız öz elanınızı yeniləyə bilərsiniz" });
//     }

//     if (!["vip", "premium"].includes(type)) {
//       return res.status(400).json({ message: "Yanlış upgrade tipi" });
//     }

//     ad.priorityType = type;
//     ad.priority = type === "vip" ? 2 : 1;

//     await ad.save();

//     res.json({ message: "Uğurla yeniləndi", ad });
//   } catch (err) {
//     console.error("Upgrade Error:", err);
//     res.status(500).json({ message: "Server xətası", error: err.message });
//   }
// });

// export default router;






import express from "express";
import Ad from "../models/Ad.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Elanı VIP / Premium etmək üçün
router.post("/upgrade/:id", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // "vip" və ya "premium"
    const listingId = req.params.id;

    // User ID yoxlaması
    const userId = req.user.id || req.user._id;
    if (!userId) return res.status(401).json({ message: "User ID tapılmadı" });

    // Elanı tap
    const ad = await Ad.findById(listingId);
    if (!ad) return res.status(404).json({ message: "Elan tapılmadı" });

    // Yalnız sahib elanını dəyişə bilər
    if (ad.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Yalnız öz elanınızı yeniləyə bilərsiniz" });
    }

    // Yalnız "vip" və "premium" qəbul et
    if (!["vip", "premium"].includes(type)) {
      return res.status(400).json({ message: "Yanlış upgrade tipi" });
    }

    // Priority və type təyin et
    ad.priorityType = type;
    ad.priority = type === "vip" ? 2 : 1; // VIP = 2, Premium = 1

    // DB-də qeyd et
    await ad.save();

    console.log(`Elan ${listingId} yeniləndi: ${type}, priority: ${ad.priority}`);

    res.json({ message: "Uğurla yeniləndi", ad });
  } catch (err) {
    console.error("Upgrade Error:", err);
    res.status(500).json({ message: "Server xətası", error: err.message });
  }
});

export default router;