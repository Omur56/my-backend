// routes/paymentRoutes.js

import express from "express";
import Payment from "../models/Payment.js";
import authMiddleware from "../middleware/authMiddleware.js";
import Ad from "../models/Ad.js";
import moment from "moment-timezone";

const router = express.Router();

/* =========================================================
   KAPITAL BANK CONFIG
========================================================= */

const KAPITAL_API_URL =
  process.env.KAPITAL_API_URL || "https://txpgtst.kapitalbank.az/api";

const KAPITAL_USERNAME = process.env.KAPITAL_USERNAME;
const KAPITAL_PASSWORD = process.env.KAPITAL_PASSWORD;

const KAPITAL_CALLBACK_URL =
  process.env.KAPITAL_CALLBACK_URL ||
  "https://my-backend-wj5g.onrender.com/api/payments/kapital/callback";

const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://axtartapaz-frontend.onrender.com";

/* =========================================================
   KAPITAL BASIC AUTH
========================================================= */

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

/* =========================================================
   KAPITAL API REQUEST
========================================================= */

const kapitalRequest = async (url, options = {}) => {
  console.log("🌐 KAPITAL API REQUEST:", {
    method: options.method || "GET",
    url,
  });

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

  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = {
      raw: text,
    };
  }

  console.log("🌐 KAPITAL API RESPONSE:", {
    status: response.status,
    data,
  });

  if (!response.ok) {
    console.error("❌ KAPITAL API ERROR:", {
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

/* =========================================================
   ACTIVATE VIP / PREMIUM
========================================================= */

const activatePayment = async (payment, order) => {
  if (!payment) {
    throw new Error("Payment tapılmadı");
  }

  if (!order) {
    throw new Error("Kapital order tapılmadı");
  }

  console.log("🔎 ACTIVATE PAYMENT CHECK:", {
    paymentId: payment._id,
    orderId: order.id,
    orderStatus: order.status,
    paymentType: payment.type,
    paymentAmount: payment.amount,
    kapitalAmount: order.amount,
    currency: order.currency,
  });

  /* ---------------------------------------------------------
     YALNIZ FULLYPAID
  --------------------------------------------------------- */

  if (order.status !== "FullyPaid") {
    console.log("⚠️ Ödəniş hələ FullyPaid deyil:", order.status);

    payment.kapitalStatus = order.status || "Unknown";

    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "not_fully_paid",
      status: order.status,
    };
  }

  /* ---------------------------------------------------------
     ƏGƏR ARTIQ ÖDƏNİLİB
  --------------------------------------------------------- */

  if (payment.paid === true) {
    console.log("ℹ️ Payment artıq təsdiqlənib:", payment._id);

    const listing = await Ad.findById(payment.listing);

    return {
      success: true,
      paid: true,
      alreadyPaid: true,
      type: payment.type,
      listingId: payment.listing,
      priority: listing?.priority || null,
      priorityType: listing?.priorityType || payment.type,
      priorityExpires: listing?.priorityExpires || null,
    };
  }

  /* ---------------------------------------------------------
     AMOUNT CHECK
  --------------------------------------------------------- */

  const expectedAmount = Number(payment.amount);
  const kapitalAmount = Number(order.amount);

  if (
    !Number.isFinite(kapitalAmount) ||
    Math.abs(kapitalAmount - expectedAmount) > 0.001
  ) {
    console.error("❌ AMOUNT MISMATCH:", {
      paymentId: payment._id,
      orderId: order.id,
      expectedAmount,
      kapitalAmount,
    });

    payment.kapitalStatus = "AmountMismatch";

    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "amount_mismatch",
    };
  }

  /* ---------------------------------------------------------
     CURRENCY CHECK
  --------------------------------------------------------- */

  if (order.currency !== "AZN") {
    console.error("❌ CURRENCY MISMATCH:", order.currency);

    payment.kapitalStatus = "CurrencyMismatch";

    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "currency_mismatch",
    };
  }

  /* ---------------------------------------------------------
     FIND LISTING
  --------------------------------------------------------- */

  const listing = await Ad.findById(payment.listing);

  if (!listing) {
    console.error("❌ Ödənişə aid elan tapılmadı:", payment.listing);

    payment.kapitalStatus = "ListingNotFound";

    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "listing_not_found",
    };
  }

  /* ---------------------------------------------------------
     USER / LISTING SECURITY
  --------------------------------------------------------- */

  if (
    !listing.userId ||
    listing.userId.toString() !== payment.user.toString()
  ) {
    console.error("❌ USER/LISTING MISMATCH:", {
      paymentUser: payment.user,
      listingUser: listing.userId,
      listingId: listing._id,
    });

    payment.kapitalStatus = "SecurityError";

    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "security_error",
    };
  }

  /* ---------------------------------------------------------
     EXPIRATION
  --------------------------------------------------------- */

  const now = moment().tz("Asia/Baku");

  let expires = null;

  if (payment.type === "premium") {
    expires = now.clone().add(7, "days").toDate();
  }

  if (payment.type === "vip") {
    expires = now.clone().add(3, "days").toDate();
  }

  /* ---------------------------------------------------------
     PRIORITY

     Premium = 1
     VIP     = 2
     Free    = 3
  --------------------------------------------------------- */

  if (payment.type === "premium") {
    listing.priorityType = "premium";
    listing.priority = 1;
  } else if (payment.type === "vip") {
    listing.priorityType = "vip";
    listing.priority = 2;
  } else {
    listing.priorityType = "free";
    listing.priority = 3;
  }

  listing.priorityExpires = expires;
  listing.isActive = true;

  await listing.save();

  /* ---------------------------------------------------------
     MARK PAYMENT PAID
  --------------------------------------------------------- */

  payment.paid = true;
  payment.paidAt = new Date();
  payment.kapitalStatus = "FullyPaid";

  await payment.save();

  /* ---------------------------------------------------------
     SUCCESS LOG
  --------------------------------------------------------- */

  console.log("==========================================");
  console.log("✅ VIP / PREMIUM AKTİVLƏŞDİRİLDİ");
  console.log("==========================================");

  console.log({
    paymentId: payment._id,
    orderId: order.id,
    listingId: listing._id,
    type: payment.type,
    priorityType: listing.priorityType,
    priority: listing.priority,
    priorityExpires: listing.priorityExpires,
    amount: payment.amount,
  });

  console.log("==========================================");

  return {
    success: true,
    paid: true,
    type: payment.type,
    listingId: listing._id,
    priority: listing.priority,
    priorityType: listing.priorityType,
    priorityExpires: listing.priorityExpires,
  };
};

