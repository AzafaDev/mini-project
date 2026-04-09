import { Request, Response, NextFunction } from "express";
import { eventService } from "./event.service";
import { handleFileUpload } from "../../utils/handleFileUpload";
import { UploadedFile } from "express-fileupload";
import { CreateEvent } from "./event.type";
import { AuthRequest } from "../auth/auth.type";

export const eventController = {
  getAllEvents: async (req: Request, res: Response, next: NextFunction) => {
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

  getEventById: async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const event = await eventService.getEventById({ id: id as string });
    res.status(200).json({ success: true, data: event });
  },

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
    }: CreateEvent = req.body;
    const organizerId = req.userId;
    if (!organizerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

    let imageUrl: string | undefined;
    if (req.files && "imageFile" in req.files) {
      const imageFile = req.files.imageFile as UploadedFile;
      try {
        imageUrl = await handleFileUpload(imageFile, {
          folder: "events-image",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Upload image failed",
        });
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
    });

    res.status(201).json({
      success: true,
      message: "Created event successfully",
      data: event,
    });
  },

  updateEvent: async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const organizerId = req.userId;
    if (!organizerId)
      return res.status(401).json({ success: false, message: "Unauthorized" });

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
    if (existingEvent.organizerId !== organizerId) {
      return res
        .status(403)
        .json({ success: false, message: "Forbidden: Not the event owner" });
    }

    let imageUrl: string | undefined;
    if (req.files && "imageFile" in req.files) {
      const imageFile = req.files.imageFile as UploadedFile;
      try {
        imageUrl = await handleFileUpload(imageFile, {
          folder: "events-image",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Upload image failed",
        });
      }
    }

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

  deleteEvent: async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.userId;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "User id not found" });
    await eventService.deleteEvent({ id: id as string, userId });

    res.status(200).json({
      success: true,
      message: "Deleted event successfully",
    });
  },

  getMyEvents: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId)
      return res
        .status(401)
        .json({ success: false, message: "User id not found" });
    const events = await eventService.getMyEvents({ id: userId });

    res.status(200).json({ success: true, data: events });
  },
};
