// @ts-nocheck
import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { voucherService, couponService } from "../discount";
import { prisma } from "../../config/prisma";

const voucherRouter = Router();

// Get vouchers for an event (public)
voucherRouter.get("/:eventId/vouchers", async (req, res) => {
  try {
    const { eventId } = req.params;
    const vouchers = await voucherService.getEventVouchers({ eventId });
    res.json({ success: true, data: vouchers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Validate voucher code (public) - changed from /validate to /check-voucher to avoid conflict with eventRouter
voucherRouter.get("/check-voucher", async (req, res) => {
  try {
    const { eventId, code } = req.query;
    const price = parseInt(req.query.price as string) || 0;
    const quantity = parseInt(req.query.quantity as string) || 1;

    if (!eventId || !code) {
      return res.status(400).json({ success: false, message: "Missing eventId or code" });
    }

    const result = await voucherService.validateVoucher({
      eventId: eventId as string,
      code: code as string,
      price,
      quantity,
    });

    res.json({
      success: true,
      valid: true,
      discount: result.discount,
      discountType: result.discountType,
      discountValue: result.discountValue,
      message: "Voucher valid!",
    });
    } catch (error: any) {
      console.log("[DEBUG Voucher Validate] Error:", error.message);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
});

// Create voucher (organizer only)
voucherRouter.post("/voucher", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, async (req, res) => {
  try {
    const organizerId = req.userId; // from JWT token, not from request body
    const { eventId, code, discountType, discountValue, startDate, endDate, maxUsage } = req.body;

      const voucher = await voucherService.createVoucher({
        eventId,
        organizerId,
        code,
        discountType,
        discountValue,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        maxUsage,
      });

      res.json({ success: true, data: voucher, message: "Voucher created successfully!" });
    } catch (error: any) {
      console.log(
        "[DEBUG Voucher Route] createVoucher error:",
        error.message,
      );
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({ success: false, message: error.message });
    }
});

// Validate coupon code
voucherRouter.get("/coupons/validate", async (req, res) => {
  try {
    const code = req.query.code as string;
    const price = parseInt(req.query.price as string) || 0;
    const quantity = parseInt(req.query.quantity as string) || 1;
    
    if (!code) {
      return res.status(400).json({ success: false, message: "Coupon code is required" });
    }

    const result = await couponService.validateCoupon({ code, price, quantity });

    res.json({
      success: true,
      valid: true,
      discount: result.discount,
      discountType: result.discountType,
      discountValue: result.discountValue,
      message: "Coupon valid!"
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get coupons (system-wide)
voucherRouter.get("/coupons", async (req, res) => {
  try {
    const userId = req.query.userId as string;
    const coupons = await couponService.getAllCoupons({ userId });
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all vouchers for organizer's events
voucherRouter.get("/my-vouchers", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, async (req, res) => {
  try {
    const userId = req.userId;
    const vouchers = await voucherService.getOrganizerVouchers({ organizerId: userId });
    res.json({ success: true, data: vouchers });
  } catch (error: any) {
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
    const coupons = await couponService.getUserCoupons({ userId });
    res.json({ success: true, data: coupons });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default voucherRouter;
