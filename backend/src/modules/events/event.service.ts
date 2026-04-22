import { prisma } from "../../config/prisma";
import { Prisma } from "@prisma/client";
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
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
    console.log("[DEBUG Event Service] getAllEvents input:", { search, category, location, startDate, endDate, minPrice, maxPrice, page, limit, sortBy, sortOrder });

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

    console.log("[DEBUG Event Service] getAllEvents where clause:", JSON.stringify(where));

    const orderBy: Prisma.EventOrderByWithRelationInput = {};
    const validSortFields = ["name", "startDate", "price", "createdAt"];
    if (validSortFields.includes(currentSortBy)) {
      orderBy[currentSortBy] = currentSortOrder === "desc" ? "desc" : "asc";
    } else {
      orderBy.startDate = "asc";
    }

    const skip = (currentPage - 1) * currentLimit;
    const total = await prisma.event.count({ where });

    console.log("[DEBUG Event Service] getAllEvents total count:", total);

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
            email: true,
            profilePicture: true,
          },
        },
        tickets: true,
      },
    });

    console.log("[DEBUG Event Service] getAllEvents fetched events:", events.length);
    console.log("[DEBUG] Event tickets:", events.map(e => ({ id: e.id, name: e.name, tickets: e.tickets.map(t => ({ type: t.type, price: t.price })) })));

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
    console.log("[DEBUG Event Service] getEventById input:", { id });

    const now = new Date();
    const event = await prisma.event.findUnique({
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

    console.log("[DEBUG Event Service] getEventById result:", !!event);
    console.log("[DEBUG] Event tickets:", event?.tickets.map(t => ({ id: t.id, type: t.type, price: t.price })));

    if (!event) throw new AppError("Event not found", 404);
    const averageRating =
      event.reviews.length > 0
        ? event.reviews.reduce((sum, r) => sum + r.rating, 0) /
          event.reviews.length
        : 0;

    const organizerEvents = await prisma.event.findMany({
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

    // Transform reviews to flatten user data
    const transformedReviews = event.reviews.map((r) => ({
      ...r,
      userId: r.user?.id,
      userName: r.user?.fullName,
      userImage: r.user?.profilePicture,
      user: undefined,
    }));

    return { ...event, reviews: transformedReviews, averageRating, organizer: transformedOrganizer };
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
    tickets,
  }: CreateEvent) => {
    console.log("[DEBUG Event Service] createEvent input:", { name, description, location, category, totalSeats, price, availableSeats, organizerId, hasImage: !!imageUrl, hasTickets: !!tickets });

    if (!name?.trim() || !description?.trim() || !location?.trim() || !category?.trim()) {
      throw new AppError("All fields are required", 400);
    }

    const parsedStartDate = typeof startDate === 'string' ? parseDate(startDate, "startDate") : startDate;
    const parsedEndDate = typeof endDate === 'string' ? parseDate(endDate, "endDate") : endDate;

    console.log("[DEBUG Event Service] createEvent parsed dates:", { parsedStartDate, parsedEndDate });

    if (parsedStartDate > parsedEndDate) {
      throw new AppError("startDate must be before endDate", 400);
    }

    const parsedTotalSeats = parseNumber(totalSeats, "totalSeats");
    const parsedPrice = parseNumber(price, "price");

    let eventTotalSeats = parsedTotalSeats;
    let eventAvailableSeats = availableSeats
      ? parseNumber(availableSeats, "availableSeats")
      : parsedTotalSeats;

    if (tickets && tickets.length > 0) {
      if (tickets.length > 2) {
        throw new AppError("Maximum 2 ticket types allowed per event", 400);
      }

      const ticketTypes = tickets.map((t) => t.type);
      const uniqueTypes = new Set(ticketTypes);
      if (uniqueTypes.size !== ticketTypes.length) {
        throw new AppError("Duplicate ticket types not allowed", 400);
      }

      for (const ticket of tickets) {
        if (ticket.type !== "GENERAL" && ticket.type !== "VIP") {
          throw new AppError("Ticket type must be GENERAL or VIP", 400);
        }
      }

      eventTotalSeats = tickets.reduce((sum, t) => sum + t.quantity, 0);
      eventAvailableSeats = eventTotalSeats;
    }

    console.log("[DEBUG Event Service] createEvent parsed numbers:", { eventTotalSeats, parsedPrice, eventAvailableSeats });

    console.log("[DEBUG Event Service] creating event in DB with $transaction");
    
    const newEvent = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name,
          description,
          location,
          category,
          startDate: parsedStartDate,
          endDate: parsedEndDate,
          totalSeats: eventTotalSeats,
          price: parsedPrice,
          availableSeats: eventAvailableSeats,
          imageUrl,
          organizer: {
            connect: { id: organizerId },
          },
        },
      });

      console.log("[DEBUG Event Service] createEvent success, eventId:", event.id);

      if (tickets && tickets.length > 0) {
        console.log("[DEBUG Event Service] creating custom tickets");
        for (const ticket of tickets) {
          await tx.ticket.create({
            data: {
              eventId: event.id,
              type: ticket.type,
              price: ticket.price,
              quantity: ticket.quantity,
              available: ticket.quantity,
            },
          });
        }
      } else {
        console.log("[DEBUG Event Service] creating default GENERAL ticket");
        await tx.ticket.create({
          data: {
            eventId: event.id,
            type: 'GENERAL',
            price: parsedPrice,
            quantity: eventTotalSeats,
            available: eventAvailableSeats,
          },
        });
      }

      return event;
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
    console.log("[DEBUG Event Service] updateEvent input:", { id, name, description, location, category, totalSeats, availableSeats, price, hasImage: !!imageUrl });

    const existingEvent = await prisma.event.findUnique({
      where: { id, isDeleted: false },
    });
    console.log("[DEBUG Event Service] updateEvent existingEvent:", !!existingEvent);

    if (!existingEvent) throw new AppError("Event not found", 404);

    const data: Prisma.EventUpdateInput = {};

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
      const newTotalSeats = parseNumber(totalSeats, "totalSeats");

      const soldResult = await prisma.transaction.aggregate({
        where: { eventId: id, status: "DONE" },
        _sum: { quantity: true },
      });
      const sold = soldResult._sum.quantity || 0;

      const newAvailableSeats = Math.max(0, newTotalSeats - sold);

      data.totalSeats = newTotalSeats;
      data.availableSeats = newAvailableSeats;
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

    console.log("[DEBUG Event Service] updateEvent data to update:", data);

    const updatedEvent = await prisma.event.update({
      where: { id, isDeleted: false },
      data,
    });

    console.log("[DEBUG Event Service] updateEvent success, eventId:", updatedEvent.id);

    return updatedEvent;
  },

  deleteEvent: async ({ id, userId }: { id: string; userId: string }) => {
    console.log("[DEBUG Event Service] deleteEvent input:", { id, userId });

    const event = await prisma.event.findUnique({
      where: { id, organizerId: userId, isDeleted: false },
    });

    console.log("[DEBUG Event Service] deleteEvent event found:", !!event);

    if (!event) throw new AppError("Event not found", 404);

    console.log("[DEBUG Event Service] soft deleting event in DB");
    const deletedEvent = await prisma.event.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    console.log("[DEBUG Event Service] deleteEvent success");

    return deletedEvent;
  },

  getMyEvents: async ({ id }: { id: string }) => {
    console.log("[DEBUG Event Service] getMyEvents input:", { id });

    const events = await prisma.event.findMany({
      where: {
        organizerId: id,
        isDeleted: false,
      },
    });

    const eventsWithSold = await Promise.all(
      events.map(async (event) => {
        const transactions = await prisma.transaction.aggregate({
          where: { eventId: event.id, status: "DONE" },
          _sum: { quantity: true },
        });
        return {
          ...event,
          sold: transactions._sum.quantity || 0,
        };
      })
    );

    console.log("[DEBUG Event Service] getMyEvents result count:", eventsWithSold.length);

    return eventsWithSold;
  },

  getEventStats: async ({ id, organizerId }: { id: string; organizerId: string }) => {
    console.log("[DEBUG Event Service] getEventStats input:", { id, organizerId });

    const event = await prisma.event.findUnique({
      where: { id: id, organizerId: organizerId, isDeleted: false },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const transactions = await prisma.transaction.findMany({
      where: { eventId: id, status: "DONE" },
    });

    const totalRevenue = transactions.reduce((sum, tx) => sum + tx.finalPrice, 0);
    const totalTicketsSold = transactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const attendeeCount = transactions.length;

    console.log("[DEBUG Event Service] getEventStats result:", { totalRevenue, totalTicketsSold, attendeeCount });

    return {
      totalRevenue,
      totalTicketsSold,
      attendeeCount,
      eventName: event.name,
    };
  },

  getOrganizerStats: async ({ organizerId, year, month, day }: { organizerId: string; year?: number; month?: number; day?: number }) => {
    console.log("[DEBUG Event Service] getOrganizerStats input:", { organizerId, year, month, day });

    const currentYear = year || new Date().getFullYear();
    const currentMonth = month;
    const currentDay = day;

    // Get all events by this organizer (not just the selected year)
    const allOrganizerEvents = await prisma.event.findMany({
      where: {
        organizerId,
        isDeleted: false,
      },
      select: { id: true, startDate: true, endDate: true },
    });

    const allEventIds = allOrganizerEvents.map(e => e.id);

    // Get all transactions for these events
    const allTransactions = await prisma.transaction.findMany({
      where: {
        eventId: { in: allEventIds },
        status: "DONE",
      },
    });

    // Calculate totals based on selected period
    let filteredTransactions = allTransactions;
    if (currentYear && currentMonth && currentDay) {
      // Specific day
      filteredTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getDate() === currentDay &&
               (txDate.getMonth() + 1) === currentMonth &&
               txDate.getFullYear() === currentYear;
      });
    } else if (currentYear && currentMonth) {
      // Specific month
      filteredTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return (txDate.getMonth() + 1) === currentMonth &&
               txDate.getFullYear() === currentYear;
      });
    } else if (currentYear) {
      // Specific year
      filteredTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === currentYear;
      });
    }

    const totalRevenue = filteredTransactions.reduce((sum, tx) => sum + tx.finalPrice, 0);
    const totalTicketsSold = filteredTransactions.reduce((sum, tx) => sum + tx.quantity, 0);
    const totalAttendees = filteredTransactions.length;

    // Calculate total events (filtered by period if needed)
    let filteredEvents = allOrganizerEvents;
    if (currentYear && currentMonth) {
      filteredEvents = allOrganizerEvents.filter(e => {
        const startDate = new Date(e.startDate);
        return startDate.getFullYear() === currentYear && (startDate.getMonth() + 1) === currentMonth;
      });
    } else if (currentYear) {
      filteredEvents = allOrganizerEvents.filter(e => {
        const startDate = new Date(e.startDate);
        return startDate.getFullYear() === currentYear;
      });
    }
    const totalEvents = filteredEvents.length;

    // Monthly stats (for current year)
    const monthlyStats: { month: string; revenue: number; tickets: number }[] = [];
    const yearTransactions = allTransactions.filter(tx => {
      const txDate = new Date(tx.createdAt);
      return txDate.getFullYear() === currentYear;
    });

    for (let m = 1; m <= 12; m++) {
      const monthTransactions = yearTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getMonth() + 1 === m;
      });

      monthlyStats.push({
        month: MONTH_NAMES[m - 1],
        revenue: monthTransactions.reduce((sum, tx) => sum + tx.finalPrice, 0),
        tickets: monthTransactions.reduce((sum, tx) => sum + tx.quantity, 0),
      });
    }

    // Daily stats (for current month if selected)
    const dailyStats: { day: string; revenue: number; tickets: number }[] = [];
    if (currentMonth) {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const monthTransactions = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return (txDate.getMonth() + 1) === currentMonth && txDate.getFullYear() === currentYear;
      });

      for (let d = 1; d <= daysInMonth; d++) {
        const dayTransactions = monthTransactions.filter(tx => {
          const txDate = new Date(tx.createdAt);
          return txDate.getDate() === d;
        });

        dailyStats.push({
          day: String(d),
          revenue: dayTransactions.reduce((sum, tx) => sum + tx.finalPrice, 0),
          tickets: dayTransactions.reduce((sum, tx) => sum + tx.quantity, 0),
        });
      }
    }

    // Yearly stats (last 5 years)
    const yearlyStats: { year: number; revenue: number; tickets: number }[] = [];
    const currentFullYear = new Date().getFullYear();
    for (let y = currentFullYear - 4; y <= currentFullYear; y++) {
      const yearTransactionsData = allTransactions.filter(tx => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === y;
      });

      yearlyStats.push({
        year: y,
        revenue: yearTransactionsData.reduce((sum, tx) => sum + tx.finalPrice, 0),
        tickets: yearTransactionsData.reduce((sum, tx) => sum + tx.quantity, 0),
      });
    }

    console.log("[DEBUG Event Service] getOrganizerStats result:", { 
      totalRevenue, 
      totalTicketsSold, 
      totalEvents, 
      totalAttendees, 
      monthlyStats: monthlyStats.length, 
      dailyStats: dailyStats.length,
      yearlyStats: yearlyStats.length 
    });

    return {
      totalRevenue,
      totalTicketsSold,
      totalEvents,
      totalAttendees,
      monthlyStats,
      dailyStats,
      yearlyStats,
    };
  },

  getOrganizerProfile: async ({ organizerId }: { organizerId: string }) => {
    console.log("[DEBUG Event Service] getOrganizerProfile input:", { organizerId });

    const organizer = await prisma.user.findUnique({
      where: { id: organizerId },
      select: {
        id: true,
        fullName: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!organizer) throw new AppError("Organizer not found", 404);

    // Get all events by this organizer
    const events = await prisma.event.findMany({
      where: { organizerId, isDeleted: false },
      include: {
        reviews: true,
      },
    });

    // Calculate rating from all reviews
    const allReviews = events.flatMap((e) => e.reviews);
    const organizerRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;
    const reviewCount = allReviews.length;

    // Get reviews with user details for the profile
    const reviews = await prisma.review.findMany({
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

    console.log("[DEBUG Event Service] getOrganizerProfile result:", {
      organizerName: organizer.fullName,
      eventCount: events.length,
      reviewCount,
      organizerRating,
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
  },
  getEventAttendees: async ({ eventId, organizerId }: { eventId: string; organizerId: string }) => {
    console.log("[DEBUG Event Service] getEventAttendees input:", { eventId, organizerId });

    if (!eventId) {
      throw new AppError("Event ID is required", 400);
    }

    if (!organizerId) {
      throw new AppError("Organizer ID is required", 400);
    }

    const event = await prisma.event.findFirst({
      where: { id: eventId, organizerId, isDeleted: false },
    });

    if (!event) {
      throw new AppError("Event not found or unauthorized", 404);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        eventId,
        status: "DONE",
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[DEBUG Event Service] getEventAttendees result count:", transactions.length);

    return transactions.map((tx) => ({
      userId: tx.user.id,
      userName: tx.user.fullName,
      userEmail: tx.user.email,
      quantity: tx.quantity,
      totalPrice: tx.finalPrice,
      status: tx.status,
    }));
  },
};