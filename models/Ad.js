

import mongoose from "mongoose";
import { nanoid } from "nanoid";

const adSchema = new mongoose.Schema(
  {
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

    title: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    price: {
      type: Number,
      default: 0,
    },

    location: String,

    city: String,

    images: [String],

    isActive: {
      type: Boolean,
      default: true,
    },

    priorityType: {
      type: String,
      enum: ["free", "vip", "premium"],
      default: "free",
    },

    priority: {
  type: Number,
  default: 3, // free
},

    priorityExpires: Date,

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
        "phone",
        "electronics",
        "clothing",
        "realEstate",
        "homeGarden",
        "household",
        "accessory",
        "listing",
      ],
      required: true,
    },

    // ===========================
    // CAR
    // ===========================

    car: {

      brand: {
        type: String,
        default: "",
      },

      model: {
        type: String,
        default: "",
      },
generation: {
  type: String,
  default: "",
},
      year: {
        type: String,
        default: "",
      },

      motor: {
        type: String,
        default: "",
      },

      engine: {
        type: String,
        default: "",
      },

      transmission: {
        type: String,
        default: "",
      },

      fuel: {
        type: String,
        default: "",
      },

      ban_type: {
        type: String,
        default: "",
      },

      color: {
        type: String,
        default: "",
      },

      km: {
        type: String,
        default: "",
      },

      modification: {
        type: String,
        default: "",
      },

      credit: {
        type: Boolean,
        default: false,
      },

      barter: {
        type: Boolean,
        default: false,
      },

      salon: {
        type: String,
        default: "",
      },

      // type_magasine: {
      //   type: String,
      //   enum: ["magaza", "sifarisle", "resmi"],
      //   default: "",
      // },

      type_magasine: {
  type: String,
  enum: ["magaza", "sifarisle", "resmi"],
  default: undefined,
},
    },

    // ===========================
    // PHONE
    // ===========================

    phoneDetail: {

      brand: String,

      model: String,

      storage: String,

      ram: String,

      color: String,

      sim_card: String,

    },

    // ===========================
    // ELECTRONICS
    // ===========================

    electronics: {

      brand: String,

      model: String,

      type: String,

    },

    // ===========================
    // REAL ESTATE
    // ===========================

    realEstate: {

      city: String,

      type_building: String,

      rooms: String,

      area: String,

      floor: String,

    },

  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Ad", adSchema);