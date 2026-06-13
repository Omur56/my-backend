import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./db.js";
// import Announcement from "./models/Announcement.js";
import adRoutes from "./routes/adRoutes.js";
import HomeAndGarden from "./models/HomeAndGarden.js";
// import electronics from "./models/.js";
// import accessory from "./models/Acsesuar.js";
import RealEstate from "./models/RealEstate.js";
import HouseHold from "./models/Household.js";
import phone from "./models/Phone.js";
import Clothing from "./models/Clothing.js";
import Jewelry from "./models/Jewelry.js";
import User from "./models/user.js";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { verifyToken } from "./middleware/verifyToken.js";
import nodemailer from "nodemailer";
import authRoutes from "./routes/auth.js";
import Ad from "./models/Ad.js";
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
import listingRoutes from "./routes/listingRoutes.js";
import "./utils/expireChecker.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import "./cron/expireListings.js";
import "./utils/expireChecker.js";
import stripeWebhookRoutes from "./routes/stripeWebhook.js";
import announcements from "./routes/announcements.js";
import cron from "node-cron";
import { expireVip } from "./utils/expireVip.js";
import { checkExpiredListings } from "./utils/checkExpiredListings.js";
import "./cron.js";
import statsRoutes from "./routes/countSay.js";
import stickyAdsRoutes from "./routes/stickyAdsRoutes.js";

// import { checkExpiredListings } from "./cron/checkExpiredListings.js";

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

// const PORT = 5000;

// app.use("/api/stripe", stripeWebhookRoutes);

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
          "https://www.google-analytics.com"
        ],

        workerSrc: ["'self'", "blob:"],

        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com"
        ],

        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://res.cloudinary.com"
        ],

        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com"
        ],

        frameSrc: [
          "'self'",
          "https://googleads.g.doubleclick.net",
          "https://pagead2.googlesyndication.com",
          "https://www.google.com"
        ]
      }
    }
  })
);

app.use("/api/stripe", stripeWebhookRoutes);

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

app.listen(5000, async () => {
  console.log("Server started");
  await generateSitemap(); // sitemap yaradılır
});

// Routes

const PORT = process.env.PORT || 10000;

const BASE_URL = process.env.BASE_URL || "http://localhost:10000";

// Multer config
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "uploads/"),
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage });


// const uploadToCloudinary = (buffer, folder = "uploads") => {
//   return new Promise((resolve, reject) => {
//     const stream = cloudinary.uploader.upload_stream(
//       {
//         folder,
//         transformation: [
//           {
//             overlay: "proelan_watermark",
//             width: 0.6,
//             opacity: 30,
//             gravity: "center",
//           },
//         ],
//       },
//       (error, result) => {
//         if (error) return reject(error);
//         resolve(result);
//       }
//     );

//     stream.end(buffer);
//   });
// };


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
      }
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
app.use("/api/payments", paymentRoutes); // create-checkout
// app.use("/api/payments/webhook", stripeWebhookRoutes); // Stripe webhook
app.use("/api/listings", listingRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/ads", adsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/profile", profileRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/countSay", statsRoutes);
app.use("/api/sticky-ads", stickyAdsRoutes);
app.use("/api/ad", adRoutes);

// Stripe ödəniş və checkout

app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "connect-src 'self' http://localhost:5000 http://localhost:10000 http://localhost:3000 https://proelan.az https://geminally-stealthless-mimi.ngrok-free.dev https://my-backend-wj5g.onrender.com https://ep1.adtrafficquality.google https://checkout.stripe.com; img-src 'self' data: blob: https://res.cloudinary.com; script-src 'self' 'unsafe-inline' https://checkout.stripe.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net; style-src 'self' 'unsafe-inline'; frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  );
  next();
});


// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 } // 10MB
// });

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
app.post("/api/ads", upload.array("images", 20), authMiddleware, async (req, res) => {
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
});


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


// kateqoriya-mapping
// const modelsMap = {
//   realEstate: RealEstate,
//   homeAndGarden: HomeAndGarden,
//   Clothing: Clothing,
//   Announcement: Announcement,
//   electronics: electronics,
//   accessory: accessory,
//   HouseHold: HouseHold,
//   Phone: Phone,
// };

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
// app.delete("/:category/:id", authMiddleware, async (req, res) => {
//   try {
//     const { category, id } = req.params;
//     const Model = modelsMap[category];
//     if (!Model) return res.status(400).json({ message: "Invalid category" });

//     const ad = await Model.findById(id);
//     if (!ad) return res.status(404).json({ message: "Ad not found" });

//     // Yalnız sahibi silə bilər
//     if (ad.user.toString() !== req.user.id)
//       return res.status(403).json({ message: "Not authorized" });

//     await Model.findByIdAndDelete(id);
//     res.json({ message: "Ad deleted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server error" });
//   }
// });
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
    const car = await Ad.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Elan tapılmadı" });

    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xətası" });
  }
});



app.post(
  "/api/car",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const contact = {
        name: req.body["contact.name"],
        email: req.body["contact.email"],
        phone: req.body["contact.phone"],
      };

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const uploadedImages = [];

      // 🔥 SAFETY FIX
      const files = req.files || [];

      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "car");
        uploadedImages.push(result.secure_url);
      }

      let mainImage = uploadedImages[0] || null;

      if (!isNaN(mainImageIndex) && uploadedImages[mainImageIndex]) {
        mainImage = uploadedImages[mainImageIndex];
      }

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: Number(req.body.price),
        location: req.body.location,
        city: req.body.city,
        userId: req.user.id, 
        category: "car",

        brand: req.body.brand,
        model: req.body.model,

        car: {
          ban_type: req.body.ban_type,
          year: req.body.year,
          engine: req.body.engine,
          transmission: req.body.transmission,
          km: req.body.km,
          color: req.body.color,
          motor: req.body.motor,
          modification: req.body.modification,
          barter: req.body.barter,
          credit: req.body.credit,
          salon: req.body.salon,
        },
 contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
          
        },

        // contact,
        userId: req.user.id,

        images: uploadedImages,
        mainImage,

        priorityType: req.body.priorityType || "free",
        priorityExpires: req.body.priorityExpires || null,

        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ Car əlavə olunarkən xəta:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  "/api/car/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const car = await Ad.findById(req.params.id);

      if (!car) return res.status(404).json({ message: "Elan tapılmadı" });

      if (car.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "car",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        car.images = uploadedImages;
      }

      car.title = req.body.title || car.title;
      car.description = req.body.description || car.description;
      car.price = req.body.price ? Number(req.body.price) : car.price;

      await car.save();

      res.json(car);
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ error: err.message });
    }
  },
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


// app.post(
//   "/api/phone",
  
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const files = req.files || [];

//       const uploadedImages = [];

//       // 🔥 SAFE UPLOAD
//       for (const file of files) {
//         const result = await uploadToCloudinary(file.buffer, "phone");
//         uploadedImages.push(result.secure_url);
//       }

//       const mainImageIndex = parseInt(req.body.mainImageIndex);

//       const mainImage =
//         uploadedImages[mainImageIndex] || uploadedImages[0] || null;

//       const newAd = await Ad.create({
//         title: req.body.title,
//         description: req.body.description,
//         price: req.body.price ? Number(req.body.price) : 0,
//         location: req.body.location,

//         category: "phone",

//         phone: {
//           storage: req.body.storage,
//           color: req.body.color,
//           ram: req.body.ram,
//           sim_card: req.body.sim_card,
//         },

//         contact: {
//           name: req.body["contact.name"],
//           email: req.body["contact.email"],
//           phone: req.body["contact.phone"],
//         },

//         userId: req.user.id,

//         images: uploadedImages,
//         mainImage,

//         priorityType: req.body.priorityType || "free",
//         liked: false,
//         favorite: false,
//       });

//       res.status(201).json(newAd);

//     } catch (err) {
//       console.error("Phone ERROR:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );




