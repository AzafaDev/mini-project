import { TransactionStatus } from "@prisma/client";
import type { PrismaClientType } from "../../../config/prisma";
import { AppError } from "../../../utils/AppError";
import { logger } from "../../../utils/logger";

export class TransactionQueryService {
  constructor(private prisma: PrismaClientType) {}

  async getTransactionById({ id }: { id: string }) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
        ticket: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  async getUserTransactions({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          userId: true,
          eventId: true,
          ticketId: true,
          quantity: true,
          totalPrice: true,
          discount: true,
          pointsUsed: true,
          couponId: true,
          voucherId: true,
          finalPrice: true,
          status: true,
          paymentProof: true,
          paymentProofUploadedAt: true,
          paidAt: true,
          expiresAt: true,
          autoCancelAt: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              location: true,
              startDate: true,
              endDate: true,
            },
          },
          ticket: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { userId } }),
    ]);

    return { data: transactions, pagination: { total, page, limit } };
  }

  async getEventTransactions({
    eventId,
    page = 1,
    limit = 10,
  }: {
    eventId: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { eventId },
        select: {
          id: true,
          userId: true,
          eventId: true,
          ticketId: true,
          quantity: true,
          totalPrice: true,
          discount: true,
          pointsUsed: true,
          couponId: true,
          voucherId: true,
          finalPrice: true,
          status: true,
          paymentProof: true,
          paymentProofUploadedAt: true,
          paidAt: true,
          expiresAt: true,
          autoCancelAt: true,
          createdAt: true,
          user: { select: { id: true, fullName: true, email: true } },
          ticket: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { eventId } }),
    ]);

    return { data: transactions, pagination: { total, page, limit } };
  }

  async getOrganizerTransactions({
    organizerId,
    page = 1,
    limit = 100,
  }: {
    organizerId: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const organizerEvents = await this.prisma.event.findMany({
      where: { organizerId },
      select: { id: true },
    });

    const eventIds = organizerEvents.map((e) => e.id);

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where: { eventId: { in: eventIds } },
        select: {
          id: true,
          userId: true,
          eventId: true,
          ticketId: true,
          quantity: true,
          totalPrice: true,
          discount: true,
          pointsUsed: true,
          couponId: true,
          voucherId: true,
          finalPrice: true,
          status: true,
          paymentProof: true,
          paymentProofUploadedAt: true,
          paidAt: true,
          expiresAt: true,
          autoCancelAt: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              location: true,
              startDate: true,
              endDate: true,
            },
          },
          user: { select: { id: true, fullName: true, email: true } },
          ticket: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.transaction.count({ where: { eventId: { in: eventIds } } }),
    ]);

    return { data: transactions, pagination: { total, page, limit } };
  }

  async hasUserPurchased({
    userId,
    eventId,
  }: {
    userId: string;
    eventId: string;
  }) {
    const count = await this.prisma.transaction.count({
      where: {
        userId,
        eventId,
        status: TransactionStatus.DONE,
      },
    });
    return count > 0;
  }
}
