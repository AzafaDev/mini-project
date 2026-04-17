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

const sanitizeEmail = (email: string): string => email.trim().toLowerCase();

const sendVerificationAndSetCookie = async (
  user: {
    id: string;
    email: string;
    fullName: string;
    verifyToken: string | null;
  },
  res: Response,
) => {
  console.log("[DEBUG Register] Preparing temp_token for UserID:", user.id);
  console.log("[DEBUG Register] verifyToken:", user.verifyToken);

  try {
    await sendEmail.verificationEmail({
      email: user.email,
      token: user.verifyToken as string,
      username: user.fullName,
    });
  } catch (error) {
    console.error("[DEBUG Register] Email Failed:", error);
  }

  if (!process.env.JWT_SECRET) {
    console.error("[DEBUG Register] CRITICAL: JWT_SECRET is undefined in .env");
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });

  console.log("[DEBUG Register] temp_token generated successfully");

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

export const authController = {
  register: async (req: Request, res: Response) => {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      role,
      referrerCode,
    }: AuthRegister = req.body;

    console.log("[DEBUG register] incoming body:", { email, fullName, role, referrerCode, phoneNumber });

    const sanitizedEmail = sanitizeEmail(email);
    console.log("[DEBUG register] sanitizedEmail:", sanitizedEmail);

    const imageUrl = await getUploadUrl(req.files?.profilePicture as UploadedFile, "profile-picture");
    console.log("[DEBUG register] image uploaded, url:", imageUrl);

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail },
    });

    console.log("[DEBUG register] existingUser check:", existingUser ? "found" : "not found");

    if (existingUser) {
      if (existingUser.isVerified) {
        console.log("[DEBUG register] user exists and is verified - rejecting");
        return res.status(409).json({
          success: false,
          message: "Email already exists. Please login or use forgot password.",
        });
      }

      console.log("[DEBUG register] user exists but not verified - rehash flow");
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

    console.log("[DEBUG register] calling authService.register with:", { email: sanitizedEmail, fullName, role, referrerCode, phoneNumber, imageUrl: !!imageUrl });
    const result = await authService.register({
      email: sanitizedEmail,
      password,
      fullName,
      phoneNumber,
      role,
      referrerCode,
      imageUrl,
    });

    console.log("[DEBUG register] authService.register result:", { userId: result.newUser.id, email: result.newUser.email, role: result.newUser.role });

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

  verifyEmail: async (req: Request, res: Response) => {
    const { token }: VerifyEmail = req.body;
    if (!token.trim() || token.trim().length < 6) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }
    const user = await authService.verifyEmail({ token });
    generateTokenForAuth({ res, userId: user.id, userRole: user.role });
    res.clearCookie("temp_token");
    res.status(200).json({ success: true, message: "Verify email successfully", user });
  },

  resendVerification: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    await authService.resendVerification(userId);
    res.status(200).json({
      success: true,
      message: "Verification email resent successfully",
    });
  },

  login: async (req: Request, res: Response) => {
    const { email, password }: Login = req.body;

    console.log("[DEBUG Login] ====== START LOGIN ======");
    console.log("[DEBUG Login] email:", email);

    const { user, requiresVerification } = await authService.login({
      email: sanitizeEmail(email),
      password,
    });

    console.log("[DEBUG Login] requiresVerification:", requiresVerification);
    console.log("[DEBUG Login] user.isVerified:", user.isVerified);
    console.log("[DEBUG Login] user.id:", user.id);

    if (requiresVerification) {
      console.log("[DEBUG Login] requiresVerification = TRUE - akan kirim ulang kode verifikasi");
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

    console.log("[DEBUG Login] requiresVerification = FALSE - login berhasil");
    generateTokenForAuth({ res, userId: user.id, userRole: user.role });
    res.clearCookie("temp_token");

    res.status(200).json({
      success: true,
      message: "Login successfully",
      user,
    });
  },

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

  getCurrentUser: async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const userRole = req.userRole;

    console.log("------------------- GET CURRENT USER -------------------");
    console.log("[DEBUG Controller] Request UserID:", userId);
    console.log("[DEBUG Controller] Request UserRole:", userRole);

    if (!userId) {
      console.log("[DEBUG Controller] FAILED: userId is missing");
      return res.status(400).json({ success: false, message: "User id not found" });
    }

    const user = await authService.getCurrentUser(userId);

    if (!user) {
      console.log("[DEBUG Controller] FAILED: user object is null from service");
    } else {
      console.log("[DEBUG Controller] SUCCESS: user fetched for", user.email);
    }

    res.status(200).json({ success: true, user });
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    console.log("[DEBUG updateProfile] req.body:", req.body);
    console.log("[DEBUG updateProfile] req.files:", req.files);
    console.log("[DEBUG updateProfile] has profilePicture:", "profilePicture" in (req.files || {}));

    const { fullName, phoneNumber } = req.body || {};
    const userId = req.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "User id not found" });
    }

    const imageUrl = await getUploadUrl(req.files?.profilePicture as UploadedFile, "profile-picture");
    console.log("[DEBUG updateProfile] imageUrl:", imageUrl);

    console.log("[DEBUG updateProfile] calling authService.updateProfile with:", { fullName, phoneNumber, imageUrl, userId });
    const user = await authService.updateProfile({
      fullName,
      phoneNumber,
      imageUrl,
      userId,
    });
    console.log("[DEBUG updateProfile] success, user:", user);

    res.status(200).json({ success: true, message: "Updated profile successfully", user });
  },

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

  forgotPassword: async (req: Request, res: Response) => {
    const { email }: ForgotPassword = req.body;
    if (!email.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    await authService.forgotPassword(sanitizeEmail(email));
    res.status(200).json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  },

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