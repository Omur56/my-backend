import moment from "moment-timezone";
import Announcement from "./models/Announcement.js";
import Acsesuar from "./models/Acsesuar.js";
import Clothing from "./models/Clothing.js";
import Electronika from "./models/Electronika.js";
import HomeAndGarden from "./models/HomeAndGarden.js";
import Phone from "./models/Phone.js";
import RealEstate from "./models/RealEstate.js";
import HouseHold from "./models/Household.js";

const MODELS = [Announcement, Clothing, Electronika, HomeAndGarden, Phone, RealEstate, HouseHold, Acsesuar];

const checkExpiredListings = async () => {
  try {
    const now = moment.tz("Asia/Baku").toDate(); // Bakı vaxtı
    console.log("CRON NOW:", now);

    for (const Model of MODELS) {
      const expiredListings = await Model.find({
        priorityExpires: { $ne: null, $lte: now },
        priorityType: { $in: ["vip", "premium"] },
      });

      console.log(`${Model.modelName} FOUND EXPIRED:`, expiredListings.length);

      if (expiredListings.length > 0) {
        const updated = await Model.updateMany(
          { _id: { $in: expiredListings.map(l => l._id) } },
          { $set: { priorityType: "free", priority: 3, priorityExpires: null } }
        );
        console.log(`${Model.modelName} Expired listings updated:`, updated.modifiedCount);
      }
    }
  } catch (err) {
    console.error("CRON ERROR:", err);
  }
};

// hər 5 saniyədə bir yoxla
setInterval(checkExpiredListings, 5000);