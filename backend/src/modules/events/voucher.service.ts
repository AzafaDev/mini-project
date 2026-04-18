import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { calculateDiscount } from "../../utils/discountEngine";
import { DiscountType } from "../../../generated/prisma/enums";

export const voucherService = {
  /**
   * Get all active vouchers for an event
   */
  getEventVouchers: async ({ eventId }: { eventId: string }) => {
    console.log("[DEBUG Voucher Service] getEventVouchers input:", { eventId });

    const now = new Date();
    const vouchers = await prisma.voucher.findMany({
      where: {
        eventId,
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
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

    console.log("[DEBUG Voucher Service] getEventVouchers result:", vouchers.length);
    return vouchers;
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
    console.log("[DEBUG Voucher Service] validateVoucher input:", { eventId, code, price, quantity });

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

    const now = new Date();
    if (voucher.startDate > now) {
      throw new AppError("Voucher not yet active", 400);
    }

    if (voucher.endDate < now) {
      throw new AppError("Voucher expired", 400);
    }

    if (voucher.maxUsage && voucher.usedCount >= voucher.maxUsage) {
      throw new AppError("Voucher usage limit reached", 400);
    }

    const discount = calculateDiscount(
      price,
      quantity,
      voucher.discountType,
      voucher.discountValue
    );

    console.log("[DEBUG Voucher Service] validateVoucher discount:", discount);
    return {
      discount,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
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
    console.log("[DEBUG Voucher Service] createVoucher input:", { eventId, code, discountType, discountValue });

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
   * Update a voucher
   */
  updateVoucher: async ({
    id,
    organizerId,
    code,
    discountType,
    discountValue,
    startDate,
    endDate,
    maxUsage,
    isActive,
  }: {
    id: string;
    organizerId: string;
    code?: string;
    discountType?: DiscountType;
    discountValue?: number;
    startDate?: Date;
    endDate?: Date;
    maxUsage?: number;
    isActive?: boolean;
  }) => {
    console.log("[DEBUG Voucher Service] updateVoucher input:", { id, organizerId });

    const voucher = await prisma.voucher.findFirst({
      where: { id },
      include: { event: { select: { organizerId: true } } },
    });

    if (!voucher || voucher.event.organizerId !== organizerId) {
      throw new AppError("Unauthorized", 403);
    }

    const updated = await prisma.voucher.update({
      where: { id },
      data: {
        ...(code && { code }),
        ...(discountType && { discountType }),
        ...(discountValue && { discountValue }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(maxUsage !== undefined && { maxUsage }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    console.log("[DEBUG Voucher Service] updateVoucher success:", updated.id);
    return updated;
  },

  /**
   * Delete a voucher
   */
  deleteVoucher: async ({ id, organizerId }: { id: string; organizerId: string }) => {
    console.log("[DEBUG Voucher Service] deleteVoucher input:", { id, organizerId });

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
    console.log("[DEBUG Voucher Service] getOrganizerVouchers input:", { organizerId });

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

    console.log("[DEBUG Voucher Service] getOrganizerVouchers result:", vouchers.length);
    return vouchers;
  },
};