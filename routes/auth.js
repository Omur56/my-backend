import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/user.js";

const router = express.Router();



const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS, // Gmail App Password
  },
  tls: {
    rejectUnauthorized: false, // self-signed sertifikat xətasını keçmək üçün
  },
});

// 1️⃣ Şifrə unutduqda — kod göndər
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email lazımdır" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Bu email ilə istifadəçi yoxdur" });

    // 6 rəqəmli təsadüfi kod
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = await bcrypt.hash(code, 10);

    user.resetPasswordCode = codeHash;
    user.resetPasswordExpires = Date.now() + 1000 * 60 * 15; // 15 dəq
    await user.save();

    const resetLink = `${process.env.BASE_URL}/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;

    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Şifrəni yeniləmə",
      html: `
        <p>Şifrəni yeniləmək üçün kodunuz: <b>${code}</b></p>
        <p>Yaxud bu linkə klikləyin:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Kod 15 dəqiqə ərzində etibarlıdır.</p>
      `,
    });

    res.json({ message: "Email-ə kod göndərildi" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Xəta baş verdi" });
  }
});

// 2️⃣ Reset Password — kodu yoxla və yenilə
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) return res.status(400).json({ message: "Email, kod və yeni şifrə tələb olunur" });

    const user = await User.findOne({ email });
    if (!user || !user.resetPasswordCode || !user.resetPasswordExpires || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: "Kodun vaxtı bitib və ya mövcud deyil" });
    }

    const isMatch = await bcrypt.compare(code, user.resetPasswordCode);
    if (!isMatch) return res.status(400).json({ message: "Kod yanlışdır" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Şifrə uğurla yeniləndi" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Xəta baş verdi" });
  }
});

export default router;
