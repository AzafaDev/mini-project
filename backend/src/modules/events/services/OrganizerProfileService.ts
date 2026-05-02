import { TransactionStatus } from "@prisma/client";
import type { PrismaClientType } from "../../../config/prisma";
import { AppError } from "../../../utils/AppError";
import { logger } from "../../../utils/logger";

export class OrganizerProfileService {
  constructor(private prisma: PrismaClientType) {}

  async calculateOrganizerRating(organizerId: string): Promise<{ rating: number; reviewCount: number }> {
    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: { reviews: true },
    });

    const allReviews = events.flatMap((e) => e.reviews);
    const reviewCount = allReviews.length;
    const rating =
      reviewCount > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
        : 0;

    return { rating, reviewCount };
  }

  async getOrganizerProfile({ organizerId }: { organizerId: string }) {
    const organizer = await this.prisma.user.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        fullName: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!organizer) throw new AppError("Organizer not found", 404);

    const events = await this.prisma.event.findMany({
      where: { organizerId },
      include: { reviews: true },
    });

    const { rating: organizerRating, reviewCount } = await this.calculateOrganizerRating(organizerId);

    const reviews = await this.prisma.review.findMany({
      where: {
        event: { organizerId },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    logger.debug("[OrganizerProfileService] getOrganizerProfile:", {
      organizerId,
      rating: organizerRating,
      reviewCount,
    });

    return {
      id: organizer.id,
      name: organizer.fullName,
      imageUrl: organizer.profilePicture,
      createdAt: organizer.createdAt,
      events: events.map((e) => ({
        id: e.id,
        name: e.name,
        imageUrl: e.imageUrl,
        location: e.location,
        category: e.category,
        startDate: e.startDate,
        endDate: e.endDate,
        price: e.price,
        availableSeats: e.availableSeats,
        totalSeats: e.totalSeats,
        reviewCount: e.reviews.length,
      })),
      rating: organizerRating,
      reviewCount,
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        createdAt: r.createdAt,
        userName: r.user.fullName,
        userImage: r.user.profilePicture,
        eventName: r.event.name,
      })),
    };
  }

  async getEventAttendees({
    eventId,
    organizerId,
  }: {
    eventId: string;
    organizerId: string;
  }) {
    if (!eventId) {
      throw new AppError("Event ID is required", 400);
    }

    if (!organizerId) {
      throw new AppError("Organizer ID is required", 400);
    }

    const event = await this.prisma.event.findFirst({
      where: { id: eventId, organizerId },
    });
    if (!event) {
      throw new AppError("Event not found or unauthorized", 404);
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        eventId,
        status: TransactionStatus.DONE,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
        ticket: {
          select: { type: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    logger.debug("[OrganizerProfileService] getEventAttendees:", {
      eventId,
      count: transactions.length,
    });

    return transactions.map((tx) => ({
      userId: tx.user.id,
      fullName: tx.user.fullName,
      email: tx.user.email,
      profilePicture: tx.user.profilePicture,
      ticketId: tx.ticketId,
      ticketName: tx.ticket?.type || "General Admission",
      quantity: tx.quantity,
      totalPrice: tx.finalPrice,
      purchaseDate: tx.paidAt || tx.createdAt,
      status: tx.status,
    }));
  }
}
