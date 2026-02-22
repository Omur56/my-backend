import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
  amount: Number,
  type: String, // free / vip / premium
  status: { type: String, default: "pending" },
  stripeSessionId: String
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);