import mongoose from "mongoose";

const StickyAdSchema = new mongoose.Schema({
  image: String,
  link: String,
  position: {
    type: String,
    enum: ["left", "right"],
  },
  active: {
    type: Boolean,
    default: true,
  }
});

export default mongoose.model("StickyAd", StickyAdSchema);