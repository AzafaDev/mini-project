import { prisma } from "../config/prisma";

interface RestoreResourcesParams {
  ticketId: string | null;
  eventId: string;
  quantity: number;
  pointsUsed: number;
  voucherId: string | null;
  couponId: string | null;
  userId: string;
}

/**
 * Restores ticket availability after transaction is rejected/expired/canceled.
 * Handles both custom tickets and default event seats.
 */
export async function restoreTicketAvailability(
  tx: any,
  { ticketId, eventId, quantity }: Pick<RestoreResourcesParams, "ticketId" | "eventId" | "quantity">
) {
  if (ticketId) {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { available: { increment: quantity } },
    });
  } else {
    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { increment: quantity } },
    });
  }
}

/**
 * Restores user points after transaction is rejected/expired/canceled.
 */
export async function restoreUserPoints(tx: any, { userId, pointsUsed }: Pick<RestoreResourcesParams, "userId" | "pointsUsed">) {
  if (pointsUsed > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: pointsUsed } },
    });

    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 3);

    await tx.pointTransaction.create({
      data: {
        userId,
        amount: pointsUsed,
        reason: "Refund: Transaction cancelled/expired/rejected",
        expiresAt,
      },
    });
  }
}

/**
 * Restores voucher usage count after transaction is rejected/expired/canceled.
 */
export async function restoreVoucher(tx: any, { voucherId }: Pick<RestoreResourcesParams, "voucherId">) {
  if (voucherId) {
    await tx.voucher.update({
      where: { id: voucherId },
      data: { usedCount: { decrement: 1 } },
    });
  }
}

/**
 * Reactivates coupon after transaction is rejected/expired/canceled.
 */
export async function restoreCoupon(tx: any, { couponId }: Pick<RestoreResourcesParams, "couponId">) {
  if (couponId) {
    await tx.coupon.update({
      where: { id: couponId },
      data: { isActive: true },
    });
  }
}

/**
 * Restores all resources (ticket, points, voucher, coupon) after a transaction
 * is rejected, expired, or canceled.
 */
export async function restoreAllResources(tx: any, params: RestoreResourcesParams) {
  await Promise.all([
    restoreTicketAvailability(tx, params),
    restoreUserPoints(tx, params),
    restoreVoucher(tx, params),
    restoreCoupon(tx, params),
  ]);
}