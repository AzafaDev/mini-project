import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export const reviewService = {
  // Buat review untuk event
  createReview: async ({
    userId,
    eventId,
    rating,
    comment,
  }: {
    userId: string;
    eventId: string;
    rating: number;
    comment?: string;
  }) => {
    console.log("[DEBUG Review Service] createReview input:", { userId, eventId, rating, comment });

    const event = await prisma.event.findUnique({
      where: { id: eventId, isDeleted: false },
    });

    console.log("[DEBUG Review Service] event found:", !!event);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Validasi: user harus sudah membeli tiket event ini
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        status: "DONE",
      },
    });

    console.log("[DEBUG Review Service] existing transaction:", !!existingTransaction);

    if (!existingTransaction) {
      throw new AppError("You must purchase a ticket for this event before reviewing", 400);
    }

    // Validasi: user hanya boleh membuat 1 review per event
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    console.log("[DEBUG Review Service] existing review:", !!existingReview);

    if (existingReview) {
      throw new AppError("You have already reviewed this event", 400);
    }

    const review = await prisma.review.create({
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

    console.log("[DEBUG Review Service] review created:", review.id);

    return review;
  },

  updateReview: async ({
    id,
    userId,
    rating,
    comment,
  }: {
    id: string;
    userId: string;
    rating: number;
    comment?: string;
  }) => {
    console.log("[DEBUG Review Service] updateReview input:", { id, userId, rating, comment });

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    console.log("[DEBUG Review Service] existing review found:", !!existingReview);

    if (!existingReview) {
      throw new AppError("Review not found", 404);
    }

    if (existingReview.userId !== userId) {
      throw new AppError("You can only update your own reviews", 403);
    }

    const review = await prisma.review.update({
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

    console.log("[DEBUG Review Service] review updated:", review.id);

    return review;
  },

  deleteReview: async ({ id, userId }: { id: string; userId: string }) => {
    console.log("[DEBUG Review Service] deleteReview input:", { id, userId });

    const existingReview = await prisma.review.findUnique({
      where: { id },
    });

    console.log("[DEBUG Review Service] existing review found:", !!existingReview);

    if (!existingReview) {
      throw new AppError("Review not found", 404);
    }

    if (existingReview.userId !== userId) {
      throw new AppError("You can only delete your own reviews", 403);
    }

    await prisma.review.delete({
      where: { id },
    });

    console.log("[DEBUG Review Service] review deleted:", id);

    return { success: true };
  },

  // Ambil semua review untuk event tertentu dengan pagination
  getEventReviews: async ({
    eventId,
    page = 1,
    limit = 10,
  }: {
    eventId: string;
    page?: number;
    limit?: number;
  }) => {
    console.log("[DEBUG Review Service] getEventReviews input:", { eventId, page, limit });

    const skip = (page - 1) * limit;

    // Jalankan query count dan findMany secara paralel
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
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
      prisma.review.count({ where: { eventId } }),
    ]);

    console.log("[DEBUG Review Service] getEventReviews result:", { count: reviews.length, total });

    return { data: reviews, pagination: { total, page, limit } };
  },
};
