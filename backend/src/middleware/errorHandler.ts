import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

/**
 * Global error handler middleware
 * Catches all unhandled errors and formats them as JSON responses
 * 
 * Handles:
 * - AppError (custom application errors with status codes)
 * - Generic Error (unknown errors)
 * 
 * Response format: { success: false, message: string }
 */
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

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};