import express from "express";
import Listing from "../models/Listing.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= CREATE LISTING ================= */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // free / vip / premium
    const userId = req.user.id;

    // Pulsuz elan limiti
    if (type === "free") {
      const freeCount = await Listing.countDocuments({
        user: userId,
        type: "free",
        isActive: true,
      });

      if (freeCount >= 3) {
        return res.status(400).json({
          message: "Maksimum 3 pulsuz elan yerləşdirə bilərsiniz",
        });
      }
    }

    // Bitmə tarixi
    const expires = new Date();
    if (type === "free") expires.setDate(expires.getDate() + 10);
    else expires.setDate(expires.getDate() + 30);

    // Yeni elan yarat
    const listing = await Listing.create({
      ...req.body,
      user: userId,
      type,
      expiresAt: expires,
      isActive: true,
    });

    res.status(201).json(listing);
  } catch (err) {
    console.error("Elan yaratma xətası:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPGRADE LISTING ================= */
router.post("/upgrade/:id", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // vip / premium
    const listing = await Listing.findById(req.params.id); // <- lean yoxdur

    if (!listing)
      return res.status(404).json({ message: "Elan tapılmadı" });

    // Upgrade logic
    listing.type = type; // vip / premium
    listing.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün
    listing.isActive = true;

    await listing.save(); // ✅ artıq TypeError olmayacaq

    res.json({ message: `Elan ${type.toUpperCase()} oldu`, listing });
  } catch (err) {
    console.error("Elan upgrade xətası:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;