app.post(
  "/api/phone",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      console.log(req.files);
      console.log(req.body);
      console.log(req.user);

      const files = req.files || [];

      const uploadedImages = [];

      for (const file of files) {
        const result = await uploadToCloudinary(
          file.buffer,
          "phone"
        );

        uploadedImages.push(result.secure_url);
      }

      const newAd = await Ad.create({
        title: req.body.title,
        brand: req.body.brand,
        model: req.body.model,
        description: req.body.description,
        price: Number(req.body.price),
        location: req.body.location,

        category: "phone",

        phoneDeatail: {
          storage: req.body.storage,
          color: req.body.color,
          ram: req.body.ram,
          sim_card: req.body.sim_card,
        },

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        userId: req.user.id,

        images: uploadedImages,
        mainImage: uploadedImages[0],

        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error(err);

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

app.get("/api/phone/:id",  async (req, res) => {
  try {
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Tapılmadı" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put(
  "/api/phone/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const item = await Ad.findById(req.params.id);

      if (!item) return res.status(404).json({ message: "Tapılmadı" });

      if (item.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      const files = req.files || [];

      if (files.length > 0) {
        const uploadedImages = [];

        for (const file of files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "phone",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        item.images = uploadedImages;
      }

      item.title = req.body.title || item.title;
      item.description = req.body.description || item.description;
      item.price = req.body.price ? Number(req.body.price) : item.price;

      await item.save();

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

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
        name: req.body["contact.name"],
        email: req.body["contact.email"],
        phone: req.body["contact.phone"],
      };

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,

        location: req.body.location,
        category: "electronics",

        brand: req.body.brand,
        model: req.body.model,

        contact,
        userId: req.user.id,

        images: uploadedImages,
        mainImage,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ ELECTRONICS ERROR:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


app.put(
  "/api/electronics/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const electronics = await Ad.findById(req.params.id);

      if (!electronics)
        return res.status(404).json({ message: "Elan tapılmadı" });

      if (electronics.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "electronics",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        electronics.images = uploadedImages;
      }

      electronics.title = req.body.title || electronics.title;
      electronics.description = req.body.description || electronics.description;
      electronics.price = req.body.price
        ? Number(req.body.price)
        : electronics.price;

      await electronics.save();

      res.json(electronics);
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ error: err.message });
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

// app.post(
//   "/api/Phone",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const files = req.files || [];

//       const uploadedImages = [];

//       // 🔥 SAFE UPLOAD
//       for (const file of files) {
//         const result = await uploadToCloudinary(file.buffer, "Phone");
//         uploadedImages.push(result.secure_url);
//       }

//       const mainImageIndex = parseInt(req.body.mainImageIndex);

//       const mainImage =
//         uploadedImages[mainImageIndex] || uploadedImages[0] || null;

//       const newAd = await Ad.create({
//         title: req.body.title,
//         description: req.body.description,
//         price: req.body.price ? Number(req.body.price) : 0,
//         location: req.body.location,

//         category: "Phone",

//         brand: req.body.brand,
//         model: req.body.model,

//         Phone: {
//           storage: req.body.storage,
//           color: req.body.color,
//         },

//         contact: {
//           name: req.body["contact.name"],
//           email: req.body["contact.email"],
//           Phone: req.body["contact.Phone"],
//         },

//         userId: req.user.id,

//         images: uploadedImages,
//         mainImage,

//         priorityType: req.body.priorityType || "free",
//         liked: false,
//         favorite: false,
//       });

//       res.status(201).json(newAd);

//     } catch (err) {
//       console.error("Phone ERROR:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// app.get("/api/Phone", async (req, res) => {
//   try {
//     const Phones = await Ad.find({ category: "Phone", isActive: true }).sort({
//       priorityType: -1,
//       createdAt: -1,
//     });

//     res.json(Phones);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/my-Phone", verifyToken, async (req, res) => {
//   try {
//     const Phones = await Ad.find({
//       userId: req.user.id,
//       category: "Phone",
//     }).sort({ priorityType: -1, createdAt: -1 });

//     res.json(Phones);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/Phone/:id", async (req, res) => {
//   try {
//     const Phone = await Ad.findById(req.params.id);

//     if (!Phone) return res.status(404).json({ message: "Tapılmadı" });

//     res.json(Phone);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.put(
//   "/api/Phone/:id",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const Phone = await Ad.findById(req.params.id);

//       if (!Phone) return res.status(404).json({ message: "Tapılmadı" });

//       if (Phone.userId.toString() !== req.user.id) {
//         return res.status(403).json({ message: "İcazə yoxdur" });
//       }

//       if (req.files && req.files.length > 0) {
//         const uploadedImages = [];

//         for (const file of req.files) {
//           const result = await cloudinary.uploader.upload(file.path, {
//             folder: "Phone",
//           });

//           uploadedImages.push(result.secure_url);

//           if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//         }

//         Phone.images = uploadedImages;
//       }

//       Phone.title = req.body.title || Phone.title;
//       Phone.description = req.body.description || Phone.description;
//       Phone.price = req.body.price ? Number(req.body.price) : Phone.price;

//       await Phone.save();

//       res.json(Phone);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   },
// );

// app.delete("/api/Phone/:id", verifyToken, async (req, res) => {
//   try {
//     const Phone = await Ad.findById(req.params.id);

//     if (!Phone) return res.status(404).json({ message: "Tapılmadı" });

//     if (Phone.userId.toString() !== req.user.id) {
//       return res.status(403).json({ message: "İcazə yoxdur" });
//     }

//     await Phone.deleteOne();

//     res.json({ message: "Silindi ✅" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.patch("/api/Phone/:id/like", async (req, res) => {
//   const Phone = await Ad.findById(req.params.id);
//   Phone.liked = !Phone.liked;
//   await Phone.save();
//   res.json(Phone);
// });

// app.patch("/api/Phone/:id/favorite", async (req, res) => {
//   const Phone = await Ad.findById(req.params.id);
//   Phone.favorite = !Phone.favorite;
//   await Phone.save();
//   res.json(Phone);
// });

// app.get("/api/Phone/search", async (req, res) => {
//   const { brand, model } = req.query;

//   const ads = await Ad.find({
//     category: "Phone",
//     ...(brand && { brand }),
//     ...(model && { model: new RegExp(model, "i") }),
//   });

//   res.json({
//     count: ads.length,
//     ads,
//   });
// });
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
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "clothing",

        type: req.body.type || "magaza",
        brand: req.body.brand,

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ Clothing error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


app.put(
  "/api/clothing/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const item = await Ad.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Elan tapılmadı" });
      }

      if (item.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "clothing",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        item.images = uploadedImages;
      }

      item.title = req.body.title || item.title;
      item.description = req.body.description || item.description;
      item.price = req.body.price ? Number(req.body.price) : item.price;
      item.location = req.body.location || item.location;
      item.brand = req.body.brand || item.brand;
      item.type = req.body.type || item.type;

      await item.save();

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.delete("/api/clothing/:id", verifyToken, async (req, res) => {
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
// app.post(
//   "/api/realEstate",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const uploadedImages = [];

//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         uploadedImages.push(result.secure_url);

//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const newAd = new Ad({
//         title: req.body.title,
//         description: req.body.description,
//         price: Number(req.body.price),
//         location: req.body.location,

//         category: "real_estate",

//         realEstate: {
//           rooms: req.body.rooms,
//           area: req.body.area,
//           city: req.body.city,
//         },

//         images: uploadedImages,
//         userId: req.user.id,
//       });

//       await newAd.save();

//       res.json(newAd);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

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

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "realEstate",

        type: req.body.type || "resmi",

        realEstate: {
          rooms: req.body.rooms,
          area: req.body.area,
          city: req.body.city,
          type_building: req.body.type_building,
          field: req.body.field,
          number_of_rooms: req.body.number_of_rooms,
        },

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        userId: req.user.id,

        images: uploadedImages,
        mainImage,

        priorityType: req.body.priorityType || "free",
        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ RealEstate error:", err);
      res.status(500).json({ error: err.message });
    }
  }
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
    const item = await Ad.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Tapılmadı" });

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  "/api/realEstate",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const uploadedImages = [];
      const files = req.files || [];

      for (const file of files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "realEstate",
          transformation: [
            {
              overlay: "proelan_watermark",
              width: 0.6,
              opacity: 30,
              gravity: "center",
            },
          ],
        });

        uploadedImages.push(result.secure_url);

        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      }

      let mainImage = null;
      if (!isNaN(mainImageIndex) && uploadedImages[mainImageIndex]) {
        mainImage = uploadedImages[mainImageIndex];
      } else if (uploadedImages.length > 0) {
        mainImage = uploadedImages[0];
      }

      const newAd = new Ad({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "realEstate",

        type: req.body.type || "resmi",

        realEstate: {
          rooms: req.body.rooms,
          area: req.body.area,
          city: req.body.city,
          type_building: req.body.type_building,
          field: req.body.field,
          number_of_rooms: req.body.number_of_rooms,
        },

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        userId: req.user.id,
        images: uploadedImages,
        mainImage,

        priorityType: req.body.priorityType || "free",
        liked: false,
        favorite: false,
      });

      await newAd.save();

      res.status(201).json(newAd);
    } catch (err) {
      console.error("❌ RealEstate error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

app.put(
  "/api/realEstate/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const item = await Ad.findById(req.params.id);

      if (!item) return res.status(404).json({ message: "Tapılmadı" });

      if (item.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "realEstate",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        item.images = uploadedImages;
      }

      item.title = req.body.title || item.title;
      item.description = req.body.description || item.description;
      item.price = req.body.price ? Number(req.body.price) : item.price;
      item.location = req.body.location || item.location;

      await item.save();

      res.json(item);
    } catch (err) {
      console.error("❌ Update error:", err);
      res.status(500).json({ error: err.message });
    }
  },
);

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
// app.post(
//   "/api/homeGarden",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const uploadedImages = [];

//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path);
//         uploadedImages.push(result.secure_url);

//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const newAd = new Ad({
//         title: req.body.title,
//         description: req.body.description,
//         price: Number(req.body.price),

//         category: "homegarden",

//         images: uploadedImages,
//         userId: req.user.id,
//       });

//       await newAd.save();

//       res.json(newAd);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// ---2--

// app.post(
//   "/api/homeGarden",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const mainImageIndex = parseInt(req.body.mainImageIndex);

//       const uploadedImages = [];
//       const files = req.files || [];

//       for (const file of files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "homeGarden",
//           transformation: [
//             {
//               overlay: "proelan_watermark",
//               width: 0.6,
//               opacity: 30,
//               gravity: "center",
//             },
//           ],
//         });

//         uploadedImages.push(result.secure_url);

//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       // main image logic
//       let mainImage = null;
//       if (!isNaN(mainImageIndex) && uploadedImages[mainImageIndex]) {
//         mainImage = uploadedImages[mainImageIndex];
//       } else if (uploadedImages.length > 0) {
//         mainImage = uploadedImages[0];
//       }

//       const newAd = new Ad({
//         title: req.body.title,
//         description: req.body.description,
//         price: req.body.price ? Number(req.body.price) : 0,
//         location: req.body.location,

//         category: "homeGarden",

//         brand: req.body.brand || "",

//         contact: {
//           name: req.body["contact.name"],
//           email: req.body["contact.email"],
//           Phone: req.body["contact.Phone"],
//         },

//         images: uploadedImages,
//         mainImage,

//         userId: req.user.id,

//         priorityType: req.body.priorityType || "free",

//         liked: false,
//         favorite: false,
//       });

//       await newAd.save();

//       res.status(201).json(newAd);
//     } catch (err) {
//       console.error("❌ HomeGarden error:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

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
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server xətası" });
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

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "homeGarden",

        brand: req.body.brand,

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ HomeGarden error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);



