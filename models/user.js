// import mongoose from "mongoose";

// const userSchema = new mongoose.Schema(
//   {
//     username: { type: String, required: true, unique: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     resetPasswordCode: { type: String }, // bcrypt hash saxlanacaq
//     resetPasswordExpires: { type: Date },
//     phone: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const User = mongoose.model("User", userSchema);

// export default User;




import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { 
      type: String, 
      required: true, 
      unique: true 
    },

    email: { 
      type: String, 
      required: true, 
      unique: true 
    },

    password: { 
      type: String, 
      required: true 
    },

    phone: { 
      type: String, 
      required: true 
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    balance: {
      type: Number,
      default: 0
    },

    isPremiumUser: {
      type: Boolean,
      default: false
    },

    resetPasswordCode: { 
      type: String 
    },

    resetPasswordExpires: { 
      type: Date 
    }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;