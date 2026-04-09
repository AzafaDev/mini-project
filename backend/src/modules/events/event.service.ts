import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";
import { CreateEvent, UpdateEvent } from "./event.type";

const parseDate = (dateStr: string, fieldName: string): Date => {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new AppError(`Invalid date format for ${fieldName}`, 400);
  }
  return date;
};

const parseNumber = (value: any, fieldName: string): number => {
  const num = Number(value);
  if (isNaN(num)) {
    throw new AppError(`Invalid numeric value for ${fieldName}`, 400);
  }
  return num;
};

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

    const orderBy: any = {};
    const validSortFields = ["name", "startDate", "price", "createdAt"];
    if (validSortFields.includes(currentSortBy)) {
      orderBy[currentSortBy] = currentSortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.startDate = "asc";
    }

    const skip = (currentPage - 1) * currentLimit;
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
    if (!name?.trim() || !description?.trim() || !location?.trim() || !category?.trim()) {
      throw new AppError("All fields are required", 400);
    }

    const parsedStartDate = typeof startDate === 'string' ? parseDate(startDate, "startDate") : startDate;
    const parsedEndDate = typeof endDate === 'string' ? parseDate(endDate, "endDate") : endDate;

    if (parsedStartDate > parsedEndDate) {
      throw new AppError("startDate must be before endDate", 400);
    }

    const parsedTotalSeats = parseNumber(totalSeats, "totalSeats");
    const parsedPrice = parseNumber(price, "price");

    const fixedAvailableSeats = availableSeats
      ? parseNumber(availableSeats, "availableSeats")
      : parsedTotalSeats;

    const newEvent = await prisma.event.create({
      data: {
        name,
        description,
        location,
        category,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        totalSeats: parsedTotalSeats,
        price: parsedPrice,
        availableSeats: fixedAvailableSeats,
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
    const existingEvent = await prisma.event.findUnique({
      where: { id, isDeleted: false },
    });
    if (!existingEvent) throw new AppError("Event not found", 404);

    const data: any = {};

    if (name !== undefined) {
      if (!name.trim()) throw new AppError("Name cannot be empty", 400);
      data.name = name;
    }
    if (description !== undefined) {
      if (!description.trim()) throw new AppError("Description cannot be empty", 400);
      data.description = description;
    }
    if (location !== undefined) {
      if (!location.trim()) throw new AppError("Location cannot be empty", 400);
      data.location = location;
    }
    if (category !== undefined) {
      if (!category.trim()) throw new AppError("Category cannot be empty", 400);
      data.category = category;
    }

    if (startDate !== undefined || endDate !== undefined) {
      const parsedStart = startDate ? (typeof startDate === 'string' ? parseDate(startDate, "startDate") : startDate) : existingEvent.startDate;
      const parsedEnd = endDate ? (typeof endDate === 'string' ? parseDate(endDate, "endDate") : endDate) : existingEvent.endDate;
      if (parsedStart > parsedEnd) {
        throw new AppError("startDate must be before endDate", 400);
      }
      data.startDate = parsedStart;
      data.endDate = parsedEnd;
    }

    if (totalSeats !== undefined) {
      data.totalSeats = parseNumber(totalSeats, "totalSeats");
    }
    if (availableSeats !== undefined) {
      data.availableSeats = parseNumber(availableSeats, "availableSeats");
    }
    if (price !== undefined) {
      data.price = parseNumber(price, "price");
    }

    if (imageUrl !== undefined) {
      data.imageUrl = imageUrl;
    }

    const updatedEvent = await prisma.event.update({
      where: { id, isDeleted: false },
      data,
    });
    return updatedEvent;
  },

  deleteEvent: async ({ id, userId }: { id: string; userId: string }) => {
    const event = await prisma.event.findUnique({
      where: { id, organizerId: userId, isDeleted: false },
    });
    if (!event) throw new AppError("Event not found", 404);

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
