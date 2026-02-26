import express from "express";
import stripePackage from "stripe";
import Payment from "../models/Payment.js";
import Announcement from "../models/Announcement.js";

const router = express.Router();
const stripe = stripePackage(process.env.STRIPE_SECRET);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
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
            listing.priorityType = payment.type; // VIP / Premium
            listing.priority = payment.type === "vip" ? 2 : 1;
            await listing.save();
          }
        }
      } catch (err) {
        console.error("Payment update error:", err.message);
      }
    }

    res.json({ received: true });
  }
);

export default router;