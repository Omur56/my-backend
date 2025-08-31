// // backend/routes/otp.js
// import express from "express";
// import twilio from "twilio";

// const router = express.Router();

// // Twilio hesab məlumatları
// const accountSid = "YOUR_TWILIO_SID";
// const authToken = "YOUR_TWILIO_AUTH_TOKEN";
// const serviceSid = "YOUR_TWILIO_SERVICE_SID"; // Messaging Service SID
// const client = twilio(accountSid, authToken);

// // OTP göndərmək
// router.post("/send-otp", async (req, res) => {
//   try {
//     const { phone } = req.body;
//     if (!phone) return res.status(400).json({ message: "Telefon nömrəsi tələb olunur" });

//     await client.verify.services(serviceSid)
//       .verifications
//       .create({ to: phone, channel: "sms" });

//     res.json({ message: "OTP göndərildi" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "OTP göndərilə bilmədi" });
//   }
// });

// // OTP təsdiqləmək
// router.post("/verify-otp", async (req, res) => {
//   try {
//     const { phone, otp } = req.body;
//     if (!phone || !otp) return res.status(400).json({ message: "Telefon və OTP tələb olunur" });

//     const verificationCheck = await client.verify.services(serviceSid)
//       .verificationChecks
//       .create({ to: phone, code: otp });

//     if (verificationCheck.status === "approved") {
//       res.json({ message: "Telefon təsdiqləndi" });
//     } else {
//       res.status(400).json({ message: "OTP düzgün deyil" });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "OTP təsdiqləmə xətası" });
//   }
// });

// export default router;
