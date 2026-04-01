import { Router, Request, Response, NextFunction } from "express";
import { authController } from "./auth.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const authRoute = Router();

// Debug middleware to log requests
const logRequest = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[AUTH ROUTE] ${req.method} ${req.path}`);
  console.log(`[AUTH ROUTE] Headers:`, req.headers["content-type"]);
  next();
};

// POST /api/auth/register
authRoute.post("/register", logRequest, authController.register);

// POST /api/auth/verify-email
authRoute.post("/verify-email", authController.verifyEmail);

authRoute.post(
  "/resend",
  authMiddleware.verifyToken,
  authController.resendVerifyEmail,
);

export default authRoute;
