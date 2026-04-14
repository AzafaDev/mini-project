import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UploadedFile } from "express-fileupload";

import { handleFileUpload } from "../../utils/handleFileUpload";
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
  // LOG 1: Cek data user sebelum pembuatan temp_token
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

  // LOG 2: Pastikan JWT_SECRET terdefinisi
  if (!process.env.JWT_SECRET) {
    console.error("[DEBUG Register] CRITICAL: JWT_SECRET is undefined in .env");
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });

  // LOG 3: Verifikasi isi token yang baru dibuat (opsional)
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
    try {
      let imageUrl;
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

      if (req.files && "profilePicture" in req.files) {
        const imageFile = req.files.profilePicture as UploadedFile;
        try {
          imageUrl = await handleFileUpload(imageFile, {
            folder: "profile-picture",
          });
          console.log("[DEBUG register] image uploaded, url:", imageUrl);
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture",
          });
        }
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });

      console.log("[DEBUG register] existingUser check:", existingUser ? "found" : "not found");

      if (existingUser) {
        if (existingUser.isVerified) {
          console.log("[DEBUG register] user exists and is verified - rejecting");
          return res.status(409).json({
            success: false,
            message:
              "Email already exists. Please login or use forgot password.",
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
    } catch (error: any) {
      console.log("[DEBUG register] error:", error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { token }: VerifyEmail = req.body;
      if (!token.trim() || token.trim().length < 6) {
        return res
          .status(400)
          .json({ success: false, message: "Token is required" });
      }
      const user = await authService.verifyEmail({ token });
      generateTokenForAuth({ res, userId: user.id, userRole: user.role });
      res.clearCookie("temp_token");
      res
        .status(200)
        .json({ success: true, message: "Verify email successfully", user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  resendVerification: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      await authService.resendVerification(userId);
      res.status(200).json({
        success: true,
        message: "Verification email resent successfully",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });login: (email: string, password: string) => Promise<void>;
    }
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
    try {
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
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  // backend/src/modules/auth/auth.controller.ts

  getCurrentUser: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      const userRole = req.userRole;

      // LOG 3: Cek data yang diteruskan dari middleware
      console.log("------------------- GET CURRENT USER -------------------");
      console.log("[DEBUG Controller] Request UserID:", userId);
      console.log("[DEBUG Controller] Request UserRole:", userRole);

      if (!userId) {
        console.log("[DEBUG Controller] FAILED: userId is missing");
        return res
          .status(400)
          .json({ success: false, message: "User id not found" });
      }

      const user = await authService.getCurrentUser(userId);

      // LOG 4: Cek data final dari Database via Service
      if (!user) {
        console.log(
          "[DEBUG Controller] FAILED: user object is null from service",
        );
      } else {
        console.log("[DEBUG Controller] SUCCESS: user fetched for", user.email);
      }

      res.status(200).json({ success: true, user });
    } catch (error: any) {
      console.log("[DEBUG Controller] CRITICAL ERROR:", error.message);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      console.log("[DEBUG updateProfile] req.body:", req.body);
      console.log("[DEBUG updateProfile] req.files:", req.files);
      console.log("[DEBUG updateProfile] has profilePicture:", "profilePicture" in (req.files || {}));

      const { fullName, phoneNumber } = req.body || {};
      const userId = req.userId;
      if (!userId)
        return res
          .status(400)
          .json({ success: false, message: "User id not found" });
      let imageUrl;
      if (req.files && "profilePicture" in req.files) {
        const imageFile = req.files.profilePicture as UploadedFile;
        console.log("[DEBUG updateProfile] imageFile:", imageFile.name, imageFile.size, imageFile.mimetype);
        console.log("[DEBUG updateProfile] tempFilePath:", imageFile.tempFilePath);
        try {
          imageUrl = await handleFileUpload(imageFile, {
            folder: "profile-picture",
          });
          console.log("[DEBUG updateProfile] imageUrl:", imageUrl);
        } catch (error: any) {
          console.log("[DEBUG updateProfile] upload error:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture",
          });
        }
      }
      console.log("[DEBUG updateProfile] calling authService.updateProfile with:", { fullName, phoneNumber, imageUrl, userId });
      const user = await authService.updateProfile({
        fullName,
        phoneNumber,
        imageUrl,
        userId,
      });
      console.log("[DEBUG updateProfile] success, user:", user);
      res
        .status(200)
        .json({ success: true, message: "Updated profile successfully", user });
    } catch (error: any) {
      console.log("[DEBUG updateProfile] catch error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  },

  changePassword: async (req: AuthRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;
      if (!userId)
        return res
          .status(400)
          .json({ success: false, message: "User id not found" });
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
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  forgotPassword: async (req: Request, res: Response) => {
    try {
      const { email }: ForgotPassword = req.body;
      if (!email.trim())
        return res
          .status(400)
          .json({ success: false, message: "Email is required" });
      await authService.forgotPassword(sanitizeEmail(email));
      res.status(200).json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
  } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },

  resetPassword: async (req: Request, res: Response) => {
    try {
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
      res
        .status(200)
        .json({ success: true, message: "Reset password successfully", user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
};
