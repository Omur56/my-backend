console.log("SERVER FILE:", import.meta.url);

import express from "express";


import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./db.js";
import adRoutes from "./routes/adRoutes.js";
import HomeAndGarden from "./models/HomeAndGarden.js";
import RealEstate from "./models/RealEstate.js";
import HouseHold from "./models/Household.js";
// import phone from "./models/Phone.js";
import Clothing from "./models/Clothing.js";
import Jewelry from "./models/Jewelry.js";
import Ad from "./models/Ad.js";
import User from "./models/user.js";
import BusinessProfile from "./models/BusinessProfile.js";

import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verifyToken } from "./middleware/verifyToken.js";
import nodemailer from "nodemailer";
import authRoutes from "./routes/auth.js";

import adsRouter from "./routes/ads.js";
import statsRouter from "./routes/stats.js";
import announcementRoutes from "./routes/announcements.js";
import bodyParser from "body-parser";
import twilio from "twilio";
import authMiddleware from "./middleware/authMiddleware.js";
import profileRoutes from "./routes/Profile.js";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import sharp from "sharp";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import adsRoutes from "./routes/ads.js";
import generateSitemap from "./utils/sitemap.js";
// import listingRoutes from "./routes/listingRoutes.js";
import "./utils/expireChecker.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import "./cron/expireListings.js";
import "./utils/expireChecker.js";
// import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import announcements from "./routes/announcements.js";
import cron from "node-cron";
import { expireVip } from "./utils/expireVip.js";
import { checkExpiredListings } from "./utils/checkExpiredListings.js";
import "./cron.js";
import statsRoutes from "./routes/countSay.js";
import stickyAdsRoutes from "./routes/stickyAdsRoutes.js";


const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = twilio(accountSid, authToken);

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// .env faylını oxu
dotenv.config();
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set("trust proxy", 1);



// MongoDB-ə qoşul
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB connection error:", err));

cron.schedule("* * * * *", async () => {
  console.log("Running cron...");
  await checkExpiredListings();
});

app.use(
  cors({
    origin: [
      "https://axtartapaz-frontend.onrender.com",
      "https://www.omurcars.org",
      "http://localhost:3000",
      "http://localhost:10000",
      "https://my-backend-wj5g.onrender.com",
      "https://checkout.stripe.com",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

cron.schedule("*/10 * * * *", () => {
  expireVip();
});

// Helmet ilə təhlükəsizlik (CSP düzgün tırnaqla)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],

        connectSrc: [
          "'self'",
          "https://my-backend-wj5g.onrender.com",
          "https://api.cloudinary.com",
          "https://res.cloudinary.com",
          "https://pagead2.googlesyndication.com",
          "https://ep1.adtrafficquality.google",
          "https://ep2.adtrafficquality.google",
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com",
          "https://my-backend-wj5g.onrender.com",
        ],

        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://pagead2.googlesyndication.com",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
        ],

        workerSrc: ["'self'", "blob:"],

        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],

        imgSrc: ["'self'", "data:", "blob:", "https://res.cloudinary.com"],

        fontSrc: ["'self'", "https://fonts.gstatic.com"],

        frameSrc: [
          "'self'",
          "https://googleads.g.doubleclick.net",
          "https://pagead2.googlesyndication.com",
          "https://www.google.com",
        ],
      },
    },
  }),
);

// app.use("/api/stripe", stripeWebhookRoutes);

app.use(express.json());
app.use(bodyParser.json());

// app.use(bodyParser.json());

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dəqiqə
    max: 5000, // eyni IP üçün maksimum 100 sorğu
    standardHeaders: true, // rate limit məlumatını `RateLimit-*` header-larda göstər
    legacyHeaders: false,
    message: "Çox request göndərdiniz, bir az sonra yenidən cəhd edin.", // `X-RateLimit-*` header-larını deaktiv et
  }),
);

// app.listen(5000, async () => {
//   console.log("Server started");
//   await generateSitemap(); // sitemap yaradılır
// });

// Routes

const PORT = process.env.PORT || 10000;

const BASE_URL = process.env.BASE_URL || "http://localhost:10000";


const uploadToCloudinary = (buffer, folder = "uploads") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        quality: "auto",
        fetch_format: "auto",

        transformation: [
          {
            width: 800,
            crop: "limit",
          },
          {
            quality: "auto",
          },
          {
            fetch_format: "auto",
          },
          {
            overlay: "proelan_watermark",
            width: 0.6,
            opacity: 30,
            gravity: "center",
          },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
};

// Watermark əlavə edən funksiya
const addWatermark = async (imagePath) => {
  const watermarkPath = "watermark.png"; // logo yolu
  const image = sharp(imagePath);
  const { width, height } = await image.metadata();

  // Watermark ölçüsü orijinal şəkil ilə müqayisədə
  const watermark = await sharp(watermarkPath)
    .resize(Math.floor(width / 4)) // watermark ölçüsünü şəkilin 1/4-i qədər edirik
    .blur(1) // azca blur
    .toBuffer();

  // Overlay tətbiqi
  await image
    .composite([
      {
        input: watermark,
        gravity: "center", // mərkəzə yerləşdir
        blend: "over",
      },
    ])
    .toFile(imagePath.replace(/(\.\w+)$/, "-wm$1")); // watermark əlavə olunmuş şəkil
};

dotenv.config({ path: path.resolve("../.env") });

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
// Static files
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
  "/sitemap.xml",
  express.static(path.join(__dirname, "public/sitemap.xml")),
);
app.use(
  "/robots.txt",
  express.static(path.join(__dirname, "public/robots.txt")),
);

// API Routes
// app.use("/api/payments", paymentRoutes); // create-checkout
// app.use("/api/payments/webhook", stripeWebhookRoutes); // Stripe webhook
// app.use("/api/listings", listingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/ads", adsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/countSay", statsRoutes);
app.use("/api/sticky-ads", stickyAdsRoutes);
app.use("/api/ad", adRoutes);


