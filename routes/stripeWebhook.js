// import express from "express";
// import Stripe from "stripe";
// import moment from "moment-timezone";
// import Ad from "../models/Ad.js";

// console.log("🔥 STRIPE WEBHOOK ROUTE LOADED");

// const router = express.Router();
// const stripe = new Stripe(process.env.STRIPE_SECRET);

// router.post(
//   "/webhook",
//   express.raw({ type: "application/json" }),
//   async (req, res) => {
//     console.log("🔥 STRIPE WEBHOOK ROUTE LOADED");
//     const sig = req.headers["stripe-signature"];
//     let event;

//     try {
//       event = stripe.webhooks.constructEvent(
//         req.body,
//         sig,
//         process.env.STRIPE_WEBHOOK_SECRET
//       );
//     } catch (err) {
//       console.log("❌ Webhook signature error:", err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }

//     console.log("🔥 WEBHOOK HIT:", event.type);

//     if (event.type === "checkout.session.completed") {
//       const session = event.data.object;

//       console.log("SESSION:", session);

//       const listingId = session.metadata?.listingId;
//       const type = session.metadata?.type;

//       if (!listingId || !type) {
//         console.log("❌ metadata yoxdur");
//         return res.json({ received: true });
//       }

//       const listing = await Ad.findById(listingId);

//       if (!listing) {
//         console.log("❌ elan tapılmadı");
//         return res.json({ received: true });
//       }

//       let expires = null;

//       if (type === "vip") {
//         expires = moment().add(3, "days").toDate();
//       } else if (type === "premium") {
//         expires = moment().add(7, "days").toDate();
//       }

//       listing.priorityType = type;
//       listing.priorityExpires = expires;
//       listing.isActive = true;

//       await listing.save();

//       console.log("✅ UPDATED:", listingId, type);
//     }

//     res.json({ received: true });
//   }
// );

// export default router;

// ----kapital bank ödəniş webhooku üçün əlavə route----

import express from "express";
import moment from "moment-timezone";
import Ad from "../models/Ad.js";

console.log("🔥 KAPITAL BANK PAYMENT ROUTE LOADED");

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Kapital Bank API
|--------------------------------------------------------------------------
*/

const KAPITAL_API_URL =
  process.env.KAPITAL_API_URL || "https://txpgtst.kapitalbank.az/api";

const KAPITAL_USERNAME = process.env.KAPITAL_USERNAME;
const KAPITAL_PASSWORD = process.env.KAPITAL_PASSWORD;

const KAPITAL_CALLBACK_URL =
  process.env.KAPITAL_CALLBACK_URL ||
  "https://proelan.az/api/payment/kapital/callback";

/*
|--------------------------------------------------------------------------
| Basic Auth
|--------------------------------------------------------------------------
*/

const getKapitalAuth = () => {
  if (!KAPITAL_USERNAME || !KAPITAL_PASSWORD) {
    throw new Error(
      "KAPITAL_USERNAME və KAPITAL_PASSWORD .env faylında yoxdur",
    );
  }

  return (
    "Basic " +
    Buffer.from(`${KAPITAL_USERNAME}:${KAPITAL_PASSWORD}`).toString("base64")
  );
};

/*
|--------------------------------------------------------------------------
| Kapital API request helper
|--------------------------------------------------------------------------
*/

const kapitalRequest = async (url, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: getKapitalAuth(),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await response.text();

  let data;

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    console.log("❌ Kapital API error:", {
      status: response.status,
      data,
    });

    const error = new Error(
      data?.message || data?.error || `Kapital API error: ${response.status}`,
    );

    error.status = response.status;
    error.data = data;

    throw error;
  }

  return data;
};

/*
|--------------------------------------------------------------------------
| CREATE KAPITAL ORDER
|--------------------------------------------------------------------------
|
| Frontend:
|
| POST /api/payment/kapital/create
|
| body:
|
| {
|   "listingId": "...",
|   "type": "vip"
| }
|
| və ya
|
| {
|   "listingId": "...",
|   "type": "premium"
| }
|
|--------------------------------------------------------------------------
*/

