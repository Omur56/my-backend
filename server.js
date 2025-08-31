import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import dotenv from "dotenv";
import connectDB from "./db.js";
import Announcement from "./models/Announcement.js";
import HomeAndGarden from "./models/HomeAndGarden.js";
import Electronika from "./models/Electronika.js";
import Accessory from "./models/Acsesuar.js";
import RealEstate from "./models/RealEstate.js";
import HouseHold from "./models/Household.js";
import Phone from "./models/Phone.js";
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
// token yoxlayan middleware
// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import path from "path";
// import dotenv from "dotenv";
// import connectDB from "./db.js";

// // MODELLƏR
// import Announcement from "./models/Announcement.js";
// import HomeAndGarden from "./models/HomeAndGarden.js";
// import Electronika from "./models/Electronika.js";
// import Accessory from "./models/Acsesuar.js";
// import RealEstate from "./models/RealEstate.js";
// import HouseHold from "./models/Household.js";
// import Phone from "./models/Phone.js";
// import Clothing from "./models/Clothing.js";
// import Jewelry from "./models/Jewelry.js";
// import User from "./models/user.js";
// import Ad from "./models/Ad.js";

// // MIDDLEWARE
// import { verifyToken } from "./middleware/verifyToken.js";
// import authMiddleware from "./middleware/authMiddleware.js";

// // ROUTES
// import authRoutes from "./routes/auth.js";
// import adsRouter from "./routes/ads.js";
// import statsRouter from "./routes/stats.js";
// import announcementRoutes from "./routes/announcements.js";
// import profileRoutes from "./routes/Profile.js";

// // DIGƏR
// import { fileURLToPath } from "url";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import mongoose from "mongoose";
// import nodemailer from "nodemailer";
// import bodyParser from "body-parser";
// import twilio from "twilio";




// import otpRoutes from "./routes/otp.js";


// .env faylını oxu
dotenv.config();
connectDB();
// Əgər __dirname lazımdırsa:

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();


// const PORT = 5000;



const PORT = process.env.PORT || 5000;




const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

// const upload = multer({ storage });

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
});


dotenv.config({ path: path.resolve("../.env") });

// Routes



// app.use(cors());


app.use(cors({
   origin: ["http://localhost:10000",  "https://omurcars.org", "https://axtartapaz-frontend.onrender.com"],
  credentials: true
}));
app.use(express.json()); 
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", authRoutes);
app.use("/api/ads", adsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/announcements", announcementRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api", profileRoutes);
// app.use(bodyParser.json());
// app.use("/api", otpRoutes);


const BASE_URL = process.env.NODE_ENV === "production"
  ? process.env.RENDER_URL  // render üçün
  : `http://localhost:${process.env.PORT}`;


// kateqoriya-mapping
const modelsMap = {

  realEstate: RealEstate,
  homeAndGarden: HomeAndGarden,
  Clothing: Clothing,
  Announcement: Announcement,
  Electronika: Electronika,
  Accessory: Accessory,
  HouseHold: HouseHold,
  Phone: Phone,

};




