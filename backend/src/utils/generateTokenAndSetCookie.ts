import { Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

const generateTokenAndSetCookie = (
  res: Response,
  userId: string,
  userRole: string,
) => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }
  const token = jwt.sign({ userId, userRole }, secret, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
};

export default generateTokenAndSetCookie;
