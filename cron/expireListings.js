import cron from "node-cron";
import Listing from "../models/Listing.js";

// Hər gün saat 00:00-da çalışacaq
cron.schedule("0 0 * * *", async () => {
  try {
    const now = new Date();

    // Bitmiş elanları deaktiv et
    const result = await Listing.updateMany(
      { expiresAt: { $lt: now }, isActive: true },
      { isActive: false }
    );

    console.log(`Cron işlədi: ${result.modifiedCount} elan deaktiv edildi.`);
  } catch (err) {
    console.error("Cron job xətası:", err);
  }
});