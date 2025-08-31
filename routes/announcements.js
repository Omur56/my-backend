import express from "express";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔹 İstifadəçinin öz elanları
router.get("/my-announcements", authMiddleware, async (req, res) => {
  try {
    const announcements = await Announcement.find({ user: req.user._id });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: "Server xətası" });
  }
});

export default router;
