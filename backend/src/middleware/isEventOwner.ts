import { Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { AppError } from "../utils/AppError";
import { AuthRequest } from "../modules/auth/auth.type";

export const isEventOwner = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const eventId = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { organizerId: true },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    if (event.organizerId !== userId) {
      throw new AppError("Forbidden: Not the event owner", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};