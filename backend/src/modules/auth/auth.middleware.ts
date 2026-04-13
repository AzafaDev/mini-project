import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.type";
import { prisma } from "../../config/prisma";

console.log("[DEBUG Auth Middleware] Module loaded");

export const authMiddleware = {
  verifyTempToken: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      console.log("[DEBUG Auth Middleware] verifyTempToken called, cookies:", req.cookies);

      const token = req.cookies.temp_token;
      if (!token) {
        console.log("[DEBUG Auth Middleware] verifyTempToken - no token found");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      console.log("[DEBUG Auth Middleware] verifyTempToken - token found, verifying...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userEmail: string;
      };

      console.log("[DEBUG Auth Middleware] verifyTempToken - decoded:", decoded);

      // Cek apakah user sudah verified
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { isVerified: true },
      });

      console.log("[DEBUG Auth Middleware] verifyTempToken - user found, isVerified:", user?.isVerified);

      if (user?.isVerified) {
        return res.status(403).json({
          success: false,
          message: "Account already verified. Please login.",
        });
      }

      req.userId = decoded.userId;

      next();
    } catch (error: any) {
      console.log("[DEBUG Auth Middleware] verifyTempToken - error:", error.message);
      res.status(401).json({ success: false, message: error.message });
    }
  },
  verifyAuthToken: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      console.log("[DEBUG Auth Middleware] verifyAuthToken called, cookies:", req.cookies);

      const token = req.cookies.auth_token;

      console.log("[DEBUG Auth Middleware] verifyAuthToken - Auth Token Found:", !!token);

      if (!token) {
        console.log("[DEBUG Auth Middleware] verifyAuthToken - no token");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: No token provided" });
      }

      console.log("[DEBUG Auth Middleware] verifyAuthToken - verifying token...");

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        userRole: string;
      };

      console.log("[DEBUG Auth Middleware] verifyAuthToken - decoded:", decoded);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, isVerified: true },
      });

      console.log("[DEBUG Auth Middleware] verifyAuthToken - user found:", !!user);

      if (!user) {
        console.log(
          "[DEBUG Auth Middleware] verifyAuthToken - User not found in DB for ID:",
          decoded.userId,
        );
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }

      req.userId = decoded.userId;
      req.userRole = decoded.userRole;

      console.log("[DEBUG Auth Middleware] verifyAuthToken - success, userId:", req.userId, "userRole:", req.userRole);

      next();
    } catch (error: any) {
      console.log("[DEBUG Auth Middleware] verifyAuthToken - Catch Error:", error.message);
      res.status(401).json({ success: false, message: error.message });
    }
  },
  isOrganizer: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      console.log("[DEBUG Auth Middleware] isOrganizer called, userRole:", req.userRole);

      const userRole = req.userRole;
      if (!userRole) {
        console.log("[DEBUG Auth Middleware] isOrganizer - no userRole");
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized" });
      }
      if (userRole !== "ORGANIZER") {
        console.log("[DEBUG Auth Middleware] isOrganizer - not ORGANIZER, role:", userRole);
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
      console.log("[DEBUG Auth Middleware] isOrganizer - authorized");
      next();
    } catch (error: any) {
      console.log("[DEBUG Auth Middleware] isOrganizer - error:", error.message);
      res.status(401).json({ success: false, message: error.message });
    }
  },
};
