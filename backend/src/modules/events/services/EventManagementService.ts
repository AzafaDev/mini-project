import type { PrismaClientType } from "../../../config/prisma";
import { AppError } from "../../../utils/AppError";
import { parseDate, parseNumber } from "../../../utils/parseHelpers";
import { logger } from "../../../utils/logger";
import { CreateEvent } from "../event.type";

export class EventManagementService {
  constructor(private prisma: PrismaClientType) {}

  async createEvent({
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
  }: CreateEvent) {
    if (
      !name?.trim() ||
      !description?.trim() ||
      !location?.trim() ||
      !category?.trim()
    ) {
      throw new AppError("All fields are required", 400);
    }

    const parsedStartDate =
      typeof startDate === "string"
        ? parseDate(startDate, "startDate")
        : startDate;
    const parsedEndDate =
      typeof endDate === "string" ? parseDate(endDate, "endDate") : endDate;

    if (parsedStartDate > parsedEndDate) {
      throw new AppError("startDate must be before endDate", 400);
    }

    const parsedTotalSeats = parseNumber(totalSeats, "totalSeats");
    let parsedPrice = parseNumber(price, "price");

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

      const minTicketPrice = Math.min(...tickets.map((t) => t.price));
      parsedPrice = minTicketPrice;
    }

    const newEvent = await this.prisma.$transaction(async (tx) => {
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

      if (tickets && tickets.length > 0) {
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
        await tx.ticket.create({
          data: {
            eventId: event.id,
            type: "GENERAL",
            price: parsedPrice,
            quantity: eventTotalSeats,
            available: eventAvailableSeats,
          },
        });
      }

      return event;
    });

    return newEvent;
  }

  async deleteEvent({ id, userId }: { id: string; userId: string }) {
    const event = await this.prisma.event.findUnique({
      where: { id, organizerId: userId, isDeleted: false },
    });

    if (!event) throw new AppError("Event not found", 404);

    const deletedEvent = await this.prisma.event.update({
      where: { id, isDeleted: false },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: userId,
      },
    });

    return deletedEvent;
  }
}
