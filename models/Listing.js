import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },

    images: [{ type: String }],

    type: {
      type: String,
      enum: ["free", "premium", "vip"],
      default: "free"
    },

    priority: { type: Number, default: 0 }, // 👈 YENİ (SIRALAMA ÜÇÜN)

    expiresAt: Date,

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

listingSchema.index({ expiresAt: 1 });

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;