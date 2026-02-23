// import express from "express";
// import stripePackage from "stripe";
// import Payment from "../models/Payment.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import Announcement from "../models/Announcement.js";

// const router = express.Router();
// const stripe = stripePackage(process.env.STRIPE_SECRET);

// router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
//   try {
//     const { type } = req.body;

//     // 🔥 Announcement istifadə et
//     const listing = await Announcement.findById(req.params.listingId);

//     if (!listing) {
//       return res.status(404).json({ message: "Elan tapılmadı" });
//     }

//     let amount = 50000;
//     if (type === "vip") amount = 150; 
//     if (type === "premium") amount = 300;

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "azn",
//             product_data: { name: `${type.toUpperCase()} Elan` },
//             unit_amount: amount,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       success_url: "http://localhost:3000/success",
//       cancel_url: "http://localhost:3000/cancel",
//     });

//     await Payment.create({
//       user: req.user.id,          // ✅ düzəldi
//       listing: listing._id,
//       amount,
//       type,
//       stripeSessionId: session.id // ✅ düzəldi
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error("Stripe checkout xətası:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;

import express from "express";
import stripePackage from "stripe";
import Payment from "../models/Payment.js";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = stripePackage(process.env.STRIPE_SECRET);

// Ödəniş yaratmaq
router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body;
    const listing = await Announcement.findById(req.params.listingId);
    if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

    let amount = 50000; // free
    if (type === "vip") amount = 150000;
    if (type === "premium") amount = 300000;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "azn",
            product_data: { name: `${type.toUpperCase()} Elan` },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    await Payment.create({
      user: req.user.id,
      listing: listing._id,
      amount,
      type,
      stripeSessionId: session.id,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout xətası:", err);
    res.status(500).json({ message: err.message });
  }
});

// Webhook (Stripe ödənişi tamamlandıqda çağırılır)
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const payment = await Payment.findOne({ stripeSessionId: session.id });
      if (payment) {
        payment.paid = true;
        await payment.save();

        const listing = await Announcement.findById(payment.listing);
        if (listing) {
          listing.type = payment.type; // VIP / Premium
          await listing.save();
        }
      }
    } catch (err) {
      console.error("Payment update error:", err.message);
    }
  }

  res.json({ received: true });
});

export default router;