app.post("/api/ads", upload.array("images", 20), async (req, res) => {
  try {
    console.log(req.body); // text field-lar
    console.log(req.files); // yüklənmiş şəkillər

    const ad = new Ad({
      ...req.body,
      images: req.files.map(f => f.filename)
    });
    await ad.save();
    res.status(201).json(ad);
  } catch (err) {
    console.error("POST /api/ads xətası:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /api/my-{category} - istifadəçinin bütün elanları
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

// DELETE /api/{category}/{id} - istifadəçi öz elanını silir
app.delete("/:category/:id", authMiddleware, async (req, res) => {
  try {
    const { category, id } = req.params;
    const Model = modelsMap[category];
    if (!Model) return res.status(400).json({ message: "Invalid category" });

    const ad = await Model.findById(id);
    if (!ad) return res.status(404).json({ message: "Ad not found" });

    // Yalnız sahibi silə bilər
    if (ad.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    await Model.findByIdAndDelete(id);
    res.json({ message: "Ad deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
async function idGenerator() {
  let unique = false;
  let newId;

  while(!unique) {
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
    return res.status(401).json({ message: "İstifadəçi adı və ya şifrə yalnışdır" });
  }
});

// Middleware – token yoxlamaq üçün
function verifyAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: "Token yoxdur" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secretKey", (err, decoded) => {
    if (err) return res.status(403).json({ message: "Token etibarsızdır" });
    if (decoded.role !== "admin") return res.status(403).json({ message: "Admin girişi tələb olunur" });
    next();
  });
}

// Məsələn reklamlar üçün qorunan route
app.get("/api/ads", verifyAdmin, (req, res) => {
  res.json([
    { id: 1, title: "Test Ad", link: "http://example.com" },
  ]);
});



const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// OTP saxlanması üçün sadə yaddaş (real app-da DB istifadə et)
const otpStore = {}; // { phoneNumber: { otp: 1234, expires: Date } }





// OTP göndərmək
app.post("/api/send-otp", async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Telefon nömrəsi tələb olunur" });

  const otp = Math.floor(100000 + Math.random() * 900000); // 6 rəqəmli kod
  otpStore[phone] = { otp, expires: Date.now() + 5 * 60 * 1000 }; // 5 dəqiqəlik OTP

  try {
    await client.messages.create({
      body: `Sizin OTP kodunuz: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });
    res.json({ message: "OTP göndərildi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "OTP göndərilə bilmədi" });
  }
});

// OTP təsdiqləmək
app.post("/api/verify-otp", (req, res) => {
  const { phone, otp } = req.body;
  if (!phone || !otp) return res.status(400).json({ message: "Telefon və OTP tələb olunur" });

  const record = otpStore[phone];
  if (!record) return res.status(400).json({ message: "OTP tapılmadı" });
  if (Date.now() > record.expires) return res.status(400).json({ message: "OTP vaxtı bitib" });
  if (Number(otp) !== record.otp) return res.status(400).json({ message: "OTP səhvdir" });

  delete otpStore[phone]; // OTP istifadə olundu
  res.json({ message: "Telefon təsdiqləndi" });
});



// app.get("/api/my-cars", verifyToken, async (req, res) => {
//   try {
//     const cars = await Announcement.find({ userId: req.user.id }).sort({ data: -1 });
//     res.json(cars);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



// app.get("/api/cars/:id", async (req, res) => {
//   try {
//     const car = await Announcement.findOne({ id: Number(req.params.id) });
//     if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
//     res.json(car); // 200 status ilə qaytarır
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Server xətası" });
//   }
// });

// // Bütün elanları gətir
// app.get("/api/cars", async (req, res) => {

//   try {
//     const cars = await Announcement.find().sort({ data: -1 });
//     res.json(cars);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// app.post("/api/cars", upload.array("images", 20 ), async (req, res) => {
//   const newId = await idGenerator();
//   try {
//      const { id } = req.params;
      
//     const {
     
//     category,
//     ban_type,
//     brand,
//     model,
//     year,
//     price,
//     location,
//     images,
//     km,
//     motor,
//     transmission,
//     liked,
//     favorite,
//     engine,
//     data,
    
//     description, } = req.body;
    
//     const contact = {
//       name: req.body["contact.name"],
//       email: req.body["contact.email"],
//       phone: req.body["contact.phone"],
//   }
//  const imageUrls = req.files.map(file => `http://localhost:${PORT}/uploads/${file.filename}`);

//   const newAnn = new Announcement({
//       id: newId,
//       ban_type,
//       category,
//       brand,
//       model,
//       year,
//       price,
//       location,
//       images,
//       km,
//       motor,
//       transmission,
//       engine,
//       contact,
//       liked: liked === "true",
//       favorite: favorite === "true",
//       data : data ? new Date(data) : new Date(),
//       description,
//        userId: req.user.id,
     
//    images: imageUrls,
//       // image: req.file ? `http://localhost:${PORT}/uploads/${req.file.filename}` : "",
// })

// await newAnn.save();
// res.status(201).json(newAnn);
// } catch (err) {
//   res.status(500).json({error: err.message});
// }
// });



// // Multer upload və verifyToken middleware əvvəlcədən əlavə olunub


// app.put("/api/cars/:id",verifyToken, upload.array("images", 20), async (req, res) => {
//    try {
//     const ann = await Announcement.findById(req.params.id);
//     if (!ann) return res.status(404).json({ message: "Elan tapılmadı" });

//     // İstifadəçi sahib deyil -> icazə yoxdur
//     if (ann.userId !== req.user.id) {
//       return res.status(403).json({ message: "Bu elanı yeniləmək hüququn yoxdur" });
//     }

//     // əgər sahibdirsə yeniləməyə davam et...
//     Object.assign(ann, req.body);
//     await ann.save();
//     res.json(ann);
//     const { id } = req.params;
//     const {
//          category,
//          ban_type,
//     brand,
//     model,
//     year,
//     price,
//     location,
//     images,
//     km,
//     motor,
//     transmission,
//     liked,
//     favorite,
//     engine,
//     data,
//     description,

    
//     } = req.body;
//     const contact = {
//       name: req.body.name,
//       email: req.body.email,
//       phone: req.body.phone,
//     };
//  let imageUrls = [];

//     if (req.files && req.files.length > 0) {
//       imageUrls = req.files.map(file => `http://localhost:${PORT}/uploads/${file.filename}`);
//     }

//     const updatedFields = {
//       id:  Date.now(), 
//         category,
//       model,
//       ban_type,
//       year,
//       brand,
//       price,
//       location,
//       images,
//       km,
//       motor,
//       transmission,
//       description,
//       engine,
//       contact,
//       liked: liked === "true",
//       favorite: favorite === "true",
//       data: data ? new Date(data) : new Date(),
//          images: req.files
//     ? req.files.map(file => `http://localhost:${PORT}/uploads/${file.filename}`)
//     : [],
//     };





  
//      if (imageUrls.length > 0) {
//       updatedFields.images = imageUrls; // şəkilləri yenilə
//     }

    

//     if (req.file) {
//       updatedFields.images = `http://localhost:${PORT}/uploads/${req.files.filename}`;
//     }
//     const update = await Announcement.findByIdAndUpdate(id, updatedFields, { new: true});
//     res.json(update);
//   } catch (err) {
//     res.status(500).json({ error: err.message})
//   }
// });


// app.delete("/api/cars/:id", verifyToken, async (req, res) => {
//   try {

//     const ann = await Announcement.findById(req.params.id);
//     if (!ann) return res.status(404).json({ message: "Elan tapılmadı" });

//     if (ann.userId !== req.user.id) {
//       return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
//     }

//     await ann.deleteOne();
//     res.status(204).send();

//     const { id } = req.params;
//   await Announcement.findByIdAndDelete(req.params.id);
//     res.status(204).send();
//   } catch  (err){
//     res.status(500).json({ error: err.message})
//   }
// });



// app.patch("/api/cars/:id/like", async (req, res) => {
//   try {
//       const car = await Announcement.findById(req.params.id);
//       car.liked = !car.liked;
//       await car.save();
//       res.json(car);
//   } catch (err) {
//     res.status(500).json({ error: err.message})
//   }
// });


// app.patch("/api/cars/:id/favorite", async (req, res) => {
//   try {
//     const car = await Announcement.findById(req.params.id); 
//     car.favorite = !car.favorite;
//     await car.save();
//     res.json(car);
//   }catch (err) {
//     res.status(500).json({error: err.message})
//   }
// });

// app.get("/api/my-cars", verifyToken, async (req, res) => {
//   try {
//     const cars = await Announcement.find({ userId: req.user.id }).sort({ data: -1 });
//     res.json(cars);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });


// Bütün elanları gətir
app.get("/api/cars", async (req, res) => {
  try {
    const cars = await Announcement.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Yalnız öz elanlarını gətir
app.get("/api/my-cars", verifyToken, async (req, res) => {
  try {
    const cars = await Announcement.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ID ilə elan
app.get("/api/cars/:id", async (req, res) => {
  try {
    const car = await Announcement.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xətası" });
  }
});

// Yeni elan əlavə et
app.post("/api/cars", verifyToken, upload.array("images", 20), async (req, res) => {

  
  try {
    const newId = await idGenerator();


// Elanı yeniləyərkən

    const newAnn = new Announcement({
      ...req.body,
      id: newId,
      userId: req.user.id,
      images: req.files.map(file => `${BASE_URL}/uploads/${file.filename}`),
      liked: false,
      favorite: false,
      
    });

    await newAnn.save();
    res.status(201).json(newAnn);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Elanı yenilə
app.put("/api/cars/:id", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json({ message: "Elan tapılmadı" });

    if (ann.userId !== req.user.id) {
      return res.status(403).json({ message: "Bu elanı yeniləmək hüququn yoxdur" });
    }

    if (req.files && req.files.length > 0) {
      ann.images = req.files.map(file => `${BASE_URL}/uploads/${file.filename}`);
    }

    const { title, description, price } = req.body;
    if (title) ann.title = title;
    if (description) ann.description = description;
    if (price) ann.price = price;

    await ann.save();
    res.json(ann);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Elanı sil
app.delete("/api/cars/:id", verifyToken, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);

    if (!ann) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    if (ann.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    }

    await ann.deleteOne();
    res.json({ message: "Elan uğurla silindi ✅" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ error: "Server xətası" });
  }
});


// Like / Favorite toggle
app.patch("/api/cars/:id/like", async (req, res) => {
  try {
    const car = await Announcement.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
    car.liked = !car.liked;
    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/cars/:id/favorite", async (req, res) => {
  try {
    const car = await Announcement.findById(req.params.id);
    if (!car) return res.status(404).json({ message: "Elan tapılmadı" });
    car.favorite = !car.favorite;
    await car.save();
    res.json(car);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});



app.delete("/api/:category/:id", verifyToken, async (req, res) => {
  try {
    const { category, id } = req.params;
    const ad = await Announcement.findOne({ _id: id, category });
    if (!ad) return res.status(404).json({ message: "Elan tapılmadı" });

    if (ad.userId !== req.user.id) {
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    }

    await ad.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ----------------- HomeAndGarden -----------------



// POST /api/homGarden - yeni elan
// app.post("/api/homGarden", verifyToken, upload.array("images", 20), async (req, res) => {
//   try {
//     const {
//       model,
//       category,
//       title,
//       description,
//       brand,
//       price,
//       location,
//       liked,
//       favorite,
//       data
//     } = req.body;

//     const contact = {
//       name: req.body["contact.name"],
//       email: req.body["contact.email"],
//       phone: req.body["contact.phone"],
//     };

//     const imageUrls = req.files?.map(f => `http://localhost:5000/uploads/${f.filename}`) || [];

//     const newHome = new HomeAndGarden({
//       userId: req.user.id,
//       model,
//       category,
//       title,
//       description,
//       brand,
//       price,
//       location,
//       contact,
//       liked: liked === "true",
//       favorite: favorite === "true",
//       data: data ? new Date(data) : new Date(),
//       images: imageUrls
//     });

//     await newHome.save();
//     res.status(201).json(newHome);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: err.message });
//   }
// });



app.post("/api/homGarden", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const { model, category, title, description, brand, price, location, liked, favorite, data } = req.body;
    const contact = {
      name: req.body["contact.name"],
      email: req.body["contact.email"],
      phone: req.body["contact.phone"],
    };
    const imageUrls = req.files?.map(f => `${BASE_URL}/uploads/${f.filename}`) || [];

    const newHome = new HomeAndGarden({
      userId: req.user.id,
      model, category, title, description, brand, price, location,
      contact, liked: liked === "true", favorite: favorite === "true",
      data: data ? new Date(data) : new Date(),
      images: imageUrls,
    });

    await newHome.save();
    res.status(201).json(newHome);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// app.get("/api/homGarden/my-announcements", verifyToken, async (req, res) => {
//   const items = await Announcement.find({ userId: req.user.id });
//   res.json(items);
// });



app.get("/api/homGarden/my-announcements", verifyToken, async (req, res) => {
  try {
    const items = await HomeAndGarden.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// GET bütün elanlar
app.get("/api/homGarden", async (req, res) => {
  try {
    const items = await HomeAndGarden.find().sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tək elan
app.get("/api/homGarden/:id", async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET istifadəçinin öz elanları
app.get("/api/homGarden/:id", verifyToken, async (req, res) => {
  try {
    const items = await HomeAndGarden.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// İstifadəçinin elan silməsi
app.delete("/api/homGarden/:id", verifyToken, async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    // Yalnız elan sahibi silə bilər
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu elanı silmək icazəniz yoxdur" });
    }

    await item.deleteOne();
    res.json({ message: "Elan uğurla silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Elanı yeniləmək (yalnız sahib edə bilər)
app.put("/api/homGarden/:id", verifyToken, async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu elanı dəyişmək icazəniz yoxdur" });
    }

    const updated = await HomeAndGarden.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT - elan yenilə
app.put("/api/homGarden/:id", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ message: "İcazəniz yoxdur" });

    const { model, category, title, description, brand, price, location, liked, favorite, data } = req.body;
    const contact = {
      name: req.body["contact.name"],
      email: req.body["contact.email"],
      phone: req.body["contact.phone"]
    };
    const imageUrls = req.files?.map(f => `${BASE_URL}/uploads/${f.filename}`) || item.images;

    Object.assign(item, {
      model, category, title, description, brand, price, location,
      contact, liked: liked === "true", favorite: favorite === "true",
      data: data ? new Date(data) : item.data,
      images: imageUrls
    });

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - elan sil
app.delete("/api/homGarden/:id", verifyToken, async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId.toString() !== req.user.id) return res.status(403).json({ message: "İcazəniz yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH like
app.patch("/api/homGarden/:id/like", verifyToken, async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    item.liked = !item.liked;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH favorite
app.patch("/api/homGarden/:id/favorite", verifyToken, async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    item.favorite = !item.favorite;
    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ----------------- Electronika -----------------
// GET bütün elanlar
app.get("/api/electronika", async (req, res) => {
  try {
    const items = await Electronika.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET mənim elanlarım
app.get("/api/my-electronika", verifyToken, async (req, res) => {
  try {
    const items = await Electronika.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE elan (sahibinə görə)
app.delete("/api/electronika/:id", verifyToken, async (req, res) => {
  try {
    const item = await Electronika.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Yeni elan əlavə et
app.post("/api/electronika", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const newId = await idGenerator();

    const imageUrls = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const newPost = new Electronika({
      id: newId,
      category: req.body.category,
      title: req.body.title,
      brand: req.body.brand,
      model: req.body.model,
      price: req.body.price,
      location: req.body.location,
      description: req.body.description,
      images: imageUrls,
      contact,
      liked: false,
      favorite: false,
      data: req.body.data ? new Date(req.body.data) : Date.now(),
      userId: req.user.id, // vacib
    });

    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE elan
app.put("/api/electronika/:id", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const post = await Electronika.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post tapılmadı" });
    if (post.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Bu elanı dəyişmək hüququn yoxdur" });

    if (req.files.length > 0) {
      const imageUrls = req.files.map(
        (file) => `${BASE_URL}/uploads/${file.filename}`
      );
      post.images = imageUrls;
    }

    post.title = req.body.title || post.title;
    post.brand = req.body.brand || post.brand;
    post.model = req.body.model || post.model;
    post.price = req.body.price || post.price;
    post.location = req.body.location || post.location;
    post.description = req.body.description || post.description;

    post.contact = {
      name: req.body["contact.name"] || post.contact.name,
      email: req.body["contact.email"] || post.contact.email,
      phone: req.body["contact.phone"] || post.contact.phone,
    };

    post.data = req.body.data ? new Date(req.body.data) : post.data;

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Like toggle
app.patch("/api/electronika/:id/like", async (req, res) => {
  try {
    const post = await Electronika.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post tapılmadı" });

    post.liked = !post.liked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite toggle
app.patch("/api/electronika/:id/favorite", async (req, res) => {
  try {
    const post = await Electronika.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post tapılmadı" });

    post.favorite = !post.favorite;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET tək elan
app.get("/api/electronika/:id", async (req, res) => {
  try {
    const item = await Electronika.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});






// ----------------- Accessory -----------------
app.get("/api/my-accessories", verifyToken, async (req, res) => {
  try {
    const items = await Accessory.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/accessories/:id", verifyToken, async (req, res) => {
  try {
    const item = await Accessory.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/accessories", async (req, res) => {
  try {
    const accessories = await Accessory.find();
    res.json(accessories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/accessories/:id", async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    if (!accessory) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(accessory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.post("/api/accessories", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const images = req.files.map(
      file => `${BASE_URL}/uploads/${file.filename}`
    );

    const accessory = new Accessory({
      ...req.body,
      images,
      userId: req.user.id, // <- burda istifadəçinin ID-si
      contact: {
        name: req.body["contact.name"],
        email: req.body["contact.email"],
        phone: req.body["contact.phone"],
      },
    });

    await accessory.save();
    res.status(201).json(accessory);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put(
  "/api/accessories/:id",
  upload.array("images", 10),
  async (req, res) => {
    try {
      let images = [];
      if (req.files.length > 0) {
        images = req.files.map(
          (file) =>
            `${BASE_URL}/uploads/${file.filename}`
        );
      }

      const updated = await Accessory.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          ...(images.length > 0 && { images }),
          contact: {
            name: req.body["contact.name"],
            email: req.body["contact.email"],
            phone: req.body["contact.phone"],
          },
        },
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


app.delete("/api/accessories/:id", async (req, res) => {
  try {
    await Accessory.findByIdAndDelete(req.params.id);
    res.json({ message: "Accessory silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.patch("/api/accessories/:id/favorite", async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    accessory.favorite = !accessory.favorite;
    await accessory.save();
    res.json(accessory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/accessories/:id/like", async (req, res) => {
  try {
    const accessory = await Accessory.findById(req.params.id);
    accessory.liked = !accessory.liked;
    await accessory.save();
    res.json(accessory);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 Yüklənmiş şəkili silmək
app.delete("/api/accessories/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    await Accessory.updateMany(
      {},
      { $pull: { images: { $regex: imageName } } }
    );
    res.json({ message: "Şəkil silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});










// ----------------- RealEstate -----------------
app.get("/api/my-realEstate", verifyToken, async (req, res) => {
  try {
    const items = await RealEstate.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/RealEstate/:id", verifyToken, async (req, res) => {
  try {
    const item = await RealEstate.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like toggle
app.patch("/api/RealEstate/:id/like", async (req, res) => {
  try {
    const post = await RealEstate.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post tapılmadı" });

    post.liked = !post.liked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite toggle
app.patch("/api/RealEstate/:id/favorite", async (req, res) => {
  try {
    const post = await RealEstate.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post tapılmadı" });

    post.favorite = !post.favorite;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/RealEstate/:id", async (req, res) => {
  try {
    const item = await RealEstate.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.get("/api/RealEstate", async (req, res) => {
  try {
    const realEstatePost = await RealEstate.find();
    res.json(realEstatePost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});





app.post("/api/RealEstate", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const newId = await idGenerator();

    const images = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );

    const realEstatePost = new RealEstate({
      id: newId,
      ...req.body,
      images,
      userId: req.user.id, // burada token-dan gələn userId əlavə olunur
      contact: {
        name: req.body["contact.name"],
        email: req.body["contact.email"],
        phone: req.body["contact.phone"],
      },
    });

    await realEstatePost.save();
    res.status(201).json(realEstatePost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.put(
  "/api/RealEstate/:id",
  upload.array("images", 20),
  async (req, res) => {
    try {
      let images = [];
      if (req.files.length > 0) {
        images = req.files.map(
          (file) =>
            `${BASE_URL}/uploads/${file.filename}`
        );
      }

      const updated = await RealEstate.findByIdAndUpdate(
        req.params.id,
        {
          ...req.body,
          ...(images.length > 0 && { images }),
          contact: {
            name: req.body["contact.name"],
            email: req.body["contact.email"],
            phone: req.body["contact.phone"],
          },
        },
        { new: true }
      );
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
);


app.delete("/api/RealEstate/:id", async (req, res) => {
  try {
    await RealEstate.findByIdAndDelete(req.params.id);
    res.json({ message: "Elan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/api/RealEstate/:id/favorite", async (req, res) => {
  try {
    const realEstatePost = await RealEstate.findById(req.params.id);
    realEstatePost.favorite = !realEstatePost.favorite;
    await realEstatePost.save();
    res.json(realEstatePost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.patch("/api/RealEstate/:id/like", async (req, res) => {
  try {
    const realEstatePost = await RealEstate.findById(req.params.id);
    realEstatePost.liked = !realEstatePost.liked;
    await realEstatePost.save();
    res.json(realEstatePost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/RealEstatePost/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;
    await RealEstate.updateMany(
      {},
      { $pull: { images: { $regex: imageName } } }
    );
    res.json({ message: "Şəkil silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// ----------------- HouseHold -----------------


app.get("/api/my-household", verifyToken, async (req, res) => {
  try {
    const items = await HouseHold.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/Household/:id", verifyToken, async (req, res) => {
  try {
    const item = await HouseHold.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/Household", async (req, res) => {
  try {
    const householdPosts = await HouseHold.find();
    res.json(householdPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/Household/:id", async (req, res) => {
  try {
    const item = await HouseHold.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post("/api/Household", verifyToken, upload.array("images", 20), async (req, res) => {
  const newId = await idGenerator();
  try {
    const images = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const newHouseHold = new HouseHold({
      id: newId,
      ...req.body,
      images,
      contact,
      data: req.body.data ? new Date(req.body.data) : new Date(),
      userId: req.user.id, // Token-dan gələn istifadəçi ID
    });

    await newHouseHold.save();
    res.status(201).json(newHouseHold);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});



app.put("/api/Household/:id", upload.array("images", 10), async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(
        (file) => `${BASE_URL}/uploads/${file.filename}`
      );
    }

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const updated = await HouseHold.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(images.length > 0 && { images }),
        contact: {
        name: req.body["contact.name"],
        email: req.body["contact.email"],
        phone: req.body["contact.phone"],
      },
        data: req.body.data ? new Date(req.body.data) : new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


app.delete("/api/Household/:id", async (req, res) => {
  try {
    const deleted = await HouseHold.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

    // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

    res.json({ message: "Elan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like toggle
app.patch("/api/Household/:id/like", async (req, res) => {
  try {
    const post = await HouseHold.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.liked = !post.liked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite toggle
app.patch("/api/Household/:id/favorite", async (req, res) => {
  try {
    const post = await HouseHold.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.favorite = !post.favorite;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.delete("/api/Household/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;

    // 1. DB-də images massivindən URL-ə uyğun şəkili silir
    await HouseHold.updateMany(
      { images: { $regex: imageName } },
      { $pull: { images: { $regex: imageName } } }
    );

   
  
    res.json({ message: "Şəkil silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});







// ----------------- Phone -----------------
// -----------------------------------------
app.get("/api/my-phone", verifyToken, async (req, res) => {
  try {
    const items = await Phone.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/Phone/:id", verifyToken, async (req, res) => {
  try {
    const item = await Phone.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/api/Phone", async (req, res) => {
  try {
    const PhonePosts = await Phone.find();
    res.json(PhonePosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID-yə görə elan gətir
app.get("/api/Phone/:id", async (req, res) => {
  try {
    const item = await Phone.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


app.post("/api/Phone", verifyToken, upload.array("images", 20), async (req, res) => {
  try {
    const newId = await idGenerator();

    const images = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );

    const newPhone = new Phone({
      id: newId,
      ...req.body,
      images,
      contact: {
        name: req.body["contact.name"] || "",
        email: req.body["contact.email"] || "",
        phone: req.body["contact.phone"] || "",
      },
      userId: req.user.id, // verifyToken middleware bu məlumatı əlavə etməlidir
      data: req.body.data ? new Date(req.body.data) : new Date(),
    });

    await newPhone.save();
    res.status(201).json(newPhone);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// Elanı yenilə
app.put("/api/Phone/:id", upload.array("images", 20), async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(
        (file) => `${BASE_URL}/uploads/${file.filename}`
      );
    }

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const updated = await Phone.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(images.length > 0 && { images }),
        contact,
        data: req.body.data ? new Date(req.body.data) : new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Elanı sil
app.delete("/api/Phone/:id", async (req, res) => {
  try {
    const deleted = await Phone.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

    // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

    res.json({ message: "Elan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like toggle
app.patch("/api/Phone/:id/like", async (req, res) => {
  try {
    const post = await Phone.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.liked = !post.liked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite toggle
app.patch("/api/Phone/:id/favorite", async (req, res) => {
  try {
    const post = await Phone.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.favorite = !post.favorite;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Şəkil silmək (hem DB-dən images massivindən, hem serverdən faylı silir)
app.delete("/api/Phone/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;

    // 1. DB-də images massivindən URL-ə uyğun şəkili sil
    await Phone.updateMany(
      { images: { $regex: imageName } },
      { $pull: { images: { $regex: imageName } } }
    );

   
  
    res.json({ message: "Şəkil silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ---------------------------------------

// ----------------- Clothing -----------------


app.get("/api/my-clothing", verifyToken, async (req, res) => {
  try {
    const items = await Clothing.find({ userId: req.user.id }).sort({ data: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/Clothing/:id", verifyToken, async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    if (item.userId !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək hüququn yoxdur" });
    await item.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/Clothing", async (req, res) => {
  try {
    const ClothingPosts = await Clothing.find();
    res.json(ClothingPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID-yə görə elan gətir
app.get("/api/Clothing/:id", async (req, res) => {
  try {
    const item = await Clothing.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni elan əlavə et
app.post("/api/Clothing", upload.array("images", 10), async (req, res) => {
  const newId = await idGenerator();
  try {
    const images = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    if (!req.body.userId) {
      return res.status(400).json({ error: "userId tələb olunur" });
    }

    const newClothing = new Clothing({
      id: newId,
      ...req.body,
      images,
      contact,
      data: req.body.data ? new Date(req.body.data) : new Date(),
    });

    await newClothing.save();
    res.status(201).json(newClothing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Elanı yenilə
app.put("/api/Clothing/:id", upload.array("images", 10), async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(
        (file) => `${BASE_URL}/uploads/${file.filename}`
      );
    }

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const updated = await Clothing.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(images.length > 0 && { images }),
        contact,
        data: req.body.data ? new Date(req.body.data) : new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Elanı sil
app.delete("/api/Clothing/:id", async (req, res) => {
  try {
    const deleted = await Clothing.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

    // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

    res.json({ message: "Elan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like toggle
app.patch("/api/Clothing/:id/like", async (req, res) => {
  try {
    const post = await Clothing.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.liked = !post.liked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite toggle
app.patch("/api/Clothing/:id/favorite", async (req, res) => {
  try {
    const post = await Clothing.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.favorite = !post.favorite;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Şəkil silmək (hem DB-dən images massivindən, hem serverdən faylı silir)
app.delete("/api/Clothing/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;

    // 1. DB-də images massivindən URL-ə uyğun şəkili sil
    await Clothing.updateMany(
      { images: { $regex: imageName } },
      { $pull: { images: { $regex: imageName } } }
    );

   
  
    res.json({ message: "Şəkil silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ------------------------------------





app.get("/api/Jewelry", async (req, res) => {
  try {
    const JewelryPosts = await Jewelry.find();
    res.json(JewelryPosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ID-yə görə elan gətir
app.get("/api/Jewelry/:id", async (req, res) => {
  try {
    const item = await Jewelry.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Yeni elan əlavə et
app.post("/api/Jewelry", upload.array("images", 10), async (req, res) => {
    const newId = await idGenerator();
  try {
    const images = req.files.map(
      (file) => `${BASE_URL}/uploads/${file.filename}`
    );

    // contact sahəsini req.body-dən ayrıca götür
    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const newJewelry = new Jewelry({
      id: newId,
      ...req.body,
      images,
      contact,
      data: req.body.data ? new Date(req.body.data) : new Date(),
    });

    await newJewelry.save();
    res.status(201).json(newJewelry);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Elanı yenilə
app.put("/api/Jewelry/:id", upload.array("images", 10), async (req, res) => {
  try {
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(
        (file) => `${BASE_URL}/uploads/${file.filename}`
      );
    }

    const contact = {
      name: req.body["contact.name"] || "",
      email: req.body["contact.email"] || "",
      phone: req.body["contact.phone"] || "",
    };

    const updated = await Jewelry.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        ...(images.length > 0 && { images }),
        contact,
        data: req.body.data ? new Date(req.body.data) : new Date(),
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Elan tapılmadı" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Elanı sil
app.delete("/api/Jewelry/:id", async (req, res) => {
  try {
    const deleted = await Jewelry.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Elan tapılmadı" });

    // Lazım gələrsə burada əlaqəli şəkilləri də serverdən silə bilərsən

    res.json({ message: "Elan silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Like toggle
app.patch("/api/Jewelry/:id/like", async (req, res) => {
  try {
    const post = await Jewelry.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.liked = !post.liked;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Favorite toggle
app.patch("/api/Jewelry/:id/favorite", async (req, res) => {
  try {
    const post = await Clothing.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Elan tapılmadı" });

    post.favorite = !post.favorite;
    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Şəkil silmək (hem DB-dən images massivindən, hem serverdən faylı silir)
app.delete("/api/Jewelry/images/:imageName", async (req, res) => {
  try {
    const imageName = req.params.imageName;

    // 1. DB-də images massivindən URL-ə uyğun şəkili sil
    await Clothing.updateMany(
      { images: { $regex: imageName } },
      { $pull: { images: { $regex: imageName } } }
    );

   
  
    res.json({ message: "Şəkil silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});











// VERIFY TOKEN


app.post("/api/announcements", verifyToken, async (req, res) => {
  try {
    const newAnn = new Announcement({
      ...req.body,
      owner: req.userId,
    });
    await newAnn.save();
    res.status(201).json(newAnn);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ROUTES
// REGISTER
// server.js və ya app.js
app.post("/api/reqister", async (req, res) => {
  try {
    // password hash-lə
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
      username: req.body.username,
      phone: req.body.phone,
      email: req.body.email,
      password: hashedPassword,
      
       // hash-lənmiş password saxlanır
    });

    await newUser.save();
    res.status(201).json("User created successfully!");
  } catch (err) {
    res.status(500).json(err);
  }
});


// LOGIN
app.post("/api/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).json("User not found");

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).json("Wrong password");

    const token = jwt.sign({ id: user._id }, "SECRET_KEY", { expiresIn: "1d" });
    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    res.status(500).json(err);
  }
});

// CREATE ANNOUNCEMENT
app.post("/api/announcements", verifyToken, async (req, res) => {
  try {
    const newAnn = new Announcement({
      ...req.body,
      owner: req.userId,
    });
    await newAnn.save();
    res.status(201).json(newAnn);
  } catch (err) {
    res.status(500).json(err);
  }
});

// UPDATE ANNOUNCEMENT
app.put("/api/announcements/:id", verifyToken, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json("Not found");

    if (ann.owner.toString() !== req.userId) {
      return res.status(403).json("You can only edit your own announcements");
    }

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
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


app.get("/api/announcements",verifyToken, async (req, res) => {
  try {
    const announcements = await Announcement.find().populate("owner", "username");
    res.json(announcements);
  } catch (err) {
    res.status(500).json(err);
  }
});



app.put("/api/announcements/:id", verifyToken, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json("Not found");

    if (ann.owner.toString() !== req.userId)
      return res.status(403).json("You can only edit your own announcements");

    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Elanı sil
app.delete("/api/announcements/:id", verifyToken, async (req, res) => {
  try {
    const ann = await Announcement.findById(req.params.id);
    if (!ann) return res.status(404).json("Not found");

    if (ann.owner.toString() !== req.userId)
      return res.status(403).json("You can only delete your own announcements");

    await Announcement.findByIdAndDelete(req.params.id);
    res.json("Deleted successfully");
  } catch (err) {
    res.status(500).json(err);
  }
});


app.get("/api/users/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password"); // password göndərmə
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
});




app.get("/api/announcements/my-announcements", verifyToken, async (req, res) => {
  try {
    const myAnnouncements = await Announcement.find({ owner: req.userId });
    res.json(myAnnouncements);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/api/my-announcements", verifyToken, async (req, res) => {
  try {
    const homeAds = await HomeAndGarden.find({ userId: req.user.id }).lean();
    homeAds.forEach(ad => ad.modelName = "homGarden");

    const clothingAds = await Clothing.find({ userId: req.user.id }).lean();
    clothingAds.forEach(ad => ad.modelName = "Clothing");

    const phoneAds = await Phone.find({ userId: req.user.id }).lean();
    phoneAds.forEach(ad => ad.modelName = "Phone");

    const householdAds = await HouseHold.find({ userId: req.user.id }).lean();
    householdAds.forEach(ad => ad.modelName = "Household");

    const realEstateAds = await RealEstate.find({ userId: req.user.id }).lean();
    realEstateAds.forEach(ad => ad.modelName = "RealEstate");

    const accessoryAds = await Accessory.find({ userId: req.user.id }).lean();
    accessoryAds.forEach(ad => ad.modelName = "accessories");

    const announcementAds = await Announcement.find({ userId: req.user.id }).lean();
    announcementAds.forEach(ad => ad.modelName = "cars");

    const electronikaAds = await Electronika.find({ userId: req.user.id }).lean();
    electronikaAds.forEach(ad => ad.modelName = "electronika");

    const allAds = [
      ...homeAds,
      ...clothingAds,
      ...phoneAds,
      ...householdAds,
      ...realEstateAds,
      ...accessoryAds,
      ...announcementAds,
      ...electronikaAds
    ];

    allAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allAds);
  } catch (err) {
    console.error("My-announcements error:", err);
    res.status(500).json({ error: err.message });
  }
});



const models = {
  homGarden: HomeAndGarden,
  clothing: Clothing,
  phone: Phone,
  household: HouseHold,
  realEstate: RealEstate,
  accessories: Accessory,
  cars: Announcement,
  electronika: Electronika,
};

app.delete("/api/:model/:id", verifyToken, async (req, res) => {
  try {
    const { model, id } = req.params;
    const Model = models[model];
    if (!Model) return res.status(400).json({ message: "Yanlış model adı" });

    const item = await Model.findById(id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

    if (item.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "İcazəniz yoxdur" });

    await item.deleteOne();
    res.json({ message: "Elan uğurla silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



app.delete("/api/:model/:id", verifyToken, async (req, res) => {
  const { model, id } = req.params;

  const models = {
    homGarden: HomeAndGarden,
    clothing: Clothing,
    phone: Phone,
    household: HouseHold,
    realestate: RealEstate,
    accessory: Accessory,
    cars: Announcement,
    electronika: Electronika,
  };

  const SelectedModel = models[model];
  if (!SelectedModel) return res.status(400).json({ message: "Yanlış model adı" });

  try {
    const item = await SelectedModel.findById(id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

    if (item.userId.toString() !== req.user.id)
      return res.status(403).json({ message: "Bu elanı silmək icazəniz yoxdur" });

    await item.deleteOne();
    res.json({ message: "Elan uğurla silindi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.delete("/api/my-announcements/:id", verifyToken, async (req, res) => {
  try {
    const item = await HomeAndGarden.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Elan tapılmadı" });

    // Yalnız elan sahibi silə bilər
    if (item.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Bu elanı silmək icazəniz yoxdur" });
    }

    await item.deleteOne();
    res.json({ message: "Elan uğurla silindi" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server işə düşdü: http://localhost:${PORT}`);
  // npx nodemon src/backend/cateqory.js serveri ise salmaq ucun
});
