import { Router } from "express";
import { authController } from "./auth.controller";
import { authMiddleware } from "./auth.middleware";
import { validate } from "../../middleware/validate";
import { authLimiter } from "../../middleware/rateLimiter";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "./auth.schema";

const authRouter = Router();

// Apply stricter rate limiter for auth endpoints
authRouter.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);
authRouter.post(
  "/verify-email",
  authLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail,
);
authRouter.post(
  "/resend-verification",
  authLimiter,
  authMiddleware.verifyTempToken,
  authController.resendVerification,
);
authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authController.login,
);
authRouter.post("/logout", authController.logout);
authRouter.get(
  "/me",
  authMiddleware.verifyAuthToken,
  authController.getCurrentUser,
);
authRouter.put(
  "/update-profile",
  authMiddleware.verifyAuthToken,
  validate(updateProfileSchema),
  authController.updateProfile,
);
authRouter.put(
  "/change-password",
  authMiddleware.verifyAuthToken,
  validate(changePasswordSchema),
  authController.changePassword,
);
authRouter.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password/:token",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default authRouter;
