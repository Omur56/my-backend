import mongoose from "mongoose";
import Listing from "./models/Listing.js";

// 🔥 BURAYA SƏNİN REAL MONGO URL
const MONGO_URI = "mongodb+srv://Omur9696:elanlar123@cluster0.pyjgrvq.mongodb.net/elanlar?retryWrites=true&w=majority&appName=Cluster0"; 
// və ya Atlas linkin

const createTest = async () => {
  try {
    // ✅ ƏVVƏL BAĞLAN
    await mongoose.connect(MONGO_URI);
    console.log("Mongo qoşuldu ✅");

    // ✅ SONRA DATA YARAT
    await Listing.create({
      title: "TEST VIP",
      price: 100,
      category: "car",
      user: "68b0bc241537b5c206977690",
      priorityType: "vip",
      priority: 1,
      priorityExpires: new Date(Date.now() - 60 * 1000),
      isActive: true
    });

    console.log("TEST ELAN YARADILDI ✅");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

createTest();