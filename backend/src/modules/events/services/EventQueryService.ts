import { Prisma } from "@prisma/client";
import type { PrismaClientType } from "../../../config/prisma";
import { AppError } from "../../../utils/AppError";
import { logger } from "../../../utils/logger";

export class EventQueryService {
  constructor(private prisma: PrismaClientType) {}

  async getAllEvents({
    search,
    category,
    location,
    startDate,
    endDate,
    minPrice,
    maxPrice,
    page,
    limit,
    sortBy,
    sortOrder,
    includePast = false,
  }: {
    search?: string;
    category?: string;
    location?: string;
    startDate?: string;
    endDate?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    includePast?: boolean;
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const currentPage = Math.max(1, page || 1);
    const currentLimit = Math.max(1, Math.min(100, limit || 10));
    const currentSortBy = sortBy || "startDate";
    const currentSortOrder = sortOrder || "asc";

    const where: Prisma.EventWhereInput = { isDeleted: false };
    if (search)
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    if (category) where.category = category;
    if (location) where.location = { contains: location, mode: "insensitive" };
    if (startDate || endDate) {
      where.startDate = {};
      if (startDate) where.startDate.gte = new Date(startDate);
      if (endDate) where.startDate.lte = new Date(endDate);
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }
    if (!includePast) {
      where.endDate = { gte: new Date() };
    }

    const orderBy: Prisma.EventOrderByWithRelationInput = {};
    const validSortFields = ["name", "startDate", "price", "createdAt"];
    if (validSortFields.includes(currentSortBy)) {
      if (currentSortBy === "name") orderBy.name = currentSortOrder === "desc" ? "desc" : "asc";
      else if (currentSortBy === "startDate") orderBy.startDate = currentSortOrder === "desc" ? "desc" : "asc";
      else if (currentSortBy === "price") orderBy.price = currentSortOrder === "desc" ? "desc" : "asc";
      else if (currentSortBy === "createdAt") orderBy.createdAt = currentSortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.startDate = "asc";
    }

    const skip = (currentPage - 1) * currentLimit;
    const total = await this.prisma.event.count({ where });

    const events = await this.prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: currentLimit,
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
        tickets: true,
      },
    });

    return {
      data: events,
      pagination: {
        page: currentPage,
        limit: currentLimit,
        total,
        totalPages: Math.ceil(total / currentLimit),
      },
    };
  }

  async getEventById({ id }: { id: string }) {
    const now = new Date();
    const event = await this.prisma.event.findUnique({
      where: { id, isDeleted: false },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
            email: true,
            profilePicture: true,
          },
        },
        tickets: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
        vouchers: {
          where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
        },
      },
    });

    if (!event) throw new AppError("Event not found", 404);

    event.vouchers = event.vouchers.filter(v =>
      v.maxUsage === null || v.usedCount < v.maxUsage
    );

    const averageRating =
      event.reviews.length > 0
        ? event.reviews.reduce((sum, r) => sum + r.rating, 0) /
          event.reviews.length
        : 0;

    const organizerEvents = await this.prisma.event.findMany({
      where: { organizerId: event.organizerId, isDeleted: false },
      include: {
        reviews: true,
      },
    });

    const allReviews = organizerEvents.flatMap((e) => e.reviews);
    const organizerRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;
    const reviewCount = allReviews.length;

    const transformedOrganizer = {
      id: event.organizer.id,
      name: event.organizer.fullName,
      imageUrl: event.organizer.profilePicture,
      rating: organizerRating,
      reviewCount: reviewCount,
    };

    const transformedReviews = event.reviews.map((r) => ({
      ...r,
      userId: r.user?.id,
      userName: r.user?.fullName,
      userImage: r.user?.profilePicture,
      user: undefined,
    }));

    return {
      ...event,
      reviews: transformedReviews,
      averageRating,
      organizer: transformedOrganizer,
    };
  }

  async getMyEvents({ id }: { id: string }) {
    const events = await this.prisma.event.findMany({
      where: {
        organizerId: id,
        isDeleted: false,
      },
    });

    const eventsWithSold = await Promise.all(
      events.map(async (event) => {
        const transactions = await this.prisma.transaction.aggregate({
          where: { eventId: event.id, status: "DONE" },
          _sum: { quantity: true },
        });
        return {
          ...event,
          sold: transactions._sum.quantity || 0,
        };
      }),
    );

    return eventsWithSold;
  }
}
