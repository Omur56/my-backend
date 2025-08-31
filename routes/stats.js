import express from "express";
import Announcement from "../models/Announcement.js";
import User from "../models/user.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const postsCount = await Announcement.countDocuments();
    const usersCount = await User.countDocuments();
    res.json({ posts: postsCount, users: usersCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
