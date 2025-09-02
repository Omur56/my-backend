// import express from "express";
// import multer from "multer";
// import path from "path";
// import Ad from "../models/Ad.js";

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/ads");
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage });

// // Yeni reklam əlavə
// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) throw new Error("Şəkil seçilməyib və ya upload qovluğu yoxdur");
//     const ad = new Ad({
//       title: req.body.title,
//       link: req.body.link,
//       image: req.file.path.replace(/\\/g, "/"), // Windows path düzəldildi
//     });
//     await ad.save();
//     res.json(ad);
//   } catch (err) {
//     console.error("❌ Reklam əlavə olunarkən xəta:", err);
//     res.status(500).json({ error: err.message });
//   }
// });


// // Reklamları gətir
// router.get("/", async (req, res) => {
//   try {
//     const ads = await Ad.find().sort({ createdAt: -1 });
//     res.json(ads);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;




// import express from "express";
// import multer from "multer";
// import path from "path";
// import Ad from "../models/Ad.js";
// import fs from "fs";
// const router = express.Router();

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/ads"),
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// // Yeni reklam əlavə et
// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) throw new Error("Şəkil seçilməyib");
//     const ad = new Ad({
//       title: req.body.title,
//       link: req.body.link,
//       image: req.file.path.replace(/\\/g, "/"),
//     });
//     await ad.save();
//     res.json(ad);
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
//     res.status(500).json({ error: err.message });
//   }

// router.delete("/:id", async (req, res) => {
//   try {
//     const ad = await Ad.findById(req.params.id);
//     if (!ad) return res.status(404).json({ error: "Reklam tapılmadı" });

//     // Şəkil yolunu düzgün yarat
//     const imgPath = path.join(process.cwd(), ad.image); // root + relative path
//     if (fs.existsSync(imgPath)) {
//       fs.unlinkSync(imgPath);
//     }

//     await ad.deleteOne(); // remove() əvəzinə deleteOne() daha stabil
//     res.json({ message: "Reklam silindi" });
//   } catch (err) {
//     console.error("❌ Reklam silərkən xəta:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

  
// });



// export default router;





// import express from "express";
// import multer from "multer";
// import path from "path";
// import Ad from "../models/Ad.js";
// import fs from "fs";
// const router = express.Router();

// // Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/ads"),
//   filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
// });
// const upload = multer({ storage });

// // Yeni reklam əlavə et
// router.post("/", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) throw new Error("Şəkil seçilməyib");
//     const ad = new Ad({
//       title: req.body.title,
//       link: req.body.link,
//       image: req.file.path.replace(/\\/g, "/"),
//     });
//     await ad.save();
//     res.json(ad);
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
//     res.status(500).json({ error: err.message });
//   }

// router.delete("/:id", async (req, res) => {
//   try {
//     const ad = await Ad.findById(req.params.id);
//     if (!ad) return res.status(404).json({ error: "Reklam tapılmadı" });

//     // Şəkil yolunu düzgün yarat
//     const imgPath = path.join(process.cwd(), ad.image); // root + relative path
//     if (fs.existsSync(imgPath)) {
//       fs.unlinkSync(imgPath);
//     }

//     await ad.deleteOne(); // remove() əvəzinə deleteOne() daha stabil
//     res.json({ message: "Reklam silindi" });
//   } catch (err) {
//     console.error("❌ Reklam silərkən xəta:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

  
// });



// export default router;



import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Ad from "../models/Ad.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Cloudinary konfiqurasiya
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/ads"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Yeni reklam əlavə et
router.post("/", upload.array("images", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) throw new Error("Şəkil seçilməyib");

    const uploadedImages = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, { folder: "ads" });
      uploadedImages.push(result.secure_url);
      fs.unlinkSync(file.path); // local faylı sil
    }

    const ad = new Ad({
      title: req.body.title,
      link: req.body.link,
      images: uploadedImages
    });

    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    console.error("❌ Reklam əlavə olunarkən xəta:", err);
    res.status(500).json({ error: err.message });
  }
});

// Bütün reklamları gətir
router.get("/", async (req, res) => {
  try {
    const ads = await Ad.find().sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Reklam sil
router.delete("/:id", async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    if (!ad) return res.status(404).json({ error: "Reklam tapılmadı" });

    // Şəkilləri Cloudinary-dən silmək istəyirsənsə, əlavə kod yazılmalıdır
    await ad.deleteOne();
    res.json({ message: "Reklam silindi" });
  } catch (err) {
    console.error("❌ Reklam silərkən xəta:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