router.post("/create", async (req, res) => {
  try {
    const { listingId, type } = req.body;

    console.log("🔥 KAPITAL CREATE REQUEST:", {
      listingId,
      type,
    });

    /*
    |--------------------------------------------------------------------------
    | Validation
    |--------------------------------------------------------------------------
    */

    if (!listingId) {
      return res.status(400).json({
        success: false,
        message: "listingId göndərilməyib",
      });
    }

    if (!["vip", "premium"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Yanlış ödəniş tipi",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Find listing
    |--------------------------------------------------------------------------
    */

    const listing = await Ad.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Elan tapılmadı",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | Price
    |--------------------------------------------------------------------------
    |
    | BURADAKI QİYMƏTLƏRİ öz VIP/Premium qiymətlərinlə dəyiş.
    |
    */

    const amount = type === "vip" ? 5 : 10;

    /*
    |--------------------------------------------------------------------------
    | Create Kapital Order
    |--------------------------------------------------------------------------
    */

    const orderResponse = await kapitalRequest(`${KAPITAL_API_URL}/order`, {
      method: "POST",

      body: JSON.stringify({
        order: {
          typeRid: "Order_SMS",

          amount: amount.toFixed(2),

          currency: "AZN",

          language: "az",

          title: type === "vip" ? "ProElan VIP elan" : "ProElan Premium elan",

          description:
            type === "vip"
              ? `Elan #${listing._id} üçün VIP ödəniş`
              : `Elan #${listing._id} üçün Premium ödəniş`,

          initiationEnvKind: "Browser",

          hppRedirectUrl: KAPITAL_CALLBACK_URL,
        },
      }),
    });

    const order = orderResponse?.order;

    if (!order?.id || !order?.hppUrl || !order?.password) {
      console.log("❌ Kapital order response düzgün deyil:", orderResponse);

      return res.status(500).json({
        success: false,
        message: "Kapital Bank order yarada bilmədi",
      });
    }

    /*
    |--------------------------------------------------------------------------
    | HPP URL
    |--------------------------------------------------------------------------
    |
    | Kapital sənədlərində bəzən hppUrl artıq /flex ilə gəlir.
    | Buna görə /flex-i ikinci dəfə əlavə etmirik.
    |
    */

    const paymentUrl = new URL(order.hppUrl);

    paymentUrl.searchParams.set("id", order.id);
    paymentUrl.searchParams.set("password", order.password);

    console.log("✅ KAPITAL ORDER CREATED:", {
      orderId: order.id,
      type,
      amount,
    });

    /*
    |--------------------------------------------------------------------------
    | Return frontend
    |--------------------------------------------------------------------------
    */

    return res.json({
      success: true,

      orderId: order.id,

      amount,

      type,

      paymentUrl: paymentUrl.toString(),
    });
  } catch (error) {
    console.error("❌ KAPITAL CREATE ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Kapital Bank ödənişi yaradılarkən xəta baş verdi",
    });
  }
});

/*
|--------------------------------------------------------------------------
| KAPITAL BANK CALLBACK
|--------------------------------------------------------------------------
|
| Kapital Bank ödənişdən sonra istifadəçini bu route-a qaytarır.
|
| Məsələn:
|
| /api/payment/kapital/callback?ID=4595&STATUS=FullyPaid
|
| VACİB:
|
| STATUS-a kor-koranə güvənmirik.
|
| Əvvəlcə Kapital Bank-dan:
|
| GET /order/{ID}
|
| edib real statusu yoxlayırıq.
|
|--------------------------------------------------------------------------
*/

router.get("/callback", async (req, res) => {
  try {
    const orderId = req.query.ID;

    const callbackStatus = req.query.STATUS;

    console.log("🔥 KAPITAL CALLBACK:", {
      orderId,
      callbackStatus,
    });

    if (!orderId) {
      console.log("❌ Kapital callback-də ID yoxdur");

      return res.status(400).send("Ödəniş ID-si tapılmadı.");
    }

    /*
    |--------------------------------------------------------------------------
    | Get Order Details
    |--------------------------------------------------------------------------
    */

    const orderResponse = await kapitalRequest(
      `${KAPITAL_API_URL}/order/${encodeURIComponent(
        orderId,
      )}?tranDetailLevel=2`,
      {
        method: "GET",
      },
    );

    const order = orderResponse?.order;

    if (!order) {
      console.log("❌ Kapital order tapılmadı:", orderId);

      return res.status(404).send("Kapital Bank order tapılmadı.");
    }

    console.log("🔥 KAPITAL ORDER STATUS:", order.status);

    /*
    |--------------------------------------------------------------------------
    | Payment verification
    |--------------------------------------------------------------------------
    */

    if (order.status !== "FullyPaid") {
      console.log("⚠️ Ödəniş tam ödənilməyib:", order.status);

      /*
      | Burada frontend nəticə səhifəsinə yönləndirə bilərik.
      */

      const frontendUrl = process.env.FRONTEND_URL || "https://proelan.az";

      return res.redirect(
        `${frontendUrl}/payment-result?status=failed&orderId=${encodeURIComponent(
          orderId,
        )}`,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Amount
    |--------------------------------------------------------------------------
    |
    | Burada real Kapital order məbləği artıq təsdiqlənir.
    |
    */

    const paidAmount = Number(order.amount);

    console.log("💰 KAPITAL PAID:", paidAmount, order.currency);

    /*
    |--------------------------------------------------------------------------
    | Burada Payment modelinə keçəndə
    | kapitalOrderId ilə Payment tapılacaq.
    |
    | Hazırkı faylda isə Stripe webhook-da olduğu kimi
    | listingId/type məlumatı order-dan gəlmədiyinə görə
    | əvvəlcə order ID-ni sistemimizdə saxlamalıyıq.
    |--------------------------------------------------------------------------
    */

    /*
    |--------------------------------------------------------------------------
    | Əgər hələ Payment modelinə Kapital order ID əlavə
    | etməmisənsə, burada birbaşa listing tapmaq mümkün deyil.
    |--------------------------------------------------------------------------
    */

    console.log("✅ Kapital Bank ödənişi təsdiqləndi:", orderId);

    /*
    |--------------------------------------------------------------------------
    | Növbəti mərhələ:
    |
    | Payment.findOne({ kapitalOrderId: String(orderId) })
    |
    | sonra:
    |
    | listing = await Ad.findById(payment.listing)
    |
    |--------------------------------------------------------------------------
    */

    const frontendUrl = process.env.FRONTEND_URL || "https://proelan.az";

    return res.redirect(
      `${frontendUrl}/payment-result?status=success&orderId=${encodeURIComponent(
        orderId,
      )}`,
    );
  } catch (error) {
    console.error("❌ KAPITAL CALLBACK ERROR:", error);

    const frontendUrl = process.env.FRONTEND_URL || "https://proelan.az";

    return res.redirect(`${frontendUrl}/payment-result?status=error`);
  }
});

/*
|--------------------------------------------------------------------------
| CHECK KAPITAL ORDER STATUS
|--------------------------------------------------------------------------
|
| Frontend lazım gəldikdə:
|
| GET /api/payment/kapital/status/:orderId
|
|--------------------------------------------------------------------------
*/

router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId yoxdur",
      });
    }

    const orderResponse = await kapitalRequest(
      `${KAPITAL_API_URL}/order/${encodeURIComponent(
        orderId,
      )}?tranDetailLevel=2`,
      {
        method: "GET",
      },
    );

    const order = orderResponse?.order;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order tapılmadı",
      });
    }

    return res.json({
      success: true,

      orderId: order.id,

      status: order.status,

      amount: order.amount,

      currency: order.currency,
    });
  } catch (error) {
    console.error("❌ KAPITAL STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Ödəniş statusu yoxlanılarkən xəta baş verdi",
    });
  }
});

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

export default router;