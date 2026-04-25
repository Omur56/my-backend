

// import express from "express";
// import multer from "multer";
// import path from "path";
// import fs from "fs";
// import Ad from "../models/Ad.js";
// import { v2 as cloudinary } from "cloudinary";

// const router = express.Router();

// // Cloudinary konfiqurasiya
// cloudinary.config({
//   cloud_name: process.env.CLOUD_NAME,
//   api_key: process.env.CLOUD_API_KEY,
//   api_secret: process.env.CLOUD_API_SECRET
// });

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/ads"),
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
// });
// const upload = multer({ storage });

// // Yeni reklam əlavə et
// router.post("/", upload.array("images", 20), async (req, res) => {
//   try {
//     if (!req.files || req.files.length === 0) throw new Error("Şəkil seçilməyib");

//     const uploadedImages = [];
//     for (const file of req.files) {
//       const result = await cloudinary.uploader.upload(file.path, { folder: "ads" });
//       uploadedImages.push(result.secure_url);
//       fs.unlinkSync(file.path); // local faylı sil
//     }

//     const ad = new Ad({
//       title: req.body.title,
//       link: req.body.link,
//       images: uploadedImages
//     });

//     await ad.save();
//     res.status(201).json(ad);
//   } catch (err) {
//     console.error("❌ Reklam əlavə olunarkən xəta:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Bütün reklamları gətir
// router.get("/", async (req, res) => {
//   try {
//     const ads = await Ad.find().sort({ createdAt: -1 });
//     res.json(ads);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Reklam sil
// router.delete("/:id", async (req, res) => {
//   try {
//     const ad = await Ad.findById(req.params.id);
//     if (!ad) return res.status(404).json({ error: "Reklam tapılmadı" });

//     // Şəkilləri Cloudinary-dən silmək istəyirsənsə, əlavə kod yazılmalıdır
//     await ad.deleteOne();
//     res.json({ message: "Reklam silindi" });
//   } catch (err) {
//     console.error("❌ Reklam silərkən xəta:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;




import express from "express";
import Ad from "../models/Ad.js";

const router = express.Router();


// 🔍 BÜTÜN ELANLAR + FILTER
router.get("/", async (req, res) => {
  const { category, brand, model } = req.query;

  let filter = { isActive: true };

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (model) filter.model = new RegExp(model, "i");

  const ads = await Ad.find(filter).sort({ createdAt: -1 });

  res.json(ads);
});


// ➕ ELAN ƏLAVƏ ET
router.post("/", async (req, res) => {
  const ad = new Ad(req.body);
  await ad.save();

  res.json(ad);
});


// 📊 SAY (məs: cruze)
router.get("/count", async (req, res) => {
  const { model } = req.query;

  const count = await Ad.countDocuments({
    model: new RegExp(model, "i"),
  });

  res.json({ count });
});

export default router;