import express from "express";
import stripePackage from "stripe";
import Payment from "../models/Payment.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Listing from "../models/Listing.js";

const router = express.Router();
const stripe = stripePackage(process.env.STRIPE_SECRET);

// Stripe checkout session yaratmaq
router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
  try {
    const { type } = req.body; // "vip" / "premium"
    const listing = await Listing.findById(req.params.listingId);

    if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

    // Ödəniş məbləği qəpiklə (unit_amount Stripe üçün qəpikdir)
    let amount = 50000; // free 500 AZN → 50000 qəpik
    if (type === "vip") amount = 150000; // 1500 AZN
    if (type === "premium") amount = 300000; // 3000 AZN

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "azn",
            product_data: { name: `${type.toUpperCase()} Elan` },
            unit_amount: amount
          },
          quantity: 1
        }
      ],
      mode: "payment",
      success_url: `${process.env.FRONTEND_BASE}/success`,
      cancel_url: `${process.env.FRONTEND_BASE}/cancel`
    });

    // Ödəniş məlumatını MongoDB-də saxla
    await Payment.create({
      user: req.user.id,
      listing: listing._id,
      amount,
      type,
      stripeSessionId: session.id
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout xətası:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;