/* =========================================================
   CREATE KAPITAL PAYMENT

   POST
   /api/payments/create-checkout/:listingId

   Body:
   {
      "type": "vip"
   }

   və ya

   {
      "type": "premium"
   }
========================================================= */

router.post("/create-checkout/:listingId", authMiddleware, async (req, res) => {
  try {
    console.log("==========================================");
    console.log("🔥 KAPITAL PAYMENT CREATE");
    console.log("==========================================");

    const { listingId } = req.params;
    const { type } = req.body;

    /* -----------------------------------------------------
         USER CHECK
      ----------------------------------------------------- */

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    /* -----------------------------------------------------
         TYPE CHECK
      ----------------------------------------------------- */

    if (!["vip", "premium"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Yanlış ödəniş tipi",
      });
    }

    /* -----------------------------------------------------
         FIND LISTING
      ----------------------------------------------------- */

    const listing = await Ad.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Elan tapılmadı",
      });
    }

    /* -----------------------------------------------------
         LISTING OWNER CHECK
      ----------------------------------------------------- */

    if (
      !listing.userId ||
      listing.userId.toString() !== req.user.id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Bu elana access yoxdur",
      });
    }

    /* -----------------------------------------------------
         PRICE

         VIP     = 3 AZN
         Premium = 7 AZN
      ----------------------------------------------------- */

    const price = type === "premium" ? 7 : type === "vip" ? 3 : 0;

    if (price <= 0) {
      return res.status(400).json({
        success: false,
        message: "Ödəniş məbləği düzgün deyil",
      });
    }

    /* -----------------------------------------------------
         CREATE KAPITAL ORDER
      ----------------------------------------------------- */

    console.log("🔥 KAPITAL ORDER YARADILIR:", {
      listingId,
      type,
      price,
    });

    const kapitalResponse = await kapitalRequest(`${KAPITAL_API_URL}/order`, {
      method: "POST",

      body: JSON.stringify({
        order: {
          typeRid: "Order_SMS",

          amount: price.toFixed(2),

          currency: "AZN",

          language: "az",

          title:
            type === "premium" ? "ProElan Premium elan" : "ProElan VIP elan",

          description:
            type === "premium"
              ? `Elan ${listing._id} üçün Premium xidmət`
              : `Elan ${listing._id} üçün VIP xidmət`,

          initiationEnvKind: "Browser",

          hppRedirectUrl: KAPITAL_CALLBACK_URL,
        },
      }),
    });

    /* -----------------------------------------------------
         KAPITAL ORDER RESPONSE
      ----------------------------------------------------- */

    const order = kapitalResponse?.order;

    if (!order || !order.id || !order.hppUrl || !order.password) {
      console.error("❌ KAPITAL ORDER RESPONSE DÜZGÜN DEYİL:", kapitalResponse);

      return res.status(500).json({
        success: false,
        message: "Kapital Bank ödəniş sifarişi yaradıla bilmədi",
      });
    }

    console.log("✅ KAPITAL ORDER CREATED:", {
      id: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      hppUrl: order.hppUrl,
    });

    /* -----------------------------------------------------
         CREATE PAYMENT RECORD
      ----------------------------------------------------- */

    const payment = await Payment.create({
      user: req.user.id,
      listing: listing._id,
      amount: price,
      type,

      kapitalOrderId: String(order.id),

      kapitalStatus: order.status || "Preparing",

      paid: false,

      paidAt: null,
    });

    console.log("✅ PAYMENT CREATED:", {
      paymentId: payment._id,
      kapitalOrderId: order.id,
      listingId: listing._id,
      type,
      amount: price,
    });

    /* -----------------------------------------------------
         CREATE KAPITAL HPP URL
      ----------------------------------------------------- */

    const paymentUrl = new URL(order.hppUrl);

    paymentUrl.searchParams.set("id", String(order.id));

    paymentUrl.searchParams.set("password", String(order.password));

    console.log("🔗 PAYMENT URL:", paymentUrl.toString());

    /* -----------------------------------------------------
         SEND FRONTEND
      ----------------------------------------------------- */

    return res.json({
      success: true,
      paymentId: payment._id,
      orderId: String(order.id),
      type,
      amount: price,
      paymentUrl: paymentUrl.toString(),
    });
  } catch (error) {
    console.error("❌ KAPITAL CREATE PAYMENT ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Kapital Bank ödənişi yaradılarkən xəta baş verdi",
    });
  }
});

