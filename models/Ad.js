

// import mongoose from "mongoose";
// import { nanoid } from "nanoid";

// const adSchema = new mongoose.Schema(
//   {
//     id: {
//       type: String,
//       default: () => nanoid(10),
//       unique: true,
//     },

//     mainImage: String,

//     liked: {
//       type: Boolean,
//       default: false,
//     },

//     favorite: {
//       type: Boolean,
//       default: false,
//     },

//     title: {
//       type: String,
//       default: "",
//     },

//     description: {
//       type: String,
//       default: "",
//     },

//     price: {
//       type: Number,
//       default: 0,
//     },

//     location: String,

//     city: String,

//     images: [String],

//     isActive: {
//       type: Boolean,
//       default: true,
//     },

//     priorityType: {
//       type: String,
//       enum: ["free", "vip", "premium"],
//       default: "free",
//     },

//     priority: {
//   type: Number,
//   default: 3, // free
// },

//     priorityExpires: Date,

//     contact: {
//       name: String,
//       email: String,
//       phone: String,
//     },

//     userId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     category: {
//       type: String,
//       enum: [
//         "car",
//         "phone",
//         "electronics",
//         "clothing",
//         "realEstate",
//         "homeGarden",
//         "household",
//         "accessory",
//         "listing",
//       ],
//       required: true,
//     },

//     // ===========================
//     // CAR
//     // ===========================

//     car: {

//       brand: {
//         type: String,
//         default: "",
//       },

//       model: {
//         type: String,
//         default: "",
//       },
// generation: {
//   type: String,
//   default: "",
// },
//       year: {
//         type: String,
//         default: "",
//       },

//       motor: {
//         type: String,
//         default: "",
//       },

//       engine: {
//         type: String,
//         default: "",
//       },

//       transmission: {
//         type: String,
//         default: "",
//       },

//       fuel: {
//         type: String,
//         default: "",
//       },

//       ban_type: {
//         type: String,
//         default: "",
//       },

//       color: {
//         type: String,
//         default: "",
//       },

//       km: {
//         type: String,
//         default: "",
//       },

//       modification: {
//         type: String,
//         default: "",
//       },

//       credit: {
//         type: Boolean,
//         default: false,
//       },

//       barter: {
//         type: Boolean,
//         default: false,
//       },

//       salon: {
//         type: String,
//         default: "",
//       },

      
//       type_magasine: {
//   type: String,
//   enum: ["magaza", "sifarisle", "resmi"],
//   default: undefined,
// },
//     },

//     // ===========================
//     // PHONE
//     // ===========================

//     phone: {
//       title: String,

//       brand: String,

//       model: String,

//       storage: String,

//       ram: String,

//       color: String,

//       sim_card: String,

//     },

//     // ===========================
//     // ELECTRONICS
//     // ===========================

//     electronics: {

//       brand: String,

//       model: String,

//       type: String,
//       title: String,


//     },

//     // ===========================
//     // REAL ESTATE
//     // ===========================

//     realEstate: {

//       city: String,

//       type_building: String,

//       rooms: String,

//       area: String,

//       floor: String,
//       title: String,

//     },
    
// clothing: {
//       brand: String,
//       model: String,
//       type: String,
//       title: String,
//       color: String,
//       size: String,

//     },

//     homeGarden: {
//       brand: String,
//       model: String,
//       type: String,
//       title: String,
//     },

//     household: {
//       brand: String,
//       model: String,
//       type: String,
//       title: String,
//     },
//     accessory: {
//       brand: String,
//       model: String,
//       type: String,
//       title: String,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// export default mongoose.model("Ad", adSchema);



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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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
  }
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

    priorityType: {
      type: String,
      enum: ["free", "vip", "premium"],
      default: "free",
    },

    priority: {
      type: Number,
      default: 3,
    },

    priorityExpires: Date,

    contact: {
      name: String,
      email: String,
      phone: String,
    },

    userId: {
      type: Schema.Types.ObjectId,
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
    timestamps: true,
    minimize: true,
  }
);




export default mongoose.model("Ad", adSchema);