app.put(
  "/api/homeGarden/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const item = await Ad.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Elan tapılmadı" });
      }

      if (item.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "homeGarden",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        item.images = uploadedImages;
      }

      item.title = req.body.title || item.title;
      item.description = req.body.description || item.description;
      item.price = req.body.price ? Number(req.body.price) : item.price;
      item.location = req.body.location || item.location;

      await item.save();

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
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

      // 🔥 SAFE CLOUDINARY UPLOAD
      for (const file of files) {
        const result = await uploadToCloudinary(file.buffer, "household");
        uploadedImages.push(result.secure_url);
      }

      const mainImageIndex = parseInt(req.body.mainImageIndex);

      const mainImage =
        uploadedImages[mainImageIndex] || uploadedImages[0] || null;

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "household",

        brand: req.body.brand || "",

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ Household error:", err);
      res.status(500).json({ error: err.message });
    }
  }
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
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server xətası" });
  }
});

app.put(
  "/api/household/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const item = await Ad.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Elan tapılmadı" });
      }

      if (item.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];
        const files = req.files || [];

        for (const file of files) {
          if (!file?.path) {
            console.log("❌ file.path yoxdur:", file);
            continue;
          }

          try {
            const result = await cloudinary.uploader.upload(file.path, {
              folder: "household",
            });

            uploadedImages.push(result.secure_url);

            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          } catch (err) {
            console.log("Cloudinary error:", err.message);
          }
        }

        item.images = uploadedImages;
      }

      item.title = req.body.title || item.title;
      item.description = req.body.description || item.description;
      item.price = req.body.price ? Number(req.body.price) : item.price;
      item.location = req.body.location || item.location;

      await item.save();

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

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

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "accessory",

        brand: req.body.brand,
        model: req.body.model,

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        liked: false,
        favorite: false,

        priorityType: req.body.priorityType || "free",
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ accessory error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);



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
    const item = await Ad.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
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

      const newAd = await Ad.create({
        title: req.body.title,
        description: req.body.description,
        price: req.body.price ? Number(req.body.price) : 0,
        location: req.body.location,

        category: "accessory",

        brand: req.body.brand,
        model: req.body.model,

        contact: {
          name: req.body["contact.name"],
          email: req.body["contact.email"],
          phone: req.body["contact.phone"],
        },

        images: uploadedImages,
        mainImage,

        userId: req.user.id,

        priorityType: req.body.priorityType || "free",
        liked: false,
        favorite: false,
      });

      res.status(201).json(newAd);

    } catch (err) {
      console.error("❌ accessory error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);


app.put(
  "/api/accessory/:id",
  verifyToken,
  upload.array("images", 20),
  async (req, res) => {
    try {
      const item = await Ad.findById(req.params.id);

      if (!item) {
        return res.status(404).json({ message: "Elan tapılmadı" });
      }

      if (item.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "İcazə yoxdur" });
      }

      if (req.files && req.files.length > 0) {
        const uploadedImages = [];

        for (const file of req.files) {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: "accessory",
          });

          uploadedImages.push(result.secure_url);

          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }

        item.images = uploadedImages;
      }

      item.title = req.body.title || item.title;
      item.description = req.body.description || item.description;
      item.price = req.body.price ? Number(req.body.price) : item.price;
      item.location = req.body.location || item.location;

      item.brand = req.body.brand || item.brand;
      item.model = req.body.model || item.model;

      await item.save();

      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
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
// app.get("/api/accessory", async (req, res) => {
//   try {
//     const data = await Ad.find({
//       category: "accessory",
//       isActive: true,
//     }).sort({ createdAt: -1 });

//     res.json(data);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/accessory/search", async (req, res) => {
//   const { model } = req.query;

//   const data = await Ad.find({
//     category: "accessory",
//     model: new RegExp(model, "i"),
//   });

//   res.json({
//     count: data.length,
//     data,
//   });
// });

app.get("/api/accessory/count", async (req, res) => {
  const { model } = req.query;

  const count = await Ad.countDocuments({
    category: "accessory",
    model: new RegExp(model, "i"),
  });

  res.json({ count });
});

// // Bütün elanları gətir
// app.get("/api/cars", async (req, res) => {
//   try {
//     const cars = await Announcement.find().sort({ createdAt: -1 });
//     res.json(cars);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Yalnız öz elanlarını gətir
// app.get("/api/my-cars", verifyToken, async (req, res) => {
//   try {
//     const cars = await Announcement.find({ userId: req.user.id }).sort({
//       createdAt: -1,
//     });
//     res.json(cars);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ID ilə elan
// app.get("/api/cars/:id", async (req, res) => {
//   try {
//     const car = await Announcement.findById(req.params.id);
//     if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(car);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server xətası" });
//   }
// });

// // Bütün elanları gətir, VIP/Premium başda
// app.get("/api/announcements", verifyToken, async (req, res) => {
//   try {
//     const announcements = await Announcement.find().sort({ priority: -1, createdAt: -1 });
//     res.json(announcements);
//   } catch (err) {
//     console.error("Fetch Announcements Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
// // Bütün elanları gətir, VIP/Premium başda olsun

// // Yalnız öz elanlarını gətir
// app.get("/api/my-cars", verifyToken, async (req, res) => {
//   try {
//     const cars = await Announcement.find({ userId: req.user.id }).sort({
//       priority: -1,
//       createdAt: -1,
//     });
//     res.json(cars);
//   } catch (err) {
//     console.error("Fetch My Cars Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.post(
//   "/api/cars",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const newId = await idGenerator();

//       // 1️⃣ mainImageIndex dəyərini al
//       const mainImageIndex = parseInt(req.body.mainImageIndex);

//       // 2️⃣ Cloudinary-yə şəkilləri yüklə + watermark
//       const uploadedImages = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "cars",
//           transformation: [
//             {
//               overlay: "proelan_watermark",
//               width: 0.6,
//               opacity: 30,
//               gravity: "center",
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       // 3️⃣ Əsas şəkili təyin et
//       let mainImage = null;
//       if (!isNaN(mainImageIndex) && uploadedImages[mainImageIndex]) {
//         mainImage = uploadedImages[mainImageIndex];
//       } else if (uploadedImages.length > 0) {
//         mainImage = uploadedImages[0]; // fallback
//       }

//       // 4️⃣ Yeni elan yarat
//       const newAnn = new Announcement({
//         ...req.body,
//         id: newId,
//         userId: req.user.id,
//         images: uploadedImages,  // ✅ watermarklı linklər
//         mainImage,               // ✅ watermarklı əsas şəkil
//         liked: false,
//         favorite: false,
//       });

//       await newAnn.save();
//       res.status(201).json(newAnn);
//     } catch (err) {
//       console.error("❌ Cars əlavə olunarkən xəta:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );
// // Elanı yenilə
// app.put(
//   "/api/cars/:id",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const ann = await Announcement.findById(req.params.id);
//       if (!ann) return res.status(404).json({ message: "Elan tapılmadı" });
//       if (ann.userId.toString() !== req.user.id)
//         return res
//           .status(403)
//           .json({ message: "Bu elanı yeniləmək hüququn yoxdur" });

//       // Əgər yeni şəkillər gəlirsə Cloudinary-yə yüklə
//       if (req.files && req.files.length > 0) {
//         const uploadedImages = [];
//         for (const file of req.files) {
//           const result = await cloudinary.uploader.upload(file.path, {
//             folder: "cars",
//           });
//           uploadedImages.push(result.secure_url);
//           if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//         }
//         ann.images = uploadedImages;
//       }

//       const { title, description, price } = req.body;
//       if (title) ann.title = title;
//       if (description) ann.description = description;
//       if (price) ann.price = price;

//       await ann.save();
//       res.json(ann);
//     } catch (err) {
//       console.error("❌ Cars yenilənərkən xəta:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// app.delete("/api/announcements/:id", verifyToken, async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Yanlış ID formatı" });
//     }

//     const ann = await Announcement.findById(id);
//     if (!ann) {
//       return res.status(404).json({ message: "Elan tapılmadı" });
//     }

//     // TOKEN-DƏN GƏLƏN USER ID
//     const userId = req.userId || req.user?.id;

//     if (!userId) {
//       return res.status(401).json({ message: "Token user tapılmadı" });
//     }

//     if (ann.userId.toString() !== userId.toString()) {
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     }

//     await ann.deleteOne();
//     res.json({ message: "Elan uğurla silindi ✅" });
//   } catch (err) {
//     console.error("DELETE ERROR FULL:", err);
//     res.status(500).json({ error: "Server xətası" });
//   }
// });

// // Like / Favorite toggle
// app.patch("/api/cars/:id/like", async (req, res) => {
//   try {
//     const car = await Announcement.findById(req.params.id);
//     if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
//     car.liked = !car.liked;
//     await car.save();
//     res.json(car);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.patch("/api/cars/:id/favorite", async (req, res) => {
//   try {
//     const car = await Announcement.findById(req.params.id);
//     if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
//     car.favorite = !car.favorite;
//     await car.save();
//     res.json(car);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/:category/:id", verifyToken, async (req, res) => {
//   try {
//     const { category, id } = req.params;
//     const ad = await Announcement.findOne({ _id: id, category });
//     if (!ad) return res.status(404).json({ message: "Elan tapılmadı" });

