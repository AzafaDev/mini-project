import { Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";

// Generate kode referral acak 6 karakter alfanumeric
const generateReferralCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Generate kode referral yang unik dan belum terpakai di database
export const generateUniqueReferralCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    code = generateReferralCode();

    // Cek apakah kode sudah dipakai user lain
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!existing) {
      isUnique = true;
      return code;
    }

    attempts++;
  }

  throw new Error("Failed to generate unique referral code");
};

// Generate kode verifikasi 6 digit numeric untuk email
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate JWT token dan set sebagai cookie httpOnly
export const generateTokenForAuth = ({
  res,
  userId,
  userRole,
}: {
  res: Response;
  userId: string;
  userRole: string;
}) => {
  console.log("[DEBUG Token] generateTokenForAuth - userId:", userId, "userRole:", userRole);
  // Token JWT berlaku selama 7 hari
  const token = jwt.sign({ userId, userRole }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  // Set cookie dengan security flag standar industry
  res.cookie("auth_token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // Tidak bisa diakses javascript client
    sameSite: "strict", // Mencegah CSRF attack
    secure: process.env.NODE_ENV === "production", // Hanya kirim lewat HTTPS di production
    path: "/",
  });
  console.log("[DEBUG Token] auth_token cookie sudah di-set");
};
