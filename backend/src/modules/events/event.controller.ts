import { Request, Response } from "express";
import { eventService } from "./event.service";
import { getUploadUrl } from "../../utils/uploadHelper";
import { UploadedFile } from "express-fileupload";
import { CreateEvent } from "./event.type";
import { AuthRequest } from "../auth/auth.type";
import { catchAsync } from "../../utils/catchAsync";

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

    const { data, pagination } = await eventService.getAllEvents({
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
    const event = await eventService.getEventById({ id: id as string });
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
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const imageUrl = await getUploadUrl(req.files?.imageFile as UploadedFile, "events-image");

    let parsedTickets: { type: 'GENERAL' | 'VIP'; price: number; quantity: number }[] | undefined;
    if (tickets) {
      if (typeof tickets === 'string') {
        try {
          parsedTickets = JSON.parse(tickets);
        } catch (e) {}
      } else {
        parsedTickets = tickets as unknown as { type: 'GENERAL' | 'VIP'; price: number; quantity: number }[];
      }
    }

    const event = await eventService.createEvent({
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
      return res.status(400).json({ success: false, message: "User id not found" });
    }
    
    await eventService.deleteEvent({ id: id as string, userId });

    res.status(200).json({
      success: true,
      message: "Deleted event successfully",
    });
  }),

  getMyEvents: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User id not found" });
    }
    
    const events = await eventService.getMyEvents({ id: userId });

    res.status(200).json({ success: true, data: events });
  }),

  getEventStats: catchAsync<AuthRequest>(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const stats = await eventService.getEventStats({
      id: id as string,
      organizerId: userId,
    });

    res.status(200).json({ success: true, data: stats });
  }),

  getOrganizerStats: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;
    const { year, month, day } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const stats = await eventService.getOrganizerStats({
      organizerId: userId,
      year: year ? Number(year) : undefined,
      month: month ? Number(month) : undefined,
      day: day ? Number(day) : undefined,
    });

    res.status(200).json({ success: true, data: stats });
  }),

  getOrganizerProfile: catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const profile = await eventService.getOrganizerProfile({
      organizerId: id as string,
    });

    res.status(200).json({ success: true, data: profile });
  }),

  getEventAttendees: catchAsync<AuthRequest>(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const attendees = await eventService.getEventAttendees({
      eventId: id as string,
      organizerId: userId,
    });

    res.status(200).json({ success: true, data: attendees });
  }),
};