//     if (ad.userId !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     }

//     await ad.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// ----------------- HomeAndGarden -----------------

// // Yeni elan əlavə et
// app.post(
//   "/api/homeGarden",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const {
//         model,
//         category,
//         title,
//         description,
//         brand,
//         price,
//         location,
//         liked,
//         favorite,
//         data,
//       } = req.body;

//       // Cloudinary-yə yükləmə + watermark
//       const uploadedImages = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "home_and_garden",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark public ID
//               width: 0.6,                   // ölçüsü şəkilin 60%-i
//               opacity: 80,                  // tündlük, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });

//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const contact = {
//         name: req.body["contact.name"] || "",
//         email: req.body["contact.email"] || "",
//         Phone: req.body["contact.Phone"] || "",
//       };

//       const newHome = new HomeAndGarden({
//         userId: req.user.id,
//         model,
//         category,
//         title,
//         description,
//         brand,
//         price,
//         location,
//         contact,
//         liked: liked === "true",
//         favorite: favorite === "true",
//         data: data ? new Date(data) : new Date(),
//         images: uploadedImages, // ✅ watermarklı linklər
//       });

//       await newHome.save();
//       res.status(201).json(newHome);
//     } catch (err) {
//       console.error("❌ HomeAndGarden əlavə olunarkən xəta:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// // Elanı yenilə
// app.put(
//   "/api/homeGarden/:id",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const item = await HomeAndGarden.findById(req.params.id);
//       if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//       if (item.userId.toString() !== req.user.id)
//         return res.status(403).json({ message: "İcazəniz yoxdur" });

//       const {
//         model,
//         category,
//         title,
//         description,
//         brand,
//         price,
//         location,
//         liked,
//         favorite,
//         data,
//       } = req.body;

//       // Yeni şəkilləri Cloudinary-yə yüklə
//       let uploadedImages = item.images;
//       if (req.files && req.files.length > 0) {
//         uploadedImages = [];
//         for (const file of req.files) {
//           const result = await cloudinary.uploader.upload(file.path, {
//             folder: "home_and_garden",
//           });
//           uploadedImages.push(result.secure_url);
//           if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//         }
//       }

//       const contact = {
//         name: req.body["contact.name"] || item.contact.name,
//         email: req.body["contact.email"] || item.contact.email,
//         Phone: req.body["contact.Phone"] || item.contact.Phone,
//       };

//       Object.assign(item, {
//         model,
//         category,
//         title,
//         description,
//         brand,
//         price,
//         location,
//         contact,
//         liked: liked === "true",
//         favorite: favorite === "true",
//         data: data ? new Date(data) : item.data,
//         images: uploadedImages,
//       });

//       await item.save();
//       res.json(item);
//     } catch (err) {
//       console.error("❌ HomeAndGarden yenilənərkən xəta:", err);
//       res.status(500).json({ error: err.message });
//     }
//   }
// );

// app.get("/api/homeGarden/my-announcements", verifyToken, async (req, res) => {
//   try {
//     const items = await HomeAndGarden.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// // GET bütün elanlar
// app.get("/api/homeGarden", async (req, res) => {
//   try {
//     const items = await HomeAndGarden.find().sort({ data: -1 });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET tək elan
// app.get("/api/homeGarden/:id", async (req, res) => {
//   try {
//     const item = await HomeAndGarden.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // GET istifadəçinin öz elanları
// app.get("/api/homeGarden/:id", verifyToken, async (req, res) => {
//   try {
//     const items = await HomeAndGarden.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // İstifadəçinin elan silməsi
// app.delete("/api/homeGarden/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await HomeAndGarden.findById(req.params.id);

//     if (!item) {
//       return res.status(404).json({ message: "Elan tapılmadı" });
//     }

//     // Yalnız elan sahibi silə bilər
//     if (item.userId.toString() !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək icazəniz yoxdur" });
//     }

//     await item.deleteOne();
//     res.json({ message: "Elan uğurla silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // // Elanı yeniləmək (yalnız sahib edə bilər)
// // app.put("/api/homGarden/:id", verifyToken, async (req, res) => {
// //   try {
// //     const item = await HomeAndGarden.findById(req.params.id);
// //     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

// //     if (item.userId.toString() !== req.user.id) {
// //       return res.status(403).json({ message: "Bu elanı dəyişmək icazəniz yoxdur" });
// //     }

// //     const updated = await HomeAndGarden.findByIdAndUpdate(
// //       req.params.id,
// //       req.body,
// //       { new: true }
// //     );

// //     res.json(updated);
// //   } catch (err) {
// //     res.status(500).json({ error: err.message });
// //   }
// // });

// // DELETE - elan sil
// app.delete("/api/homeGarden/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await HomeAndGarden.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId.toString() !== req.user.id)
//       return res.status(403).json({ message: "İcazəniz yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PATCH like
// app.patch("/api/homeGarden/:id/like", verifyToken, async (req, res) => {
//   try {
//     const item = await HomeAndGarden.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     item.liked = !item.liked;
//     await item.save();
//     res.json(item);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // PATCH favorite
// app.patch("/api/homeGarden/:id/favorite", verifyToken, async (req, res) => {
//   try {
//     const item = await HomeAndGarden.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     item.favorite = !item.favorite;
//     await item.save();
//     res.json(item);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ----------------- electronics -----------------
// // GET bütün elanlar
// app.get("/api/electronics", async (req, res) => {
//   try {
//     const items = await electronics.find();
//     res.json(items);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET mənim elanlarım
// app.get("/api/my-electronics", verifyToken, async (req, res) => {
//   try {
//     const items = await electronics.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE elan (sahibinə görə)
// app.delete("/api/electronics/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await electronics.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId.toString() !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // // Yeni elan əlavə et
// // app.post("/api/electronics", verifyToken, upload.array("images", 20), async (req, res) => {
// //   try {
// //     const newId = await idGenerator();

// //     const imageUrls = req.files.map(
// //       (file) => `${BASE_URL}/uploads/${file.filename}`
// //     );

// //     const contact = {
// //       name: req.body["contact.name"] || "",
// //       email: req.body["contact.email"] || "",
// //       Phone: req.body["contact.Phone"] || "",
// //     };

// //     const newPost = new electronics({
// //       id: newId,
// //       category: req.body.category,
// //       title: req.body.title,
// //       brand: req.body.brand,
// //       model: req.body.model,
// //       price: req.body.price,
// //       location: req.body.location,
// //       description: req.body.description,
// //       images: imageUrls,
// //       contact,
// //       liked: false,
// //       favorite: false,
// //       data: req.body.data ? new Date(req.body.data) : Date.now(),
// //       userId: req.user.id, // vacib
// //     });

// //     await newPost.save();
// //     res.status(201).json(newPost);
// //   } catch (error) {
// //     res.status(400).json({ message: error.message });
// //   }
// // });

// // // UPDATE elan
// // app.put("/api/electronics/:id", verifyToken, upload.array("images", 20), async (req, res) => {
// //   try {
// //     const post = await electronics.findById(req.params.id);
// //     if (!post) return res.status(404).json({ message: "Post tapılmadı" });
// //     if (post.userId.toString() !== req.user.id)
// //       return res.status(403).json({ message: "Bu elanı dəyişmək hüququn yoxdur" });

// //     if (req.files.length > 0) {
// //       const imageUrls = req.files.map(
// //         (file) => `${BASE_URL}/uploads/${file.filename}`
// //       );
// //       post.images = imageUrls;
// //     }

// //     post.title = req.body.title || post.title;
// //     post.brand = req.body.brand || post.brand;
// //     post.model = req.body.model || post.model;
// //     post.price = req.body.price || post.price;
// //     post.location = req.body.location || post.location;
// //     post.description = req.body.description || post.description;

// //     post.contact = {
// //       name: req.body["contact.name"] || post.contact.name,
// //       email: req.body["contact.email"] || post.contact.email,
// //       Phone: req.body["contact.Phone"] || post.contact.Phone,
// //     };

// //     post.data = req.body.data ? new Date(req.body.data) : post.data;

// //     await post.save();
// //     res.json(post);
// //   } catch (error) {
// //     res.status(400).json({ message: error.message });
// //   }
// // });

// // Yeni elan əlavə et
// app.post(
//   "/api/electronics",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const newId = await idGenerator();
//       const uploadedImages = [];

//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "electronics",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
//               width: 0.6,                   // Şəkilin 60%-i ölçüdə
//               opacity: 80,                  // daha tünd, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const contact = {
//         name: req.body["contact.name"] || "",
//         email: req.body["contact.email"] || "",
//         Phone: req.body["contact.Phone"] || "",
//       };

//       const newPost = new electronics({
//         id: newId,
//         category: req.body.category,
//         title: req.body.title,
//         brand: req.body.brand,
//         model: req.body.model,
//         price: req.body.price,
//         location: req.body.location,
//         description: req.body.description,
//         images: uploadedImages, // ✅ watermarklı linklər
//         contact,
//         liked: false,
//         favorite: false,
//         data: req.body.data ? new Date(req.body.data) : Date.now(),
//         userId: req.user.id,
//       });

//       await newPost.save();
//       res.status(201).json(newPost);
//     } catch (error) {
//       console.error("❌ electronics əlavə olunarkən xəta:", error);
//       res.status(400).json({ message: error.message });
//     }
//   }
// );

