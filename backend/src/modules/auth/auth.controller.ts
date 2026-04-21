import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UploadedFile } from "express-fileupload";

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
  /**
   * Handles user registration with email verification flow.
   * 
   * Flow:
   * 1. Sanitizes and validates email format
   * 2. Checks if user already exists (verified or unverified)
   * 3. If unverified user exists, rehash password and resend verification
   * 4. Creates new user with hashed password and generates verification token
   * 5. Sends verification email and sets temp token cookie
   * 
   * @param req - Express request with registration data (email, password, fullName, phoneNumber, role, referrerCode)
   * @param res - Express response
   * @returns JSON with success status and message
   */
  register: async (req: Request, res: Response) => {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      role,
      referrerCode,
    }: AuthRegister = req.body;

    // Normalisasi email sebelum dicek ke database
    const sanitizedEmail = sanitizeEmail(email);

    // Upload profile picture jika ada
    const imageUrl = await getUploadUrl(req.files?.profilePicture as UploadedFile, "profile-picture");

    // Cek apakah email sudah pernah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    if (existingUser) {
      // Jika user sudah terverifikasi, email tidak bisa dipakai lagi
      if (existingUser.isVerified) {
        return res.status(409).json({
          success: false,
          message: "Email already exists. Please login or use forgot password.",
        });
      }

      // Jika user ada tapi belum verifikasi, update data dan kirim ulang verifikasi
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

    // Jika email baru, buat user baru
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
  },

  /**
   * Verifies user's email address using the token sent to their email.
   * On success, generates auth token and clears temporary token cookie.
   * 
   * @param req - Express request with verification token
   * @param res - Express response
   * @returns JSON with success message and user data
   */
  verifyEmail: async (req: Request, res: Response) => {
    const { token }: VerifyEmail = req.body;
    // Validasi format token minimal 6 digit
    if (!token.trim() || token.trim().length < 6) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }
    const user = await authService.verifyEmail({ token });
    // Generate token auth permanent
    generateTokenForAuth({ res, userId: user.id, userRole: user.role });
    // Hapus cookie token sementara
    res.clearCookie("temp_token");
    res.status(200).json({ success: true, message: "Verify email successfully", user });
  },

  /**
   * Resends verification email to unverified user.
   * Requires authentication (user must be logged in but not verified).
   * 
   * @param req - Express request with authenticated user (req.userId)
   * @param res - Express response
   * @returns JSON with success message
   */
  resendVerification: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    await authService.resendVerification(userId);
    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  },

  /**
   * Handles user login.
   * 
   * Flow:
   * 1. Validates email and password
   * 2. Checks if user exists and password matches
   * 3. If account is not verified, sends new verification email
   * 4. If verified, generates auth token and returns user data
   * 
   * @param req - Express request with login credentials (email, password)
   * @param res - Express response
   * @returns JSON with success message and user data, or verification required
   */
  login: async (req: Request, res: Response) => {
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
  },

  /**
   * Logs out user by clearing auth_token and temp_token cookies.
   * 
   * @param req - Express request (authentication not required for logout)
   * @param res - Express response
   * @returns JSON with success message
   */
  logout: async (req: AuthRequest, res: Response) => {
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
  },

  /**
   * Gets current authenticated user's profile data.
   * Requires valid auth_token cookie.
   * 
   * @param req - Express request with authenticated user (req.userId, req.userRole)
   * @param res - Express response
   * @returns JSON with user data
   */
  getCurrentUser: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const userRole = req.userRole;

    if (!userId) {
      return res.status(400).json({ success: false, message: "User id not found" });
    }

    const user = await authService.getCurrentUser(userId);

    res.status(200).json({ success: true, user });
  },

  /**
   * Updates user's profile (fullName, phoneNumber, profilePicture).
   * Requires authentication.
   * 
   * @param req - Express request with updated profile data and authenticated user
   * @param res - Express response
   * @returns JSON with success message and updated user data
   */
  updateProfile: async (req: AuthRequest, res: Response) => {
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
  },

  /**
   * Changes user's password.
   * Requires authentication and current password verification.
   * 
   * @param req - Express request with currentPassword and newPassword
   * @param res - Express response
   * @returns JSON with success message and updated user data
   */
  changePassword: async (req: AuthRequest, res: Response) => {
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
  },

  /**
   * Initiates password reset flow.
   * Sends reset link to user's email if account exists.
   * Note: This intentionally doesn't reveal whether email exists or not (security).
   * 
   * @param req - Express request with email
   * @param res - Express response
   * @returns JSON with generic success message
   */
  forgotPassword: async (req: Request, res: Response) => {
    const { email }: ForgotPassword = req.body;
    if (!email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    await authService.forgotPassword(sanitizeEmail(email));
    // Selalu return pesan sukses meskipun email tidak ada
    // Ini untuk keamanan: tidak memberitahu attacker apakah email terdaftar
    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  },

  /**
   * Completes password reset using token from email.
   * Validates token expiry and updates password.
   * 
   * @param req - Express request with reset token (params) and newPassword (body)
   * @param res - Express response
   * @returns JSON with success message and user data
   */
  resetPassword: async (req: Request, res: Response) => {
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
  },
};