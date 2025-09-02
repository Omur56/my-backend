// import mongoose from "mongoose";

// const AdSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   link: { type: String, required: true },
//   images: { type: [String], required: true }, // string olmalıdır
//   createdAt: { type: Date, default: Date.now },
// });

// export default mongoose.model("Ad", AdSchema);


import mongoose from "mongoose";

const AdSchema = new mongoose.Schema({
  title: { type: String, required: true },
  link: { type: String }, // burada xəta gəlir
  images: { type: [String], required: true },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model("Ad", AdSchema);