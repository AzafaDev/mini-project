import { TransactionStatus } from "@prisma/client";
import type { PrismaClientType } from "../../config/prisma";
import { prisma as prismaClient } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";

export class ReviewService {
  constructor(private prisma: PrismaClientType) {}

  async createReview({
    userId,
    eventId,
    rating,
    comment,
  }: {
    userId: string;
    eventId: string;
    rating: number;
    comment?: string;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const existingTransaction = await this.prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: TransactionStatus.DONE,
      },
    });

    if (!existingTransaction) {
      throw new AppError("You must purchase a ticket for this event before reviewing", 400);
    }

    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingReview) {
      throw new AppError("You have already reviewed this event", 400);
    }

    const review = await this.prisma.review.create({
      data: {
        userId,
        eventId,
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    logger.debug("[ReviewService] createReview:", { reviewId: review.id });

    return review;
  }

  async updateReview({
    id,
    userId,
    rating,
    comment,
  }: {
    id: string;
    userId: string;
    rating: number;
    comment?: string;
  }) {
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new AppError("Review not found", 404);
    }

    if (existingReview.userId !== userId) {
      throw new AppError("You can only update your own reviews", 403);
    }

    const review = await this.prisma.review.update({
      where: { id },
      data: {
        rating,
        comment,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            profilePicture: true,
          },
        },
      },
    });

    logger.debug("[ReviewService] updateReview:", { reviewId: review.id });

    return review;
  }

  async deleteReview({ id, userId }: { id: string; userId: string }) {
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new AppError("Review not found", 404);
    }

    if (existingReview.userId !== userId) {
      throw new AppError("You can only delete your own reviews", 403);
    }

    await this.prisma.review.delete({
      where: { id },
    });

    logger.debug("[ReviewService] deleteReview:", { reviewId: id });

    return { success: true };
  }

  async getEventReviews({
    eventId,
    page = 1,
    limit = 10,
  }: {
    eventId: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { eventId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              profilePicture: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.review.count({ where: { eventId } }),
    ]);

    logger.debug("[ReviewService] getEventReviews:", { eventId, count: reviews.length, total });

    return { data: reviews, pagination: { total, page, limit } };
  }
}

export const reviewService = new ReviewService(prismaClient);
