import { Router } from "express";
import { prisma } from "../../config/prisma";
import { authMiddleware } from "../auth/auth.middleware";

const voucherRouter = Router();

console.log("[DEBUG Route] Registering Voucher routes");

// Get vouchers for an event (public)
voucherRouter.get("/:eventId/vouchers", async (req, res) => {
  try {
    const { eventId } = req.params;
    console.log("[DEBUG Voucher Route] getVouchers eventId:", eventId);
    
    const vouchers = await prisma.voucher.findMany({
      where: {
        eventId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
        OR: [
          { maxUsage: null },
          { usedCount: { lt: prisma.voucher.fields.maxUsage } },
        ],
      },
      select: {
        code: true,
        discountType: true,
        discountValue: true,
      },
    });

    console.log("[DEBUG Voucher Route] getVouchers result count:", vouchers.length);

    res.json({ success: true, data: vouchers });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] getVouchers error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Validate voucher code (public) - changed from /validate to /check-voucher to avoid conflict with eventRouter
voucherRouter.get("/check-voucher", async (req, res) => {
  try {
    console.log("[DEBUG Voucher Validate] Full URL:", req.originalUrl);
    console.log("[DEBUG Voucher Validate] Query:", req.query);
    
    const { eventId, code } = req.query;
    const price = parseInt(req.query.price as string) || 0;
    const quantity = parseInt(req.query.quantity as string) || 1;
    console.log("[DEBUG Voucher Validate] eventId:", eventId);
    console.log("[DEBUG Voucher Validate] code:", code, "price:", price, "quantity:", quantity);

    if (!eventId || !code) {
      return res.status(400).json({ success: false, message: "Missing eventId or code" });
    }

    const voucher = await prisma.voucher.findFirst({
      where: {
        code: (code as string).toUpperCase(),
        eventId: eventId as string,
        isActive: true,
      },
    });

    console.log("[DEBUG Voucher Validate] Looking for code:", (code as string).toUpperCase());
    console.log("[DEBUG Voucher Validate] Event ID:", eventId);
    console.log("[DEBUG Voucher Validate] Found voucher:", voucher ? "YES" : "NO");
    if (voucher) {
      console.log("[DEBUG Voucher Validate] Voucher details:", { code: voucher.code, startDate: voucher.startDate, endDate: voucher.endDate, isActive: voucher.isActive, maxUsage: voucher.maxUsage, usedCount: voucher.usedCount });
    }

    if (!voucher) {
      return res.status(404).json({ success: false, message: "Invalid voucher code" });
    }

    const now = new Date();
    console.log("[DEBUG Voucher Validate] Current date:", now);
    console.log("[DEBUG Voucher Validate] Voucher startDate:", voucher.startDate, "endDate:", voucher.endDate);

    if (voucher.startDate > now) {
      return res.status(400).json({ success: false, message: "Voucher not yet active" });
    }

    if (voucher.endDate < now) {
      return res.status(400).json({ success: false, message: "Voucher expired" });
    }

    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      return res.status(400).json({ success: false, message: "Voucher usage limit reached" });
    }

    // Calculate discount based on type - only PERCENTAGE supported
    let discount = 0;
    if (voucher.discountType === "PERCENTAGE" && price > 0 && quantity > 0) {
      discount = (price * quantity * voucher.discountValue) / 100;
    } else {
      discount = voucher.discountValue;
    }

    console.log("[DEBUG Voucher Validate] SUCCESS! discount:", discount, "type:", voucher.discountType);

    res.json({ 
      success: true, 
      valid: true,
      discount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      message: "Voucher valid!" 
    });
  } catch (error: any) {
    console.log("[DEBUG Voucher Validate] Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create voucher (organizer only)
voucherRouter.post("/voucher", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, async (req, res) => {
  try {
    console.log("[DEBUG Voucher] POST /api/events/ called");
    console.log("[DEBUG Voucher] Full URL:", req.originalUrl);
    console.log("[DEBUG Voucher] Method:", req.method);
    console.log("[DEBUG Voucher] Body:", JSON.stringify(req.body));
    console.log("[DEBUG Voucher] Headers:", req.headers.authorization ? "Has auth header" : "No auth header");
    console.log("[DEBUG Voucher] req.body.userId:", req.body.userId);
    console.log("[DEBUG Voucher] req.userId:", req.userId);
    
    const userId = req.body.userId;
    const { eventId, code, discountType, discountValue, startDate, endDate, maxUsage } = req.body;
    
    console.log("[DEBUG Voucher Route] createVoucher input:", { eventId, code, discountType, discountValue, startDate, endDate, maxUsage });

    // Verify event belongs to organizer
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId: userId },
    });

    if (!event) {
      return res.status(403).json({ success: false, message: "Event not found or not yours" });
    }

    // Check if code already exists
    const existing = await prisma.voucher.findFirst({
      where: { code: code.toUpperCase(), eventId },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Voucher code already exists for this event" });
    }

    const voucher = await prisma.voucher.create({
      data: {
        eventId,
        code: code.toUpperCase(),
        discountType, // PERCENTAGE or FIXED
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxUsage: maxUsage || null,
        isActive: true,
      },
    });

    console.log("[DEBUG Voucher Route] createVoucher success:", voucher.id);

    res.json({ success: true, data: voucher, message: "Voucher created successfully!" });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] createVoucher error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Validate coupon code
voucherRouter.get("/coupons/validate", async (req, res) => {
  try {
    const code = req.query.code as string;
    const price = parseInt(req.query.price as string) || 0;
    const quantity = parseInt(req.query.quantity as string) || 1;
    console.log("[DEBUG Voucher Route] validateCoupon code:", code, "price:", price, "quantity:", quantity);
    
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    console.log("[DEBUG Voucher Route] validateCoupon coupon found:", !!coupon, coupon?.id, coupon?.code);
    console.log("[DEBUG Voucher Route] validateCoupon isActive:", coupon?.isActive);
    console.log("[DEBUG Voucher Route] validateCoupon dates:", { start: coupon?.startDate, end: coupon?.endDate, now: new Date() });

    if (!coupon) {
      console.log("[DEBUG Voucher Route] validateCoupon coupon NOT FOUND for code:", code);
      return res.status(404).json({ 
        success: false, 
        message: "Invalid or expired coupon code" 
      });
    }

    let actualDiscount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      if (price > 0) {
        actualDiscount = (price * coupon.discountValue) / 100;
        console.log("[DEBUG Voucher Route] PERCENTAGE discount calculated:", { price, percentage: coupon.discountValue, actualDiscount });
      } else {
        console.log("[DEBUG Voucher Route] PERCENTAGE discount SKIPPED (price or quantity is 0):", { price, quantity });
        // actualDiscount stays 0
      }
    } else {
      actualDiscount = coupon.discountValue;  // FIXED type uses raw value
      console.log("[DEBUG Voucher Route] FIXED discount:", actualDiscount);
    }
    console.log("[DEBUG Voucher Route] final actualDiscount:", actualDiscount);

    res.json({
      success: true,
      valid: true,
      discount: actualDiscount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      message: "Coupon valid!"
    });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] validateCoupon error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get coupons (system-wide)
voucherRouter.get("/coupons", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    console.log("[DEBUG Voucher Route] getCoupons userId:", userId);
    
    const coupons = await prisma.coupon.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
      },
    });

    console.log("[DEBUG Voucher Route] getCoupons result count:", coupons.length);

    res.json({ success: true, data: coupons });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] getCoupons error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all vouchers for organizer's events
voucherRouter.get("/my-vouchers", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("[DEBUG Voucher Route] getMyVouchers userId:", userId);
    
    // Get all events by organizer
    const events = await prisma.event.findMany({
      where: { organizerId: userId },
      select: { id: true },
    });
    
    const eventIds = events.map(e => e.id);

    const vouchers = await prisma.voucher.findMany({
      where: { eventId: { in: eventIds } },
      include: {
        event: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[DEBUG Voucher Route] getMyVouchers result count:", vouchers.length);

    res.json({ success: true, data: vouchers });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] getMyVouchers error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update voucher
voucherRouter.put("/voucher/:id", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { code, discountType, discountValue, startDate, endDate, maxUsage, isActive } = req.body;
    
    console.log("[DEBUG Voucher Route] updateVoucher id:", id, "userId:", userId);
    
    const voucher = await prisma.voucher.findFirst({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });
    
    if (!voucher || voucher.event.organizerId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    const updated = await prisma.voucher.update({
      where: { id },
      data: { code, discountType, discountValue, startDate: new Date(startDate), endDate: new Date(endDate), maxUsage, isActive },
    });
    
    console.log("[DEBUG Voucher Route] updateVoucher success:", updated.id);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] updateVoucher error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete voucher
voucherRouter.delete("/voucher/:id", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    console.log("[DEBUG Voucher Route] deleteVoucher id:", id, "userId:", userId);
    
    const voucher = await prisma.voucher.findFirst({
      where: { id },
      include: { event: { select: { organizerId: true } } as any },
    });
    
    if (!voucher || (voucher as any).event?.organizerId !== userId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }
    
    await prisma.voucher.delete({ where: { id } });
    
    console.log("[DEBUG Voucher Route] deleteVoucher success:", id);
    res.json({ success: true, message: "Voucher deleted" });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] deleteVoucher error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});



// Get current user's coupons (authenticated)
voucherRouter.get("/my-coupons", authMiddleware.verifyAuthToken, async (req, res) => {
  try {
    const userId = req.userId;
    console.log("[DEBUG Voucher Route] getMyCoupons userId:", userId);
    
    const coupons = await prisma.coupon.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
        startDate: true,
        endDate: true,
      },
    });

    console.log("[DEBUG Voucher Route] getMyCoupons result count:", coupons.length);

    res.json({ success: true, data: coupons });
  } catch (error: any) {
    console.log("[DEBUG Voucher Route] getMyCoupons error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default voucherRouter;
