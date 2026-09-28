
import mongoose from "mongoose";

const businessProfileSchema = new mongoose.Schema(
  {
    // Biznes sahibinin istifadəçisi
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Biznes adı
    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    // VÖEN
    voen: {
      type: String,
      required: true,
      trim: true,
    },

    // Fəaliyyət sahəsi
    businessType: {
      type: String,
      enum: ["magaza", "avtosalon", "sirket", "xidmet", "digər"],
      default: "magaza",
    },

    // ƏSAS BİZNES ELAN KATEQORİYASI
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

    // Biznes haqqında
    description: {
      type: String,
      default: "",
    },

    // Telefon
    phone: {
      type: String,
      default: "",
    },

    // E-mail
    email: {
      type: String,
      default: "",
    },

    // Ünvan
    address: {
      type: String,
      default: "",
    },

    // Şəhər
    city: {
      type: String,
      default: "",
    },

    // Logo
    logo: {
      type: String,
      default: "",
    },

    // Cover
    coverImage: {
      type: String,
      default: "",
    },
    coverImages: {
      type: [String],
      default: [],
    },

    // İş saatları
    workingHours: {
      monday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "19:00" },
        closed: { type: Boolean, default: false },
      },

      tuesday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "19:00" },
        closed: { type: Boolean, default: false },
      },

      wednesday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "19:00" },
        closed: { type: Boolean, default: false },
      },

      thursday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "19:00" },
        closed: { type: Boolean, default: false },
      },

      friday: {
        open: { type: String, default: "09:00" },
        close: { type: String, default: "19:00" },
        closed: { type: Boolean, default: false },
      },

      saturday: {
        open: { type: String, default: "10:00" },
        close: { type: String, default: "17:00" },
        closed: { type: Boolean, default: false },
      },

      sunday: {
        open: { type: String, default: "10:00" },
        close: { type: String, default: "17:00" },
        closed: { type: Boolean, default: true },
      },
    },

    // Public URL
    slug: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // Təsdiqlənmiş biznes
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const BusinessProfile = mongoose.model(
  "BusinessProfile",
  businessProfileSchema,
);

export default BusinessProfile;