// // UPDATE elan
// app.put(
//   "/api/electronics/:id",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const post = await electronics.findById(req.params.id);
//       if (!post) return res.status(404).json({ message: "Post tapılmadı" });
//       if (post.userId.toString() !== req.user.id)
//         return res
//           .status(403)
//           .json({ message: "Bu elanı dəyişmək hüququn yoxdur" });

//       if (req.files.length > 0) {
//         const uploadedImages = [];
//         for (const file of req.files) {
//           const result = await cloudinary.uploader.upload(file.path, {
//             folder: "electronics",
//           });
//           uploadedImages.push(result.secure_url);
//           if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//         }
//         post.images = uploadedImages;
//       }

//       post.title = req.body.title || post.title;
//       post.brand = req.body.brand || post.brand;
//       post.model = req.body.model || post.model;
//       post.price = req.body.price || post.price;
//       post.location = req.body.location || post.location;
//       post.description = req.body.description || post.description;

//       post.contact = {
//         name: req.body["contact.name"] || post.contact.name,
//         email: req.body["contact.email"] || post.contact.email,
//         Phone: req.body["contact.Phone"] || post.contact.Phone,
//       };

//       post.data = req.body.data ? new Date(req.body.data) : post.data;

//       await post.save();
//       res.json(post);
//     } catch (error) {
//       console.error("❌ electronics yenilənərkən xəta:", error);
//       res.status(400).json({ message: error.message });
//     }
//   }
// );

// // Like toggle
// app.patch("/api/electronics/:id/like", async (req, res) => {
//   try {
//     const post = await electronics.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post tapılmadı" });

//     post.liked = !post.liked;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Favorite toggle
// app.patch("/api/electronics/:id/favorite", async (req, res) => {
//   try {
//     const post = await electronics.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post tapılmadı" });

//     post.favorite = !post.favorite;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // GET tək elan
// app.get("/api/electronics/:id", async (req, res) => {
//   try {
//     const item = await electronics.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // ----------------- accessory -----------------
// app.get("/api/my-accessory", verifyToken, async (req, res) => {
//   try {
//     const items = await accessory.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/accessory/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await accessory.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });
// app.get("/api/accessory", async (req, res) => {
//   try {
//     const accessory = await accessory.find();
//     res.json(accessory);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/accessory/:id", async (req, res) => {
//   try {
//     const accessory = await accessory.findById(req.params.id);
//     if (!accessory) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(accessory);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // app.post("/api/accessory", verifyToken, upload.array("images", 20), async (req, res) => {
// //   try {
// //     const images = req.files.map(
// //       file => `${BASE_URL}/uploads/${file.filename}`
// //     );

// //     const accessory = new accessory({
// //       ...req.body,
// //       images,
// //       userId: req.user.id, // <- burda istifadəçinin ID-si
// //       contact: {
// //         name: req.body["contact.name"],
// //         email: req.body["contact.email"],
// //         Phone: req.body["contact.Phone"],
// //       },
// //     });

// //     await accessory.save();
// //     res.status(201).json(accessory);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // app.put(
// //   "/api/accessory/:id",
// //   upload.array("images", 10),
// //   async (req, res) => {
// //     try {
// //       let images = [];
// //       if (req.files.length > 0) {
// //         images = req.files.map(
// //           (file) =>
// //             `${BASE_URL}/uploads/${file.filename}`
// //         );
// //       }

// //       const updated = await accessory.findByIdAndUpdate(
// //         req.params.id,
// //         {
// //           ...req.body,
// //           ...(images.length > 0 && { images }),
// //           contact: {
// //             name: req.body["contact.name"],
// //             email: req.body["contact.email"],
// //             Phone: req.body["contact.Phone"],
// //           },
// //         },
// //         { new: true }
// //       );
// //       res.json(updated);
// //     } catch (err) {
// //       res.status(400).json({ error: err.message });
// //     }
// //   }
// // );
// app.post(
//   "/api/accessory",
//   verifyToken,
//   upload.array("images", 10),
//   async (req, res) => {
//     try {
//       if (!req.files || req.files.length === 0)
//         throw new Error("Şəkil seçilməyib");

//       const uploadedImages = [];
//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/"); // Windows üçün
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "accessory",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
//               width: 0.6,                   // Şəkilin 60%-i ölçüdə
//               opacity: 80,                  // tünd, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const accessory = new accessory({
//         ...req.body,
//         images: uploadedImages, // ✅ watermarklı şəkillər
//         userId: req.user.id,
//         contact: {
//           name: req.body["contact.name"] || "",
//           email: req.body["contact.email"] || "",
//           Phone: req.body["contact.Phone"] || "",
//         },
//       });

//       await accessory.save();
//       res.status(201).json(accessory);
//     } catch (err) {
//       console.error(err);
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// app.put(
//   "/api/accessory/:id",
//   upload.array("images", 10),
//   async (req, res) => {
//     try {
//       let uploadedImages = [];

//       if (req.files.length > 0) {
//         for (const file of req.files) {
//           const filePath = file.path.replace(/\\/g, "/");
//           const result = await cloudinary.uploader.upload(filePath, {
//             folder: "accessory",
//           });
//           uploadedImages.push(result.secure_url);

//           if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//         }
//       }

//       const updated = await accessory.findByIdAndUpdate(
//         req.params.id,
//         {
//           ...req.body,
//           ...(uploadedImages.length > 0 && { images: uploadedImages }),
//           contact: {
//             name: req.body["contact.name"],
//             email: req.body["contact.email"],
//             Phone: req.body["contact.Phone"],
//           },
//         },
//         { new: true }
//       );

//       res.json(updated);
//     } catch (err) {
//       console.error(err);
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// app.delete("/api/accessory/:id", async (req, res) => {
//   try {
//     await accessory.findByIdAndDelete(req.params.id);
//     res.json({ message: "accessory silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.patch("/api/accessory/:id/favorite", async (req, res) => {
//   try {
//     const accessory = await accessory.findById(req.params.id);
//     accessory.favorite = !accessory.favorite;
//     await accessory.save();
//     res.json(accessory);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.patch("/api/accessory/:id/like", async (req, res) => {
//   try {
//     const accessory = await accessory.findById(req.params.id);
//     accessory.liked = !accessory.liked;
//     await accessory.save();
//     res.json(accessory);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // 📌 Yüklənmiş şəkili silmək
// app.delete("/api/accessory/images/:imageName", async (req, res) => {
//   try {
//     const imageName = req.params.imageName;
//     await accessory.updateMany(
//       {},
//       { $pull: { images: { $regex: imageName } } }
//     );
//     res.json({ message: "Şəkil silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ----------------- RealEstate -----------------
// app.get("/api/my-realEstate", verifyToken, async (req, res) => {
//   try {
//     const items = await RealEstate.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/RealEstate/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await RealEstate.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Like toggle
// app.patch("/api/RealEstate/:id/like", async (req, res) => {
//   try {
//     const post = await RealEstate.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post tapılmadı" });

//     post.liked = !post.liked;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Favorite toggle
// app.patch("/api/RealEstate/:id/favorite", async (req, res) => {
//   try {
//     const post = await RealEstate.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Post tapılmadı" });

//     post.favorite = !post.favorite;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get("/api/RealEstate/:id", async (req, res) => {
//   try {
//     const item = await RealEstate.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get("/api/RealEstate", async (req, res) => {
//   try {
//     const realEstatePost = await RealEstate.find();
//     res.json(realEstatePost);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // app.post("/api/RealEstate", verifyToken, upload.array("images", 20), async (req, res) => {
// //   try {
// //     const newId = await idGenerator();

// //     const images = req.files.map(
// //       (file) => `${BASE_URL}/uploads/${file.filename}`
// //     );

// //     const realEstatePost = new RealEstate({
// //       id: newId,
// //       ...req.body,
// //       images,
// //       userId: req.user.id, // burada token-dan gələn userId əlavə olunur
// //       contact: {
// //         name: req.body["contact.name"],
// //         email: req.body["contact.email"],
// //         Phone: req.body["contact.Phone"],
// //       },
// //     });

// //     await realEstatePost.save();
// //     res.status(201).json(realEstatePost);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // app.put(
// //   "/api/RealEstate/:id",
// //   upload.array("images", 20),
// //   async (req, res) => {
// //     try {
// //       let images = [];
// //       if (req.files.length > 0) {
// //         images = req.files.map(
// //           (file) => `${BASE_URL}/uploads/${file.filename}`
// //         );
// //       }

// //       const updated = await RealEstate.findByIdAndUpdate(
// //         req.params.id,
// //         {
// //           ...req.body,
// //           ...(images.length > 0 && { images }),
// //           contact: {
// //             name: req.body["contact.name"],
// //             email: req.body["contact.email"],
// //             Phone: req.body["contact.Phone"],
// //           },
// //         },
// //         { new: true }
// //       );
// //       res.json(updated);
// //     } catch (err) {
// //       res.status(400).json({ error: err.message });
// //     }
// //   }
// // );

// app.post(
//   "/api/RealEstate",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const newId = await idGenerator();

//       const mainImageIndex = parseInt(req.body.mainImageIndex);

//       // Cloudinary-yə yükləmə + watermark
//       const uploadedImages = [];
//       for (const file of req.files) {
//         const result = await cloudinary.uploader.upload(file.path, {
//           folder: "realestate",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
//               width: 0.6,                   // Şəkilin 60%-i ölçüdə
//               opacity: 80,                  // tünd, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       // Əsas şəkili təyin et
//       let mainImage = null;
//       if (!isNaN(mainImageIndex) && uploadedImages[mainImageIndex]) {
//         mainImage = uploadedImages[mainImageIndex];
//       } else if (uploadedImages.length > 0) {
//         mainImage = uploadedImages[0]; // fallback
//       }

