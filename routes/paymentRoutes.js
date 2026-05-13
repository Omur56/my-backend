



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

// Bütün modellər
// const models = [
//   Accessory,
//   Electronika,
//   Clothing,
//   HomeAndGarden,
//   Phone,
//   RealEstate,
//   Announcement,
//   HouseHold,
//   Listing, // əsas model
// ];

// const models =  Ad;


// ======= CREATE CHECKOUT SESSION =======
// router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
//   try {
//     const { listingId } = req.params;
//     const { type } = req.body; // vip, premium

//     // bütün modellərdə axtarış
//     let listing = null;
//     for (const Model of models) {
//       listing = await Model.findById(listingId);
//       if (listing) break;
//     }
//     if (!listing) return res.status(404).json({ message: "Elan tapılmadı" });

//     // qiymət
//     const price = type === "vip" ? 200 : type === "premium" ? 150 : 100;

//     // Stripe sessiyası
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

//     // Payment bazaya
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













// routes/listings.js
import express from "express";
import Stripe from "stripe";
import Payment from "../models/Payment.js";
import authMiddleware from "../middleware/authMiddleware.js";
// import Announcement from "../models/Announcement.js";
import Ad from "../models/Ad.js";
import Accessory from "../models/Acsesuar.js";
import Electronika from "../models/Electronika.js";
import Clothing from "../models/Clothing.js";
import HomeAndGarden from "../models/HomeAndGarden.js";
import Phone from "../models/Phone.js";
import HouseHold from "../models/Household.js";
import RealEstate from "../models/RealEstate.js";
import Listing from "../models/Listing.js";
import moment from "moment-timezone";

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET);




// =====================
// CREATE CHECKOUT
// =====================
router.post(
  "/create-checkout/:listingId",
  authMiddleware,
  async (req, res) => {
    try {
      console.log("USER:", req.user);

      const { listingId } = req.params;
      const { type } = req.body;

      if (!req.user?.id) {
        return res.status(401).json({ message: "User not found" });
      }

      const listing = await Ad.findById(listingId);
if (listing.userId.toString() !== req.user.id) {
  return res.status(403).json({ message: "Bu elana access yoxdur" });
}
      if (!listing) {
        return res.status(404).json({ message: "Elan tapılmadı" });
      }

      const price =
  type === "premium" ? 7 :
  type === "vip" ? 3 :
  100;

const AZN_TO_USD = 0.59;
const priceUSD = Math.round(price * AZN_TO_USD);

const session = await stripe.checkout.sessions.create({
  payment_method_types: ["card"],
  line_items: [
    {
      price_data: {
        currency: "usd", // Stripe limitation
        product_data: {
          name: `${type.toUpperCase()} Elan`,
        },
        unit_amount: priceUSD * 100,
      },
      quantity: 1,
    },
  ],
  mode: "payment",
  metadata: {
    listingId,
    type,
    userId: req.user.id,
  },
  success_url: "https://axtartapaz-frontend.onrender.com/success",
  cancel_url: "https://axtartapaz-frontend.onrender.com//cancel",
});
      await Payment.create({
        user: req.user.id, // 🔥 FIXED (ƏN VACİB)
        listing: listing._id,
        amount: price,
        type,
        stripeSessionId: session.id,
        paid: false,
      });

      res.json({ url: session.url });

    } catch (err) {
      console.error("STRIPE ERROR:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// =====================
// STRIPE WEBHOOK
// =====================
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
      console.log("Webhook error:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const { listingId, type } = session.metadata;

      await Payment.findOneAndUpdate(
        { stripeSessionId: session.id },
        { paid: true }
      );

      const listing = await Ad.findById(listingId);
      // 🔥 EXTRA SECURITY CHECK
if (listing.userId.toString() !== session.metadata.userId) {
  console.log("Unauthorized webhook attempt");
  return res.json({ received: true });
}

      if (!listing) {
        return res.json({ received: true });
      }

      let expires = null;

      if (type === "premium") {
        expires = moment().add(7, "days").toDate();
      } else if (type === "vip") {
        expires = moment().add(3, "days").toDate();
      }

      listing.priorityType = type;

      listing.priority =
        type === "premium" ? 1 :
        type === "vip" ? 2 :
        3;

      listing.priorityExpires = expires;
      listing.isActive = true;

      await listing.save();
    }

    res.json({ received: true });
  }
);


// =====================
// GET LISTINGS
// =====================
router.get("/", async (req, res) => {
  try {
    const now = new Date();

    let listings = await Ad.find();

    const fixed = listings.map((item) => {
      const expired =
        item.priorityExpires && item.priorityExpires < now;

      return {
        ...item.toObject(),
        priorityType: expired ? "free" : item.priorityType,
        priority: expired ? 3 : item.priority,
      };
    });

    fixed.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(fixed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;