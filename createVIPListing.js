import mongoose from "mongoose";
import Listing from "./models/Listing.js";

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error(err));

const createVIPListing = async () => {
  await Listing.create({
    title: "VIP 15 saniyəlik elan",
    price: 100,
    priorityType: "vip",
    priorityExpires: new Date(Date.now() + 15000), // 15 saniyə sonra bitəcək
    isActive: true,
    user: "64f1e1b7c2b0b12345678901", // real user ObjectId
    category: "car"
  });
  console.log("VIP listing created ✅");
};

createVIPListing();