//       const realEstatePost = new RealEstate({
//         id: newId,
//         ...req.body,
//         images: uploadedImages, // ✅ watermarklı şəkillər
//         mainImage,
//         userId: req.user.id,
//         contact: {
//           name: req.body["contact.name"] || "",
//           email: req.body["contact.email"] || "",
//           Phone: req.body["contact.Phone"] || "",
//         },
//       });

//       await realEstatePost.save();
//       res.status(201).json(realEstatePost);
//     } catch (err) {
//       console.error("❌ RealEstate əlavə olunarkən xəta:", err);
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// // PUT - Elanı yeniləmək
// app.put("/api/RealEstate/:id", upload.array("images", 20), async (req, res) => {
//   try {
//     let uploadedImages = [];

//     if (req.files.length > 0) {
//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/");
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "realestate",
//         });
//         uploadedImages.push(result.secure_url);
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }
//     }

//     const updated = await RealEstate.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,
//         ...(uploadedImages.length > 0 && { images: uploadedImages }),
//         contact: {
//           name: req.body["contact.name"],
//           email: req.body["contact.email"],
//           Phone: req.body["contact.Phone"],
//         },
//       },
//       { new: true }
//     );

//     res.json(updated);
//   } catch (err) {
//     console.error("❌ RealEstate yenilənərkən xəta:", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// app.delete("/api/RealEstate/:id", async (req, res) => {
//   try {
//     await RealEstate.findByIdAndDelete(req.params.id);
//     res.json({ message: "Elan silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.patch("/api/RealEstate/:id/favorite", async (req, res) => {
//   try {
//     const realEstatePost = await RealEstate.findById(req.params.id);
//     realEstatePost.favorite = !realEstatePost.favorite;
//     await realEstatePost.save();
//     res.json(realEstatePost);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.patch("/api/RealEstate/:id/like", async (req, res) => {
//   try {
//     const realEstatePost = await RealEstate.findById(req.params.id);
//     realEstatePost.liked = !realEstatePost.liked;
//     await realEstatePost.save();
//     res.json(realEstatePost);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/RealEstatePost/images/:imageName", async (req, res) => {
//   try {
//     const imageName = req.params.imageName;
//     await RealEstate.updateMany(
//       {},
//       { $pull: { images: { $regex: imageName } } }
//     );
//     res.json({ message: "Şəkil silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ----------------- HouseHold -----------------

// app.get("/api/my-household", verifyToken, async (req, res) => {
//   try {
//     const items = await HouseHold.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/Household/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await HouseHold.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/Household", async (req, res) => {
//   try {
//     const householdPosts = await HouseHold.find();
//     res.json(householdPosts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/Household/:id", async (req, res) => {
//   try {
//     const item = await HouseHold.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // app.post("/api/Household", verifyToken, upload.array("images", 20), async (req, res) => {
// //   const newId = await idGenerator();
// //   try {
// //     const images = req.files.map(
// //       (file) => `${BASE_URL}/uploads/${file.filename}`
// //     );

// //     const contact = {
// //       name: req.body["contact.name"] || "",
// //       email: req.body["contact.email"] || "",
// //       Phone: req.body["contact.Phone"] || "",
// //     };

// //     const newHouseHold = new HouseHold({
// //       id: newId,
// //       ...req.body,
// //       images,
// //       contact,
// //       data: req.body.data ? new Date(req.body.data) : new Date(),
// //       userId: req.user.id, // Token-dan gələn istifadəçi ID
// //     });

// //     await newHouseHold.save();
// //     res.status(201).json(newHouseHold);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // app.put("/api/Household/:id", upload.array("images", 20), async (req, res) => {
// //   try {
// //     let images = [];
// //     if (req.files && req.files.length > 0) {
// //       images = req.files.map(
// //         (file) => `${BASE_URL}/uploads/${file.filename}`
// //       );
// //     }

// //     const contact = {
// //       name: req.body["contact.name"] || "",
// //       email: req.body["contact.email"] || "",
// //       Phone: req.body["contact.Phone"] || "",
// //     };

// //     const updated = await HouseHold.findByIdAndUpdate(
// //       req.params.id,
// //       {
// //         ...req.body,
// //         ...(images.length > 0 && { images }),
// //         contact: {
// //         name: req.body["contact.name"],
// //         email: req.body["contact.email"],
// //         Phone: req.body["contact.Phone"],
// //       },
// //         data: req.body.data ? new Date(req.body.data) : new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
// //     res.json(updated);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // POST - Yeni Household elan əlavə etmək
// app.post(
//   "/api/Household",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     const newId = await idGenerator();
//     try {
//       const uploadedImages = [];

//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/"); // Windows path problemi üçün
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "household",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
//               width:2.6,                   // Şəkilin 60%-i ölçüdə
//               opacity: 80,                  // tünd, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const contact = {
//         name: req.body["contact.name"] || "",
//         email: req.body["contact.email"] || "",
//         Phone: req.body["contact.Phone"] || "",
//       };

//       const newHouseHold = new HouseHold({
//         id: newId,
//         ...req.body,
//         images: uploadedImages, // ✅ watermarklı şəkillər
//         contact,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//         userId: req.user.id,
//       });

//       await newHouseHold.save();
//       res.status(201).json(newHouseHold);
//     } catch (err) {
//       console.error("❌ Household əlavə olunarkən xəta:", err);
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// // PUT - Household elanını yeniləmək
// app.put("/api/Household/:id", upload.array("images", 20), async (req, res) => {
//   try {
//     let uploadedImages = [];

//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/");
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "household",
//         });
//         uploadedImages.push(result.secure_url);
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }
//     }

//     const contact = {
//       name: req.body["contact.name"] || "",
//       email: req.body["contact.email"] || "",
//       Phone: req.body["contact.Phone"] || "",
//     };

//     const updated = await HouseHold.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,
//         ...(uploadedImages.length > 0 && { images: uploadedImages }),
//         contact,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//       },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Household yenilənərkən xəta:", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// app.delete("/api/Household/:id", async (req, res) => {
//   try {
//     const deleted = await HouseHold.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

//     res.json({ message: "Elan silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Like toggle
// app.patch("/api/Household/:id/like", async (req, res) => {
//   try {
//     const post = await HouseHold.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.liked = !post.liked;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Favorite toggle
// app.patch("/api/Household/:id/favorite", async (req, res) => {
//   try {
//     const post = await HouseHold.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.favorite = !post.favorite;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.delete("/api/Household/images/:imageName", async (req, res) => {
//   try {
//     const imageName = req.params.imageName;

//     // 1. DB-də images massivindən URL-ə uyğun şəkili silir
//     await HouseHold.updateMany(
//       { images: { $regex: imageName } },
//       { $pull: { images: { $regex: imageName } } }
//     );

//     res.json({ message: "Şəkil silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ----------------- Phone -----------------
// // -----------------------------------------
// app.get("/api/my-Phone", verifyToken, async (req, res) => {
//   try {
//     const items = await Phone.find({ userId: req.user.id }).sort({ data: -1 });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/Phone/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await Phone.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/Phone", async (req, res) => {
//   try {
//     const PhonePosts = await Phone.find();
//     res.json(PhonePosts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ID-yə görə elan gətir
// app.get("/api/Phone/:id", async (req, res) => {
//   try {
//     const item = await Phone.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // app.post("/api/Phone", verifyToken, upload.array("images", 20), async (req, res) => {
// //   try {
// //     const newId = await idGenerator();

// //     const images = req.files.map(
// //       (file) => `${BASE_URL}/uploads/${file.filename}`
// //     );

// //     const newPhone = new Phone({
// //       id: newId,
// //       ...req.body,
// //       images,
// //       contact: {
// //         name: req.body["contact.name"] || "",
// //         email: req.body["contact.email"] || "",
// //         Phone: req.body["contact.Phone"] || "",
// //       },
// //       userId: req.user.id, // verifyToken middleware bu məlumatı əlavə etməlidir
// //       data: req.body.data ? new Date(req.body.data) : new Date(),
// //     });

// //     await newPhone.save();
// //     res.status(201).json(newPhone);
// //   } catch (err) {
// //     console.error(err);
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // // Elanı yenilə
// // app.put("/api/Phone/:id", upload.array("images", 20), async (req, res) => {
// //   try {
// //     let images = [];
// //     if (req.files && req.files.length > 0) {
// //       images = req.files.map(
// //         (file) => `${BASE_URL}/uploads/${file.filename}`
// //       );
// //     }

// //     const contact = {
// //       name: req.body["contact.name"] || "",
// //       email: req.body["contact.email"] || "",
// //       Phone: req.body["contact.Phone"] || "",
// //     };

// //     const updated = await Phone.findByIdAndUpdate(
// //       req.params.id,
// //       {
// //         ...req.body,
// //         ...(images.length > 0 && { images }),
// //         contact,
// //         data: req.body.data ? new Date(req.body.data) : new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
// //     res.json(updated);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // POST - Yeni Phone elan əlavə etmək
// app.post(
//   "/api/Phone",
//   verifyToken,
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const newId = await idGenerator();
//       const uploadedImages = [];

//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/"); // Windows path üçün
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "Phones",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
//               width: 1.4,                   // Şəkilin 60%-i ölçüdə
//               opacity: 80,                  // tünd, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const contact = {
//         name: req.body["contact.name"] || "",
//         email: req.body["contact.email"] || "",
//         Phone: req.body["contact.Phone"] || "",
//       };

