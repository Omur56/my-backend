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

  // car obyekti yoxdursa yarat
  if (!ad.car) {
    ad.car = {};
    changed = true;
  }

  // Root brand -> car.brand
  if (!ad.car.brand) {
    ad.car.brand = ad.get("brand") || "";
    changed = true;
  }

  // Root model -> car.model
  if (
    !ad.car.model ||
    (typeof ad.car.model === "string" &&
      ad.car.model.startsWith("function"))
  ) {
    ad.car.model = ad.get("model") || "";
    changed = true;
  }

  // type_magasine boşdursa sil
  if (
    ad.car.type_magasine === "" ||
    ad.car.type_magasine === null ||
    ad.car.type_magasine === undefined
  ) {
    delete ad.car.type_magasine;
    changed = true;
  }

  if (changed) {
    await ad.save({ validateModifiedOnly: true });

    updated++;

    console.log(`✔ ${ad._id} yeniləndi`);
  }
}

console.log(`\nBitdi. ${updated} elan yeniləndi.`);

await mongoose.disconnect();

process.exit();