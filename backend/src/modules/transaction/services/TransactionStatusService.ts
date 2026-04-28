import { TransactionStatus } from "@prisma/client";
import type { PrismaClientType } from "../../../config/prisma";
import { AppError } from "../../../utils/AppError";
import { logger } from "../../../utils/logger";
import { sendEmail } from "../../../utils/sendEmail";
import { restoreAllResources } from "../../../utils/transactionHelpers";
import { ticketPricingService } from "../ticket-pricing.service";
import {
  POINTS_EARNED_MULTIPLIER,
  MAX_POINTS_PER_TRANSACTION,
} from "../../../config/constants";

export class TransactionStatusService {
  constructor(private prisma: PrismaClientType) {}

  async acceptTransaction({ id }: { id: string }) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        ticket: true,
        user: { select: { email: true, fullName: true } },
        event: { select: { name: true } },
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("Invalid transaction status", 400);
    }

    const earnedPoints = ticketPricingService.calculateEarnedPoints(
      transaction.finalPrice,
      POINTS_EARNED_MULTIPLIER,
      MAX_POINTS_PER_TRANSACTION,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.DONE,
          paidAt: new Date(),
        },
      });

      if (transaction.couponId) {
        await tx.coupon.update({
          where: { id: transaction.couponId },
          data: { isActive: false },
        });
      }

      if (earnedPoints > 0) {
        const user = await tx.user.findUnique({
          where: { id: transaction.userId },
        });

        if (user) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              points: user.points + earnedPoints,
            },
          });

          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 3);

          await tx.pointTransaction.create({
            data: {
              userId: user.id,
              amount: earnedPoints,
              reason: `Purchase reward for event ticket`,
              expiresAt,
            },
          });
        }
      }

      return result;
    });

    if (transaction.user && transaction.event) {
      sendEmail
        .transactionAccepted({
          email: transaction.user.email,
          username: transaction.user.fullName,
          eventName: transaction.event.name,
          finalPrice: transaction.finalPrice,
          quantity: transaction.quantity,
        })
        .catch((err: Error) =>
          logger.error("[TransactionStatusService] Email send failed:", err.message),
        );
    }

    return updated;
  }

  async rejectTransaction({ id }: { id: string }) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        ticket: true,
        voucher: true,
        coupon: true,
        user: { select: { email: true, fullName: true } },
        event: { select: { name: true } },
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("Invalid transaction status", 400);
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.REJECTED,
        },
      });

      await restoreAllResources(tx, {
        ticketId: transaction.ticketId,
        eventId: transaction.eventId,
        quantity: transaction.quantity,
        pointsUsed: transaction.pointsUsed,
        voucherId: transaction.voucherId,
        couponId: transaction.couponId,
        userId: transaction.userId,
      });

      return result;
    });

    if (transaction.user && transaction.event) {
      sendEmail
        .transactionRejected({
          email: transaction.user.email,
          username: transaction.user.fullName,
          eventName: transaction.event.name,
          finalPrice: transaction.finalPrice,
          quantity: transaction.quantity,
        })
        .catch((err: Error) =>
          logger.error("[TransactionStatusService] Email send failed:", err.message),
        );
    }

    return result;
  }

  async expireTransaction({ id }: { id: string }) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { ticket: true, voucher: true, coupon: true },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.EXPIRED,
        },
      });

      await restoreAllResources(tx, {
        ticketId: transaction.ticketId,
        eventId: transaction.eventId,
        quantity: transaction.quantity,
        pointsUsed: transaction.pointsUsed,
        voucherId: transaction.voucherId,
        couponId: transaction.couponId,
        userId: transaction.userId,
      });

      return result;
    });
  }

  async cancelTransaction({ id }: { id: string }) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: { ticket: true, voucher: true, coupon: true },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    const status = transaction.status as TransactionStatus;
    const allowedStatuses: TransactionStatus[] = [
      TransactionStatus.WAITING_PAYMENT,
      TransactionStatus.WAITING_CONFIRMATION,
    ];

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Cannot cancel this transaction", 400);
    }

    return this.prisma.$transaction(async (tx) => {
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.CANCELED,
        },
      });

      await restoreAllResources(tx, {
        ticketId: transaction.ticketId,
        eventId: transaction.eventId,
        quantity: transaction.quantity,
        pointsUsed: transaction.pointsUsed,
        voucherId: transaction.voucherId,
        couponId: transaction.couponId,
        userId: transaction.userId,
      });

      return result;
    });
  }
}
