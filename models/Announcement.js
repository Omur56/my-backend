// // import mongoose from "mongoose";
// // import { v4 as uuidv4 } from "uuid";
// // const announcementSchema = new mongoose.Schema(
// //   {
// //     id: { type: Number, required: true, default: uuidv4 },

// //     category: String,
// //     brand: String,
// //     model: String,
// //     ban_type: String,
// //     year: String,
// //     type: {
// //   type: String,
// //   enum: ["sifarisle", "magaza", "resmi"],
// //   default: ""
// // },
// //     price: String,
// //     color: String,
// //     location: String,
// //     images: [String],
// //     mainImage: String,
// //     images1: [String],
// //     km: String,
// //     motor: String,
// //     transmission: String,
// //     salon: String,
// //     sifarisle : String,
// //     resmi: String,
// //     magaza: String,
// //     default: String,
// //     barter: String,
// //     kredit: String,
// //     engine: String,
// //     description: String,
// //     data: { type: Date, default: Date.now },
// //     userId: {
// //       type: mongoose.Schema.Types.ObjectId,
// //       ref: "User",
// //       required: true,
// //     },
// //     contact: {
// //       name: String,
// //       email: String,
// //       phone: String,
// //     },
// //     liked: { type: Boolean, default: false },
// //     favorite: { type: Boolean, default: false },
// //   },
// //   { timestamps: true }
// // );

// // const Announcement = mongoose.model("Announcement", announcementSchema);
// // export default Announcement;



import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const announcementSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, default: uuidv4 },
    category: String,
    brand: String,
    model: String,
    ban_type: String,
    isActive: { type: Boolean, default: true },
    vipExpireAt: Date,

    year: String,
   priorityType: {
  type: String,
  enum: ["free", "vip", "premium"],
  default: "free",
},
priority: {
  type: Number,
  enum: [0, 1, 2], // 0 = free, 1 = vip, 2 = premium
  default: 3,
},
    type: {
      type: String,
      enum: ["sifarisle", "magaza", "resmi"],
      default: "",
    },
    priority: { type: Number, default: 3 },

    vipExpireAt: {
  type: Date,
  default: null
},
    price: String,
    color: String,
    location: String,
    images: [String],
    mainImage: String,
    km: String,
    motor: String,
    modfikasiya: String,
    barter: String,
    kredit: String,
    engine: String,
    transmission: String,
    salon: String,
    description: String,
    data: { type: Date, default: Date.now },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    liked: { type: Boolean, default: false },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const Announcement = mongoose.model("Announcement", announcementSchema);
export default Announcement;
