import Listing from "../models/Listing.js";

export const checkExpiredListings = async () => {
  const now = new Date();
  const expired = await Listing.updateMany(
    { priorityExpires: { $lt: now }, type: { $ne: "free" } },
    { type: "free", isActive: true, priorityExpires: null }
  );
  console.log("Expired listings updated:", expired.modifiedCount);
};

// Server.js-də 1 saatlıq interval
setInterval(checkExpiredListings, 60 * 60 * 1000);