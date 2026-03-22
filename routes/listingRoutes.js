import express from "express";
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import authMiddleware from "../middleware/authMiddleware.js";
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

const models = [
  Accessory,
  Electronika,
  Clothing,
  HomeAndGarden,
  Phone,
  RealEstate,
  Announcement,
  HouseHold,
];

router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
  try {
    const { listingId } = req.params;
    const { type } = req.body; // vip, premium

    // Bütün modellərdə axtarış
    let listing = null;
    for (const Model of models) {
      listing = await Model.findById(listingId);
      if (listing) break;
    }

    if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

    // Qiymət təyin et
    const price = type === "vip" ? 200 : type === "premium" ? 150 : 100;

    // Stripe checkout session yarat
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "azn",
            product_data: { name: `${type.toUpperCase()} Elan` },
            unit_amount: price * 100,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      metadata: { listingId, type, userId: req.user.id },
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    // Payment məlumatını bazada saxla
    await Payment.create({
      user: req.user.id,
      listing: listing._id,
      amount: price,
      type,
      stripeSessionId: session.id,
      paid: false,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Stripe error" });
  }
});

// ✅ Webhook ilə ödəniş tamamlananda elan update
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { listingId, type, userId } = session.metadata;

    // Payment bazada update
    await Payment.findOneAndUpdate(
      { stripeSessionId: session.id },
      { paid: true }
    );

    // Listing update: priorityType və priorityExpires
    let listing = null;
    for (const Model of models) {
      listing = await Model.findById(listingId);
      if (listing) break;
    }
    if (listing) {
      let expires = null;
      if (type === "vip") expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 gün
      else if (type === "premium") expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 gün

      listing.priorityType = type;
      listing.priorityExpires = expires;
      listing.isActive = true;
      await listing.save();
    }
  }

  res.json({ received: true });
});

export default router;