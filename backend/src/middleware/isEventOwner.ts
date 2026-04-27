import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../modules/auth/auth.type";

// Middleware untuk memastikan user adalah pemilik dari event tersebut
// Digunakan untuk proteksi route edit/hapus event
export const isEventOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Ambil eventId dari parameter URL
    const eventId = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    // Cek apakah event ada di database
    const event = await prisma.event.findFirst({
      where: { id: eventId },
      select: { organizerId: true, isDeleted: true },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.isDeleted) {
      throw new AppError("Event has been deleted", 410);
    }

    // Pastikan user yang login adalah organizer dari event ini
    if (event.organizerId !== userId) {
      throw new AppError("Forbidden: Not the event owner", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};