import { Prisma } from "@prisma/client";

type TxClient = Omit<Prisma.TransactionClient, Prisma.ITXClientDenyList>;

interface RestoreResourcesParams {
  ticketId: string | null;
  eventId: string;
  quantity: number;
  pointsUsed: number;
  voucherId: string | null;
  couponId: string | null;
  userId: string;
}

export async function restoreTicketAvailability(
  tx: TxClient,
  { ticketId, eventId, quantity }: Pick<RestoreResourcesParams, "ticketId" | "eventId" | "quantity">
): Promise<void> {
  if (ticketId) {
    await tx.ticket.update({
      where: { id: ticketId },
      data: { available: { increment: quantity } },
    });
    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { increment: quantity } },
    });
  } else {
    await tx.event.update({
      where: { id: eventId },
      data: { availableSeats: { increment: quantity } },
    });
  }
}

export async function restoreUserPoints(
  tx: TxClient,
  { userId, pointsUsed }: Pick<RestoreResourcesParams, "userId" | "pointsUsed">
): Promise<void> {
  if (pointsUsed > 0) {
    await tx.user.update({
      where: { id: userId },
      data: { points: { increment: pointsUsed } },
    });
  }
}

export async function restoreVoucher(
  tx: TxClient,
  { voucherId }: Pick<RestoreResourcesParams, "voucherId">,
): Promise<void> {
  if (voucherId) {
    await tx.voucher.updateMany({
      where: { id: voucherId, usedCount: { gt: 0 } },
      data: { usedCount: { decrement: 1 } },
    });
  }
}

export async function restoreCoupon(
  tx: TxClient,
  { couponId }: Pick<RestoreResourcesParams, "couponId">
): Promise<void> {
  if (couponId) {
    await tx.coupon.update({
      where: { id: couponId },
      data: { isActive: true },
    });
  }
}

export async function restoreAllResources(tx: TxClient, params: RestoreResourcesParams): Promise<void> {
  await Promise.all([
    restoreTicketAvailability(tx, params),
    restoreUserPoints(tx, params),
    restoreVoucher(tx, params),
    restoreCoupon(tx, params),
  ]);
}