// import mongoose from "mongoose";
// // import { v4 as uuidv4 } from "uuid";
// import { nanoid } from "nanoid";

// const adSchema = new mongoose.Schema(
//   {
//     // id: {
//     //   type: String,
//     //   required: true,
//     //   default: () => uuidv4(),
//     // },

//     id: {
//   type: String,
//   default: () => nanoid(10),
//   unique: true,
// },

// mainImage: String,

// liked: {
//   type: Boolean,
//   default: false,
// },

// favorite: {
//   type: Boolean,
//   default: false,
// },
//     title: String,
//     description: String,
//     price: Number,
//     location: String,
//     city: String,
//     images: [String],
//     brand: String,
//     model: String,
       
       
       
//     // data: { type: Date, default: Date.now },
   
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
//         "clothing", // 🔥 düzəldildi
//         "realEstate",
//         "homeGarden",
//         "household",
//         "accessory",
//         "listing",
//       ],
//     },

    

//     car: {

// brand: String,
// model: String,

// ban_type: String,
// year: String,
// engine: String,
// motor: String,
// transmission: String,
// km: String,
// color: String,
// modification: String,
// barter: String,
// credit: String,
// salon: String,

// type_magasine: {
//   type: String,
//   enum: ["sifarisle", "magaza", "resmi"],
//   default: undefined,
// },
// },


//    phoneDeatail: {
//       storage: String,
//       color: String,
//       ram: String,
//       sim_card: String,
//     },

//     realEstate: {
//       rooms: String,
//       area: String,
//       city: String,
//       type_building: String,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Ad", adSchema);


// // -----------------------------


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
        type: String,
        default: "",
      },

      barter: {
        type: String,
        default: "",
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