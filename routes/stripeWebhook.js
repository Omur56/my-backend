// import express from "express";
// import Announcement from "../models/Announcement.js";
// import Stripe from "stripe";
// import dotenv from "dotenv";

// dotenv.config();

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET, { apiVersion: "2022-11-15" });

// // Stripe Webhook
// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.log("Webhook signature error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const { listingId, type } = session.metadata;

//       const listing = await Announcement.findById(listingId);
//       if (!listing) {
//         console.log(`Listing ${listingId} tapılmadı`);
//         return res.status(404).json({ message: "Elan tapılmadı" });
//       }

//       listing.priorityType = type; // vip / premium
//       listing.priority = type === "vip" ? 1 : 2;
//       listing.isActive = true;
//       await listing.save();

//       console.log(`Elan ${listingId} yeniləndi: ${type}`);
//     }

//     res.json({ received: true });
//   }
// );
// export default router;

import express from "express";
import Announcement from "../models/Announcement.js";
import Stripe from "stripe";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

// **express.json() əvəzinə express.raw({type: "application/json"}) istifadə et**
router.post(
  "/webhook",
  express.raw({ type: "application/json" }), 
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,                 // RAW body
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log("Webhook signature error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { listingId, type } = session.metadata;

      const listing = await Announcement.findById(listingId);
      if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

      listing.priorityType = type; // "vip" / "premium"
      listing.priority = type === "vip" ? 1 : 2;
      listing.isActive = true;
      await listing.save();

      console.log(`Elan ${listingId} yeniləndi: ${type}`);
    }

    res.json({ received: true });
  }
);

export default router;