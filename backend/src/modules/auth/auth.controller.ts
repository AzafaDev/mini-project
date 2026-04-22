import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UploadedFile } from "express-fileupload";
import { catchAsync } from "../../utils/catchAsync";

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
import { prisma } from "../../config/prisma";
import {
  generateTokenForAuth,
  generateVerificationCode,
} from "../../utils/generateToken";
import { sendEmail } from "../../utils/sendEmail";

// Normalisasi email: hapus spasi dan ubah ke lowercase
// Mencegah duplikasi user karena perbedaan case atau spasi
const sanitizeEmail = (email: string): string => email.trim().toLowerCase();

// Kirim email verifikasi dan set cookie token sementara
// Digunakan untuk user yang belum verifikasi email
const sendVerificationAndSetCookie = async (
  user: {
    id: string;
    email: string;
    fullName: string;
    verifyToken: string | null;
  },
  res: Response,
) => {
  try {
    await sendEmail.verificationEmail({
      email: user.email,
      token: user.verifyToken as string,
      username: user.fullName,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error);
  }

  if (!process.env.JWT_SECRET) {
    console.error("CRITICAL: JWT_SECRET is undefined in .env");
  }

  // Generate token sementara yang berlaku 30 menit
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });

  // Set cookie temp_token dengan security flag
  res.cookie("temp_token", token, {
    maxAge: 30 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "Verification code has been sent to your email",
    requiresVerification: true,
  });
};

/**
 * Authentication controller handling all auth-related endpoints.
 * Includes: register, login, logout, verify email, forgot password, etc.
 */
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

    const sanitizedEmail = sanitizeEmail(email);
    const imageUrl = await getUploadUrl(req.files?.profilePicture as UploadedFile, "profile-picture");

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "Email already exists. Please login or use forgot password.",
        });
      }

      const newToken = generateVerificationCode();
      const updatedUser = await authService.rehashAndUpdateUser(
        existingUser.email,
        password,
        {
          phoneNumber,
          profilePicture: imageUrl,
          fullName,
          role,
        },
        newToken,
      );

      return sendVerificationAndSetCookie(
        {
          id: updatedUser.id,
          email: updatedUser.email,
          fullName: updatedUser.fullName,
          verifyToken: newToken,
        },
        res,
      );
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

    return sendVerificationAndSetCookie(
      {
        id: result.newUser.id,
        email: result.newUser.email,
        fullName: result.newUser.fullName,
        verifyToken: result.newUser.verifyToken,
      },
      res,
    );
  }),

  verifyEmail: catchAsync(async (req: Request, res: Response) => {
    const { token }: VerifyEmail = req.body;
    if (!token.trim() || token.trim().length < 6) {
      return res.status(400).json({ success: false, message: "Token is required" });
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
      email: sanitizeEmail(email),
      password,
    });

    if (requiresVerification) {
      return sendVerificationAndSetCookie(
        {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          verifyToken: user.verifyToken,
        },
        res,
      );
    }

    generateTokenForAuth({ res, userId: user.id, userRole: user.role });
    res.clearCookie("temp_token");

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user,
    });
  }),

  logout: catchAsync<AuthRequest>(async (req, res) => {
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
    const userRole = req.userRole;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User id not found" });
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({ success: true, user });
  }),

  updateProfile: catchAsync<AuthRequest>(async (req, res) => {
    const { fullName, phoneNumber } = req.body || {};
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id not found" });
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
      return res.status(400).json({ success: false, message: "User id not found" });
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
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    await authService.forgotPassword(sanitizeEmail(email));
    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  }),

  resetPassword: catchAsync(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { newPassword }: ResetPassword = req.body;
    if (!newPassword.trim() || newPassword.trim().length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }
    const user = await authService.resetPassword({
      token: token as string,
      newPassword,
    });
    res.status(200).json({ success: true, message: "Reset password successfully", user });
  }),
};
