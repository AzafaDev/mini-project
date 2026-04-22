import { Request } from "express";
import { Role } from "@prisma/client";

export type AuthRegister = {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: Role;
  referrerCode: string;
  imageUrl: string | undefined;
};

export type VerifyEmail = {
  token: string;
};

export type Login = {
  email: string;
  password: string;
};

export type ForgotPassword = {
  email: string;
};

export type ResetPassword = {
  newPassword: string;
};

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}
