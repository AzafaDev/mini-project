import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { discountCalculatorService } from "./discount-calculator.service";

export const couponService = {
  /**
   * Validate a coupon code (system-wide)
   */
  validateCoupon: async ({
    code,
    price,
    quantity,
  }: {
    code: string;
    price: number;
    quantity: number;
  }) => {
    console.log("[DEBUG Coupon Service] validateCoupon input:", { code, price, quantity });

    if (!code) {
      throw new AppError("Coupon code is required", 400);
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        isActive: true,
        startDate: { lte: new Date() },
        endDate: { gte: new Date() },
      },
    });

    if (!coupon) {
      throw new AppError("Invalid or expired coupon code", 404);
    }

    const actualDiscount = discountCalculatorService.calculateDiscount(
      price,
      quantity,
      coupon.discountType,
      coupon.discountValue
    );

    console.log("[DEBUG Coupon Service] validateCoupon success:", actualDiscount);
    return {
      discount: actualDiscount,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      couponId: coupon.id,
    };
  },

  /**
   * Get user's coupons
   */
  getUserCoupons: async ({ userId }: { userId: string }) => {
    console.log("[DEBUG Coupon Service] getUserCoupons input:", { userId });

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

    console.log("[DEBUG Coupon Service] getUserCoupons result:", coupons.length);
    return coupons;
  },

  /**
   * Get all system-wide active coupons (optionally filtered by userId)
   */
  getCoupons: async ({ userId }: { userId?: string }) => {
    console.log("[DEBUG Coupon Service] getCoupons input:", { userId });

    const where: any = {
      isActive: true,
      startDate: { lte: new Date() },
      endDate: { gte: new Date() },
    };

    if (userId) {
      where.userId = userId;
    }

    const coupons = await prisma.coupon.findMany({
      where,
      select: {
        id: true,
        code: true,
        discountType: true,
        discountValue: true,
      },
    });

    console.log("[DEBUG Coupon Service] getCoupons result:", coupons.length);
    return coupons;
  },

  // Backward compatibility
  getAllCoupons: async ({ userId }: { userId?: string }) => {
    return couponService.getCoupons({ userId });
  },
};
