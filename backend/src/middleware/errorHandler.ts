import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { logger } from "../utils/logger";

const isProduction = process.env.NODE_ENV === "production";

const generateUUID = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }

  const errorId = generateUUID();
  logger.error(`[ERROR:${errorId}] Unhandled error:`, {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  return res.status(500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message,
    ...(isProduction ? {} : { errorId }),
  });
};