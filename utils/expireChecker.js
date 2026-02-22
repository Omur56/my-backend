import cron from "node-cron";
import Listing from "../models/Listing.js";

cron.schedule("0 0 * * *", async () => {
  const now = new Date();

  await Listing.updateMany(
    { expiresAt: { $lt: now } },
    { isActive: false }
  );

  console.log("Expired listings disabled");
});