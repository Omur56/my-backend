// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//   listing: { type: mongoose.Schema.Types.ObjectId, ref: "Listing" },
//   amount: Number,
//   type: String, // free / vip / premium
//   status: { type: String, default: "pending" },
//   stripeSessionId: String
// }, { timestamps: true });

// export default mongoose.model("Payment", paymentSchema);


// import mongoose from "mongoose";

// const paymentSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   listing: { type: mongoose.Schema.Types.ObjectId, ref: "Announcement", required: true },
//   amount: Number,
//   type: String,
//   paid: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now }
// });

// export default mongoose.model("Payment", paymentSchema);



import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    listing: { type: mongoose.Schema.Types.ObjectId, ref: "Announcement", required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["free", "vip", "premium"], default: "free" },
    stripeSessionId: { type: String, required: true },
    paid: { type: Boolean, default: false } // ✅ Ödəniş tamamlandımı
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;