app.use("/api/payments", paymentRoutes);
// Stripe ödəniş və checkout

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "connect-src 'self' http://localhost:5000 http://localhost:10000 http://localhost:3000 https://proelan.az https://geminally-stealthless-mimi.ngrok-free.dev https://my-backend-wj5g.onrender.com https://ep1.adtrafficquality.google https://checkout.stripe.com; img-src 'self' data: blob: https://res.cloudinary.com; script-src 'self' 'unsafe-inline' https://checkout.stripe.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  );
  next();
});



const upload = multer(); // memory storage default (BUFFER üçün lazımdır)
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

app.post("/upload", upload.array("images", 10), async (req, res) => {
  try {
    const uploadedFiles = [];

    for (const file of req.files) {
      // Cloudinary-yə upload + watermark
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "proelan",
        transformation: [
          {
            overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
            width: 0.6,
            opacity: 30,
            gravity: "center",
          },
        ],
      });

      uploadedFiles.push({
        original: file.path,
        watermarked: result.secure_url, // Frontend-də istifadə edəcəyin link
      });
    }

    res.status(200).json({
      message: "Şəkillər yükləndi və watermark əlavə olundu",
      files: uploadedFiles,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Xəta baş verdi", error: err.message });
  }
});
app.post(
  "/api/ads",
  upload.array("images", 20),
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0)
        throw new Error("Şəkil seçilməyib");

      const uploadedImages = [];

      for (const file of req.files) {
        const filePath = file.path.replace(/\\/g, "/");

        const result = await cloudinary.uploader.upload(filePath, {
          folder: "ads",
        });

        uploadedImages.push(result.secure_url);

        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }

      const ad = new Ad({
        title: req.body.title,
        link: req.body.link,
        description: req.body.description,
        images: uploadedImages,

        // 🔥 VACİB FIX
        userId: req.user.id,
      });

      await ad.save();

      res.status(201).json(ad);
    } catch (err) {
      console.error("❌ Reklam əlavə olunarkən xəta:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.get("/api/my-ads", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const ads = await Ad.find({ userId });

    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



const ads = await Ad.find().sort({ createdAt: -1 });

// ---------count ---

app.get("/count/car", async (req, res) => {
  try {
    const count = await Cars.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Cars count error" });
  }
});

app.get("/count/electronics", async (req, res) => {
  try {
    const count = await electronics.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "electronics count error" });
  }
});

app.get("/count/Clothing", async (req, res) => {
  try {
    const count = await Clothing.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Clothing count error" });
  }
});

app.get("/count/homeGarden", async (req, res) => {
  try {
    const count = await HomeAndGarden.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "HomeGarden count error" });
  }
});

app.get("/count/phone", async (req, res) => {
  try {
    const count = await Phone.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Phone count error" });
  }
});

app.get("/count/realEstate", async (req, res) => {
  try {
    const count = await RealEstate.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "RealEstate count error" });
  }
});

app.get("/count/household", async (req, res) => {
  try {
    const count = await Household.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Household count error" });
  }
});

app.get("/count/accessory", async (req, res) => {
  try {
    const count = await accessory.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "accessory count error" });
  }
});

// --------------------------------------

// -----axtarış filteri

// ----------business profile filter
app.post("/api/business", verifyToken, async (req, res) => {
  try {
    console.log("📥 BUSINESS BODY:", req.body);
    console.log("👤 BUSINESS USER:", req.user);

    const {
      businessName,
      voen,
      businessType,
      businessCategory,
      description,
      phone,
      email,
      address,
      city,
    } = req.body;

    // ---------------------------------------------------------
    // BUSINESS NAME
    // ---------------------------------------------------------

    if (!businessName?.trim()) {
      return res.status(400).json({
        message: "Biznes adı mütləqdir",
      });
    }

    // ---------------------------------------------------------
    // VOEN
    // ---------------------------------------------------------

    if (!voen?.trim()) {
      return res.status(400).json({
        message: "VÖEN mütləqdir",
      });
    }

    if (!/^\d{10}$/.test(voen.trim())) {
      return res.status(400).json({
        message: "VÖEN 10 rəqəmdən ibarət olmalıdır",
      });
    }

    // ---------------------------------------------------------
    // BUSINESS CATEGORY
    // ---------------------------------------------------------

    if (!businessCategory) {
      return res.status(400).json({
        message: "Biznes kateqoriyası seçilməlidir",
      });
    }

    const allowedCategories = [
      "car",
      "phone",
      "electronics",
      "clothing",
      "realEstate",
      "homeGarden",
      "household",
      "accessory",
      "listing",
    ];

    if (!allowedCategories.includes(businessCategory)) {
      return res.status(400).json({
        message: "Yanlış biznes kateqoriyası seçilib",
      });
    }

    // ---------------------------------------------------------
    // SLUG
    // ---------------------------------------------------------

    const slugBase =
      businessName
        .toLowerCase()
        .trim()
        .replace(/ə/g, "e")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u")
        .replace(/ğ/g, "g")
        .replace(/ş/g, "s")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") || `biznes-${Date.now()}`;

    let slug = slugBase;

    let existingSlug = await BusinessProfile.findOne({
      slug,
    });

    let counter = 2;

    while (existingSlug) {
      slug = `${slugBase}-${counter}`;

      existingSlug = await BusinessProfile.findOne({
        slug,
      });

      counter++;
    }

    // ---------------------------------------------------------
    // CREATE BUSINESS
    // ---------------------------------------------------------

    const business = await BusinessProfile.create({
      owner: req.user.id,

      businessName: businessName.trim(),

      voen: voen.trim(),

      businessType: businessType || "magaza",

      // 🔥 VACİB
      category: businessCategory,

      description: description || "",

      phone: phone || "",

      email: email || "",

      address: address || "",

      city: city || "",

      slug,
    });

    console.log("✅ BUSINESS CREATED:", business);

    return res.status(201).json({
      message: "Biznes profili yaradıldı",
      business,
    });
  } catch (error) {
    console.error("❌ Business create error:", error);

    return res.status(500).json({
      message: "Biznes profili yaradıla bilmədi",
      error: error.message,
    });
  }
});

