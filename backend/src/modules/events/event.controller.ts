import { Request, Response } from "express";
import { getUploadUrl } from "../../utils/uploadHelper";
import { UploadedFile } from "express-fileupload";
import { CreateEvent } from "./event.type";
import { AuthRequest } from "../auth/auth.type";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";
import {
  eventQueryService,
  eventManagementService,
  eventStatsService,
  organizerProfileService,
} from "./services";

export const eventController = {
  getAllEvents: catchAsync(async (req: Request, res: Response) => {
    const {
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
      includePast,
    } = req.query;

    const { data, pagination } = await eventQueryService.getAllEvents({
      search: search as string,
      category: category as string,
      location: location as string,
      startDate: startDate as string,
      endDate: endDate as string,
      minPrice: minPrice as string,
      maxPrice: maxPrice as string,
      page: Number(page),
      limit: Number(limit),
      sortBy: sortBy as string,
      sortOrder: sortOrder as string,
      includePast: includePast === "true",
    });

    res.status(200).json({ success: true, data, pagination });
  }),

  getEventById: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const event = await eventQueryService.getEventById({ id: id as string });
    res.status(200).json({ success: true, data: event });
  }),

  createEvent: catchAsync<AuthRequest>(async (req, res) => {
    const {
      name,
      description,
      location,
      category,
      startDate,
      endDate,
      totalSeats,
      price,
      availableSeats,
      tickets,
    } = req.body as CreateEvent;

    const organizerId = req.userId;
    if (!organizerId) {
      throw new AppError("Unauthorized", 401);
    }

    if (!req.files || !req.files.imageFile) {
      throw new AppError("Event image is required", 400);
    }

    const imageUrl = await getUploadUrl(req.files.imageFile as UploadedFile, "events-image");

    let parsedTickets: { type: 'GENERAL' | 'VIP'; price: number; quantity: number }[] | undefined;
    if (tickets) {
      if (typeof tickets === 'string') {
        try {
          parsedTickets = JSON.parse(tickets);
        } catch (e) {
          throw new AppError("Invalid JSON format for tickets field", 400);
        }
      } else {
        parsedTickets = tickets as unknown as { type: 'GENERAL' | 'VIP'; price: number; quantity: number }[];
      }
    }

    const event = await eventManagementService.createEvent({
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
      tickets: parsedTickets,
    });

    logger.debug("[EventController] createEvent success:", event.id);

    res.status(201).json({
      success: true,
      message: "Created event successfully",
      data: event,
    });
  }),

  deleteEvent: catchAsync<AuthRequest>(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    await eventManagementService.deleteEvent({ id: id as string, userId });

    res.status(200).json({
      success: true,
      message: "Deleted event successfully",
    });
  }),

  getMyEvents: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const events = await eventQueryService.getMyEvents({ id: userId });

    res.status(200).json({ success: true, data: events });
  }),

  getEventStats: catchAsync<AuthRequest>(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const stats = await eventStatsService.getEventStats({
      id: id as string,
      organizerId: userId,
    });

    res.status(200).json({ success: true, data: stats });
  }),

  getOrganizerStats: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;
    const { year, month, day } = req.query;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const stats = await eventStatsService.getOrganizerStats({
      organizerId: userId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      day: day ? Number(day) : undefined,
    });

    res.status(200).json({ success: true, data: stats });
  }),

  getOrganizerProfile: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const profile = await organizerProfileService.getOrganizerProfile({
      organizerId: id as string,
    });

    res.status(200).json({ success: true, data: profile });
  }),

  getEventAttendees: catchAsync<AuthRequest>(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const attendees = await organizerProfileService.getEventAttendees({
      eventId: id as string,
      organizerId: userId,
    });

    res.status(200).json({ success: true, data: attendees });
  }),
};
