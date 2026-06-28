import mongoose from "mongoose";
import dotenv from "dotenv";
import Ad from "./models/Ad.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

console.log("MongoDB qoşuldu...");

const ads = await Ad.find({ category: "car" });

let updated = 0;

for (const ad of ads) {
  let changed = false;

  if (!ad.car) {
    ad.car = {};
    changed = true;
  }

  // brand
  if (ad.brand && !ad.car.brand) {
    ad.car.brand = ad.brand;
    changed = true;
  }

  // model
  if (ad.model && !ad.car.model) {
    ad.car.model = ad.model;
    changed = true;
  }

  if (changed) {
    await ad.save();
    updated++;
    console.log(`✔ ${ad._id} yeniləndi`);
  }
}

console.log(`\nBitdi. ${updated} elan yeniləndi.`);

await mongoose.disconnect();
process.exit();