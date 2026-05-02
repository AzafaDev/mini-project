import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.type";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

export const authMiddleware = {
  verifyTempToken: async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    const token = req.cookies.temp_token;
    if (!token) {
      throw new AppError("Unauthorized: No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      userEmail: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isVerified: true },
    });

    if (user?.isVerified) {
      throw new AppError("Account already verified. Please login.", 403);
    }

    req.userId = decoded.userId;

    next();
  },

  verifyAuthToken: async (
    req: AuthRequest,
    _res: Response,
    next: NextFunction,
  ) => {
    const token = req.cookies.auth_token;

    if (!token) {
      throw new AppError("Unauthorized: No token provided", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      userRole: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, isVerified: true },
    });

    if (!user) {
      throw new AppError("Unauthorized: Invalid token", 401);
    }

    req.userId = decoded.userId;
    req.userRole = decoded.userRole;

    next();
  },

  isOrganizer: async (req: AuthRequest, _res: Response, next: NextFunction) => {
    const userRole = req.userRole;
    if (!userRole) {
      throw new AppError("Unauthorized", 401);
    }
    if (userRole !== "ORGANIZER") {
      throw new AppError("Access denied", 403);
    }
    next();
  },
};