/* =========================================================
   KAPITAL BANK CALLBACK

   GET
   /api/payments/kapital/callback
========================================================= */

router.get("/kapital/callback", async (req, res) => {
  try {
    console.log("==========================================");
    console.log("🔥🔥🔥 KAPITAL CALLBACK GƏLDİ");
    console.log("QUERY:", req.query);
    console.log("URL:", req.originalUrl);
    console.log("==========================================");

    const orderId = req.query.ID;
    const callbackStatus = req.query.STATUS;

    /* -----------------------------------------------------
         ORDER ID CHECK
      ----------------------------------------------------- */

    if (!orderId) {
      console.log("❌ KAPITAL CALLBACK: ID yoxdur");

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=no_order_id`,
      );
    }

    console.log("🔎 CALLBACK ORDER ID:", orderId);
    console.log("🔎 CALLBACK STATUS:", callbackStatus);

    /* -----------------------------------------------------
         FIND PAYMENT
      ----------------------------------------------------- */

    const payment = await Payment.findOne({
      kapitalOrderId: String(orderId),
    });

    if (!payment) {
      console.log("❌ Payment tapılmadı:", orderId);

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=payment_not_found&orderId=${encodeURIComponent(
          orderId,
        )}`,
      );
    }

    console.log("✅ PAYMENT TAPILDI:", {
      paymentId: payment._id,
      orderId: payment.kapitalOrderId,
      type: payment.type,
      amount: payment.amount,
      paid: payment.paid,
    });

    /* -----------------------------------------------------
         ƏGƏR ARTİQ ÖDƏNİLİBSƏ
      ----------------------------------------------------- */

    if (payment.paid === true) {
      console.log("ℹ️ Payment artıq təsdiqlənib:", orderId);

   return res.redirect(
     `${FRONTEND_URL}/success?orderId=${encodeURIComponent(
       orderId,
     )}&type=${encodeURIComponent(payment.type)}`,
   );
    }

    /* -----------------------------------------------------
         CALLBACK STATUS-U REFUSED / FAILED VƏ S.
      ----------------------------------------------------- */

    if (callbackStatus && callbackStatus !== "FullyPaid") {
      console.log("❌ KAPITAL CALLBACK UĞURSUZ:", callbackStatus);

      payment.kapitalStatus = callbackStatus;

      await payment.save();

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=failed&orderId=${encodeURIComponent(
          orderId,
        )}&paymentStatus=${encodeURIComponent(callbackStatus)}`,
      );
    }

    /* -----------------------------------------------------
         GET REAL ORDER FROM KAPITAL
      ----------------------------------------------------- */

    console.log("🔎 Kapital order API ilə yoxlanılır:", orderId);

    const kapitalResponse = await kapitalRequest(
      `${KAPITAL_API_URL}/order/${encodeURIComponent(
        orderId,
      )}?tranDetailLevel=2`,
      {
        method: "GET",
      },
    );

    const order = kapitalResponse?.order;

    if (!order) {
      console.log("❌ Kapital order məlumatı gəlmədi:", orderId);

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=order_not_found&orderId=${encodeURIComponent(
          orderId,
        )}`,
      );
    }

    console.log("🔥 KAPITAL REAL ORDER:", {
      id: order.id,
      status: order.status,
      amount: order.amount,
      currency: order.currency,
    });

    /* -----------------------------------------------------
         ACTIVATE PAYMENT
      ----------------------------------------------------- */

    const result = await activatePayment(payment, order);

    console.log("🔥 ACTIVATE RESULT:", result);

    /* -----------------------------------------------------
         NOT FULLY PAID
      ----------------------------------------------------- */

    if (!result.paid) {
      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=failed&orderId=${encodeURIComponent(
          orderId,
        )}&paymentStatus=${encodeURIComponent(
          result.status || order.status || callbackStatus || "Unknown",
        )}`,
      );
    }

    /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

    console.log("==========================================");

    console.log("🎉 KAPİTAL ÖDƏNİŞİ UĞURLUDUR");

    console.log("==========================================");

    return res.redirect(
      `${FRONTEND_URL}/payment-result?status=success&orderId=${encodeURIComponent(
        orderId,
      )}&type=${encodeURIComponent(payment.type)}`,
    );
  } catch (error) {
    console.error("❌ KAPITAL CALLBACK ERROR:", error);

    return res.redirect(
      `${FRONTEND_URL}/payment-result?status=error&reason=callback_error`,
    );
  }
});

/* =========================================================
   CHECK PAYMENT STATUS

   GET
   /api/payments/status/:orderId
========================================================= */

router.get("/status/:orderId", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.params;

    /* -----------------------------------------------------
         ORDER ID CHECK
      ----------------------------------------------------- */

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId yoxdur",
      });
    }

    /* -----------------------------------------------------
         FIND PAYMENT
      ----------------------------------------------------- */

    const payment = await Payment.findOne({
      kapitalOrderId: String(orderId),
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment tapılmadı",
      });
    }

    /* -----------------------------------------------------
         USER SECURITY
      ----------------------------------------------------- */

    if (payment.user.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Bu ödənişə giriş yoxdur",
      });
    }

    /* -----------------------------------------------------
         GET KAPITAL ORDER
      ----------------------------------------------------- */

    const kapitalResponse = await kapitalRequest(
      `${KAPITAL_API_URL}/order/${encodeURIComponent(
        orderId,
      )}?tranDetailLevel=2`,
      {
        method: "GET",
      },
    );

    const order = kapitalResponse?.order;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Kapital Bank order tapılmadı",
      });
    }

    console.log("🔎 STATUS CHECK:", {
      orderId,
      orderStatus: order.status,
      paymentType: payment.type,
      paid: payment.paid,
    });

    /* -----------------------------------------------------
         ACTIVATE PAYMENT
      ----------------------------------------------------- */

    const result = await activatePayment(payment, order);

    /* -----------------------------------------------------
         RESPONSE
      ----------------------------------------------------- */

    return res.json({
      success: true,

      orderId: String(order.id),

      paymentId: payment._id,

      status: order.status,

      amount: order.amount,

      currency: order.currency,

      type: payment.type,

      paid: result.paid,

      listingId: result.listingId || payment.listing,

      priority: result.priority || null,

      priorityType: result.priorityType || (payment.paid ? payment.type : null),

      priorityExpires: result.priorityExpires || null,
    });
  } catch (error) {
    console.error("❌ KAPITAL STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error?.message || "Ödəniş statusu yoxlanılarkən xəta baş verdi",
    });
  }
});

/* =========================================================
   GET LISTINGS

   Premium = 1
   VIP     = 2
   Free    = 3
========================================================= */

router.get("/", async (req, res) => {
  try {
    const now = new Date();

    const listings = await Ad.find();

    const fixed = listings.map((item) => {
      const expired = item.priorityExpires && item.priorityExpires < now;

      return {
        ...item.toObject(),

        priorityType: expired ? "free" : item.priorityType,

        priority: expired ? 3 : item.priority,
      };
    });

    /* -----------------------------------------------------
       PRIORITY SORT
    ----------------------------------------------------- */

    fixed.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.json(fixed);
  } catch (err) {
    console.error("❌ GET LISTINGS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

export default router;
