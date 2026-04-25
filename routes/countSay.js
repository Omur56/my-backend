import express from "express";
import Ad from "../models/Ad.js";

const router = express.Router();

router.get("/counts", async (req, res) => {
  try {
    const [
      car,
      phone,
      electronics,
      clothing,
      realEstate,
      homeGarden,
      household,
      accessory
    ] = await Promise.all([
      Ad.countDocuments({ category: "car" }),
      Ad.countDocuments({ category: "phone" }),
      Ad.countDocuments({ category: "electronics" }),
      Ad.countDocuments({ category: "clothing" }),
      Ad.countDocuments({ category: "realEstate" }),
      Ad.countDocuments({ category: "homeGarden" }),
      Ad.countDocuments({ category: "household" }),
      Ad.countDocuments({ category: "accessory" })
    ]);

    res.json({
      car,
      phone,
      electronics,
      clothing,
      realEstate,
      homeGarden,
      household,
      accessory
    });

  } catch (err) {
    console.error("COUNT ERROR:", err);
    res.status(500).json({ message: "Stats error" });
  }
});

export default router;