// backend/routes/profile.js
import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";

// Modellər
import HomeAndGarden from "../models/HomeAndGarden.js";
import RealEstate from "../models/RealEstate.js";
import Phone from "../models/Phone.js";
import Announcement from "../models/Announcement.js";
import Acsesuar from "../models/Acsesuar.js";
import Clothing from "../models/Clothing.js";
import HouseHold from "../models/Household.js";
import Electronika from "../models/Electronika.js";
// digər modellər varsa əlavə et

const router = express.Router();

// /api/my-ads - bütün elanlar üçün
router.get("/my-ads", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // verifyToken middleware token-dən user id-ni alır

    const homGarden = await HomeAndGarden.find({ user: userId });
    const realEstates = await RealEstate.find({ user: userId });
    const phones = await Phone.find({ user: userId });
    const acsesuars = await Acsesuar.find({ user: userId });
    const clothings = await Clothing.find({ user: userId });
    const houseHolds = await HouseHold.find({ user: userId });
    const electronikas = await Electronika.find({ user: userId });
    const announcements = await Announcement.find({ user: userId });

    // hər elan arrayinə category əlavə edirik
    const allAds = [
      ...homGarden.map(ad => ({ ...ad._doc, category: "homeAndGarden" })),
      ...realEstates.map(ad => ({ ...ad._doc, category: "realEstate" })),
      ...phones.map(ad => ({ ...ad._doc, category: "phone" })),
      ...acsesuars.map(ad => ({ ...ad._doc, category: "acsesuar" })),
      ...clothings.map(ad => ({ ...ad._doc, category: "clothing" })),
      ...houseHolds.map(ad => ({ ...ad._doc, category: "household" })),
      ...electronikas.map(ad => ({ ...ad._doc, category: "electronika" })),
      ...announcements.map(ad => ({ ...ad._doc, category: "announcement" })),
    ];

    // tarixə görə sort
    allAds.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allAds);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server xətası" });
  }
});

export default router;
