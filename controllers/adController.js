import Ad from "../models/Ad.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

export const createAd = async (req, res) => {
  try {
    const file = req.file;

    const result = await uploadToCloudinary(file.buffer);

    const ad = await Ad.create({
      ...req.body,
      image: result.secure_url
    });

    res.json(ad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};