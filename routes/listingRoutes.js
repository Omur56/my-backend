import express from "express";
import Listing from "../models/Listing.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* ================= CREATE LISTING ================= */
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const totalCount = await Listing.countDocuments({
      userId,
      isActive: true
    });

    if (totalCount >= 3) {
      return res.status(400).json({
        message: "3 pulsuz elandan sonra ödəniş etməlisiniz"
      });
    }

    const expires = new Date();
    expires.setDate(expires.getDate() + 10);

    const listing = await Listing.create({
      ...req.body,
      userId,
      type: "free",
      priority: 0,
      expiresAt: expires,
      isActive: true
    });

    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ================= UPGRADE LISTING ================= */
router.post("/upgrade/:id", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // vip / premium
    const listing = await Listing.findById(req.params.id);

    if (!listing)
      return res.status(404).json({ message: "Elan tapılmadı" });

    // Yalnız vip / premium qəbul et
    if (!["vip", "premium"].includes(type))
      return res.status(400).json({ message: "Yanlış upgrade tipi" });

    listing.type = type; // vip / premium
    listing.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 gün
    listing.isActive = true;

    await listing.save();

    res.json({ message: `Elan ${type.toUpperCase()} oldu`, listing });
  } catch (err) {
    console.error("Elan upgrade xətası:", err);
    res.status(500).json({ message: err.message });
  }
});

/* ================= GET ALL LISTINGS ================= */
router.get("/all", async (req, res) => {
  try {
    const listings = await Listing.find({ isActive: true })
      .sort({ priority: -1, data: -1 }); // VIP yuxarı, Premium ortada, Free aşağı

    res.json(listings);
  } catch (err) {
    console.error("Elanları gətirmək xətası:", err.message);
    res.status(500).json({ message: err.message });
  }
});

export default router;