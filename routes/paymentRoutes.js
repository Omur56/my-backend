import express from "express";
import stripePackage from "stripe";
import Payment from "../models/Payment.js";
import Announcement from "../models/Announcement.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();
const stripe = stripePackage(process.env.STRIPE_SECRET);

// Ödəniş yaratmaq
// router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
//   try {
//     const { type } = req.body; // vip / premium
//     const listing = await Announcement.findById(req.params.listingId);
//     if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

//     let amount = 50000; // free default
//     if (type === "vip") amount = 15000; // 150 AZN (stripe üçün qəpiklə)
//     if (type === "premium") amount = 30000; // 300 AZN

//     // const session = await stripe.checkout.sessions.create({
//     //   payment_method_types: ["card"],
//     //   line_items: [
//     //     {
//     //       price_data: {
//     //         currency: "azn",
//     //         product_data: { name: `${type.toUpperCase()} Elan` },
//     //         unit_amount: amount,
//     //       },
//     //       quantity: 1,
//     //     },
//     //   ],
//     //   mode: "payment",
//     //   success_url: `http://localhost:3000/success?payment=success`,
//     //   cancel_url: `http://localhost:3000/cancel?payment=cancel`,
//     // });

//     const session = await stripe.checkout.sessions.create({
//   payment_method_types: ["card"],
//   mode: "payment",
//   line_items: [...],
//   metadata: {
//     listingId: listing._id.toString(),
//     type: type,
//   },
//   success_url: `http://localhost:3000/success`,
//   cancel_url: `http://localhost:3000/cancel`,
// });

//     // Payment məlumatını DB-də saxla
//     await Payment.create({
//       user: req.user.id,
//       listing: listing._id,
//       amount,
//       type,
//       stripeSessionId: session.id,
//       paid: false,
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error("Stripe checkout xətası:", err);
//     res.status(500).json({ message: err.message });
//   }
// });



router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body;
    const listing = await Announcement.findById(req.params.listingId);

    if (!listing) {
      return res.status(404).json({ message: "Elan tapılmadı" });
    }

    const amount = type === "vip" ? 15000 : 30000;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",

      line_items: [
        {
          price_data: {
            currency: "azn",
            product_data: {
              name: type === "vip" ? "VIP Elan" : "Premium Elan",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],

      metadata: {
        listingId: listing._id.toString(),
        type: type,
      },

      success_url: `http://localhost:3000/success?payment=success`,
      cancel_url: `http://localhost:3000/cancel?payment=cancel`,
    });

    res.json({ url: session.url });

  } catch (error) {
    console.error("Checkout error:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;