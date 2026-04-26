import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";

const isProduction = process.env.NODE_ENV === "production";

// Fallback for crypto.randomUUID in older Node.js versions
const generateUUID = () => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback to a simple UUID-like string (not cryptographically secure but OK for error tracking)
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Global error handler untuk menangkap SEMUA error di aplikasi
// Semua error baik yang di-throw manual maupun error sistem akan melewati ini
// Mengembalikan response error yang konsisten untuk client
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // AppError adalah error yang sengaja kita throw dari aplikasi
  // Ini adalah error yang diantisipasi dengan status code dan pesan yang jelas
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Untuk error generic / error sistem yang tidak terduga
  // Generate unique ID untuk tracking error di log production
  const errorId = generateUUID();
  // Semua detail error dicatat di server log untuk debugging
  console.error(`[ERROR:${errorId}] Unhandled error:`, {
    message: err.message,
    stack: isProduction ? undefined : err.stack,
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Di production tidak menampilkan detail error ke client
  // Untuk keamanan dan menghindari expose informasi sensitif
  return res.status(500).json({
    success: false,
    message: isProduction ? "Internal server error" : err.message,
    ...(isProduction ? {} : { errorId }),
  });
};