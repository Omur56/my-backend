import mongoose from "mongoose";

const AdvertisementSchema = new mongoose.Schema(
  {
    title: String,
    image: String,
    link: String,
    position: {
      type: String,
      enum: ["left", "right"],
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Advertisement", AdvertisementSchema);
