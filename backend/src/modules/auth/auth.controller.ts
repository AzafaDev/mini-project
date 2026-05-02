import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UploadedFile } from "express-fileupload";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { logger } from "../../utils/logger";

import { getUploadUrl } from "../../utils/uploadHelper";
import {
  AuthRegister,
  AuthRequest,
  ForgotPassword,
  Login,
  ResetPassword,
  VerifyEmail,
} from "./auth.type";
import { authService } from "./auth.service";
import { generateTokenForAuth } from "../../utils/generateToken";
import { sendEmail } from "../../utils/sendEmail";

const setVerificationCookie = (res: Response, userId: string) => {
  if (!process.env.JWT_SECRET) {
    logger.error("CRITICAL: JWT_SECRET is undefined in .env");
    throw new AppError("Internal server error", 500);
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });

  res.cookie("temp_token", token, {
    maxAge: 30 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      role,
      referrerCode,
    }: AuthRegister = req.body;

    const sanitizedEmail = authService.sanitizeEmail(email);
    const imageUrl = await getUploadUrl(req.files?.profilePicture as UploadedFile, "profile-picture");

    const existingUser = await authService.findByEmail(sanitizedEmail);

    if (existingUser) {
      if (existingUser.isVerified) {
        throw new AppError("Email already exists. Please login or use forgot password.", 409);
      }

      const { newToken } = await authService.handleExistingUnverifiedUser(
        sanitizedEmail,
        password,
        { phoneNumber, profilePicture: imageUrl, fullName, role },
      );

      setVerificationCookie(res, existingUser.id);
      authService.sendVerificationEmail({
        email: sanitizedEmail,
        fullName,
        newToken,
      });

      return res.status(200).json({
        success: true,
        message: "Verification code has been sent to your email",
        requiresVerification: true,
      });
    }

    const result = await authService.register({
      email: sanitizedEmail,
      password,
      fullName,
      phoneNumber,
      role,
      referrerCode,
      imageUrl,
    });

    setVerificationCookie(res, result.newUser.id);
    authService.sendVerificationEmail({
      email: sanitizedEmail,
      fullName,
      newToken: result.newUser.verifyToken as string,
    });

    res.status(200).json({
      success: true,
      message: "Verification code has been sent to your email",
      requiresVerification: true,
    });
  }),

  verifyEmail: catchAsync(async (req: Request, res: Response) => {
    const { token }: VerifyEmail = req.body;
    if (!token.trim() || token.trim().length < 6) {
      throw new AppError("Token is required", 400);
    }
    const user = await authService.verifyEmail({ token });
    generateTokenForAuth({ res, userId: user.id, userRole: user.role });
    res.clearCookie("temp_token");
    res.status(200).json({ success: true, message: "Verify email successfully", user });
  }),

  resendVerification: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;
    await authService.resendVerification(userId);
    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const { email, password }: Login = req.body;

    const { user, requiresVerification } = await authService.login({
      email: authService.sanitizeEmail(email),
      password,
    });

    if (requiresVerification) {
      setVerificationCookie(res, user.id);
      authService.sendVerificationEmail({
        email: user.email,
        fullName: user.fullName,
        newToken: user.verifyToken as string,
      });

      return res.status(200).json({
        success: true,
        message: "Verification code has been sent to your email",
        requiresVerification: true,
      });
    }

    generateTokenForAuth({ res, userId: user.id, userRole: user.role });
    res.clearCookie("temp_token");

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user,
    });
  }),

  logout: catchAsync<AuthRequest>(async (_req, res) => {
    res.clearCookie("auth_token", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.clearCookie("temp_token", {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });
    res.status(200).json({ success: true, message: "Logout successfully" });
  }),

  getCurrentUser: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;
    if (!userId) {
      throw new AppError("User id not found", 400);
    }

    const user = await authService.getCurrentUser(userId);
    res.status(200).json({ success: true, user });
  }),

  updateProfile: catchAsync<AuthRequest>(async (req, res) => {
    const { fullName, phoneNumber } = req.body || {};
    const userId = req.userId;
    if (!userId) {
      throw new AppError("User id not found", 400);
    }

    const imageUrl = await getUploadUrl(req.files?.profilePicture as UploadedFile, "profile-picture");

    const user = await authService.updateProfile({
      fullName,
      phoneNumber,
      imageUrl,
      userId,
    });

    res.status(200).json({ success: true, message: "Updated profile successfully", user });
  }),

  changePassword: catchAsync<AuthRequest>(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;
    if (!userId) {
      throw new AppError("User id not found", 400);
    }
    const user = await authService.changePassword({
      currentPassword,
      newPassword,
      userId,
    });
    res.status(200).json({
      success: true,
      message: "Changed password successfully",
      user,
    });
  }),

  forgotPassword: catchAsync(async (req: Request, res: Response) => {
    const { email }: ForgotPassword = req.body;
    if (!email.trim()) {
      throw new AppError("Email is required", 400);
    }
    await authService.forgotPassword(authService.sanitizeEmail(email));
    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  }),

  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword }: ResetPassword = req.body;
    if (!newPassword.trim() || newPassword.trim().length < 8) {
      throw new AppError("Password must be at least 8 characters", 400);
    }
    const user = await authService.resetPassword({
      token,
      newPassword,
    });
    res.status(200).json({ success: true, message: "Reset password successfully", user });
  }),
};
