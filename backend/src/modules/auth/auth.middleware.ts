import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.type";
import { prisma } from "../../config/prisma";

export const authMiddleware = {
  verifyTempToken: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.cookies.temp_token;
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userEmail: string;
      };

      // Cek apakah user sudah verified
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isVerified: true },
      });

      if (user?.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Account already verified. Please login.",
        });
      }

      req.userId = decoded.userId;

      next();
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },
  verifyAuthToken: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const token = req.cookies.auth_token;
      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userRole: string;
      };

      // Check if user still exists and is not deleted
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isVerified: true },
      });

      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }

      req.userId = decoded.userId;
      req.userRole = decoded.userRole;

      next();
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },
  isOrganizer: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.userRole;
      if (!userRole) {
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      if (userRole !== "ORGANIZER") {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
      next();
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  },
};
