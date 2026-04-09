import { Response } from "express";
import jwt from "jsonwebtoken";

import { prisma } from "../config/prisma";

const generateReferralCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateUniqueReferralCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10; // Safety limit

  while (!isUnique && attempts < maxAttempts) {
    code = generateReferralCode();

    // Cek apakah code sudah ada di database
    const existing = await prisma.user.findUnique({
      where: { referralCode: code },
    });

    if (!existing) {
      isUnique = true;
      return code;
    }

    attempts++;
  }

  // Fallback kalau semua attempts gagal (sangat jarang)
  throw new Error("Failed to generate unique referral code");
};

// utils/generateVerificationCode.ts
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
  // Hasil: "123456" — 6 digit numeric
};

export const generateTokenForAuth = ({
  res,
  userId,
  userRole,
}: {
  res: Response;
  userId: string;
  userRole: string;
}) => {
  const token = jwt.sign({ userId, userRole }, process.env.JWT_SECRET!, {
    expiresIn: "7d",
  });
  res.cookie("auth_token", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
};
