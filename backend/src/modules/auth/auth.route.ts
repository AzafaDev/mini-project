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

console.log("[DEBUG Route] Registering Auth routes");

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
authRouter.post("/logout", (req, res, next) => {
  console.log("[DEBUG Auth Route] logout hit");
  next();
}, authController.logout);
authRouter.get(
  "/me",
  (req, res, next) => {
    console.log("[DEBUG Auth Route] /me hit, cookies:", req.cookies);
    next();
  },
  authMiddleware.verifyAuthToken,
  authController.getCurrentUser,
);
authRouter.put(
  "/update-profile",
  authMiddleware.verifyAuthToken,
  (req, res, next) => { console.log("[DEBUG Auth Route] update-profile hit, body:", req.body, "files:", req.files); next(); },
  validate(updateProfileSchema),
  authController.updateProfile,
);
authRouter.put(
  "/change-password",
  (req, res, next) => {
    console.log("[DEBUG Auth Route] change-password hit");
    next();
  },
  authMiddleware.verifyAuthToken,
  validate(changePasswordSchema),
  authController.changePassword,
);
authRouter.post(
  "/forgot-password",
  (req, res, next) => {
    console.log("[DEBUG Auth Route] forgot-password hit, email:", req.body.email);
    next();
  },
  authLimiter,
  validate(forgotPasswordSchema),
  authController.forgotPassword,
);
authRouter.post(
  "/reset-password/:token",
  (req, res, next) => {
    console.log("[DEBUG Auth Route] reset-password hit, token:", req.params.token);
    next();
  },
  authLimiter,
  validate(resetPasswordSchema),
  authController.resetPassword,
);

export default authRouter;
