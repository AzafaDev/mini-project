import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.log("[DEBUG Error Handler] Error occurred:", {
    message: err.message,
    path: req.path,
    method: req.method,
    statusCode: err instanceof AppError ? err.statusCode : 500,
  });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unknown error = 500
  console.error("[DEBUG Error Handler] Unhandled error:", err);
  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};