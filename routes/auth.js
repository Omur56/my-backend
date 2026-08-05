import express from "express";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/user.js";

const router = express.Router();

// SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

// SMTP Test
(async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP Verify OK");
  } catch (err) {
    console.error("❌ SMTP Verify Failed:", err);
  }
})();

console.log({
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_FROM: process.env.SMTP_FROM,
  SMTP_PASS_EXISTS: !!process.env.SMTP_PASS,
  BASE_URL: process.env.BASE_URL,
});

// =========================
// Forgot Password
// =========================
router.post("/forgot-password", async (req, res) => {
  try {
    console.log("📩 Forgot Password Request");

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email lazımdır",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "Bu email ilə istifadəçi yoxdur",
      });
    }

    // 6 rəqəmli kod
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const codeHash = await bcrypt.hash(code, 10);

    user.resetPasswordCode = codeHash;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();

   const resetLink =
`${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;

    console.log("📨 Mail göndərilir...");

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Şifrəni yenilə",
      html: `
        <h2>Şifrəni sıfırla</h2>

        <p>Sizin təsdiq kodunuz:</p>

        <h1 style="letter-spacing:6px">${code}</h1>

        <p>və ya aşağıdakı linkə klik edin:</p>

        <a href="${resetLink}">
          ${resetLink}
        </a>

        <br><br>

        <small>Kod 15 dəqiqə etibarlıdır.</small>
      `,
    });

    console.log("✅ Mail göndərildi");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);

    return res.json({
      message: "Email-ə kod göndərildi",
    });
  } catch (err) {
    console.error("❌ Forgot Password Error");
    console.error(err);

    return res.status(500).json({
      message: err.message,
      code: err.code,
    });
  }
});

// =========================
// Reset Password
// =========================
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({
        message: "Email, kod və yeni şifrə tələb olunur",
      });
    }

    const user = await User.findOne({ email });

    if (
      !user ||
      !user.resetPasswordCode ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({
        message: "Kodun vaxtı bitib və ya mövcud deyil",
      });
    }

    const isMatch = await bcrypt.compare(
      code,
      user.resetPasswordCode
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Kod yanlışdır",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.json({
      message: "Şifrə uğurla yeniləndi",
    });
  } catch (err) {
    console.error("❌ Reset Password Error");
    console.error(err);

    return res.status(500).json({
      message: err.message,
    });
  }
});

export default router;