//       const newPhone = new Phone({
//         id: newId,
//         ...req.body,
//         images: uploadedImages, // ✅ watermarklı şəkillər
//         contact,
//         userId: req.user.id,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//       });

//       await newPhone.save();
//       res.status(201).json(newPhone);
//     } catch (err) {
//       console.error("❌ Phone əlavə olunarkən xəta:", err);
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// // PUT - Phone elanını yeniləmək
// app.put("/api/Phone/:id", upload.array("images", 20), async (req, res) => {
//   try {
//     let uploadedImages = [];

//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/");
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "Phones",
//         });
//         uploadedImages.push(result.secure_url);
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }
//     }

//     const contact = {
//       name: req.body["contact.name"] || "",
//       email: req.body["contact.email"] || "",
//       Phone: req.body["contact.Phone"] || "",
//     };

//     const updated = await Phone.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,
//         ...(uploadedImages.length > 0 && { images: uploadedImages }),
//         contact,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//       },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Phone yenilənərkən xəta:", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// // Elanı sil
// app.delete("/api/Phone/:id", async (req, res) => {
//   try {
//     const deleted = await Phone.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

//     res.json({ message: "Elan silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Like toggle
// app.patch("/api/Phone/:id/like", async (req, res) => {
//   try {
//     const post = await Phone.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.liked = !post.liked;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Favorite toggle
// app.patch("/api/Phone/:id/favorite", async (req, res) => {
//   try {
//     const post = await Phone.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.favorite = !post.favorite;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.delete("/api/Phone/images/:imageName", async (req, res) => {
//   try {
//     const imageName = req.params.imageName;
//     const filePath = path.join(__dirname, "uploads", imageName);

//     // DB-dən sil
//     await Phone.updateMany(
//       { images: { $regex: imageName } },
//       { $pull: { images: { $regex: imageName } } }
//     );

//     // Serverdən sil
//     fs.unlink(filePath, (err) => {
//       if (err) console.error("Fayl silinmədi:", err);
//     });

//     res.json({ message: "Şəkil silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ---------------------------------------

// // ----------------- Clothing -----------------

// app.get("/api/my-Clothing", verifyToken, async (req, res) => {
//   try {
//     const items = await Clothing.find({ userId: req.user.id }).sort({
//       data: -1,
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/Clothing/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await Clothing.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     if (item.userId !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək hüququn yoxdur" });
//     await item.deleteOne();
//     res.status(204).send();
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/Clothing", async (req, res) => {
//   try {
//     const ClothingPosts = await Clothing.find();
//     res.json(ClothingPosts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ID-yə görə elan gətir
// app.get("/api/Clothing/:id", async (req, res) => {
//   try {
//     const item = await Clothing.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // // Yeni elan əlavə et
// // app.post("/api/Clothing", upload.array("images", 20), async (req, res) => {
// //   const newId = await idGenerator();
// //   try {
// //     const images = req.files.map(
// //       (file) => `${BASE_URL}/uploads/${file.filename}`
// //     );

// //     const contact = {
// //       name: req.body["contact.name"] || "",
// //       email: req.body["contact.email"] || "",
// //       Phone: req.body["contact.Phone"] || "",
// //     };

// //     if (!req.body.userId) {
// //       return res.status(400).json({ error: "userId tələb olunur" });
// //     }

// //     const newClothing = new Clothing({
// //       id: newId,
// //       ...req.body,
// //       images,
// //       contact,
// //       data: req.body.data ? new Date(req.body.data) : new Date(),
// //     });

// //     await newClothing.save();
// //     res.status(201).json(newClothing);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // // Elanı yenilə
// // app.put("/api/Clothing/:id", upload.array("images", 20), async (req, res) => {
// //   try {
// //     let images = [];
// //     if (req.files && req.files.length > 0) {
// //       images = req.files.map(
// //         (file) => `${BASE_URL}/uploads/${file.filename}`
// //       );
// //     }

// //     const contact = {
// //       name: req.body["contact.name"] || "",
// //       email: req.body["contact.email"] || "",
// //       Phone: req.body["contact.Phone"] || "",
// //     };

// //     const updated = await Clothing.findByIdAndUpdate(
// //       req.params.id,
// //       {
// //         ...req.body,
// //         ...(images.length > 0 && { images }),
// //         contact,
// //         data: req.body.data ? new Date(req.body.data) : new Date(),
// //       },
// //       { new: true }
// //     );

// //     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
// //     res.json(updated);
// //   } catch (err) {
// //     res.status(400).json({ error: err.message });
// //   }
// // });

// // Yeni elan əlavə et
// app.post(
//   "/api/Clothing",
//   upload.array("images", 20),
//   async (req, res) => {
//     try {
//       const newId = await idGenerator();
//       const uploadedImages = [];

//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/"); // Windows path üçün
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "clothing",
//           transformation: [
//             {
//               overlay: "proelan_watermark", // Cloudinary-də yüklədiyin watermark
//               width: 0.8,                   // Şəkilin 60%-i ölçüdə
//               opacity: 80,                  // tünd, bütün şəkillərdə görünür
//               gravity: "center",            // ortada yerləşir
//             },
//           ],
//         });
//         uploadedImages.push(result.secure_url);

//         // Lokal faylı sil
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }

//       const contact = {
//         name: req.body["contact.name"] || "",
//         email: req.body["contact.email"] || "",
//         Phone: req.body["contact.Phone"] || "",
//       };

//       if (!req.body.userId) {
//         return res.status(400).json({ error: "userId tələb olunur" });
//       }

//       const newClothing = new Clothing({
//         id: newId,
//         ...req.body,
//         images: uploadedImages, // ✅ watermarklı şəkillər
//         contact,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//       });

//       await newClothing.save();
//       res.status(201).json(newClothing);
//     } catch (err) {
//       console.error("❌ Clothing əlavə olunarkən xəta:", err);
//       res.status(400).json({ error: err.message });
//     }
//   }
// );

// // Elanı yenilə
// app.put("/api/Clothing/:id", upload.array("images", 20), async (req, res) => {
//   try {
//     let uploadedImages = [];

//     if (req.files && req.files.length > 0) {
//       for (const file of req.files) {
//         const filePath = file.path.replace(/\\/g, "/");
//         const result = await cloudinary.uploader.upload(filePath, {
//           folder: "clothing",
//         });
//         uploadedImages.push(result.secure_url);
//         if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
//       }
//     }

//     const contact = {
//       name: req.body["contact.name"] || "",
//       email: req.body["contact.email"] || "",
//       Phone: req.body["contact.Phone"] || "",
//     };

//     const updated = await Clothing.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,
//         ...(uploadedImages.length > 0 && { images: uploadedImages }),
//         contact,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//       },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Clothing yenilənərkən xəta:", err);
//     res.status(400).json({ error: err.message });
//   }
// });

// // Elanı sil
// app.delete("/api/Clothing/:id", async (req, res) => {
//   try {
//     const deleted = await Clothing.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

//     res.json({ message: "Elan silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Like toggle
// app.patch("/api/Clothing/:id/like", async (req, res) => {
//   try {
//     const post = await Clothing.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.liked = !post.liked;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Favorite toggle
// app.patch("/api/Clothing/:id/favorite", async (req, res) => {
//   try {
//     const post = await Clothing.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.favorite = !post.favorite;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Şəkil silmək (hem DB-dən images massivindən, hem serverdən faylı silir)
// app.delete("/api/Clothing/images/:imageName", verifyToken, async (req, res) => {
//   try {
//     const imageName = req.params.imageName;

//     // 1. DB-də images massivindən URL-ə uyğun şəkili sil
//     await Clothing.updateMany(
//       { images: { $regex: imageName } },
//       { $pull: { images: { $regex: imageName } } }
//     );

//     res.json({ message: "Şəkil silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ------------------------------------

// app.get("/api/Jewelry", async (req, res) => {
//   try {
//     const JewelryPosts = await Jewelry.find();
//     res.json(JewelryPosts);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // ID-yə görə elan gətir
// app.get("/api/Jewelry/:id", async (req, res) => {
//   try {
//     const item = await Jewelry.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(item);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Yeni elan əlavə et
// app.post("/api/Jewelry", upload.array("images", 10), async (req, res) => {
//   const newId = await idGenerator();
//   try {
//     const images = req.files.map(
//       (file) => `${BASE_URL}/uploads/${file.filename}`
//     );

//     // contact sahəsini req.body-dən ayrıca götür
//     const contact = {
//       name: req.body["contact.name"] || "",
//       email: req.body["contact.email"] || "",
//       Phone: req.body["contact.Phone"] || "",
//     };

//     const newJewelry = new Jewelry({
//       id: newId,
//       ...req.body,
//       images,
//       contact,
//       data: req.body.data ? new Date(req.body.data) : new Date(),
//     });

//     await newJewelry.save();
//     res.status(201).json(newJewelry);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Elanı yenilə
// app.put("/api/Jewelry/:id", upload.array("images", 10), async (req, res) => {
//   try {
//     let images = [];
//     if (req.files && req.files.length > 0) {
//       images = req.files.map((file) => `${BASE_URL}/uploads/${file.filename}`);
//     }

//     const contact = {
//       name: req.body["contact.name"] || "",
//       email: req.body["contact.email"] || "",
//       Phone: req.body["contact.Phone"] || "",
//     };

//     const updated = await Jewelry.findByIdAndUpdate(
//       req.params.id,
//       {
//         ...req.body,
//         ...(images.length > 0 && { images }),
//         contact,
//         data: req.body.data ? new Date(req.body.data) : new Date(),
//       },
//       { new: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(updated);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Elanı sil
// app.delete("/api/Jewelry/:id", async (req, res) => {
//   try {
//     const deleted = await Jewelry.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

