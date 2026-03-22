

// import mongoose from "mongoose";

// const listingSchema = new mongoose.Schema(
//   {
//     title: String,
//     description: String,
//     price: Number,
//     images: [String],
//     location: String,

//     category: {
//       type: String,
//       enum: [
//         "car",
//         "phone",
//         "electronics",
//         "accessory",
//         "clothing",
//         "realestate",
//         "homegarden",
//         "household"
//       ],
//     },

//     priorityType: {
//       type: String,
//       default: "free",
//     },

//     priority: {
//       type: Number,
//       default: 3,
//     },

//     isActive: {
//       type: Boolean,
//       default: false,
//     },

//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Listing", listingSchema);

import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    images: {
      type: [String],
      default: [],
    },
    location: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "car",
        "phone",
        "electronics",
        "accessory",
        "clothing",
        "realestate",
        "homegarden",
        "household"
      ],
      required: true,
    },
    priorityType: {
      type: String,
      default: "free", // vip, premium və ya free
    },
    priority: {
      type: Number,
      default: 3,
    },
    priorityExpires: {
      type: Date,
      default: null, // VIP/Premium elan üçün vaxt
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Listing", listingSchema);