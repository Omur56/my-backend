
import express from "express";
import Stripe from "stripe";
import Announcement from "../models/Announcement.js";
import Accessory from "../models/Acsesuar.js";
import Electronika from "../models/Electronika.js";
import Clothing from "../models/Clothing.js";
import HomeAndGarden from "../models/HomeAndGarden.js";
import Phone from "../models/Phone.js";
import HouseHold from "../models/Household.js";
import RealEstate from "../models/RealEstate.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

const models = [Accessory, Electronika, Clothing, HomeAndGarden, Phone, RealEstate, Announcement, HouseHold];

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
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

      // bütün modellərdə axtarış
      let listing = null;
      for (const Model of models) {
        listing = await Model.findById(listingId);
        if (listing) break; // tapıldısa dayandır
      }

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