app.get("/api/business/my", verifyToken, async (req, res) => {
  try {
    const business = await BusinessProfile.findOne({
      owner: req.user.id,
    });

    if (!business) {
      return res.status(404).json({
        message: "Biznes profili yoxdur",
      });
    }

    res.json(business);
  } catch (error) {
    console.error("❌ Get business error:", error);

    res.status(500).json({
      message: "Biznes profili alınmadı",
      error: error.message,
    });
  }
});



app.get("/api/business/:slug", async (req, res) => {
  try {
    const business = await BusinessProfile.findOne({
      slug: req.params.slug,
    }).populate("owner", "username");

    if (!business) {
      return res.status(404).json({
        message: "Biznes profili tapılmadı",
      });
    }

    const ads = await Ad.find({
      businessId: business._id,
    }).sort({ createdAt: -1 });

    console.log("🏪 PUBLIC BUSINESS:", {
      id: business._id,
      name: business.businessName,
      category: business.category,
      slug: business.slug,
    });

    return res.json({
      business,
      ads,
    });
  } catch (error) {
    console.error("❌ Get public business error:", error);

    return res.status(500).json({
      message: "Biznes profili alınmadı",
      error: error.message,
    });
  }
});
// sayt xəritəsi api çağrış

app.get("/api/car", async (req, res) => {
  console.log("QUERY:", req.query);

  const filter = {
    category: "car",
  };

  if (req.query.brand) {
    filter["car.brand"] = req.query.brand;
  }

  if (req.query.model) {
    filter["car.model"] = req.query.model;
  }

  console.log("FILTER:", filter);

  const cars = await Ad.find(filter);

  console.log("FOUND:", cars.length);

  res.json(cars);
});

// -----------------------------

app.get("/api/filter/brands", async (req, res) => {
  const brands = await Ad.distinct("car.brand", {
    category: "car",
    isActive: true,
  });

  res.json(brands.filter(Boolean).sort());
});

app.get("/api/filter/models", async (req, res) => {
  const { brand } = req.query;

  const models = await Ad.distinct("car.model", {
    category: "car",
    isActive: true,
    "car.brand": brand,
  });

  res.json(models.filter(Boolean).sort());
});

app.get("/api/filter/motor", async (req, res) => {
  const { brand, model } = req.query;

  const motors = await Ad.distinct("car.motors", {
    category: "car",
    isActive: true,
    "car.brand": brand,
    "car.model": model,
  });

  res.json(motors.filter(Boolean).sort());
});
// -----------------

