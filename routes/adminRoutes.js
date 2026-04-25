import express from "express";
import User from "../models/User.js";
import Ad from "../models/Ad.js";

const router = express.Router();


// 👤 USERS
router.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// BAN USER
router.put("/users/ban/:id", async (req, res) => {
  const user = await User.findById(req.params.id);
  user.isBanned = !user.isBanned;
  await user.save();
  res.json(user);
});

// DELETE USER
router.delete("/users/:id", async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});


// 📢 ADS APPROVAL SYSTEM
router.get("/ads/pending", async (req, res) => {
  const ads = await Ad.find({ status: "pending" });
  res.json(ads);
});

router.put("/ads/approve/:id", async (req, res) => {
  const ad = await Ad.findById(req.params.id);
  ad.status = "approved";
  await ad.save();
  res.json(ad);
});

router.delete("/ads/:id", async (req, res) => {
  await Ad.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});


// 📊 STATS
router.get("/stats", async (req, res) => {
  const users = await User.countDocuments();
  const posts = await Ad.countDocuments();
  res.json({ users, posts });
});

export default router;