import { Request, Response } from "express";
import { eventService } from "./event.service";
import { getUploadUrl } from "../../utils/uploadHelper";
import { UploadedFile } from "express-fileupload";
import { CreateEvent } from "./event.type";
import { AuthRequest } from "../auth/auth.type";

export const eventController = {
  // Ambil semua event dengan support filter, sorting, dan pagination
  getAllEvents: async (req: Request, res: Response) => {
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
    });

    res.status(200).json({ success: true, data, pagination });
  },

  /**
   * Get single event by ID.
   * 
   * @param req - Express request with event ID in params
   * @param res - Express response
   * @returns JSON with event data or 404 if not found
   */
  getEventById: async (req: Request, res: Response) => {
    const { id } = req.params;

    const event = await eventService.getEventById({ id: id as string });

    res.status(200).json({ success: true, data: event });
  },

  /**
   * Create new event (Organizer only).
   * Handles FormData parsing for file uploads and nested ticket data.
   * 
   * @param req - Express request with authenticated organizer and event data
   * @param res - Express response
   * @returns JSON with created event data
   */
  // Buat event baru - Hanya untuk role ORGANIZER
  createEvent: async (req: AuthRequest, res: Response) => {
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

    // Upload gambar event jika ada
    const imageUrl = await getUploadUrl(req.files?.imageFile as UploadedFile, "events-image");

    let parsedTickets: { type: 'GENERAL' | 'VIP'; price: number; quantity: number }[] | undefined;
    if (tickets) {
      // Jika tickets dikirim sebagai string JSON (karena FormData), parse terlebih dahulu
      if (typeof tickets === 'string') {
        try {
          parsedTickets = JSON.parse(tickets);
        } catch (e) {
          // Jika gagal parse, gunakan default ticket
        }
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
  },

  /**
   * Update existing event (Organizer only, must be event owner).
   * 
   * @param req - Express request with event ID in params and updated data in body
   * @param res - Express response
   * @returns JSON with updated event data
   */
  updateEvent: async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const organizerId = req.userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const {
      name,
      description,
      location,
      category,
      startDate,
      endDate,
      totalSeats,
      availableSeats,
      price,
    } = req.body;

    const existingEvent = await eventService.getEventById({ id });
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const imageUrl = await getUploadUrl(req.files?.imageFile as UploadedFile, "events-image");

    const event = await eventService.updateEvent({
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
    });

    res.status(200).json({
      success: true,
      message: "Updated event successfully",
      data: event,
    });
  },

/**
   * Soft delete event (Organizer only, must be event owner).
   * Marks event as deleted without removing from database.
   * 
   * @param req - Express request with event ID in params
   * @param res - Express response
   * @returns JSON with success message
   */
  deleteEvent: async (req: AuthRequest, res: Response) => {
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
  },

  /**
   * Get all events created by current organizer.
   * 
   * @param req - Express request with authenticated organizer
   * @param res - Express response
   * @returns JSON with array of events
   */
  getMyEvents: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "User id not found" });
    }
    
    const events = await eventService.getMyEvents({ id: userId });

    res.status(200).json({ success: true, data: events });
  },

  /**
   * Get statistics for a specific event (Organizer only).
   * 
   * @param req - Express request with event ID in params and authenticated organizer
   * @param res - Express response
   * @returns JSON with event statistics (revenue, tickets sold, etc.)
   */
  getEventStats: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const stats = await eventService.getEventStats({
        id: id as string,
        organizerId: userId,
      });

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  /**
   * Get aggregated statistics for all events by current organizer.
   * Supports filtering by year, month, or day.
   * 
   * @param req - Express request with query params (year, month, day)
   * @param res - Express response
   * @returns JSON with organizer statistics
   */
  getOrganizerStats: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { year, month, day } = req.query;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const stats = await eventService.getOrganizerStats({
        organizerId: userId,
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        day: day ? Number(day) : undefined,
      });

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  /**
   * Get public profile of an organizer (including their events and reviews).
   * 
   * @param req - Express request with organizer ID in params
   * @param res - Express response
   * @returns JSON with organizer profile data
   */
  getOrganizerProfile: async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const profile = await eventService.getOrganizerProfile({
        organizerId: id as string,
      });

      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  /**
   * Get list of attendees for a specific event (Organizer only).
   * 
   * @param req - Express request with event ID in params and authenticated organizer
   * @param res - Express response
   * @returns JSON with array of attendee details
   */
  getEventAttendees: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
      const attendees = await eventService.getEventAttendees({
        eventId: id as string,
        organizerId: userId,
      });

      res.status(200).json({ success: true, data: attendees });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },
};