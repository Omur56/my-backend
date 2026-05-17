import mongoose from "mongoose";
// import { v4 as uuidv4 } from "uuid";
import { nanoid } from "nanoid";

const adSchema = new mongoose.Schema(
  {
    // id: {
    //   type: String,
    //   required: true,
    //   default: () => uuidv4(),
    // },

    id: {
  type: String,
  default: () => nanoid(10),
  unique: true,
},

mainImage: String,

liked: {
  type: Boolean,
  default: false,
},

favorite: {
  type: Boolean,
  default: false,
},
    title: String,
    description: String,
    price: Number,
    location: String,
    city: String,
    images: [String],
    // data: { type: Date, default: Date.now },
   
    isActive: { type: Boolean, default: true },

    priorityType: {
      type: String,
      enum: ["free", "vip", "premium"],
      default: "free",
    },

    priorityExpires: {
      type: Date,
      default: null,
    },

    contact: {
      name: String,
      email: String,
      phone: String,
    },


    
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      enum: [
        "car",
        "Phone",
        "electronics",
        "clothing", // 🔥 düzəldildi
        "realEstate",
        "homeGarden",
        "household",
        "accessory",
        "listing",
      ],
    },

    brand: String,
    model: String,

    car: {
  ban_type: String,
  year: String,
  engine: String,
  motor: String,
  transmission: String,
  km: String,
  color: String,
  modification: String,
  barter: String,
  credit: String,
  salon: String,
  type_magasine: {
  type: String,
  enum: ["sifarisle", "magaza", "resmi"],
  default: undefined,
  required: false,
},


},


    phone: {
      storage: String,
      color: String,
      ram: String,
      sim_card: String,
    },

    realEstate: {
      rooms: String,
      area: String,
      city: String,
      type_building: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Ad", adSchema);


// -----------------------------


