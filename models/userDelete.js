const mongoose = require("mongoose");

const userDeletedSchema = new mongoose.Schema({
  title: String,
  description: String,
  images: [String],
  price: Number,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // elan kimə aiddir
});

const Ad = mongoose.model("UserDeleted", adSchema);
module.exports = Ad;
