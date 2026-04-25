import express from "express";
import StickyAd from "../models/StickyAd.js";

const router = express.Router();

// 📌 GET LEFT + RIGHT STICKY ADS
router.get("/", async (req, res) => {
  try {
    const ads = await StickyAd.find({ active: true });
    res.json(ads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;