app.get("/my-:category", authMiddleware, async (req, res) => {
  try {
    const category = req.params.category;
    const Model = modelsMap[category];
    if (!Model) return res.status(400).json({ message: "Invalid category" });

    const ads = await Model.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(ads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/:category/:id", authMiddleware, async (req, res) => {
  try {
    const { category, id } = req.params;

    const Model = modelsMap[category];
    if (!Model) return res.status(400).json({ message: "Invalid category" });

    const ad = await Model.findById(id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    // FIXED
    if (ad.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Model.findByIdAndDelete(id);

    res.json({ message: "Ad deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// // DELETE /api/{category}/{id} - istifadəçi öz elanını silir

async function idGenerator() {
  let unique = false;
  let newId;

  while (!unique) {
    newId = Math.floor(10000 + Math.random() * 90000);
    const exists = await Announcement.findOne({ id: newId });
    if (!exists) unique = true;
  }
  return newId;
}

const ADMIN_USER = {
  username: "Omrs",
  password: "omrs5566", // test üçün sadə saxlanılıb
};

// Login route
app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
    const token = jwt.sign({ role: "admin" }, "secretKey", { expiresIn: "1h" });
    return res.json({ token });
  } else {
    return res
      .status(401)
      .json({ message: "İstifadəçi adı və ya şifrə yalnışdır" });
  }
});

// Middleware – token yoxlamaq üçün
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "Token yoxdur" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token etibarsızdır" });
    if (decoded.role !== "admin")
      return res.status(403).json({ message: "Admin girişi tələb olunur" });
    next();
  });
}

// Məsələn reklamlar üçün qorunan route
app.get("/api/ads", verifyAdmin, (req, res) => {
  res.json([{ id: 1, title: "Test Ad", link: "http://example.com" }]);
});

app.delete("/api/ads/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // frontend göndərəcək

    const ad = await Ad.findById(id);

    if (!ad) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    // ❌ Başqasının elanını silməsin
    if (ad.user.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Bu elanı silmək səlahiyyətin yoxdur" });
    }

    await ad.deleteOne();
    res.json({ message: "Elan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

// OTP saxlanması üçün sadə yaddaş (real app-da DB istifadə et)
const otpStore = {}; // { PhoneNumber: { otp: 1234, expires: Date } }

// OTP göndərmək
app.post("/api/send-otp", async (req, res) => {
  const { Phone } = req.body;
  if (!Phone)
    return res.status(400).json({ message: "Telefon nömrəsi tələb olunur" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6 rəqəmli kod
  otpStore[Phone] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 dəqiqəlik OTP

  try {
    await client.messages.create({
      body: `Sizin OTP kodunuz: ${otp}`,
      from: process.env.TWILIO_Phone_NUMBER,
      to: Phone,
    });
    res.json({ message: "OTP göndərildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP göndərilə bilmədi" });
  }
});

// OTP təsdiqləmək
app.post("/api/verify-otp", (req, res) => {
  const { Phone, otp } = req.body;
  if (!Phone || !otp)
    return res.status(400).json({ message: "Telefon və OTP tələb olunur" });

  const record = otpStore[Phone];
  if (!record) return res.status(400).json({ message: "OTP tapılmadı" });
  if (Date.now() > record.expires)
    return res.status(400).json({ message: "OTP vaxtı bitib" });
  if (Number(otp) !== record.otp)
    return res.status(400).json({ message: "OTP səhvdir" });

  delete otpStore[Phone]; // OTP istifadə olundu
  res.json({ message: "Telefon təsdiqləndi" });
});

// -----------------count

app.get("/counts", async (req, res) => {
  try {
    const result = {};

    await Promise.all(
      models.map(async (m) => {
        result[m.key] = await m.model.countDocuments();
      }),
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "error" });
  }
});

app.get("/api/ads/sticky", (req, res) => {
  res.json({ message: "sticky ads here" });
});
// ------------------------------

app.get("/api/car", async (req, res) => {
  try {
    const car = await Ad.find({ category: "car", isActive: true }).sort({
      priorityType: -1,
      createdAt: -1,
    });

    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/my-car", verifyToken, async (req, res) => {
  try {
    const car = await Ad.find({
      userId: req.user.id,
      category: "car",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/car/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ Car detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


app.post(
  "/api/car",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      // 🔥 car JSON parse
      const car = req.body.car ? JSON.parse(req.body.car) : {};

      console.log("CAR OBJECT:", car);
      console.log("GENERATION:", car.generation);

      // =========================================================
      // 🔥 BUSINESS YOXLAMASI
      // =========================================================

      let validBusinessId = null;

      if (req.body.businessId) {
        const business = await BusinessProfile.findOne({
          _id: req.body.businessId,
          owner: req.user.id,
        });

        // Biznes istifadəçiyə aid deyil
        if (!business) {
          return res.status(403).json({
            message:
              "Bu biznes profilindən elan yerləşdirmək icazəniz yoxdur.",
          });
        }

        // Biznesin kateqoriyası avtomobil olmalıdır
        if (business.category !== "car") {
          return res.status(400).json({
            message:
              "Bu biznesin kateqoriyası avtomobil elanları üçün uyğun deyil.",
          });
        }

        validBusinessId = business._id;
      }

      // =========================================================
      // 🔥 CONTACT
      // =========================================================

      const contact = {
        name: car.contact?.name || "",
        email: car.contact?.email || "",
        phone: car.contact?.phone || "",
      };

      // =========================================================
      // 🔥 TITLE
      // =========================================================

      const title = `${car.brand || ""} ${car.model || ""}`.trim();

      // =========================================================
      // 🔥 ŞƏKİLLƏR
      // =========================================================

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const files = req.files || [];

      const uploadedImages = [];

      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "car");

        uploadedImages.push(result.secure_url);
      }

      // İlk şəkil əsas şəkil
      let mainImage = uploadedImages[0] || null;

      // Əgər istifadəçi əsas şəkil seçibsə
      if (!isNaN(mainImageIndex) && uploadedImages[mainImageIndex]) {
        mainImage = uploadedImages[mainImageIndex];
      }

      console.log(Ad.schema.path("car.generation"));

      // =========================================================
      // 🔥 ELAN YARAT
      // =========================================================

      const newAd = await Ad.create({
        title,

        description: req.body.description || "",

        price: Number(req.body.price) || 0,

        location: req.body.location || "",

        city: req.body.city || "",

        // 🔥 Elanın sahibi
        userId: req.user.id,

        // 🔥 Kateqoriya
        category: "car",

        // =====================================================
        // 🔥 BİZNES BAĞLANTISI
        // =====================================================

        businessId: validBusinessId,

        // =====================================================
        // 🔥 CAR
        // =====================================================

        car: {
          brand: car.brand || "",

          model: car.model || "",

          generation: car.generation || "",

          ban_type: car.ban_type || "",

          year: car.year || "",

          engine: car.engine || "",

          transmission: car.transmission || "",

          km: car.km || "",

          color: car.color || "",

          motor: car.motor || "",

          modification: car.modification || "",

          barter: Boolean(car.barter),

          credit: Boolean(car.credit),

          salon: car.salon || "Xeyr",

          type_magasine: car.type_magasine || "",

          // 🔥 contact car daxilində
          contact,
        },

        // =====================================================
        // 🔥 ayrıca contact
        // =====================================================

        contact,

        // =====================================================
        // 🔥 ŞƏKİLLƏR
        // =====================================================

        images: uploadedImages,

        mainImage,

        // =====================================================
        // 🔥 PRIORITY
        // =====================================================

        priorityType: req.body.priorityType || "free",

        priorityExpires: req.body.priorityExpires || null,

        liked: false,

        favorite: false,
      });

      console.log("✅ Car elan yaradıldı:", newAd._id);

      console.log("🏪 Business ID:", validBusinessId);

      return res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ Car əlavə olunarkən xəta:", err);

      return res.status(500).json({
        error: err.message,
      });
    }
  }
);







app.delete("/api/car/:id", verifyToken, async (req, res) => {
  try {
    const car = await Ad.findById(req.params.id);

    if (!car) return res.status(404).json({ message: "Tapılmadı" });

    if (car.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await car.deleteOne();

    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/car/:id/like", async (req, res) => {
  const car = await Ad.findById(req.params.id);
  car.liked = !car.liked;
  await car.save();
  res.json(car);
});

app.patch("/api/car/:id/favorite", async (req, res) => {
  const car = await Ad.findById(req.params.id);
  car.favorite = !car.favorite;
  await car.save();
  res.json(car);
});

app.get("/api/ads/search", async (req, res) => {
  const { brand, model } = req.query;

  const ads = await Ad.find({
    category: "car",
    ...(brand && { brand }),
    ...(model && { model: new RegExp(model, "i") }),
  });

  res.json({
    count: ads.length,
    ads,
  });
});

// --------------------------------------------

// ----Phones-------


app.post(
  "/api/phone",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      // =====================================================
      // ŞƏKİLLƏRİ CLOUDINARY-YƏ YÜKLƏ
      // =====================================================
      const files = req.files || [];
      const uploadedImages = [];

      for (const file of files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "phone"
        );

        uploadedImages.push(result.secure_url);
      }

      // =====================================================
      // BAŞLIQ
      // =====================================================
      const title =
        `${req.body.brand || ""} ${req.body.model || ""}`.trim() ||
        "Telefon";

      // =====================================================
      // BİZNES ID
      // =====================================================
      const businessId =
        req.body.businessId &&
        String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      // =====================================================
      // ELAN YARAT
      // =====================================================
      const newAd = await Ad.create({
        title,

        description: req.body.description || "",

        price: Number(req.body.price) || 0,

        location: req.body.location || "",

        category: "phone",

        // 🔥 BİZNES PROFİLİ İLƏ ƏLAQƏ
        businessId,

        // =====================================================
        // TELEFON MƏLUMATLARI
        // =====================================================
        phone: {
          title,

          brand: req.body.brand || "",

          model: req.body.model || "",

          storage: req.body.storage || "",

          ram: req.body.ram || "",

          color: req.body.color || "",

          sim_card: req.body.sim_card || "",

          description: req.body.description || "",
        },

        // =====================================================
        // ƏLAQƏ MƏLUMATLARI
        // =====================================================
        contact: {
          name: req.body["contact.name"] || "",

          email: req.body["contact.email"] || "",

          phone: req.body["contact.phone"] || "",
        },

        // =====================================================
        // İSTİFADƏÇİ
        // =====================================================
        userId: req.user.id,

        // =====================================================
        // ŞƏKİLLƏR
        // =====================================================
        images: uploadedImages,

        mainImage:
          uploadedImages[0] || null,

        // =====================================================
        // PRIORITET
        // =====================================================
        priorityType:
          req.body.priorityType || "free",
      });

      // =====================================================
      // UĞURLU CAVAB
      // =====================================================
      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ Phone error:", err);

      res.status(500).json({
        message: err.message,
      });
    }
  }
);


app.get("/api/phone", async (req, res) => {
  try {
    const data = await Ad.find({
      category: "phone",
      isActive: true,
    }).sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/phone/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ Phone detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});



app.delete("/api/phone/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Tapılmadı" });

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await item.deleteOne();

    res.json({ message: "Silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/phone/:id/like", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.liked = !item.liked;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/phone/:id/favorite", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.favorite = !item.favorite;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------

// ----------elektronika

app.get("/api/my-electronics", verifyToken, async (req, res) => {
  try {
    const electronics = await Ad.find({
      userId: req.user.id,
      category: "electronics",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(electronics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/electronics", async (req, res) => {
  try {
    const electronics = await Ad.find({
      category: "electronics",
    }).sort({ createdAt: -1 });

    res.json(electronics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/electronics/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ Electronics detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post(
  "/api/electronics",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const uploadedImages = [];

      // 🔥 SAFE UPLOAD
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "electronics");

        uploadedImages.push(result.secure_url);
      }

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      const contact = {
        name: req.body["contact.name"] || "",
        email: req.body["contact.email"] || "",
        phone: req.body["contact.phone"] || "",
      };

      const title = `${req.body.brand || ""} ${req.body.model || ""}`.trim();

      // 🏪 Biznes profilindən gələn businessId
      const businessId =
        req.body.businessId && String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      const newAd = await Ad.create({
        title,
        description: req.body.description || "",
        price: Number(req.body.price) || 0,
        location: req.body.location || "",

        category: "electronics",

        // 🏪 Elanı biznes profilinə bağlayır
        businessId,

        electronics: {
          brand: req.body.brand || "",
          model: req.body.model || "",
          type: req.body.type || "",
        },

        contact,

        userId: req.user.id,

        images: uploadedImages,
        mainImage,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ ELECTRONICS ERROR:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  },
);



app.delete("/api/electronics/:id", verifyToken, async (req, res) => {
  try {
    const electronics = await Ad.findById(req.params.id);

    if (!electronics) return res.status(404).json({ message: "Tapılmadı" });

    if (electronics.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await electronics.deleteOne();

    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/electronics/:id/like", async (req, res) => {
  const electronics = await Ad.findById(req.params.id);
  electronics.liked = !electronics.liked;
  await electronics.save();
  res.json(electronics);
});

app.patch("/api/electronics/:id/favorite", async (req, res) => {
  const electronics = await Ad.findById(req.params.id);
  electronics.favorite = !electronics.favorite;
  await electronics.save();
  res.json(electronics);
});

app.get("/api/ads/search", async (req, res) => {
  const { brand, model } = req.query;

  const ads = await Ad.find({
    category: "electronics",
    ...(brand && { brand }),
    ...(model && { model: new RegExp(model, "i") }),
  });

  res.json({
    count: ads.length,
    ads,
  });
});

// -------------------------------------------


// ----------------------------------

// -----------geyimler-----------
app.get("/api/clothing", async (req, res) => {
  try {
    const data = await Ad.find({ category: "clothing", isActive: true }).sort({
      priorityType: -1,
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/my-clothing", verifyToken, async (req, res) => {
  try {
    const data = await Ad.find({
      userId: req.user.id,
      category: "clothing",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/clothing/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ Clothing detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post(
  "/api/clothing",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const uploadedImages = [];

      // 🔥 SAFE CLOUDINARY UPLOAD
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "clothing");

        uploadedImages.push(result.secure_url);
      }

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      const title = `${req.body.brand || ""} ${req.body.model || ""}`.trim();

      // 🏪 Biznes profilindən gələn businessId
      const businessId =
        req.body.businessId && String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      const newAd = await Ad.create({
        title,
        description: req.body.description || "",
        price: Number(req.body.price) || 0,
        location: req.body.location || "",

        category: "clothing",

        // 🏪 Elanı biznes profilinə bağlayır
        businessId,

        clothing: {
          brand: req.body.brand || "",
          model: req.body.model || "",
          type: req.body.type || "",
          color: req.body.color || "",
          size: req.body.size || "",
        },

        contact: {
          name: req.body["contact.name"] || "",
          email: req.body["contact.email"] || "",
          phone: req.body["contact.phone"] || "",
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ Clothing error:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  },
);


app.delete("/api/clothing/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Tapılmadı",
      });
    }

    // 👤 Adi elan sahibidirsə
    const isDirectOwner =
      item.userId && String(item.userId) === String(req.user.id);

    // 🏪 Biznes sahibidirsə
    let isBusinessOwner = false;

    if (item.businessId) {
      const business = await BusinessProfile.findOne({
        _id: item.businessId,
        owner: req.user.id,
      }).lean();

      isBusinessOwner = Boolean(business);
    }

    // ❌ Heç biri deyilsə icazə yoxdur
    if (!isDirectOwner && !isBusinessOwner) {
      return res.status(403).json({
        message: "İcazə yoxdur",
      });
    }

    await item.deleteOne();

    res.json({
      message: "Silindi ✅",
    });
  } catch (err) {
    console.error("❌ Clothing delete error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.put("/api/clothing/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    // 👤 Adi elan sahibidirsə
    const isDirectOwner =
      item.userId && String(item.userId) === String(req.user.id);

    // 🏪 Biznes sahibidirsə
    let isBusinessOwner = false;

    if (item.businessId) {
      const business = await BusinessProfile.findOne({
        _id: item.businessId,
        owner: req.user.id,
      }).lean();

      isBusinessOwner = Boolean(business);
    }

    // ❌ Nə elan sahibi, nə də biznes sahibi
    if (!isDirectOwner && !isBusinessOwner) {
      return res.status(403).json({
        message: "İcazə yoxdur",
      });
    }

    // ================================
    // ƏSAS ELAN MƏLUMATLARI
    // ================================

    if (req.body.title !== undefined) {
      item.title = String(req.body.title).trim();
    }

    if (req.body.price !== undefined) {
      const price = Number(req.body.price);

      if (Number.isNaN(price)) {
        return res.status(400).json({
          message: "Qiymət düzgün deyil",
        });
      }

      item.price = price;
    }

    if (req.body.city !== undefined) {
      item.city = String(req.body.city).trim();
    }

    if (req.body.location !== undefined) {
      item.location = String(req.body.location).trim();
    }

    if (req.body.description !== undefined) {
      item.description = String(req.body.description).trim();
    }

    await item.save();

    res.json({
      message: "Elan uğurla yeniləndi",
      ad: item,
    });
  } catch (err) {
    console.error("❌ Clothing update error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


app.patch("/api/clothing/:id/like", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.liked = !item.liked;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/clothing/:id/favorite", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.favorite = !item.favorite;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/clothing/search", async (req, res) => {
  try {
    const { brand, model } = req.query;

    const data = await Ad.find({
      category: "clothing",
      ...(brand && { brand }),
      ...(model && { model: new RegExp(model, "i") }),
    });

    res.json({
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// -----------------------------

// ------ev alqi satqi----------

app.post(
  "/api/realEstate",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const uploadedImages = [];

      // 🔥 SAFE CLOUDINARY UPLOAD
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "realEstate");

        uploadedImages.push(result.secure_url);
      }

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      const title =
        `${req.body.rooms || ""} otaqlı ${req.body.type_building || ""}`.trim();

      // 🏪 Biznes profilindən gələn businessId
      const businessId =
        req.body.businessId && String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      const newAd = await Ad.create({
        title,
        description: req.body.description || "",
        price: Number(req.body.price) || 0,
        location: req.body.location || "",

        category: "realEstate",

        // 🏪 Elanı biznes profilinə bağlayır
        businessId,

        realEstate: {
          title,
          city: req.body.city || "",
          type_building: req.body.type_building || "",
          rooms: req.body.rooms || "",
          area: req.body.area || "",
          floor: req.body.floor || "",
          number_of_rooms: req.body.number_of_rooms || "",
          field: req.body.field || "",
        },

        contact: {
          name: req.body["contact.name"] || "",
          email: req.body["contact.email"] || "",
          phone: req.body["contact.phone"] || "",
        },

        userId: req.user.id,

        images: uploadedImages,
        mainImage,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ RealEstate error:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  },
);

app.get("/api/realEstate", async (req, res) => {
  try {
    const items = await Ad.find({
      category: "realEstate",
      isActive: true,
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/my-realEstate", verifyToken, async (req, res) => {
  try {
    const items = await Ad.find({
      userId: req.user.id,
      category: "realEstate",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/realEstate/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ RealEstate detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


app.delete("/api/realEstate/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Tapılmadı" });

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await item.deleteOne();

    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/realEstate/:id/like", async (req, res) => {
  const item = await Ad.findById(req.params.id);
  item.liked = !item.liked;
  await item.save();
  res.json(item);
});

app.patch("/api/realEstate/:id/favorite", async (req, res) => {
  const item = await Ad.findById(req.params.id);
  item.favorite = !item.favorite;
  await item.save();
  res.json(item);
});

// ------HomeAndGarden---


// ------

app.get("/api/homeGarden", async (req, res) => {
  try {
    const items = await Ad.find({
      category: "homeGarden",
      isActive: true,
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/my-homeGarden", verifyToken, async (req, res) => {
  try {
    const items = await Ad.find({
      userId: req.user.id,
      category: "homeGarden",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/homeGarden/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ HomeGarden detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post(
  "/api/homeGarden",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const uploadedImages = [];

      // 🔥 SAFE CLOUDINARY UPLOAD
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "homeGarden");

        uploadedImages.push(result.secure_url);
      }

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      const title = req.body.title || req.body.brand || "";

      // 🏪 Biznes profilindən gələn businessId
      const businessId =
        req.body.businessId && String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      const newAd = await Ad.create({
        title,
        description: req.body.description || "",
        price: Number(req.body.price) || 0,
        location: req.body.location || "",

        category: "homeGarden",

        // 🏪 Elanı biznes profilinə bağlayır
        businessId,

        homeGarden: {
          title,
          brand: req.body.brand || "",
          model: req.body.model || "",
          type: req.body.type || "",
        },

        contact: {
          name: req.body["contact.name"] || "",
          email: req.body["contact.email"] || "",
          phone: req.body["contact.phone"] || "",
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ HomeGarden error:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  },
);


app.delete("/api/homeGarden/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Tapılmadı" });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await item.deleteOne();

    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/homeGarden/:id/like", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.liked = !item.liked;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/homeGarden/:id/favorite", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.favorite = !item.favorite;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------household

app.post(
  "/api/household",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const uploadedImages = [];

      // =====================================================
      // CLOUDINARY ŞƏKİL YÜKLƏMƏ
      // =====================================================
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "household");

        uploadedImages.push(result.secure_url);
      }

      // =====================================================
      // ƏSAS ŞƏKİL
      // =====================================================
      const mainImageIndex = Number.isInteger(parseInt(req.body.mainImageIndex))
        ? parseInt(req.body.mainImageIndex)
        : 0;

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      // =====================================================
      // BAŞLIQ
      // =====================================================
      const title = req.body.title || req.body.brand || "Məişət texnikası";

      // =====================================================
      // BİZNES ID
      // =====================================================
      const businessId =
        req.body.businessId && String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      // =====================================================
      // ELAN YARAT
      // =====================================================
      const newAd = await Ad.create({
        title,

        description: req.body.description || "",

        price: Number(req.body.price) || 0,

        location: req.body.location || "",

        category: "household",

        // 🔥 BİZNES PROFİLİ İLƏ ƏLAQƏ
        businessId,

        // =====================================================
        // HOUSEHOLD MƏLUMATLARI
        // =====================================================
        household: {
          title: req.body.title || "",
          brand: req.body.brand || "",
          model: req.body.model || "",

          // Frontend-də type_of_goods istifadə edirsə
          type: req.body.type || req.body.type_of_goods || "",

          category: req.body.category || "",

          type_of_household:
            req.body.type_of_household || req.body.type_of_goods || "",
        },

        // =====================================================
        // ƏLAQƏ
        // =====================================================
        contact: {
          name: req.body["contact.name"] || "",
          email: req.body["contact.email"] || "",
          phone: req.body["contact.phone"] || "",
        },

        // =====================================================
        // ŞƏKİLLƏR
        // =====================================================
        images: uploadedImages,

        mainImage,

        // =====================================================
        // İSTİFADƏÇİ
        // =====================================================
        userId: req.user.id,

        // =====================================================
        // ELAN PRIORİTETİ
        // =====================================================
        priorityType: req.body.priorityType || "free",
      });

      // =====================================================
      // UĞURLU CAVAB
      // =====================================================
      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ Household error:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  },
);


app.get("/api/household", async (req, res) => {
  try {
    const items = await Ad.find({ category: "household", isActive: true }).sort(
      { priorityType: -1, createdAt: -1 },
    );

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/my-household", verifyToken, async (req, res) => {
  try {
    const items = await Ad.find({
      userId: req.user.id,
      category: "household",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/household/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ Household detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});


app.delete("/api/household/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Tapılmadı" });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await item.deleteOne();

    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/household/:id/like", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Tapılmadı" });
    }
    item.liked = !item.liked;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/household/:id/favorite", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Tapılmadı" });
    }

    item.favorite = !item.favorite;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------

app.get("/api/ads", async (req, res) => {
  const { category, brand, model } = req.query;

  let filter = { isActive: true };

  if (category) filter.category = category;
  if (brand) filter.brand = brand;
  if (model) filter.model = new RegExp(model, "i");

  const ads = await Ad.find(filter).sort({
    priorityType: -1,
    createdAt: -1,
  });

  res.json(ads);
});

// ----acsesuarr

app.get("/api/accessory", async (req, res) => {
  try {
    const data = await Ad.find({ category: "accessory", isActive: true }).sort({
      priorityType: -1,
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/my-accessory", verifyToken, async (req, res) => {
  try {
    const data = await Ad.find({
      userId: req.user.id,
      category: "accessory",
    }).sort({ priorityType: -1, createdAt: -1 });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/accessory/:id", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id).populate(
      "businessId",
      "businessName slug logo coverImage verified city",
    );

    if (!item) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    res.json(item);
  } catch (err) {
    console.error("❌ Accessory detail error:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post(
  "/api/accessory",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const files = req.files || [];
      const uploadedImages = [];

      // 🔥 SAFE CLOUDINARY UPLOAD
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "accessory");

        uploadedImages.push(result.secure_url);
      }

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      const contact = req.body.contact ? JSON.parse(req.body.contact) : {};

      const title = `${req.body.brand || ""} ${req.body.model || ""}`.trim();

      // 🏪 Biznes profilindən gələn businessId
      const businessId =
        req.body.businessId && String(req.body.businessId).trim() !== ""
          ? req.body.businessId
          : null;

      const newAd = await Ad.create({
        title,
        description: req.body.description || "",
        price: Number(req.body.price) || 0,
        location: req.body.location || "",

        category: "accessory",

        // 🏪 Elanı biznes profilinə bağlayır
        businessId,

        accessory: {
          title,
          brand: req.body.brand || "",
          model: req.body.model || "",
          type: req.body.type || "",
        },

        contact: {
          name: contact.name || "",
          email: contact.email || "",
          phone: contact.phone || "",
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ accessory error:", err);

      res.status(500).json({
        error: err.message,
      });
    }
  },
);


app.delete("/api/accessory/:id", verifyToken, async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Tapılmadı" });
    }

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "İcazə yoxdur" });
    }

    await item.deleteOne();

    res.json({ message: "Silindi ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/accessory/:id/like", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.liked = !item.liked;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/accessory/:id/favorite", async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    item.favorite = !item.favorite;
    await item.save();

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/accessory/search", async (req, res) => {
  try {
    const { model } = req.query;

    const data = await Ad.find({
      category: "accessory",
      ...(model && { model: new RegExp(model, "i") }),
    });

    res.json({
      count: data.length,
      data,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ---------------------------

// ----------------------PUT------------------



// ======================================================
// UNIVERSAL ELAN UPDATE
// BÜTÜN KATEQORİYALAR ÜÇÜN
// ======================================================

const categoryDetailMap = {
  car: "car",
  phone: "phoneDetail",
  electronics: "electronics",
  clothing: "clothing",
  realEstate: "realEstate",
  homeGarden: "homeGarden",
  household: "household",
  accessory: "accessory",
};


// ======================================================
// UNIVERSAL UPDATE HANDLER
// ======================================================

const updateAdHandler = async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);

    if (!ad) {
      return res.status(404).json({
        message: "Elan tapılmadı",
      });
    }

    // --------------------------------------------------
    // İstifadəçi yoxlaması
    // --------------------------------------------------

    if (String(ad.userId) !== String(req.user.id)) {
      return res.status(403).json({
        message: "İcazə yoxdur",
      });
    }


    // ==================================================
    // ŞƏKİLLƏR
    // ==================================================

    if (req.files && req.files.length > 0) {
      const uploadedImages = [];

      for (const file of req.files) {
        try {
          if (!file?.path) {
            console.log("❌ file.path yoxdur:", file);
            continue;
          }

          const result = await cloudinary.uploader.upload(file.path, {
            folder: `ads/${ad.category || "other"}`,
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (uploadError) {
          console.error(
            "❌ Cloudinary upload error:",
            uploadError.message
          );

          if (file?.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      if (uploadedImages.length > 0) {
        ad.images = uploadedImages;

        // İlk şəkli əsas şəkil kimi də saxla
        ad.mainImage = uploadedImages[0];
      }
    }


    // ==================================================
    // REQUEST-DƏN DATA-NI OXU
    // ==================================================

    let payload = {};

    try {
      if (req.body.ad) {
        payload =
          typeof req.body.ad === "string"
            ? JSON.parse(req.body.ad)
            : req.body.ad;
      } else {
        payload = req.body || {};
      }
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);

      return res.status(400).json({
        message: "Göndərilən məlumat düzgün deyil",
      });
    }


    // ==================================================
    // ÜMUMİ ELAN SAHƏLƏRİ
    // ==================================================

    if (payload.title !== undefined) {
      ad.title = payload.title;
    }

    if (payload.description !== undefined) {
      ad.description = payload.description;
    }

    if (
      payload.price !== undefined &&
      payload.price !== ""
    ) {
      const price = Number(payload.price);

      if (!Number.isNaN(price)) {
        ad.price = price;
      }
    }

    if (payload.city !== undefined) {
      ad.city = payload.city;
    }

    if (payload.location !== undefined) {
      ad.location = payload.location;
    }


    // ==================================================
    // KATEQORİYA DETALLARI
    // ==================================================

    const detailKey = categoryDetailMap[ad.category];

    if (
      detailKey &&
      payload.details &&
      typeof payload.details === "object"
    ) {
      const oldDetails =
        ad[detailKey]?.toObject?.() ||
        ad[detailKey] ||
        {};

      const newDetails = {
        ...oldDetails,
      };


      // ------------------------------------------------
      // Yalnız göndərilən sahələri dəyiş
      // ------------------------------------------------

      Object.entries(payload.details).forEach(
        ([field, value]) => {
          if (
            field === "_id" ||
            field === "id" ||
            field === "userId"
          ) {
            return;
          }

          if (value !== undefined) {
            newDetails[field] = value;
          }
        }
      );


      ad[detailKey] = newDetails;
    }


    // ==================================================
    // SAVE
    // ==================================================

    await ad.save();

    // MongoDB-dən yenilənmiş formada yenidən götür
    const updatedAd = await Ad.findById(ad._id);

    return res.json({
      message: "Elan uğurla yeniləndi",
      ad: updatedAd,
    });

  } catch (err) {
    console.error("❌ UNIVERSAL UPDATE ERROR:", err);

    return res.status(500).json({
      message: "Elan yenilənmədi",
      error: err.message,
    });
  }
};


// ======================================================
// UNIVERSAL PUT
// ======================================================

app.put(
  "/api/ads/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);


// ======================================================
// KÖHNƏ ROUTE-LAR DA SAXLANILIR
// BELƏLİKLƏ BAŞQA YERLƏRDƏKİ KODLARIN DA POZULMUR
// ======================================================

app.put(
  "/api/car/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/phone/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/electronics/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/clothing/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/realEstate/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/homeGarden/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/household/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);

app.put(
  "/api/accessory/:id",
  verifyToken,
  upload.array("images", 20),
  updateAdHandler
);


app.post("/api/register", async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("PHONE:", req.body.phone);
    console.log("TYPE:", typeof req.body.phone);
    const {
      username,
      phone,
      email,
      password
    } = req.body;
 console.log("PHONE AFTER DESTRUCTURE:", phone);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      phone,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "User created",
    });

  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json("User not found");

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );
    if (!validPassword) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1d" });
    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json(err);
  }
});


// profil üçün
app.get("/api/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // password göndərmə
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});

// });

const buildPath = path.join(__dirname, "../frontend/build");

// Static frontend
app.use(express.static(buildPath));

// SPA fallback
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }

  res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`🚀 Server işə düşdü: http://localhost:${PORT}`);
});
