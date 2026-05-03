import express from "express";
import { createAd } from "../controllers/adController.js";
import multer from "multer";

const router = express.Router();
const upload = multer(); // memory storage

router.post("/create", upload.single("image"), createAd);

export default router;