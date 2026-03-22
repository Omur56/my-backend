// utils/checkExpiredListings.js
import Listing from "../models/Listing.js";

export const checkExpiredListings = async () => {
  try {
    const now = new Date();

    const expiredListings = await Listing.find({
      priorityExpires: { $ne: null, $lt: now },   // vaxtı keçmiş
      priorityType: { $in: ["vip", "premium"] }  // yalnız VIP/Premium
    });

    if (expiredListings.length === 0) {
      console.log("No expired listings found ✅");
      return;
    }

    console.log(`FOUND EXPIRED: ${expiredListings.length}`);
    expiredListings.forEach(l => {
      console.log(`- Expired: ${l.title} (${l._id}) | type: ${l.priorityType}`);
    });

    const expired = await Listing.updateMany(
      { _id: { $in: expiredListings.map(l => l._id) } },
      { $set: { priorityType: "free", isActive: true, priorityExpires: null } }
    );

    console.log(`Expired listings updated: ${expired.modifiedCount} ✅`);
  } catch (err) {
    console.error("Error updating expired listings:", err);
  }
};