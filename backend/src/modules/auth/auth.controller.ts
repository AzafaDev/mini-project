import { UploadedFile } from "express-fileupload";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";

import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
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

// Helper: send verification email and set temp_token cookie
const sendVerificationAndSetCookie = async (
  user: {
    id: string;
    email: string;
    fullName: string;
    verifyToken: string | null;
  },
  res: Response,
) => {
  let emailSent = true;
  try {
    await sendEmail.verificationEmail({
      email: user.email,
      token: user.verifyToken as string,
      username: user.fullName,
    });
  } catch (error) {
    emailSent = false;
    console.error("[EMAIL_FAILED]", error);
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
    expiresIn: "30m",
  });
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
    emailSent,
  });
};

export const authController = {
  register: async (req: Request, res: Response) => {
    console.log("[DEBUG] register - Request body:", req.body);
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

      // Sanitasi email: trim + lowercase
      console.log("[DEBUG] register - Sanitizing email:", email);
      const sanitizedEmail = email.trim().toLowerCase();

      // Upload gambar (jika ada)
      console.log("[DEBUG] register - Checking for image file");
      if (req.files && "imageFile" in req.files) {
        const imageFile = req.files.imageFile as UploadedFile;
        console.log(
          "[DEBUG] register - File found, attempting upload:",
          imageFile.name,
          imageFile.mimetype,
        );
        try {
          imageUrl = await uploadToCloudinary(
            imageFile.tempFilePath,
            "profile-picture",
          );
          console.log(
            "[DEBUG] register - Cloudinary upload success, imageUrl:",
            imageUrl,
          );
        } catch (error) {
          console.log("[DEBUG] register - Cloudinary upload failed:", error);
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture",
          });
        }
      } else {
        console.log("[DEBUG] register - No image file in request");
      }

      console.log("[DEBUG] register - imageUrl before service call:", imageUrl);

      // Cek apakah email sudah terdaftar (case-insensitive)
      console.log(
        "[DEBUG] register - Checking existing user for email:",
        sanitizedEmail,
      );
      const existingUser = await prisma.user.findUnique({
        where: { email: sanitizedEmail },
      });

      if (existingUser) {
        console.log("[DEBUG] register - Existing user found:", existingUser.id);
        // === FLOW USER EXISTING ===
        // Jika user sudah verified, jangan izinkan re-register
        if (existingUser.isVerified) {
          return res.status(409).json({
            success: false,
            message:
              "Email already exists. Please login or use forgot password.",
          });
        }

        const newToken = generateVerificationCode();
        console.log(
          "[DEBUG] register - Generated new verification token:",
          newToken,
        );
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
        console.log("[DEBUG] register - Rehashing and updating existing user");

        // Gunakan helper untuk kirim email + set cookie
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

      // === FLOW USER BARU ===
      console.log("[DEBUG] register - Calling authService.register");
      const result = await authService.register({
        email: sanitizedEmail,
        password,
        fullName,
        phoneNumber,
        role,
        referrerCode,
        imageUrl,
      });
      console.log(
        "[DEBUG] register - User created successfully, result:",
        result.newUser.id,
      );

      // Gunakan helper untuk kirim email + set cookie
      console.log(
        "[DEBUG] register - Sending verification email and setting cookie",
      );
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
      console.log("[DEBUG] register - Error occurred:", error.message);
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
      res.status(400).json({ success: false, message: error.message });
    }
  },
  login: async (req: Request, res: Response) => {
    const { email, password }: Login = req.body;

    // 1. Panggil service (Logika bisnis ada di sini)
    const { user, requiresVerification } = await authService.login({
      email: email.trim().toLowerCase(),
      password,
    });

    // 2. Handle jika butuh verifikasi
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

    // 3. Handle login sukses
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
  getCurrentUser: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId)
        return res
          .status(400)
          .json({ success: false, message: "User id not found" });
      const user = await authService.getCurrentUser(userId);
      res.status(200).json({ success: true, user });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  },
  updateProfile: async (req: AuthRequest, res: Response) => {
    try {
      const { fullName, phoneNumber } = req.body;
      const userId = req.userId;
      if (!userId)
        return res
          .status(400)
          .json({ success: false, message: "User id not found" });
      let imageUrl;
      // Upload gambar (jika ada)
      if (req.files && "imageFile" in req.files) {
        const imageFile = req.files.imageFile as UploadedFile;
        try {
          imageUrl = await uploadToCloudinary(
            imageFile.tempFilePath,
            "profile-picture",
          );
        } catch (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload profile picture",
          });
        }
      }
      const user = await authService.updateProfile({
        fullName,
        phoneNumber,
        imageUrl,
        userId,
      });
      res
        .status(200)
        .json({ success: true, message: "Updated profile successfully", user });
    } catch (error: any) {
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
      await authService.forgotPassword(email.trim().toLowerCase());
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
