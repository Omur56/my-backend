// testCreateVIP15s.js
import mongoose from "mongoose";
import Listing from "./models/Listing.js"; // real modelin yolu

// MongoDB-ə qoşul
mongoose.connect(
  "mongodb+srv://Omur9696:elanlar123@cluster0.pyjgrvq.mongodb.net/elanlar?retryWrites=true&w=majority&appName=Cluster0",
)
.then(() => console.log("MongoDB connected ✅"))
.catch(err => console.error("MongoDB connection error:", err));

const createVIPListing = async () => {
  try {
    const listing = await Listing.create({
      title: "VIP 15 saniyəlik elan",
      price: 100,
      priorityType: "vip",
      priorityExpires: new Date(Date.now() + 15000), // 15 saniyə sonra bitəcək
      isActive: true,
      user: "64f1e1b7c2b0b12345678901", // real user ObjectId
      category: "car"
    });

    console.log("VIP listing created ✅", listing._id);
  } catch (err) {
    console.error("Error creating listing:", err);
  } finally {
    mongoose.disconnect();
  }
};

createVIPListing();