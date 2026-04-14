import bcrypt from "bcrypt";
import crypto from "crypto";

import { prisma } from "../../config/prisma";
import { Role } from "../../../generated/prisma/enums";
import { AuthRegister, Login, VerifyEmail } from "./auth.type";
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
    console.log("[DEBUG register service] received:", {
      email,
      fullName,
      role,
      referrerCode,
      hasImageUrl: !!imageUrl,
    });

    let referrer: { id: string } | null;
    if (referrerCode) {
      console.log(
        "[DEBUG register service] checking referrer code:",
        referrerCode,
      );
      referrer = await prisma.user.findFirst({
        where: { referralCode: { equals: referrerCode, mode: "insensitive" } },
      });
      console.log(
        "[DEBUG register service] referrer found:",
        referrer ? referrer.id : null,
      );
      if (!referrer) throw new AppError("Invalid referral code", 409);
    } else {
      console.log("[DEBUG register service] no referrer code provided");
    }

    const verifyToken = generateVerificationCode();
    console.log("[DEBUG register service] verifyToken generated");

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[DEBUG register service] password hashed");

    const referralCode = await generateUniqueReferralCode();
    console.log(
      "[DEBUG register service] referralCode generated:",
      referralCode,
    );

    const result = await prisma.$transaction(async (tx) => {
      console.log("[DEBUG register service] creating user in transaction");
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
      console.log("[DEBUG register service] user created with id:", newUser.id);

      if (referrer) {
        console.log(
          "[DEBUG register service] creating referral bonus for referrer:",
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

        const couponCode = crypto.randomBytes(4).toString("hex").toUpperCase();
        console.log(
          "[DEBUG register service] creating coupon for new user, code:",
          couponCode,
        );
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

        console.log(
          "[DEBUG register service] updating referrer points balance:",
          referrer.id,
        );
        await tx.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: REFERRAL_POINT },
          },
        });
      }

      return { newUser };
    });

    console.log("[DEBUG register service] registration complete, returning:", {
      userId: result.newUser.id,
      email: result.newUser.email,
    });
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
      "[DEBUG rehashAndUpdateUser] email:",
      email,
      "fullName:",
      updateData.fullName,
      "role:",
      updateData.role,
    );

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("[DEBUG rehashAndUpdateUser] password rehashed");

    console.log("[DEBUG rehashAndUpdateUser] updating user in database");
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
      "[DEBUG rehashAndUpdateUser] user updated, id:",
      updatedUser.id,
    );
    return updatedUser;
  },

  verifyEmail: async ({ token }: VerifyEmail) => {
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
    return sanitizeUser(updatedUser);
  },

  resendVerification: async (userId?: string) => {
    if (!userId) throw new AppError("User not found", 404);
    const newToken = generateVerificationCode();
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verifyToken: newToken,
        verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendEmail.verificationEmail({
      email: user.email,
      token: newToken,
      username: user.fullName,
    });
  },

  login: async ({ email, password }: Login) => {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { ownedCoupons: true }
    });

    if (!user) throw new AppError("Invalid email or password", 401);

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      throw new AppError("Invalid email or password", 401);

    console.log("[DEBUG Service] user.isVerified:", user.isVerified);
    console.log("[DEBUG Service] user.verifyToken:", user.verifyToken);

    if (!user.isVerified) {
      console.log(
        "[DEBUG Service] isVerified FALSE - generate new token & send email",
      );
      const newVerifyToken = generateVerificationCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verifyToken: newVerifyToken,
          verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      console.log("[DEBUG Service] new verifyToken generated:", newVerifyToken);
      return {
        user: { ...sanitizeUser(user), verifyToken: newVerifyToken },
        requiresVerification: true,
      };
    }

    console.log(
      "[DEBUG Service] isVerified TRUE - return requiresVerification: false",
    );
    return { user: sanitizeUser(user), requiresVerification: false };
  },

  getCurrentUser: async (userId: string) => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ownedCoupons: true,
      },
    });
    if (!user) throw new AppError("User not found", 404);
    return sanitizeUser(user);
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
    console.log("[DEBUG authService.updateProfile] received:", {
      userId,
      fullName,
      phoneNumber,
      imageUrl,
    });
    const data: any = {};
    if (fullName !== undefined) data.fullName = fullName;
    if (phoneNumber !== undefined) data.phoneNumber = phoneNumber;
    if (imageUrl !== undefined) data.profilePicture = imageUrl;
    console.log("[DEBUG authService.updateProfile] data to update:", data);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
      include: {
        ownedCoupons: true,
      },
    });
    return sanitizeUser(updatedUser);
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError("User not found", 404);
    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isCorrectPassword) throw new AppError("Invalid current password", 400);
    // Cek apakah newPassword sama dengan currentPassword
    const isSameAsOld = await bcrypt.compare(newPassword, user.password);
    if (isSameAsOld) throw new AppError("New password cannot be the same as current password", 400);
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
    return sanitizeUser(updatedUser);
  },

  forgotPassword: async (email: string) => {
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
  },

  resetPassword: async ({
    token,
    newPassword,
  }: {
    token: string;
    newPassword: string;
  }) => {
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
    return updatedUser;
  },
};
