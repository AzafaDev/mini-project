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
    let referrer: { id: string } | null;
    if (referrerCode) {
      referrer = await prisma.user.findFirst({
        where: { referralCode: { equals: referrerCode, mode: 'insensitive' } },
      });
      if (!referrer) throw new AppError("Invalid referral code", 409);
    }

    const verifyToken = generateVerificationCode();
    const hashedPassword = await bcrypt.hash(password, 10);
    const referralCode = await generateUniqueReferralCode();

    const result = await prisma.$transaction(async (tx) => {
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

      if (referrer) {
        await tx.pointTransaction.create({
          data: {
            userId: referrer.id,
            amount: REFERRAL_POINT,
            reason: `Referral bonus: ${newUser.fullName} registered`,
            expiresAt: new Date(Date.now() + 3 * 30 * 24 * 60 * 60 * 1000),
          },
        });

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

      return { newUser };
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
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) throw new AppError("Invalid email or password", 401);

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      throw new AppError("Invalid email or password", 401);

    if (!user.isVerified) {
      return { user: sanitizeUser(user), requiresVerification: true };
    }

    return { user: sanitizeUser(user), requiresVerification: false };
  },

  getCurrentUser: async (userId: string) => {
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
