import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "./auth.type";
import { prisma } from "../../config/prisma";

/**
 * Authentication middleware for verifying tokens and authorization.
 * Handles two types of tokens:
 * - temp_token: For unverified users during email verification flow
 * - auth_token: For verified users accessing protected routes
 */
export const authMiddleware = {
  /**
   * Verifies temporary token used during email verification flow.
   * This middleware is used for routes that require user to be in the
   * process of verifying their email (e.g., resend verification code).
   * 
   * Checks:
   * 1. temp_token cookie exists
   * 2. Token is valid and not expired
   * 3. User is NOT yet verified (if verified, rejects with 403)
   * 
   * @param req - Express request with cookies
   * @param res - Express response
   * @param next - Express next function
   */
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

  /**
   * Verifies authentication token for protected routes.
   * This is the main authentication middleware for routes that require
   * a valid, verified user session.
   * 
   * Checks:
   * 1. auth_token cookie exists
   * 2. Token is valid and not expired
   * 3. User exists in database
   * 
   * On success, attaches userId and userRole to req object.
   * 
   * @param req - Express request with cookies
   * @param res - Express response
   * @param next - Express next function
   */
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

  /**
   * Authorization middleware to check if user has ORGANIZER role.
   * Must be used AFTER verifyAuthToken (relies on req.userRole).
   * Returns 403 if user is not an organizer.
   * 
   * @param req - Express request with userRole from auth middleware
   * @param res - Express response
   * @param next - Express next function
   */
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