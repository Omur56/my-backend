import mongoose from "mongoose";

const announcementSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    category: String,
    brand: String,
    model: String,
    ban_type: String,
    year: String,
    price: String,
    location: String,
    images: [String],
    km: String,
    motor: String,
    transmission: String,
    engine: String,
    description: String,
    data: { type: Date, default: Date.now },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    liked: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
