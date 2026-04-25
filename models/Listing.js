
// import mongoose from "mongoose";

// const listingSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//       default: "",
//     },
//     price: {
//       type: Number,
//       required: true,
//       default: 0,
//     },
//     images: {
//       type: [String],
//       default: [],
//     },
//     location: {
//       type: String,
//       default: "",
//     },
//     category: {
//       type: String,
//       enum: [
//         "Announcement",
//         "phone",
//         "electronics",
//         "accessory",
//         "clothing",
//         "realestate",
//         "homegarden",
//         "household"
//       ],
//       required: true,
//     },
//     priorityType: {
//       type: String,
//       default: "free", // vip, premium və ya free
//     },
//     priority: {
//       type: Number,
//       default: 3,
//     },
//     priorityExpires: {
//       type: Date,
//       default: null, // VIP/Premium elan üçün vaxt
//     },
//     isActive: {
//       type: Boolean,
//       default: false,
//     },
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Listing", listingSchema);




import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, default: 0 },
    images: { type: [String], default: [] },
    location: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        // "announcement",
        "Ad",
        // "phone",
        // "electronics",
        // "accessory",
        // "clothing",
        // "realestate",
        // "homeGarden",
        // "household",
      ],
      required: true,
    },
    priorityType: {
      type: String,
      enum: ["free", "vip", "premium"],
      default: "free",
    },
    priority: {
      type: Number,
      enum: [1, 2, 3], // 1 = vip, 2 = premium, 3 = free
      default: 3,
    },
    priorityExpires: {
      type: Date,
      default: null,
    },
    isActive: { type: Boolean, default: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);