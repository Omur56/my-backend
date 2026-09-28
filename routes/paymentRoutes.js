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
  console.log("==========================================");
  console.log("🌐 KAPITAL API REQUEST");
  console.log("METHOD:", options.method || "GET");
  console.log("URL:", url);
  console.log("==========================================");

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

  console.log("==========================================");
  console.log("🌐 KAPITAL API RESPONSE");
  console.log("STATUS:", response.status);
  console.log("DATA:", JSON.stringify(data, null, 2));
  console.log("==========================================");

  if (!response.ok) {
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
   GET ORDER OBJECT
   Kapital cavabının müxtəlif wrapper formalarını
   təhlükəsiz şəkildə qəbul edir.
========================================================= */

const extractKapitalOrder = (response) => {
  if (!response) {
    return null;
  }

  if (response.order) {
    return response.order;
  }

  if (response.data?.order) {
    return response.data.order;
  }

  if (response.result?.order) {
    return response.result.order;
  }

  // Bəzi cavablarda order birbaşa gəlirsə
  if (response.id || response.status || response.hppUrl) {
    return response;
  }

  return null;
};

/* =========================================================
   NORMALIZE STATUS
========================================================= */

const normalizeKapitalStatus = (status) => {
  return String(status || "")
    .trim()
    .replace(/\s+/g, "")
    .toLowerCase();
};

const isFullyPaid = (order) => {
  const status = normalizeKapitalStatus(order?.status);

  console.log("🔎 KAPITAL STATUS CHECK:", {
    original: order?.status,
    normalized: status,
  });

  return status === "fullypaid" || status === "fully_paid" || status === "paid";
};

/* =========================================================
   WAIT FOR FULLY PAID
========================================================= */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getKapitalOrder = async (orderId) => {
  const response = await kapitalRequest(
    `${KAPITAL_API_URL}/order/${encodeURIComponent(orderId)}?tranDetailLevel=2`,
    {
      method: "GET",
    },
  );

  const order = extractKapitalOrder(response);

  console.log("🔥 KAPITAL ORDER EXTRACTED:", {
    orderId,
    order,
  });

  return order;
};

const getFullyPaidOrderWithRetry = async (orderId) => {
  let lastOrder = null;

  // Kapital callback-dan dərhal sonra status bəzən
  // hələ FullyPaid olmaya bilər.
  for (let attempt = 1; attempt <= 5; attempt++) {
    console.log(`🔄 KAPITAL PAYMENT STATUS CHECK ${attempt}/5`);

    try {
      lastOrder = await getKapitalOrder(orderId);

      if (lastOrder) {
        console.log("🔎 ORDER STATUS:", lastOrder.status);

        if (isFullyPaid(lastOrder)) {
          console.log("✅ KAPITAL ORDER FULLY PAID TAPILDI");

          return lastOrder;
        }
      }
    } catch (error) {
      console.error("❌ Kapital order check error:", error?.message);
    }

    if (attempt < 5) {
      await sleep(2000);
    }
  }

  return lastOrder;
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

  console.log("==========================================");
  console.log("🔥 ACTIVATE PAYMENT");
  console.log("==========================================");

  console.log({
    paymentId: payment._id,
    orderId: order.id,
    orderStatus: order.status,
    paymentType: payment.type,
    paymentAmount: payment.amount,
    kapitalAmount: order.amount,
    currency: order.currency,
  });

  /* =======================================================
     PAYMENT TYPE CHECK
  ======================================================= */

  if (!["vip", "premium"].includes(payment.type)) {
    payment.kapitalStatus = "InvalidPaymentType";
    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "invalid_payment_type",
    };
  }

  /* =======================================================
     PAYMENT STATUS
  ======================================================= */

  if (!isFullyPaid(order)) {
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

  /* =======================================================
     AMOUNT CHECK
  ======================================================= */

  const expectedAmount = Number(payment.amount);
  const kapitalAmount = Number(order.amount);

  console.log("💰 AMOUNT CHECK:", {
    expectedAmount,
    kapitalAmount,
  });

  if (
    !Number.isFinite(kapitalAmount) ||
    !Number.isFinite(expectedAmount) ||
    Math.abs(kapitalAmount - expectedAmount) > 0.001
  ) {
    console.error("❌ AMOUNT MISMATCH");

    payment.kapitalStatus = "AmountMismatch";
    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "amount_mismatch",
    };
  }

  /* =======================================================
     CURRENCY CHECK
  ======================================================= */

  if (String(order.currency || "").toUpperCase() !== "AZN") {
    console.error("❌ CURRENCY MISMATCH:", order.currency);

    payment.kapitalStatus = "CurrencyMismatch";
    await payment.save();

    return {
      success: false,
      paid: false,
      reason: "currency_mismatch",
    };
  }

  /* =======================================================
     FIND LISTING
  ======================================================= */

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

  console.log("✅ ELAN TAPILDI:", {
    id: listing._id,
    title: listing.title,
    userId: listing.userId,
    paymentUser: payment.user,
    oldPriorityType: listing.priorityType,
    oldPriority: listing.priority,
  });

  /* =======================================================
     USER / LISTING SECURITY
  ======================================================= */

  if (!listing.userId || String(listing.userId) !== String(payment.user)) {
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

  /* =======================================================
     EXPIRATION
  ======================================================= */

  const now = moment().tz("Asia/Baku");

  let expires;

  if (payment.type === "premium") {
    expires = now.clone().add(7, "days").toDate();
  } else {
    expires = now.clone().add(3, "days").toDate();
  }

  /* =======================================================
     PRIORITY
     
     PREMIUM = 1
     VIP     = 2
     FREE    = 3
  ======================================================= */

  const newPriority = payment.type === "premium" ? 1 : 2;

  const newPriorityType = payment.type;

  console.log("==========================================");
  console.log("💎 ELAN STATUS UPDATE");
  console.log("==========================================");

  console.log({
    listingId: listing._id,
    paymentType: payment.type,
    newPriorityType,
    newPriority,
    priorityExpires: expires,
  });

  /* =======================================================
     DIRECT DATABASE UPDATE
     
     Burada listing.save() əvəzinə
     findByIdAndUpdate istifadə edirik.
     
     Beləliklə Mongoose document-in başqa
     sahələrinin təsadüfən dəyişməsi qarşısı alınır.
  ======================================================= */

  const updatedListing = await Ad.findByIdAndUpdate(
    listing._id,
    {
      $set: {
        priorityType: newPriorityType,
        priority: newPriority,
        priorityExpires: expires,
        isActive: true,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  /* =======================================================
     VERIFY
  ======================================================= */

  if (!updatedListing) {
    throw new Error("Elan update zamanı tapılmadı");
  }

  console.log("==========================================");
  console.log("🔎 DB UPDATE NƏTİCƏSİ");
  console.log("==========================================");

  console.log({
    listingId: updatedListing._id,
    priorityType: updatedListing.priorityType,
    priority: updatedListing.priority,
    priorityExpires: updatedListing.priorityExpires,
    isActive: updatedListing.isActive,
  });

  if (
    updatedListing.priorityType !== newPriorityType ||
    Number(updatedListing.priority) !== Number(newPriority)
  ) {
    throw new Error(
      `Elan DB-də düzgün yenilənmədi. ` +
        `priorityType=${updatedListing.priorityType}, ` +
        `priority=${updatedListing.priority}`,
    );
  }

  /* =======================================================
     PAYMENT MARK PAID
  ======================================================= */

  payment.paid = true;
  payment.paidAt = new Date();
  payment.kapitalStatus = "FullyPaid";

  await payment.save();

  /* =======================================================
     FINAL DB VERIFY
  ======================================================= */

  const finalListing = await Ad.findById(updatedListing._id).select(
    "_id title priority priorityType priorityExpires isActive",
  );

  console.log("==========================================");
  console.log("🎉 VIP / PREMIUM AKTİVLƏŞDİRİLDİ");
  console.log("==========================================");

  console.log({
    paymentId: payment._id,
    orderId: order.id,
    listingId: finalListing?._id,
    type: payment.type,
    priorityType: finalListing?.priorityType,
    priority: finalListing?.priority,
    priorityExpires: finalListing?.priorityExpires,
    paid: payment.paid,
  });

  console.log("==========================================");

  return {
    success: true,
    paid: true,
    type: payment.type,
    listingId: finalListing._id,
    priority: finalListing.priority,
    priorityType: finalListing.priorityType,
    priorityExpires: finalListing.priorityExpires,
  };
};

/* =========================================================
   CREATE KAPITAL PAYMENT

   POST
   /api/payments/create-checkout/:listingId

   BODY
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

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    if (!["vip", "premium"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Yanlış ödəniş tipi",
      });
    }

    const listing = await Ad.findById(listingId);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Elan tapılmadı",
      });
    }

    if (!listing.userId || String(listing.userId) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Bu elana access yoxdur",
      });
    }

    const price = type === "premium" ? 7 : 3;

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

    const order = extractKapitalOrder(kapitalResponse);

    console.log("🔥 EXTRACTED ORDER:", order);

    if (!order || !order.id || !order.hppUrl || !order.password) {
      console.error("❌ KAPITAL ORDER RESPONSE DÜZGÜN DEYİL:", kapitalResponse);

      return res.status(500).json({
        success: false,
        message: "Kapital Bank ödəniş sifarişi yaradıla bilmədi",
      });
    }

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

    console.log("==========================================");
    console.log("✅ PAYMENT CREATED");
    console.log("==========================================");

    console.log({
      paymentId: payment._id,
      kapitalOrderId: order.id,
      listingId: listing._id,
      type,
      amount: price,
    });

    const paymentUrl = new URL(order.hppUrl);

    paymentUrl.searchParams.set("id", String(order.id));

    paymentUrl.searchParams.set("password", String(order.password));

    console.log("🔗 PAYMENT URL:", paymentUrl.toString());

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
   KAPITAL CALLBACK

   GET
   /api/payments/kapital/callback
========================================================= */
router.get("/kapital/callback", async (req, res) => {
  console.log("==========================================");
  console.log("🔥🔥🔥 KAPITAL CALLBACK ÇAĞIRILDI");
  console.log("🔥 QUERY:", JSON.stringify(req.query, null, 2));
  console.log("🔥 TIME:", new Date().toISOString());
  console.log("==========================================");

  try {
    const orderId = req.query.ID;
    const callbackStatus = req.query.STATUS;

    console.log("🔥 ORDER ID:", orderId);
    console.log("🔥 CALLBACK STATUS:", callbackStatus);

    if (!orderId) {
      console.log("❌ CALLBACK-DƏ ID YOXDUR");

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=no_order_id`,
      );
    }

    const payment = await Payment.findOne({
      kapitalOrderId: String(orderId),
    });

    console.log(
      "🔥 PAYMENT:",
      payment
        ? {
            id: payment._id,
            orderId: payment.kapitalOrderId,
            listing: payment.listing,
            type: payment.type,
            paid: payment.paid,
            kapitalStatus: payment.kapitalStatus,
          }
        : null,
    );

    if (!payment) {
      console.log("❌ PAYMENT TAPILMADI:", orderId);

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=payment_not_found&orderId=${encodeURIComponent(
          orderId,
        )}`,
      );
    }

    if (callbackStatus) {
      payment.kapitalStatus = callbackStatus;
      await payment.save();

      console.log("✅ CALLBACK STATUS PAYMENT-Ə YAZILDI:", callbackStatus);
    }

    console.log("🔥 KAPITAL ORDER STATUS YOXLAMASI BAŞLAYIR");

    const kapitalResponse = await kapitalRequest(
      `${KAPITAL_API_URL}/order/${encodeURIComponent(
        orderId,
      )}?tranDetailLevel=2`,
      {
        method: "GET",
      },
    );

    console.log(
      "🔥 KAPITAL ORDER RESPONSE:",
      JSON.stringify(kapitalResponse, null, 2),
    );

    const order =
      kapitalResponse?.order ||
      kapitalResponse?.data?.order ||
      kapitalResponse?.data ||
      kapitalResponse;

    console.log("🔥 EXTRACTED ORDER:", order);

    if (!order) {
      console.log("❌ KAPITAL ORDER TAPILMADI");

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=order_not_found&orderId=${encodeURIComponent(
          orderId,
        )}`,
      );
    }

    console.log("🔥 FINAL KAPITAL STATUS:", order.status);

    const normalizedStatus = String(order.status || "")
      .trim()
      .toLowerCase();

    console.log("🔥 NORMALIZED STATUS:", normalizedStatus);

    if (normalizedStatus !== "fullypaid") {
      console.log("⚠️ ÖDƏNİŞ HƏLƏ FULLYPAID DEYİL:", order.status);

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=failed&orderId=${encodeURIComponent(
          orderId,
        )}&paymentStatus=${encodeURIComponent(
          order.status || callbackStatus || "Unknown",
        )}`,
      );
    }

    console.log("==========================================");
    console.log("💰 ÖDƏNİŞ FULLYPAID-DIR");
    console.log("💰 PAYMENT TYPE:", payment.type);
    console.log("💰 LISTING:", payment.listing);
    console.log("==========================================");

    const listing = await Ad.findById(payment.listing);

    console.log(
      "🔥 LISTING BEFORE:",
      listing
        ? {
            id: listing._id,
            priorityType: listing.priorityType,
            priority: listing.priority,
            priorityExpires: listing.priorityExpires,
          }
        : null,
    );

    if (!listing) {
      console.log("❌ ELAN TAPILMADI");

      return res.redirect(
        `${FRONTEND_URL}/payment-result?status=error&reason=listing_not_found`,
      );
    }

    if (payment.type === "premium") {
      listing.priorityType = "premium";
      listing.priority = 1;
      listing.priorityExpires = moment()
        .tz("Asia/Baku")
        .add(7, "days")
        .toDate();
    } else if (payment.type === "vip") {
      listing.priorityType = "vip";
      listing.priority = 2;
      listing.priorityExpires = moment()
        .tz("Asia/Baku")
        .add(3, "days")
        .toDate();
    }

    listing.isActive = true;

    await listing.save();

    console.log("🔥 LISTING AFTER SAVE:", {
      id: listing._id,
      priorityType: listing.priorityType,
      priority: listing.priority,
      priorityExpires: listing.priorityExpires,
    });

    payment.paid = true;
    payment.paidAt = new Date();
    payment.kapitalStatus = "FullyPaid";

    await payment.save();

    console.log("==========================================");
    console.log("🎉🎉🎉 PREMIUM/VIP AKTIV EDİLDİ");
    console.log("🎉 PAYMENT:", payment._id);
    console.log("🎉 LISTING:", listing._id);
    console.log("🎉 TYPE:", listing.priorityType);
    console.log("🎉 PRIORITY:", listing.priority);
    console.log("==========================================");

    return res.redirect(
      `${FRONTEND_URL}/payment-result?status=success&orderId=${encodeURIComponent(
        orderId,
      )}&type=${encodeURIComponent(payment.type)}`,
    );
  } catch (error) {
    console.error("==========================================");
    console.error("❌❌❌ KAPITAL CALLBACK ERROR");
    console.error(error);
    console.error("==========================================");

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

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "orderId yoxdur",
      });
    }

    const payment = await Payment.findOne({
      kapitalOrderId: String(orderId),
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment tapılmadı",
      });
    }

    if (String(payment.user) !== String(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Bu ödənişə giriş yoxdur",
      });
    }

    const order = await getFullyPaidOrderWithRetry(orderId);

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

    const result = await activatePayment(payment, order);

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

      priority: result.priority ?? null,

      priorityType: result.priorityType ?? null,

      priorityExpires: result.priorityExpires ?? null,
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

    fixed.sort((a, b) => {
      if (Number(a.priority) !== Number(b.priority)) {
        return Number(a.priority) - Number(b.priority);
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
