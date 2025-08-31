import express from "express";
import Post from "../models/Post.js";
import authMiddleware from "../middleware/verifyToken.js";

const router = express.Router();

// ✅ Elan yarat
router.post("/", authMiddleware, async (req, res) => {
  const post = new Post({ ...req.body, createdBy: req.user.id });
  await post.save();
  res.json(post);
});

// ✅ Öz elanlarını gör
router.get("/my", authMiddleware, async (req, res) => {
  const posts = await Post.find({ createdBy: req.user.id });
  res.json(posts);
});

// ✅ Elan redaktə
router.put("/:id", authMiddleware, async (req, res) => {
  const post = await Post.findOne({ _id: req.params.id, createdBy: req.user.id });
  if (!post) return res.status(403).json({ message: "İcazə yoxdur" });

  Object.assign(post, req.body);
  await post.save();
  res.json(post);
});

// ✅ Elan sil
router.delete("/:id", authMiddleware, async (req, res) => {
  const deleted = await Post.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
  if (!deleted) return res.status(403).json({ message: "İcazə yoxdur" });

  res.json({ message: "Elan silindi" });
});

export default router;
