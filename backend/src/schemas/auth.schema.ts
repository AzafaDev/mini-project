import { z } from "zod";

// Role enum
const roleEnum = z.enum(["CUSTOMER", "ORGANIZER"]);

// Register schema
export const registerSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email format" })
    .min(1, { message: "Email is required" }),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password must be at least 8 characters" })
    .max(100, { message: "Password must not exceed 100 characters" }),
  fullName: z
    .string({ message: "Full name is required" })
    .min(1, { message: "Full name is required" })
    .max(100, { message: "Full name must not exceed 100 characters" }),
  phoneNumber: z
    .string()
    .optional()
    .refine((val) => !val || /^(\+62|62|0)[0-9]{9,13}$/.test(val), {
      message: "Invalid phone number format",
    }),
  role: roleEnum.default("CUSTOMER"),
  referralCode: z.string().optional(),
});

// Login schema
export const loginSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email format" }),
  password: z
    .string({ message: "Password is required" })
    .min(1, { message: "Password is required" }),
});

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Invalid email format" }),
});

// Reset password schema
export const resetPasswordSchema = z.object({
  token: z
    .string({ message: "Token is required" })
    .min(1, { message: "Token is required" }),
  newPassword: z
    .string({ message: "New password is required" })
    .min(8, { message: "New password must be at least 8 characters" })
    .max(100, { message: "New password must not exceed 100 characters" }),
});

// Change password schema
export const changePasswordSchema = z.object({
  oldPassword: z
    .string({ message: "Old password is required" })
    .min(1, { message: "Old password is required" }),
  newPassword: z
    .string({ message: "New password is required" })
    .min(8, { message: "New password must be at least 8 characters" })
    .max(100, { message: "New password must not exceed 100 characters" }),
});

// Export types
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
