
// import dotenv from "dotenv";

// dotenv.config();

// const uri = "mongodb+srv://Omur9696:elanlar123@cluster0.pyjgrvq.mongodb.net/elanlar?retryWrites=true&w=majority&appName=Cluster0";

// const connectDB = async () => {
//   try {
     
//     console.log("✅ MongoDB bağlantısı uğurludur");
//   } catch (err) {
//     console.error("❌ MongoDB bağlantı xətası:", err);
//   }
// };

// export default connectDB;


// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const uri =
//   process.env.MONGO_URI ||
//   "mongodb+srv://Omur9696:elanlar123@cluster0.pyjgrvq.mongodb.net/elanlar?retryWrites=true&w=majority&appName=Cluster0";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("✅ MongoDB bağlantısı uğurludur");
//   } catch (err) {
//     console.error("❌ MongoDB bağlantı xətası:", err);
//     process.exit(1); // serveri dayandır
//   }
// };

// export default connectDB;


// import mongoose from "mongoose";
// import dotenv from "dotenv";

// dotenv.config();

// const uri =
//   process.env.MONGO_URI ||
//   "mongodb+srv://Omur9696:elanlar123@cluster0.pyjgrvq.mongodb.net/elanlar?retryWrites=true&w=majority&appName=Cluster0";

// const connectDB = async () => {
//   try {
//     await mongoose.connect(uri); // artıq useNewUrlParser və useUnifiedTopology lazım deyil
//     console.log("✅ MongoDB bağlantısı uğurludur");
//   } catch (err) {
//     console.error("❌ MongoDB bağlantı xətası:", err);
//     process.exit(1); // serveri dayandır
//   }
// };

// export default connectDB;


import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;

const connectDB = async () => {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB bağlantısı uğurludur");
  } catch (err) {
    console.error("❌ MongoDB bağlantı xətası:", err);
    process.exit(1); // serveri dayandır
  }
};

export default connectDB;

