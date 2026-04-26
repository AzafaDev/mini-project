import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { discountCalculatorService } from "./discount-calculator.service";
import { DiscountType } from "@prisma/client";

export const voucherService = {
  /**
   * Get all active vouchers for an event
   */
  getEventVouchers: async ({ eventId }: { eventId: string }) => {
    const now = new Date();
    const vouchers = await prisma.$queryRaw`
      SELECT code, "discountType", "discountValue"
      FROM "Voucher"
      WHERE "eventId" = ${eventId}
        AND "isActive" = true
        AND "startDate" <= ${now}
        AND "endDate" >= ${now}
        AND ("maxUsage" IS NULL OR "usedCount" < "maxUsage")
    `;

    return vouchers as Array<{
      code: string;
      discountType: DiscountType;
      discountValue: number;
    }>;
  },

  /**
   * Validate a voucher code for an event
   */
  validateVoucher: async ({
    eventId,
    code,
    price,
    quantity,
  }: {
    eventId: string;
    code: string;
    price: number;
    quantity: number;
  }) => {
    console.log("[DEBUG Voucher Service] validateVoucher input:", {
      eventId,
      code,
      price,
      quantity,
    });

    const voucher = await prisma.voucher.findFirst({
      where: {
        code: code.toUpperCase(),
        eventId,
        isActive: true,
      },
    });

    if (!voucher) {
      throw new AppError("Invalid voucher code", 404);
    }

    const eligibility = discountCalculatorService.validateDiscountEligibility(
      voucher.startDate,
      voucher.endDate,
      voucher.maxUsage,
      voucher.usedCount,
    );

    if (!eligibility.valid) {
      throw new AppError(eligibility.error!, 400);
    }

    const discount = discountCalculatorService.calculateDiscount(
      price,
      quantity,
      voucher.discountType,
      voucher.discountValue,
    );

    console.log("[DEBUG Voucher Service] validateVoucher discount:", discount);
    return {
      discount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      voucherId: voucher.id,
    };
  },

  /**
   * Create a new voucher for an event
   */
  createVoucher: async ({
    eventId,
    organizerId,
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    maxUsage,
  }: {
    eventId: string;
    organizerId: string;
    code: string;
    discountType: DiscountType;
    discountValue: number;
    startDate: Date;
    endDate: Date;
    maxUsage?: number;
  }) => {
    console.log("[DEBUG Voucher Service] createVoucher input:", {
      eventId,
      code,
      discountType,
      discountValue,
    });

    // Verify event belongs to organizer
    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId },
    });

    if (!event) {
      throw new AppError("Event not found or unauthorized", 403);
    }

    // Check if code already exists
    const existing = await prisma.voucher.findFirst({
      where: { code: code.toUpperCase(), eventId },
    });

    if (existing) {
      throw new AppError("Voucher code already exists for this event", 400);
    }

    // Validate discount value
    if (discountValue <= 0) {
      throw new AppError("Discount value must be a positive number", 400);
    }
    if (discountType === DiscountType.PERCENTAGE && discountValue > 100) {
      throw new AppError("Percentage discount cannot exceed 100%", 400);
    }

    const voucher = await prisma.voucher.create({
      data: {
        eventId,
        code: code.toUpperCase(),
        discountType,
        discountValue,
        startDate,
        endDate,
        maxUsage: maxUsage || null,
        isActive: true,
      },
    });

    console.log("[DEBUG Voucher Service] createVoucher success:", voucher.id);
    return voucher;
  },

  /**
   * Delete a voucher
   */
  deleteVoucher: async ({
    id,
    organizerId,
  }: {
    id: string;
    organizerId: string;
  }) => {
    console.log("[DEBUG Voucher Service] deleteVoucher input:", {
      id,
      organizerId,
    });

    const voucher = await prisma.voucher.findFirst({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });

    if (!voucher || voucher.event.organizerId !== organizerId) {
      throw new AppError("Unauthorized", 403);
    }

    await prisma.voucher.delete({ where: { id } });
    console.log("[DEBUG Voucher Service] deleteVoucher success:", id);
    return { success: true };
  },

  /**
   * Get all vouchers for organizer's events
   */
  getOrganizerVouchers: async ({ organizerId }: { organizerId: string }) => {
    console.log("[DEBUG Voucher Service] getOrganizerVouchers input:", {
      organizerId,
    });

    const events = await prisma.event.findMany({
      where: { organizerId },
      select: { id: true },
    });

    const eventIds = events.map((e) => e.id);

    const vouchers = await prisma.voucher.findMany({
      where: { eventId: { in: eventIds } },
      include: {
        event: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(
      "[DEBUG Voucher Service] getOrganizerVouchers result:",
      vouchers.length,
    );
    return vouchers;
  },
};
