import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        userRole: string;
        iat: number;
        exp: number;
      };
    }
  }
}

export const authMiddleware = {
  verifyToken: (req: Request, res: Response, next: NextFunction) => {
    console.log("[AUTH MIDDLEWARE] === Verifying token ===");
    console.log("[AUTH MIDDLEWARE] All cookies:", JSON.stringify(req.cookies));
    console.log("[AUTH MIDDLEWARE] Raw cookie header:", req.headers.cookie);

    const accessToken = req.cookies?.token;
    console.log(
      "[AUTH MIDDLEWARE] Token value:",
      accessToken ? `${accessToken.substring(0, 20)}...` : "NOT FOUND",
    );
    console.log("[AUTH MIDDLEWARE] Token found:", !!accessToken);

    if (!accessToken) {
      console.log("[AUTH MIDDLEWARE] No token provided - returning 401");
      return res.status(401).json({
        success: false,
        message: "Access denied. No authentication token provided.",
      });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        console.log("[AUTH MIDDLEWARE] JWT_SECRET not defined");
        throw new Error("JWT_SECRET is not defined");
      }

      const decoded = jwt.verify(accessToken, secret) as {
        userId: string;
        userRole: string;
        iat: number;
        exp: number;
      };

      console.log("[AUTH MIDDLEWARE] Token decoded successfully:", {
        userId: decoded.userId,
        userRole: decoded.userRole,
      });

      // Attach decoded user info to request
      req.user = decoded;

      console.log("[AUTH MIDDLEWARE] User attached to request");
      // Continue to next middleware/handler
      next();
    } catch (error: any) {
      console.log(
        "[AUTH MIDDLEWARE] Token verification failed:",
        error.message,
      );
      return res.status(401).json({
        success: false,
        message:
          error.message === "jwt expired"
            ? "Token has expired"
            : "Invalid or expired token",
      });
    }
  },
};
