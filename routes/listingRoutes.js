

// import express from "express";
// import Stripe from "stripe";
// import Payment from "../models/Payment.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import Announcement from "../models/Announcement.js";
// import Accessory from "../models/Acsesuar.js";
// import Electronika from "../models/Electronika.js";
// import Clothing from "../models/Clothing.js";
// import HomeAndGarden from "../models/HomeAndGarden.js";
// import Phone from "../models/Phone.js";
// import HouseHold from "../models/Household.js";
// import RealEstate from "../models/RealEstate.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET);

// // Bütün modellər
// const models = [
//   Accessory,
//   Electronika,
//   Clothing,
//   HomeAndGarden,
//   Phone,
//   RealEstate,
//   Announcement,
//   HouseHold,
// ];

// // ======= CREATE CHECKOUT SESSION =======
// router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
//   try {
//     const { listingId } = req.params;
//     const { type } = req.body; // vip, premium

//     // Bütün modellərdə axtarış
//     let listing = null;
//     for (const Model of models) {
//       listing = await Model.findById(listingId);
//       if (listing) break;
//     }

//     if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Qiymət təyin et
//     const price = type === "vip" ? 200 : type === "premium" ? 150 : 100;

//     // Stripe checkout session yarat
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "azn",
//             product_data: { name: `${type.toUpperCase()} Elan` },
//             unit_amount: price * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       metadata: { listingId, type, userId: req.user.id },
//       success_url: "http://localhost:3000/success",
//       cancel_url: "http://localhost:3000/cancel",
//     });

//     // Payment məlumatını bazada saxla
//     await Payment.create({
//       user: req.user.id,
//       listing: listing._id,
//       amount: price,
//       type,
//       stripeSessionId: session.id,
//       paid: false,
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Stripe error" });
//   }
// });

// // ======= STRIPE WEBHOOK =======
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
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const { listingId, type, userId } = session.metadata;

//       // Payment bazada update
//       await Payment.findOneAndUpdate(
//         { stripeSessionId: session.id },
//         { paid: true }
//       );

//       // Listing update: priorityType və priorityExpires
//       let listing = null;
//       for (const Model of models) {
//         listing = await Model.findById(listingId);
//         if (listing) break;
//       }

//       if (listing) {
//         // 🔥 TEST ÜÇÜN 1 dəqiqə sonra expired (productionda 1 gün / 7 gün)
//         let expires = null;
//         if (type === "vip") expires = new Date(Date.now() + 60 * 1000); // 1 dəqiqə
//         else if (type === "premium") expires = new Date(Date.now() + 2 * 60 * 1000); // 2 dəqiqə

//         listing.priorityType = type;
//         listing.priority = type === "vip" ? 1 : 2;
//         listing.priorityExpires = expires;
//         listing.isActive = true;
//         await listing.save();
//       }
//     }

//     res.json({ received: true });
//   }
// );

// // ======= GET LISTINGS (fallback + expired auto-free) =======
// router.get("/", async (req, res) => {
//   try {
//     const now = new Date();
//     let listings = [];

//     // Bütün modelləri topla
//     for (const Model of models) {
//       const data = await Model.find();
//       listings = listings.concat(data);
//     }

//     // Expired elanları free et (API fallback)
//     const fixedListings = listings.map((l) => {
//       if (l.priorityExpires && l.priorityExpires < now) {
//         return {
//           ...l.toObject(),
//           priorityType: "free",
//           priority: 3,
//           priorityExpires: null,
//         };
//       }
//       return l;
//     });

//     // Priority sort: vip > premium > free
//     const priorityOrder = { vip: 1, premium: 2, free: 3 };
//     fixedListings.sort(
//       (a, b) => priorityOrder[a.priorityType] - priorityOrder[b.priorityType]
//     );

//     res.json(fixedListings);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;










// import express from "express";
// import Stripe from "stripe";
// import Payment from "../models/Payment.js";
// import authMiddleware from "../middleware/authMiddleware.js";
// import Announcement from "../models/Announcement.js";
// import Accessory from "../models/Acsesuar.js";
// import Electronika from "../models/Electronika.js";
// import Clothing from "../models/Clothing.js";
// import HomeAndGarden from "../models/HomeAndGarden.js";
// import Phone from "../models/Phone.js";
// import HouseHold from "../models/Household.js";
// import RealEstate from "../models/RealEstate.js";

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET);

// // Bütün modellər
// const models = [
//   Accessory,
//   Electronika,
//   Clothing,
//   HomeAndGarden,
//   Phone,
//   RealEstate,
//   Announcement,
//   HouseHold,
// ];