//     res.json({ message: "Elan silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Like toggle
// app.patch("/api/Jewelry/:id/like", async (req, res) => {
//   try {
//     const post = await Jewelry.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.liked = !post.liked;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Favorite toggle
// app.patch("/api/Jewelry/:id/favorite", async (req, res) => {
//   try {
//     const post = await Jewelry.findById(req.params.id);
//     if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

//     post.favorite = !post.favorite;
//     await post.save();
//     res.json(post);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // Şəkil silmək (hem DB-dən images massivindən, hem serverdən faylı silir)
// app.delete("/api/Jewelry/images/:imageName", async (req, res) => {
//   try {
//     const imageName = req.params.imageName;

//     // 1. DB-də images massivindən URL-ə uyğun şəkili sil
//     await Clothing.updateMany(
//       { images: { $regex: imageName } },
//       { $pull: { images: { $regex: imageName } } }
//     );

//     res.json({ message: "Şəkil silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // VERIFY TOKEN

// app.post("/api/announcements", verifyToken, async (req, res) => {
//   try {
//     const newAnn = new Announcement({
//       ...req.body,
//       owner: req.userId,
//     });
//     await newAnn.save();
//     res.status(201).json(newAnn);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // ROUTES
// // REGISTER
// // server.js və ya app.js
app.post("/api/reqister", async (req, res) => {
  try {
    const { username, Phone, email, password } = req.body;

    // 1. check user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. create user
    const newUser = new User({
      username,
      phone,
      email,
      password: hashedPassword,
    });

    // 4. save user
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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

// // CREATE ANNOUNCEMENT
// app.post("/api/announcements", verifyToken, async (req, res) => {
//   try {
//     const newAnn = new Announcement({
//       ...req.body,
//       owner: req.userId,
//     });
//     await newAnn.save();
//     res.status(201).json(newAnn);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // UPDATE ANNOUNCEMENT
// app.put("/api/announcements/:id", verifyToken, async (req, res) => {
//   try {
//     const ann = await Announcement.findById(req.params.id);
//     if (!ann) return res.status(404).json("Not found");

//     if (ann.owner.toString() !== req.userId) {
//       return res.status(403).json("You can only edit your own announcements");
//     }

//     const updated = await Announcement.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

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

// app.get("/api/announcements", verifyToken, async (req, res) => {
//   try {
//     const announcements = await Announcement.find().populate(
//       "owner",
//       "username"
//     );
//     res.json(announcements);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// app.put("/api/announcements/:id", verifyToken, async (req, res) => {
//   try {
//     const ann = await Announcement.findById(req.params.id);
//     if (!ann) return res.status(404).json("Not found");

//     if (ann.owner.toString() !== req.userId)
//       return res.status(403).json("You can only edit your own announcements");

//     const updated = await Announcement.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     res.json(updated);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // Elanı sil
// app.delete("/api/announcements/:id", verifyToken, async (req, res) => {
//   try {
//     const ann = await Announcement.findById(req.params.id);
//     if (!ann) return res.status(404).json("Not found");

//     if (ann.owner.toString() !== req.userId)
//       return res.status(403).json("You can only delete your own announcements");

//     await Announcement.findByIdAndDelete(req.params.id);
//     res.json("Deleted successfully");
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// app.get("/api/users/:id", verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id).select("-password"); // password göndərmə
//     if (!user) return res.status(404).json("User not found");
//     res.json(user);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// // app.get(
// //   "/api/announcements/my-announcements",
// //   verifyToken,
// //   async (req, res) => {
// //     try {
// //       const myAnnouncements = await Announcement.find({ owner: req.userId });
// //       res.json(myAnnouncements);
// //     } catch (err) {
// //       res.status(500).json(err);
// //     }
// //   }
// // );

// app.delete("/api/my-announcements/:id", verifyToken, async (req, res) => {
//   try {
//     const deleted = await Announcement.findOneAndDelete({ id: req.params.id });
//     if (!deleted) {
//       return res.status(404).json({ message: "Elan tapılmadı" });
//     }
//     res.json({ message: "Elan uğurla silindi" });
//   } catch (err) {
//     console.error("Silinmə xətası:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// app.get("/api/my-announcements", verifyToken, async (req, res) => {
//   try {
//     const homeAds = await HomeAndGarden.find({ userId: req.user._id }).lean();
//     homeAds.forEach((ad) => (ad.modelName = "homGarden"));

//     const clothingAds = await Clothing.find({ userId: req.user._id }).lean();
//     clothingAds.forEach((ad) => (ad.modelName = "Clothing"));

//     const PhoneAds = await Phone.find({ userId: req.user._id }).lean();
//     PhoneAds.forEach((ad) => (ad.modelName = "Phone"));

//     const householdAds = await HouseHold.find({ userId: req.user._id }).lean();
//     householdAds.forEach((ad) => (ad.modelName = "Household"));

//     const realEstateAds = await RealEstate.find({
//       userId: req.user._id,
//     }).lean();
//     realEstateAds.forEach((ad) => (ad.modelName = "RealEstate"));

//     const accessoryAds = await accessory.find({ userId: req.user._id }).lean();
//     accessoryAds.forEach((ad) => (ad.modelName = "accessory"));

//     const announcementAds = await Announcement.find({
//       userId: req.user.id,
//     }).lean();
//     announcementAds.forEach((ad) => (ad.modelName = "cars"));

//     const electronicsAds = await electronics.find({
//       userId: req.user.id,
//     }).lean();
//     electronicsAds.forEach((ad) => (ad.modelName = "electronics"));

//     const allAds = [
//       ...homeAds,
//       ...clothingAds,
//       ...PhoneAds,
//       ...householdAds,
//       ...realEstateAds,
//       ...accessoryAds,
//       ...announcementAds,
//       ...electronicsAds,
//     ];

//     allAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

//     res.json(allAds);
//   } catch (err) {
//     console.error("My-announcements error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// const models = {
//   homeGarden: HomeAndGarden,
//   clothing: Clothing,
//   Phone: Phone,
//   household: HouseHold,
//   realEstate: RealEstate,
//   accessory: accessory,
//   cars: Announcement,
//   electronics: electronics,
// };

// app.delete("/api/:model/:id", verifyToken, async (req, res) => {
//   try {
//     const { model, id } = req.params;
//     const Model = models[model];
//     if (!Model) return res.status(400).json({ message: "Yanlış model adı" });

//     const item = await Model.findById(id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

//     if (item.userId.toString() !== req.user.id)
//       return res.status(403).json({ message: "İcazəniz yoxdur" });

//     await item.deleteOne();
//     res.json({ message: "Elan uğurla silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/:model/:id", verifyToken, async (req, res) => {
//   const { model, id } = req.params;

//   const models = {
//     homeGarden: HomeAndGarden,
//     clothing: Clothing,
//     Phone: Phone,
//     household: HouseHold,
//     realestate: RealEstate,
//     accessory: accessory,
//     cars: Announcement,
//     electronics: electronics,
//   };

//   const SelectedModel = models[model];
//   if (!SelectedModel)
//     return res.status(400).json({ message: "Yanlış model adı" });

//   try {
//     const item = await SelectedModel.findById(id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

//     if (item.userId.toString() !== req.user.id)
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək icazəniz yoxdur" });

//     await item.deleteOne();
//     res.json({ message: "Elan uğurla silindi" });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// app.delete("/api/my-announcements/:id", verifyToken, async (req, res) => {
//   try {
//     const item = await announcement.findById(req.params.id);
//     if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Yalnız elan sahibi silə bilər
//     if (item.userId.toString() !== req.user.id) {
//       return res
//         .status(403)
//         .json({ message: "Bu elanı silmək icazəniz yoxdur" });
//     }

//     await item.deleteOne();
//     res.json({ message: "Elan uğurla silindi" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });
// console.log("React build path:", path.join(__dirname, "../frontend/build"));
// // Serve static files from the frontend build
// app.use(express.static(path.join(__dirname, "../frontend/build")));

// // Catch-all route for React Router
// app.get(/.*/, (req, res) => {

//   res.sendFile(path.join(__dirname, "cd/frontend/build", "index.html"));
// });

// React build path
// const buildPath = path.join(__dirname, "../frontend/build");
// console.log("React build path:", buildPath);

// // Static fayllar
// app.use(express.static(buildPath));

// const buildPath = path.join(__dirname, "frontend/build"); // əgər frontend build backend ilə eyni səviyyədədirsə
// app.use(express.static(buildPath));

// // // React Router catch-all (ESM uyğun)
// app.get(/.*/, (req, res) => {
//   res.sendFile(path.join(buildPath, "index.html"));
// });

// // STATIC

// // frontend build
// app.use(express.static(path.join(__dirname, "build")));

// // SPA fallback (SAFE VERSION)
// app.use((req, res, next) => {
//   if (req.path.startsWith("/api")) return next();
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

// const buildPath = path.join(__dirname, "../frontend/build");

// // Static frontend
// app.use(express.static(buildPath));

// // SPA fallback
// app.use((req, res, next) => {
//   if (req.path.startsWith("/api")) {
//     return next();
//   }

//   res.sendFile(path.join(buildPath, "index.html"));
// });

// app.listen(PORT, () => {
//   console.log(`🚀 Server işə düşdü: http://localhost:${PORT}`);
//   // npx nodemon src/backend/cateqory.js serveri ise salmaq ucun
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