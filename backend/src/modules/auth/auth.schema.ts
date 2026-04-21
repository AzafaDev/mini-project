import { z } from "zod";
import { Role } from "../../../generated/prisma/enums";

// Register validation schema
export const registerSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    fullName: z.string().min(1, "Full name is required"),
    phoneNumber: z.string().optional(),
    role: z.nativeEnum(Role, {
      message: "Role must be CUSTOMER or ORGANIZER",
    }),
    referrerCode: z.string().optional(),
  }),
});

// Login validation schema
export const loginSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(1, "Password is required"),
  }),
});

// Verify email validation schema
export const verifyEmailSchema = z.object({
  body: z.object({
    token: z
      .string()
      .min(6, "Token must be at least 6 characters")
      .max(6, "Token must be at most 6 characters"),
  }),
});

// Update profile validation schema
export const updateProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(1, "Full name is required").optional(),
    phoneNumber: z.string().optional(),
    profilePicture: z.any().optional(),
  }),
});

// Change password validation schema
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
  }),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  body: z.object({
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
  }),
});

// Type exports
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
