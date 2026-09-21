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

    // 🔥 ƏSAS BİZNES ELAN KATEQORİYASI
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
