import mongoose from "mongoose";

const AdViewSchema = new mongoose.Schema(
  {
    ad: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ad",
      required: true,
      index: true,
    },

    viewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

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

// Qeydiyyatlı istifadəçi eyni elana 1 dəfə
AdViewSchema.index(
  { ad: 1, viewer: 1 },
  {
    unique: true,
    partialFilterExpression: {
      viewer: { $type: "objectId" },
    },
  },
);

// Qonaq istifadəçi eyni elana 1 dəfə
AdViewSchema.index(
  { ad: 1, visitorId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      visitorId: { $type: "string" },
    },
  },
);

const AdView = mongoose.model("AdView", AdViewSchema);

export default AdView;
