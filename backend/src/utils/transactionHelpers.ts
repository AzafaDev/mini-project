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
    // Restore custom ticket availability
    await tx.ticket.update({
      where: { id: ticketId },
      data: { available: { increment: quantity } },
    });
    // Also restore event availableSeats (sync)
    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { increment: quantity } },
    });
  } else {
    // Default ticket: only event seats
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
  }
}

/**
 * Restores voucher usage count after transaction is rejected/expired/canceled.
 */
export async function restoreVoucher(
  tx: any,
  { voucherId }: Pick<RestoreResourcesParams, "voucherId">,
) {
  if (voucherId) {
    await tx.voucher.updateMany({
      where: { id: voucherId, usedCount: { gt: 0 } },
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
  // Semua operasi restore dijalankan paralel dengan Promise.all
  // Alasannya:
  // 1. Tidak ada dependensi antar operasi restore
  // 2. Lebih cepat daripada await satu-satu secara sequential
  // 3. Semua tetap berjalan dalam satu atomic transaction
  await Promise.all([
    restoreTicketAvailability(tx, params),
    restoreUserPoints(tx, params),
    restoreVoucher(tx, params),
    restoreCoupon(tx, params),
  ]);
}