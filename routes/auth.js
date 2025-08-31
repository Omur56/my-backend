// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/user");
// const router = express.Router();

// // REGISTER
// router.post("/register", async (req, res) => {
//   const { username, email, password } = req.body;
//   if (!username || !email || !password)
//     return res.status(400).json({ message: "Please fill all fields" });

//   try {
//     const userExist = await User.findOne({ email });
//     if (userExist) return res.status(400).json({ message: "User exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ username, email, password: hashedPassword });
//     await user.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // LOGIN
// router.post("/login", async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password)
//     return res.status(400).json({ message: "Please fill all fields" });

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// module.exports = router;


// import express from "express";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import User from "";

// const router = express.Router();

// router.post("/register", async (req, res) => {
//   const { name, mobile, email, password } = req.body;

//   if (!name || !mobile || !email || !password)
//     return res.status(400).json({ message: "Please fill all fields" });

//   try {
//     const userExist = await User.findOne({ email });
//     if (userExist) return res.status(400).json({ message: "User already exists" });

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = new User({ name, mobile, email, password: hashedPassword });
//     await user.save();

//     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
//     res.status(201).json({
//       token,
//       user: { id: user._id, name: user.name, mobile: user.mobile, email: user.email },
//     });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;

import express from "express";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import User from "../models/user.js";

const router = express.Router();

// 📩 Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Gmail App Password (normal şifrə yox!)
  },
});

// 🔑 Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { identifier } = req.body;

    // user tap (email, username və ya phone ilə)
    const user = await User.findOne({
      $or: [
        { email: identifier },
        { username: identifier },
        { phone: identifier },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: "İstifadəçi tapılmadı!" });
    }

    // Yeni random şifrə
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    // Email göndər
    try {
      await transporter.sendMail({
        from: `"AxtarTap" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Şifrə Bərpası",
        text: `Yeni şifrəniz: ${newPassword}`,
      });

      res.json({ message: "Yeni şifrəniz email ünvanınıza göndərildi!" });
    } catch (mailErr) {
      console.error("Email göndərmə xətası:", mailErr);
      res.status(500).json({ message: "Email göndərilə bilmədi!" });
    }
  } catch (err) {
    console.error("Server xətası:", err);
    res.status(500).json({ message: "Server xətası" });
  }
});

export default router;

