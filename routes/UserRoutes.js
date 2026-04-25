import express from "express";
import User from "../models/User.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

/* GET ALL USERS */
router.get("/", authMiddleware, async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});

/* BAN / UNBAN USER */
router.patch("/ban/:id", authMiddleware, async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  user.isBanned = !user.isBanned;
  await user.save();

  res.json(user);
});

/* DELETE USER */
router.delete("/:id", authMiddleware, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

/* EDIT USER */
router.put("/:id", authMiddleware, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.json(user);
});

export default router;