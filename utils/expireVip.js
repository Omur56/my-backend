import Announcement from "../models/Announcement.js";

export const expireVip = async () => {

  const now = new Date();

  const expired = await Announcement.updateMany(
    { vipExpireAt: { $lte: now } },
    {
      priorityType: "free",
      priority: 3,
      vipExpireAt: null
    }
  );

  console.log("Expired VIP:", expired.modifiedCount);

};
