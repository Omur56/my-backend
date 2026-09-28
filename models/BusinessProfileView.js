import mongoose from "mongoose";

const businessProfileViewSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
      required: true,
      index: true,
    },

    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Giriş etməmiş istifadəçilər üçün unikal sessiya/visitor ID
    visitorId: {
      type: String,
      default: null,
      index: true,
    },

    lastViewedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

// Eyni login olmuş istifadəçi eyni biznes üçün yalnız 1 dəfə sayılır
businessProfileViewSchema.index(
  { business: 1, viewer: 1 },
  {
    unique: true,
    partialFilterExpression: {
      viewer: { $type: "objectId" },
    },
  },
);

const BusinessProfileView = mongoose.model(
  "BusinessProfileView",
  businessProfileViewSchema,
);

export default BusinessProfileView;
