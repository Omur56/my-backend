import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    // MongoDB-də sənədlərdə hal-hazırda "userId" var
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    price: {
      type: Number,
      required: true
    },

    images: [
      {
        type: String
      }
    ],

    type: {
      type: String,
      enum: ["free", "premium", "vip"],
      default: "free"
    },

    expiresAt: {
      type: Date
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Müddət bitən elanlar üçün sürətli axtarış
listingSchema.index({ expiresAt: 1 });

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;