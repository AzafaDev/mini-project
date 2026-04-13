import rateLimit from "express-rate-limit";

console.log("[DEBUG RateLimiter] Middleware loaded");

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for auth endpoints (login, register, forgot password)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for sensitive operations
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 5, // Limit each IP to 5 requests per hour
  message: {
    success: false,
    message: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});