import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "../../config/prisma";
import { Role } from "../../../generated/prisma/enums";
import { AuthRegister, AuthRequest, Login, VerifyEmail } from "./auth.type";
import {
  generateUniqueReferralCode,
  generateVerificationCode,
} from "../../utils/generateToken";
import { sendEmail } from "../../utils/sendEmail";
import { AppError } from "../../utils/AppError";

const DISCOUNT_PERCENTAGE = 10;
const REFERRAL_POINT = 10000;

const sanitizeUser = (user: any) => {
  const {
    password,
    resetPasswordToken,
    resetPasswordTokenExpiresAt,
    verifyToken,
    verifyTokenExpiresAt,
    ...rest
  } = user;
  return rest;
};

export const authService = {
  register: async ({
    email,
    password,
    fullName,
    phoneNumber,
    role,
    referrerCode,
    imageUrl,
  }: AuthRegister) => {
    console.log("[DEBUG] authService.register - Received data:", {
      email,
      fullName,
      phoneNumber,
      role,
      referrerCode,
      imageUrl,
    });
    let referrer: { id: string } | null;
    if (referrerCode) {
      referrer = await prisma.user.findFirst({
        where: { referralCode: { equals: referrerCode, mode: 'insensitive' } },
      });
      if (!referrer) throw new AppError("Invalid referral code", 409);
    }
    console.log(
      "[DEBUG] authService.register - Generating verify token and hashing password",
    );
    const verifyToken = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(
      "[DEBUG] authService.register - Generating unique referral code",
    );
    const referralCode = await generateUniqueReferralCode();
    console.log(
      "[DEBUG] authService.register - Starting transaction to create user",
    );
    const result = await prisma.$transaction(async (tx) => {
      console.log("[DEBUG] authService.register - Creating user in database");
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          fullName,
          phoneNumber,
          referralCode,
          role,
          referredBy: referrerCode || null,
          profilePicture: imageUrl,
          verifyToken: verifyToken,
          verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      console.log(
        "[DEBUG] authService.register - User created with ID:",
        newUser.id,
      );
      if (referrer) {
        console.log(
          "[DEBUG] authService.register - Creating referral bonus for referrer:",
          referrer.id,
        );
        await tx.pointTransaction.create({
          data: {
            userId: referrer.id,
            amount: REFERRAL_POINT,
            reason: `Referral bonus: ${newUser.fullName} registered`,
            expiresAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          },
        });
        console.log(
          "[DEBUG] authService.register - Creating discount coupon for new user",
        );
        const couponCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        await tx.coupon.create({
          data: {
            code: couponCode,
            discountType: "PERCENTAGE",
            discountValue: DISCOUNT_PERCENTAGE,
            startDate: new Date(Date.now()),
            endDate: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
            userId: newUser.id,
          },
        });
      }
      console.log(
        "[DEBUG] authService.register - Transaction completed successfully",
      );
      return { newUser };
    });
    console.log(
      "[DEBUG] authService.register - Register process completed, returning result",
    );
    return result;
  },

  rehashAndUpdateUser: async (
    email: string,
    password: string,
    updateData: {
      phoneNumber: string;
      profilePicture: string | undefined;
      fullName: string;
      role: Role;
    },
    newVerifyToken: string,
  ) => {
    console.log(
      "[DEBUG] authService.rehashAndUpdateUser - Start for email:",
      email,
    );
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        phoneNumber: updateData.phoneNumber,
        profilePicture: updateData.profilePicture,
        fullName: updateData.fullName,
        role: updateData.role,
        verifyToken: newVerifyToken,
        verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log(
      "[DEBUG] authService.rehashAndUpdateUser - User updated:",
      updatedUser.id,
    );
    return updatedUser;
  },

  verifyEmail: async ({ token }: VerifyEmail) => {
    console.log("[DEBUG] authService.verifyEmail - Start with token:", token);
    const userWithValidToken = await prisma.user.findFirst({
      where: { verifyToken: token, verifyTokenExpiresAt: { gt: new Date() } },
    });
    if (!userWithValidToken) {
      throw new AppError("Invalid or expired token", 400);
    }
    const updatedUser = await prisma.user.update({
      where: { id: userWithValidToken.id },
      data: {
        verifyToken: null,
        verifyTokenExpiresAt: null,
        isVerified: true,
      },
    });
    console.log(
      "[DEBUG] authService.verifyEmail - Email verified for user:",
      updatedUser.id,
    );
    return sanitizeUser(updatedUser);
  },
  resendVerification: async (userId?: string) => {
    console.log("[DEBUG] authService.resendVerification - Start");
    if (!userId) throw new AppError("User not found", 404);
    const newToken = generateVerificationCode();
    console.log(
      "[DEBUG] authService.resendVerification - New token generated:",
      newToken,
    );
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verifyToken: newToken,
        verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    console.log(
      "[DEBUG] authService.resendVerification - User updated:",
      user.id,
    );

    await sendEmail.verificationEmail({
      email: user.email,
      token: newToken,
      username: user.fullName,
    });
    console.log("[DEBUG] authService.resendVerification - Email sent");
  },
  login: async ({ email, password }: Login) => {
    console.log("[DEBUG] authService.login - Start");
    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[DEBUG] authService.login - User found:", user?.id || "null");

    if (!user) throw new AppError("Invalid email or password", 401);

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      throw new AppError("Invalid email or password", 401);
    console.log(
      "[DEBUG] authService.login - Password correct, checking verification status",
    );

    if (!user.isVerified) {
      console.log(
        "[DEBUG] authService.login - User not verified, returning requiresVerification=true",
      );
      return { user: sanitizeUser(user), requiresVerification: true };
    }

    console.log("[DEBUG] authService.login - User verified, returning user");
    return { user: sanitizeUser(user), requiresVerification: false };
  },
  getCurrentUser: async (userId: string) => {
    console.log("[DEBUG] authService.getCurrentUser - Start for userId:", userId);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profilePicture: true,
        role: true,
        referralCode: true,
        points: true,
        isVerified: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return user;
  },
  updateProfile: async ({
    userId,
    fullName,
    phoneNumber,
    imageUrl,
  }: {
    userId: string;
    fullName?: string;
    phoneNumber?: string;
    imageUrl?: string;
  }) => {
    console.log(
      "[DEBUG] authService.updateProfile - Start for userId:",
      userId,
    );
    
    const data: any = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (imageUrl !== undefined) data.profilePicture = imageUrl;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profilePicture: true,
        role: true,
        referralCode: true,
        points: true,
        isVerified: true,
        createdAt: true,
      },
    });
    console.log(
      "[DEBUG] authService.updateProfile - Profile updated for user:",
      updatedUser.id,
    );
    return updatedUser;
  },
  changePassword: async ({
    currentPassword,
    newPassword,
    userId,
  }: {
    currentPassword: string;
    newPassword: string;
    userId: string;
  }) => {
    console.log(
      "[DEBUG] authService.changePassword - Start for userId:",
      userId,
    );
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCorrectPassword) throw new AppError("Invalid current password", 400);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profilePicture: true,
        role: true,
        referralCode: true,
        points: true,
        isVerified: true,
        createdAt: true,
      },
    });
    console.log(
      "[DEBUG] authService.changePassword - Password changed for user:",
      updatedUser.id,
    );
    return sanitizeUser(updatedUser);
  },
  forgotPassword: async (email: string) => {
    console.log("[DEBUG] authService.forgotPassword - Start for email:", email);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return;
    const resetToken = crypto.randomBytes(32).toString("hex");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });
    await sendEmail.resetPassword({
      email: user.email,
      token: resetToken,
      username: user.fullName,
    });
    console.log("[DEBUG] authService.forgotPassword - Reset email sent");
  },
  resetPassword: async ({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }) => {
    console.log("[DEBUG] authService.resetPassword - Start with token");
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: { gt: new Date() },
      },
    });
    if (!user) throw new AppError("Invalid or expired token", 400);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phoneNumber: true,
        profilePicture: true,
        role: true,
        referralCode: true,
        points: true,
        isVerified: true,
        createdAt: true,
      },
    });
    console.log(
      "[DEBUG] authService.resetPassword - Password reset for user:",
      updatedUser.id,
    );
    return updatedUser;
  },
};
