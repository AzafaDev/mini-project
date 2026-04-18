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

/**
 * Authentication Routes
 * All routes follow RESTful conventions
 */

// Register - Create new user account
authRouter.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  authController.register,
);

// Verify email - Confirm user's email with verification token
authRouter.post(
  "/verify-email",
  authLimiter,
  validate(verifyEmailSchema),
  authController.verifyEmail,
);

// Resend verification - Send new verification email (requires temp_token)
authRouter.post(
  "/resend-verification",
  authLimiter,
  authMiddleware.verifyTempToken,
  authController.resendVerification,
);

// Login - Authenticate user and create session
authRouter.post(
  "/login",
  authLimiter,
  validate(loginSchema),
  authController.login,
);

// Logout - Clear authentication cookies
authRouter.post("/logout", authController.logout);

// Get current user - Fetch authenticated user's profile
authRouter.get(
  "/me",
  authMiddleware.verifyAuthToken,
  authController.getCurrentUser,
);

// Update profile - Update user's profile information
authRouter.put(
  "/update-profile",
  authMiddleware.verifyAuthToken,
  validate(updateProfileSchema),
  authController.updateProfile,
);

// Change password - Update user's password
authRouter.put(
  "/change-password",
  authMiddleware.verifyAuthToken,
  validate(changePasswordSchema),
  authController.changePassword,
);

// Forgot password - Request password reset email
authRouter.post(
  "/forgot-password",
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);

// Reset password - Set new password using reset token
authRouter.post(
  "/reset-password/:token",
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default authRouter;