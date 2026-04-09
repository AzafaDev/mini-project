import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateEvent, UpdateEvent } from "./event.type";

export const eventService = {
  getAllEvents: async ({
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
  }): Promise<{
    data: any[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> => {
    const currentPage = Math.max(1, page || 1);
    const currentLimit = Math.max(1, Math.min(100, limit || 10));
    const currentSortBy = sortBy || "startDate";
    const currentSortOrder = sortOrder || "asc";

    const where: any = { isDeleted: false };
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

    // Build sort order
    const orderBy: any = {};
    const validSortFields = ["name", "startDate", "price", "createdAt"];
    if (validSortFields.includes(currentSortBy)) {
      orderBy[currentSortBy] = currentSortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.startDate = "asc"; // default sort
    }

    // Calculate pagination
    const skip = (currentPage - 1) * currentLimit;

    // Get total count for pagination
    const total = await prisma.event.count({ where });

    const events = await prisma.event.findMany({
      where,
      orderBy,
      skip,
      take: currentLimit,
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
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
  },

  getEventById: async ({ id }: { id: string }) => {
    const now = new Date();
    const event = await prisma.event.findUnique({
      where: { id, isDeleted: false },
      include: {
        organizer: {
          select: {
            id: true,
            fullName: true,
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
    const averageRating =
      event.reviews.length > 0
        ? event.reviews.reduce((sum, r) => sum + r.rating, 0) /
          event.reviews.length
        : 0;
    return { ...event, averageRating };
  },

  createEvent: async ({
    name,
    description,
    location,
    category,
    startDate,
    endDate,
    totalSeats,
    price,
    availableSeats,
    imageUrl,
    organizerId,
  }: CreateEvent) => {
    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        location,
        category,
        startDate,
        endDate,
        totalSeats,
        price,
        availableSeats: availableSeats ?? totalSeats,
        imageUrl,
        organizer: {
          connect: { id: organizerId },
        },
      },
    });
    return newEvent;
  },

  updateEvent: async ({
    id,
    name,
    description,
    location,
    category,
    startDate,
    endDate,
    totalSeats,
    availableSeats,
    price,
    imageUrl,
  }: UpdateEvent) => {
    // Build update data with only provided fields
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (location !== undefined) data.location = location;
    if (category !== undefined) data.category = category;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    if (totalSeats !== undefined) data.totalSeats = Number(totalSeats);
    if (availableSeats !== undefined)
      data.availableSeats = Number(availableSeats);
    if (price !== undefined) data.price = Number(price);
    if (imageUrl !== undefined) data.imageUrl = imageUrl;

    const updatedEvent = await prisma.event.update({
      where: { id, isDeleted: false },
      data,
    });
    return updatedEvent;
  },

  deleteEvent: async ({ id, userId }: { id: string; userId: string }) => {
    // Check if event exists and user is the organizer
    const event = await prisma.event.findUnique({
      where: { id, organizerId: userId, isDeleted: false },
    });
    if (!event) throw new AppError("Event not found", 404);

    // Soft delete: set isDeleted = true, deletedAt = now(), deletedBy = userId
    const deletedEvent = await prisma.event.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return deletedEvent;
  },
  getMyEvents: async ({ id }: { id: string }) => {
    const events = await prisma.event.findMany({
      where: {
        organizerId: id,
        isDeleted: false,
      },
    });
    return events;
  },
};