// // ======= CREATE CHECKOUT SESSION =======
// router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
//   try {
//     const { listingId } = req.params;
//     const { type } = req.body; // vip, premium

//     // Bütün modellərdə axtarış
//     let listing = null;
//     for (const Model of models) {
//       listing = await Model.findById(listingId);
//       if (listing) break;
//     }

//     if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

//     // Qiymət təyin et
//     const price = type === "vip" ? 200 : type === "premium" ? 150 : 100;

//     // Stripe checkout session yarat
//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ["card"],
//       line_items: [
//         {
//           price_data: {
//             currency: "azn",
//             product_data: { name: `${type.toUpperCase()} Elan` },
//             unit_amount: price * 100,
//           },
//           quantity: 1,
//         },
//       ],
//       mode: "payment",
//       metadata: { listingId, type, userId: req.user.id },
//       success_url: "http://localhost:3000/success",
//       cancel_url: "http://localhost:3000/cancel",
//     });

//     // Payment məlumatını bazada saxla
//     await Payment.create({
//       user: req.user.id,
//       listing: listing._id,
//       amount: price,
//       type,
//       stripeSessionId: session.id,
//       paid: false,
//     });

//     res.json({ url: session.url });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Stripe error" });
//   }
// });

// // ======= STRIPE WEBHOOK =======
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
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;
//       const { listingId, type, userId } = session.metadata;

//       // Payment bazada update
//       await Payment.findOneAndUpdate(
//         { stripeSessionId: session.id },
//         { paid: true }
//       );

//       // Listing update: priorityType və priorityExpires
//       let listing = null;
//       for (const Model of models) {
//         listing = await Model.findById(listingId);
//         if (listing) break;
//       }

//       if (listing) {
//         // 🔥 TEST ÜÇÜN 1 dəqiqə sonra expired (productionda 1 gün / 7 gün)
//         let expires = null;
//         if (type === "vip") expires = new Date(Date.now() + 60 * 1000); // 1 dəqiqə
//         else if (type === "premium") expires = new Date(Date.now() + 2 * 60 * 1000); // 2 dəqiqə

//         listing.priorityType = type;
//         listing.priority = type === "vip" ? 1 : 2;
//         listing.priorityExpires = expires;
//         listing.isActive = true;
//         await listing.save();
//       }
//     }

//     res.json({ received: true });
//   }
// );

// // ======= GET LISTINGS (fallback + expired auto-free) =======
// router.get("/", async (req, res) => {
//   try {
//     const now = new Date();
//     let listings = [];

//     // Bütün modelləri topla
//     for (const Model of models) {
//       const data = await Model.find();
//       listings = listings.concat(data);
//     }

//     // Expired elanları free et (API fallback)
//     const fixedListings = listings.map((l) => {
//       if (l.priorityExpires && l.priorityExpires < now) {
//         return {
//           ...l.toObject(),
//           priorityType: "free",
//           priority: 3,
//           priorityExpires: null,
//         };
//       }
//       return l;
//     });

//     // Priority sort: vip > premium > free
//     const priorityOrder = { vip: 1, premium: 2, free: 3 };
//     fixedListings.sort(
//       (a, b) => priorityOrder[a.priorityType] - priorityOrder[b.priorityType]
//     );

//     res.json(fixedListings);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// export default router;



import express from "express";
import Stripe from "stripe";
import moment from "moment-timezone"; // 🔹 import moment-timezone
// import Announcement from "../models/Announcement.js";
import Ad from "../models/Ad.js";
// import Accessory from "../models/Acsesuar.js";
// import Electronika from "../models/Electronika.js";
// import Clothing from "../models/Clothing.js";
// import HomeAndGarden from "../models/HomeAndGarden.js";
// import Phone from "../models/Phone.js";
// import HouseHold from "../models/Household.js";
// import RealEstate from "../models/RealEstate.js";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);

// const models = [Accessory, Electronika, Clothing, HomeAndGarden, Phone, RealEstate, Announcement, HouseHold];

const models = Ad;

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
        if (listing) break;
      }

      if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

      // 🔹 VIP/Premium müddətini Bakı vaxtına görə set et
      let expires = null;
      if (type === "vip") expires = moment.tz("Asia/Baku").add(7, "days").toDate();
      else if (type === "premium") expires = moment.tz("Asia/Baku").add(3, "days").toDate();

      listing.priorityType = type; // "vip" / "premium"
      listing.priority = type === "vip" ? 1 : 2;
      listing.priorityExpires = expires;
      listing.isActive = true;

      await listing.save();

      console.log(`Elan ${listingId} yeniləndi: ${type}, expires: ${expires}`);
    }

    res.json({ received: true });
  }
);

export default router;