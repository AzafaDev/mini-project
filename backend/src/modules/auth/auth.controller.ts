import { Request, Response } from "express";
import { authService } from "./auth.service";
import { registerSchema } from "../../schemas/auth.schema";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary.js";
import generateTokenAndSetCookie from "../../utils/generateTokenAndSetCookie";

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      // Validate request body
      const validatedData = registerSchema.parse(req.body);

      let profilePicture: string | undefined;

      // Upload profile picture if provided
      console.log("[AUTH CONTROLLER] req.files:", req.files);
      console.log(
        "[AUTH CONTROLLER] Has profilePictureFile:",
        req.files && "profilePictureFile" in req.files,
      );

      if (req.files && "profilePictureFile" in req.files) {
        const profilePictureFile = req.files.profilePictureFile as any;
        console.log("[AUTH CONTROLLER] File info:", {
          name: profilePictureFile.name,
          size: profilePictureFile.size,
          mimetype: profilePictureFile.mimetype,
          tempFilePath: profilePictureFile.tempFilePath,
        });

        const fs = await import("fs");
        const tempFilePath = profilePictureFile.tempFilePath;

        if (tempFilePath) {
          console.log("[AUTH CONTROLLER] Reading file from:", tempFilePath);
          const fileBuffer = fs.readFileSync(tempFilePath);
          console.log("[AUTH CONTROLLER] File buffer size:", fileBuffer.length);

          console.log("[AUTH CONTROLLER] Uploading to Cloudinary...");
          const uploadResult = await uploadToCloudinary(fileBuffer, "profiles");
          console.log("[AUTH CONTROLLER] Upload result:", uploadResult);

          profilePicture = uploadResult.secure_url;
          console.log("[AUTH CONTROLLER] Profile picture URL:", profilePicture);
        } else {
          console.log("[AUTH CONTROLLER] No tempFilePath found!");
        }
      } else {
        console.log("[AUTH CONTROLLER] No profile picture file uploaded");
      }

      console.log(
        "[AUTH CONTROLLER] Final profilePicture value:",
        profilePicture,
      );

      // Register user
      const { user, verifyToken } = await authService.register({
        email: validatedData.email,
        password: validatedData.password,
        fullName: validatedData.fullName,
        phoneNumber: validatedData.phoneNumber,
        profilePicture,
        role: validatedData.role,
        referralCode: validatedData.referralCode,
      });

      generateTokenAndSetCookie(res, user.id, user.role);

      // Return success response (exclude sensitive data)
      res.status(201).json({
        message: "Registration successful",
        data: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          referralCode: user.referralCode,
          profilePicture: user.profilePicture,
          verifyToken,
        },
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        res.status(400).json({
          message: "Validation error",
          errors: error.errors,
        });
        return;
      }
      res.status(400).json({ message: error.message });
    }
  },
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  },
  resendVerifyEmail: async (req: Request, res: Response) => {
    console.log("[AUTH CONTROLLER] resendVerifyEmail called");
    console.log("[AUTH CONTROLLER] User from middleware:", req.user);

    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new Error("User ID not found");
      }
      console.log("[AUTH CONTROLLER] User ID:", userId);

      const result = await authService.resendVerifyEmail(userId);
      console.log("[AUTH CONTROLLER] Service result:", result);

      res.status(200).json(result);
    } catch (error: any) {
      console.log("[AUTH CONTROLLER] Error:", error.message);
      res.status(400).json({ message: error.message });
    }
  },
};
