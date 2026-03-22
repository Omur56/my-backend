// import Listing from "../models/Listing.js";

// export const checkExpiredListings = async () => {
//   const now = new Date();
//   const expired = await Listing.updateMany(
//     { priorityExpires: { $lt: now }, type: { $ne: "free" } },
//     { type: "free", isActive: true, priorityExpires: null }
//   );
//   console.log("Expired listings updated:", expired.modifiedCount);
// };

// // Server.js-də 1 saatlıq interval
// // setInterval(checkExpiredListings, 60 * 60 * 1000);

// setInterval(checkExpiredListings, 20 * 1000); // 10 saniyə
import Listing from "../models/Listing.js";

export const checkExpiredListings = async () => {
  try {
    const now = new Date();
    console.log("NOW:", now);

    // expired elanları tap
    const expiredListings = await Listing.find({
      priorityExpires: { $ne: null, $lt: now },
      priorityType: { $ne: "free" }
    });

    console.log("FOUND EXPIRED:", expiredListings.length);
    console.log(expiredListings);

    // Tapılanları free et
    const expired = await Listing.updateMany(
      {
        _id: { $in: expiredListings.map(l => l._id) }
      },
      {
        $set: {
          priorityType: "free",
          isActive: true,
          priorityExpires: null
        }
      }
    );

    console.log("UPDATED:", expired.modifiedCount);

  } catch (err) {
    console.error("Error updating expired listings:", err);
  }
};

// TEST üçün 20 saniyə interval
setInterval(checkExpiredListings, 20 * 1000);