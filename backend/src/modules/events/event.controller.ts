import { Request, Response, NextFunction } from "express";
import { eventService } from "./event.service";
import { getUploadUrl } from "../../utils/uploadHelper";
import { UploadedFile } from "express-fileupload";
import { CreateEvent } from "./event.type";
import { AuthRequest } from "../auth/auth.type";

export const eventController = {
  getAllEvents: async (req: Request, res: Response) => {
    console.log("[DEBUG Event Controller] getAllEvents query:", req.query);

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

    console.log("[DEBUG Event Controller] getAllEvents params:", {
      search,
      category,
      location,
      page,
      limit,
    });

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

    console.log(
      "[DEBUG Event Controller] getAllEvents result count:",
      data.length,
    );

    res.status(200).json({ success: true, data, pagination });
  },

  getEventById: async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("[DEBUG Event Controller] getEventById id:", id);

    const event = await eventService.getEventById({ id: id as string });
    console.log("[DEBUG Event Controller] getEventById result:", !!event);

    res.status(200).json({ success: true, data: event });
  },

  createEvent: async (req: AuthRequest, res: Response) => {
    console.log("[DEBUG Event Controller] createEvent body:", req.body);
    console.log("[DEBUG Event Controller] createEvent userId:", req.userId);

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
    }: CreateEvent = req.body;
    const organizerId = req.userId;
    if (!organizerId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const imageUrl = await getUploadUrl(req.files?.imageFile as UploadedFile, "events-image");
    console.log("[DEBUG Event Controller] createEvent imageUrl:", imageUrl);

    // Parse tickets if it's a string (from FormData)
    let parsedTickets: any = undefined;
    if (tickets) {
      if (typeof tickets === 'string') {
        try {
          parsedTickets = JSON.parse(tickets);
        } catch (e) {
          console.log("[DEBUG Event Controller] Failed to parse tickets:", e);
        }
      } else {
        parsedTickets = tickets;
      }
    }

    const event = await eventService.createEvent({
      name,
      description,
      location,
      category,
      startDate: startDate as any,
      endDate: endDate as any,
      totalSeats: totalSeats as any,
      price: price as any,
      availableSeats: availableSeats as any,
      imageUrl,
      organizerId,
      tickets: parsedTickets,
    });

    console.log(
      "[DEBUG Event Controller] createEvent success, eventId:",
      event.id,
    );

    res.status(201).json({
      success: true,
      message: "Created event successfully",
      data: event,
    });
  },

  updateEvent: async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    console.log("[DEBUG Event Controller] updateEvent id:", id);
    console.log("[DEBUG Event Controller] updateEvent userId:", req.userId);

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

    console.log("[DEBUG Event Controller] updateEvent body:", req.body);

    const existingEvent = await eventService.getEventById({ id });
    if (!existingEvent) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const imageUrl = await getUploadUrl(req.files?.imageFile as UploadedFile, "events-image");
    console.log("[DEBUG Event Controller] updateEvent imageUrl:", imageUrl);

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

    console.log(
      "[DEBUG Event Controller] updateEvent success, eventId:",
      event.id,
    );

    res.status(200).json({
      success: true,
      message: "Updated event successfully",
      data: event,
    });
  },

  deleteEvent: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;
    console.log(
      "[DEBUG Event Controller] deleteEvent id:",
      id,
      "userId:",
      userId,
    );

    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User id not found" });
    await eventService.deleteEvent({ id: id as string, userId });

    console.log("[DEBUG Event Controller] deleteEvent success");

    res.status(200).json({
      success: true,
      message: "Deleted event successfully",
    });
  },

  getMyEvents: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    console.log("[DEBUG Event Controller] getMyEvents userId:", userId);

    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User id not found" });
    const events = await eventService.getMyEvents({ id: userId });

    console.log(
      "[DEBUG Event Controller] getMyEvents result count:",
      events.length,
    );

    res.status(200).json({ success: true, data: events });
  },

  getEventStats: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;
    console.log(
      "[DEBUG Event Controller] getEventStats id:",
      id,
      "userId:",
      userId,
    );

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
      const stats = await eventService.getEventStats({
        id: id as string,
        organizerId: userId,
      });
      console.log("[DEBUG Event Controller] getEventStats result:", stats);

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      console.error(
        "[DEBUG Event Controller] getEventStats error:",
        error.message,
      );
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getOrganizerStats: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { year, month, day } = req.query;
    console.log(
      "[DEBUG Event Controller] getOrganizerStats userId:",
      userId,
      "year:",
      year,
      "month:",
      month,
      "day:",
      day,
    );

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
      const stats = await eventService.getOrganizerStats({
        organizerId: userId,
        year: year ? Number(year) : undefined,
        month: month ? Number(month) : undefined,
        day: day ? Number(day) : undefined,
      });
      console.log("[DEBUG Event Controller] getOrganizerStats result:", stats);

      res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      console.error(
        "[DEBUG Event Controller] getOrganizerStats error:",
        error.message,
      );
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getOrganizerProfile: async (req: Request, res: Response) => {
    const { id } = req.params;
    console.log("[DEBUG Event Controller] getOrganizerProfile id:", id);

    try {
      const profile = await eventService.getOrganizerProfile({
        organizerId: id as string,
      });
      console.log(
        "[DEBUG Event Controller] getOrganizerProfile result:",
        !!profile,
      );

      res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
      console.error(
        "[DEBUG Event Controller] getOrganizerProfile error:",
        error.message,
      );
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getEventAttendees: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;
    console.log(
      "[DEBUG Event Controller] getEventAttendees id:",
      id,
      "userId:",
      userId,
    );

    if (!userId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    try {
      const attendees = await eventService.getEventAttendees({
        eventId: id as string,
        organizerId: userId,
      });
      console.log(
        "[DEBUG Event Controller] getEventAttendees result count:",
        attendees.length,
      );

      res.status(200).json({ success: true, data: attendees });
    } catch (error: any) {
      console.error(
        "[DEBUG Event Controller] getEventAttendees error:",
        error.message,
      );
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },
};
