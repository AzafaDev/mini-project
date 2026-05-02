import { TransactionStatus, DiscountType } from "@prisma/client";
import type { PrismaClientType } from "../../../config/prisma";
import { UploadedFile } from "express-fileupload";
import { AppError } from "../../../utils/AppError";
import { logger } from "../../../utils/logger";
import { handleFileUpload } from "../../../utils/handleFileUpload";
import { restoreAllResources } from "../../../utils/transactionHelpers";
import { discountCalculatorService } from "../../discount/discount-calculator.service";
import { voucherService } from "../../discount/voucher.service";
import { couponService } from "../../discount/coupon.service";
import { ticketPricingService } from "../ticket-pricing.service";
import {
  TRANSACTION_EXPIRATION_HOURS,
  TRANSACTION_AUTO_CANCEL_DAYS,
  MAX_POINTS_PER_TRANSACTION,
} from "../../../config/constants";
import { pointsService } from "../../points/points.service";

export class TransactionCreationService {
  constructor(private prisma: PrismaClientType) {}

  async createTransaction({
    userId,
    eventId,
    ticketId,
    quantity,
    voucherCode,
    couponCode,
    pointsUsed = 0,
    idempotencyKey,
  }: {
    userId: string;
    eventId: string;
    ticketId: string;
    quantity: number;
    voucherCode?: string;
    couponCode?: string;
    pointsUsed?: number;
    idempotencyKey?: string;
  }) {
    if (pointsUsed < 0) {
      throw new AppError("Points used cannot be negative", 400);
    }

    if (voucherCode && couponCode) {
      throw new AppError(
        "Cannot use both voucher and coupon simultaneously",
        400,
      );
    }

    if (idempotencyKey) {
      const existingByIdempotency = await this.prisma.transaction.findFirst({
        where: { idempotencyKey },
      });
      if (existingByIdempotency) {
        logger.debug("[TransactionCreationService] duplicate idempotencyKey detected:", idempotencyKey);
        return existingByIdempotency;
      }
    }

    const now = new Date();
    const existingPending = await this.prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        OR: [
          { status: TransactionStatus.WAITING_PAYMENT, expiresAt: { gt: now } },
          {
            status: TransactionStatus.WAITING_CONFIRMATION,
            autoCancelAt: { gt: now },
          },
        ],
      },
    });

    if (existingPending) {
      return existingPending;
    }

    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: true },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (now > event.endDate) {
      throw new AppError(
        "This event has already ended and tickets are no longer available",
        400,
      );
    }

    if (event.organizerId === userId) {
      throw new AppError(
        "Organizers cannot purchase tickets for their own events",
        403,
      );
    }

    const ticket = event.tickets.find((t) => t.id === ticketId);

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    let voucherId: string | null = null;
    let couponId: string | null = null;
    let discount = 0;
    let voucher: any = null;

    if (voucherCode) {
      voucher = await this.prisma.voucher.findFirst({
        where: {
          code: voucherCode,
          eventId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
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
        throw new AppError(eligibility.error || "Voucher is not eligible", 400);
      }

      voucherId = voucher.id;
      const calculatedDiscount = discountCalculatorService.calculateDiscount(
        ticket.price,
        quantity,
        voucher.discountType as DiscountType,
        voucher.discountValue,
      );
      discount += calculatedDiscount;
    }

    if (couponCode) {
      const coupon = await this.prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      if (coupon) {
        const existingUsage = await this.prisma.transaction.findFirst({
          where: {
            userId,
            couponId: coupon.id,
            status: {
              in: [
                TransactionStatus.DONE,
                TransactionStatus.WAITING_CONFIRMATION,
                TransactionStatus.WAITING_PAYMENT,
              ],
            },
          },
        });

        if (existingUsage) {
          throw new AppError("Coupon has already been used", 400);
        }

        couponId = coupon.id;
        const calculatedDiscount = discountCalculatorService.calculateDiscount(
          ticket.price,
          quantity,
          coupon.discountType as DiscountType,
          coupon.discountValue,
        );
        discount += calculatedDiscount;
      }
    }

    const pointsDiscount = pointsUsed;
    const pricing = ticketPricingService.calculateFinalPrice(
      ticket.price * quantity,
      discount,
      pointsDiscount,
    );
    const totalPrice = pricing.totalPrice;
    const finalPrice = pricing.finalPrice;

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TRANSACTION_EXPIRATION_HOURS);

    const autoCancelAt = new Date();
    autoCancelAt.setDate(autoCancelAt.getDate() + TRANSACTION_AUTO_CANCEL_DAYS);

    return this.prisma.$transaction(async (tx) => {
      if (pointsUsed > 0) {
        const activePoints = await pointsService.getActivePointsTx(tx, userId);

        if (pointsUsed > activePoints) {
          throw new AppError("Insufficient points balance", 400);
        }

        if (pointsUsed > MAX_POINTS_PER_TRANSACTION) {
          throw new AppError(
            `Maximum points per transaction is ${MAX_POINTS_PER_TRANSACTION}`,
            400,
          );
        }

        const updateResult = await tx.user.updateMany({
          where: {
            id: userId,
            points: { gte: pointsUsed },
          },
          data: { points: { decrement: pointsUsed } },
        });

        if (updateResult.count === 0) {
          throw new AppError(
            "Failed to deduct points: insufficient balance or user not found",
            400,
          );
        }

        await tx.pointTransaction.create({
          data: {
            userId: userId,
            amount: -pointsUsed,
            reason: `Redeemed ${pointsUsed} points for event ticket`,
            expiresAt: new Date(),
          },
        });
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          eventId,
          ticketId: ticketId,
          quantity,
          totalPrice,
          discount,
          pointsUsed,
          couponId,
          voucherId,
          finalPrice,
          idempotencyKey,
          status:
            finalPrice === 0
              ? TransactionStatus.DONE
              : TransactionStatus.WAITING_PAYMENT,
          expiresAt: finalPrice === 0 ? new Date() : expiresAt,
          autoCancelAt,
        },
      });

      if (finalPrice === 0) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.DONE,
            paidAt: new Date(),
          },
        });

        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { isActive: false },
          });
        }
      }

      if (voucherId) {
        const updatedVoucher = await tx.voucher.updateMany({
          where: {
            id: voucherId,
            usedCount: { lt: voucher.maxUsage },
          },
          data: { usedCount: { increment: 1 } },
        });
        if (updatedVoucher.count === 0) {
          throw new AppError("Voucher usage limit reached", 400);
        }
      }

      try {
        await tx.ticket.update({
          where: {
            id: ticketId,
            available: { gte: quantity },
          },
          data: { available: { decrement: quantity } },
        });
        await tx.event.update({
          where: { id: eventId },
          data: { availableSeats: { decrement: quantity } },
        });
      } catch (error: any) {
        if (error.code === "P2025") {
          throw new AppError("Not enough tickets available", 400);
        }
        throw error;
      }

      return transaction;
    });
  }

  async uploadPaymentProof({
    id,
    paymentProof,
  }: {
    id: string;
    paymentProof: UploadedFile;
  }) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== TransactionStatus.WAITING_PAYMENT) {
      throw new AppError("Invalid transaction status", 400);
    }

    if (new Date() > transaction.expiresAt) {
      throw new AppError("Transaction has expired", 400);
    }

    const imageUrl = await handleFileUpload(paymentProof, {
      folder: "payment-proofs",
    });

    const updated = await this.prisma.transaction.update({
      where: { id },
      data: {
        paymentProof: imageUrl,
        paymentProofUploadedAt: new Date(),
        status: TransactionStatus.WAITING_CONFIRMATION,
      },
    });

    return updated;
  }
}
