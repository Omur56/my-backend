import mongoose from "mongoose";
import { nanoid } from "nanoid";

const { Schema } = mongoose;

// ===========================
// SUB SCHEMAS
// ===========================

const carSchema = new Schema(
  {
    brand: String,
    model: String,
    generation: String,
    year: String,
    motor: String,
    engine: String,
    transmission: String,
    fuel: String,
    ban_type: String,
    color: String,
    km: String,
    modification: String,
    description: String,

    credit: {
      type: Boolean,
      default: false,
    },

    barter: {
      type: Boolean,
      default: false,
    },

    salon: String,

    type_magasine: {
      type: String,
      enum: ["magaza", "sifarisle", "resmi"],
    },
  },
  {
    _id: false,
    minimize: true,
  },
);

const phoneSchema = new Schema(
  {
    title: String,
    brand: String,
    model: String,
    storage: String,
    ram: String,
    color: String,
    sim_card: String,
    description: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

const electronicsSchema = new Schema(
  {
    title: String,
    brand: String,
    model: String,
    type: String,
    description: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

const realEstateSchema = new Schema(
  {
    title: String,
    city: String,
    type_building: String,
    rooms: String,
    area: String,
    floor: String,
    number_of_floors: String,
    number_of_rooms: String,
    field: String,
    description: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

const clothingSchema = new Schema(
  {
    title: String,
    brand: String,
    model: String,
    type: String,
    color: String,
    size: String,
    condition: String,
    description: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

const homeGardenSchema = new Schema(
  {
    title: String,
    brand: String,
    model: String,
    type: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

const householdSchema = new Schema(
  {
    title: String,
    brand: String,
    model: String,
    type: String,
    category: String,
    type_of_household: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

const accessorySchema = new Schema(
  {
    title: String,
    brand: String,
    model: String,
    type: String,
  },
  {
    _id: false,
    minimize: true,
  },
);

// ===========================
// MAIN SCHEMA
// ===========================

const adSchema = new Schema(
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

    // ===========================
    // VIP / PREMIUM
    // ===========================

    priorityType: {
      type: String,
      enum: ["free", "vip", "premium"],
      default: "free",
    },

    priority: {
      type: Number,
      default: 3,
    },

    priorityExpires: {
      type: Date,
      default: null,
    },

    // ===========================
    // VIEWS
    // ===========================

    viewCount: {
      type: Number,
      default: 0,
    },

    // ===========================
    // CONTACT
    // ===========================

    contact: {
      name: {
        type: String,
        default: "",
      },

      email: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },
    },

    // ===========================
    // USER
    // ===========================

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ===========================
    // BUSINESS
    // ===========================

    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BusinessProfile",
      default: null,
    },

    // ===========================
    // CATEGORY
    // ===========================

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
    // CATEGORY DETAILS
    // ===========================

    car: {
      type: carSchema,
      default: undefined,
    },

    phone: {
      type: phoneSchema,
      default: undefined,
    },

    electronics: {
      type: electronicsSchema,
      default: undefined,
    },

    realEstate: {
      type: realEstateSchema,
      default: undefined,
    },

    clothing: {
      type: clothingSchema,
      default: undefined,
    },

    homeGarden: {
      type: homeGardenSchema,
      default: undefined,
    },

    household: {
      type: householdSchema,
      default: undefined,
    },

    accessory: {
      type: accessorySchema,
      default: undefined,
    },
  },

  {
    // ===========================
    // AUTOMATIC DATES
    // ===========================

    timestamps: true,

    minimize: true,
  },
);

// ===========================
// MODEL
// ===========================

const Ad = mongoose.model("Ad", adSchema);

export default Ad;
