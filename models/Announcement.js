// import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";

// const announcementSchema = new mongoose.Schema(
//   {
//     id: { type: String, required: true, default: uuidv4 },

//     category: String,
//     brand: String,
//     model: String,
//     ban_type: String,
//     isActive: { type: Boolean, default: true },

//     priorityType: {
//       type: String,
//       enum: ["free", "vip", "premium"],
//       default: "free",
//     },

//     priorityExpires: {
//       type: Date,
//       default: null,
//     },

//     type: {
//       type: String,
//       enum: ["sifarisle", "magaza", "resmi"],
//       default: "",
//     },

//     price: {
//       type: Number,
//       default: 0,
//     },

//     color: String,
//     location: String,
//     images: [String],
//     mainImage: String,

//     km: {
//       type: Number,
//       default: 0,
//     },

//     motor: String,
//     modfikasiya: String,
//     barter: String,
//     kredit: String,
//     engine: String,
//     transmission: String,
//     salon: String,

//     description: String,

//     data: { type: Date, default: Date.now },

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     contact: {
//       name: String,
//       email: String,
//       phone: String,
//     },

//     liked: { type: Boolean, default: false },
//     favorite: { type: Boolean, default: false },
//   },
//   { timestamps: true },
// );

// const Announcement = mongoose.model("Announcement", announcementSchema);
// export default Announcement;