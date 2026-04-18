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

/**
 * Removes sensitive fields from user object before sending to client.
 * Strips: password, resetPasswordToken, resetPasswordTokenExpiresAt, verifyToken, verifyTokenExpiresAt
 * 
 * @param user - Full user object from database
 * @returns User object with sensitive fields removed
 */
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
  /**
   * Registers a new user with email verification flow.
   * 
   * Process:
   * 1. Validate referral code if provided
   * 2. Generate verification token and hash password
   * 3. Create user in database with Prisma transaction
   * 4. If referral code exists, award referrer with points and create coupon for new user
   * 
   * @param userData - User registration data (email, password, fullName, phoneNumber, role, referrerCode, imageUrl)
   * @returns Object containing the newly created user
   */
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
        where: { referralCode: { equals: referrerCode, mode: "insensitive" } },
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

        await tx.user.update({
          where: { id: referrer.id },
          data: {
            points: { increment: REFERRAL_POINT },
          },
        });
      }

      return { newUser };
    });

    return result;
  },

  /**
   * Updates an existing unverified user's password when they re-register.
   * This handles the case where user started registration but didn't verify email.
   * 
   * @param email - User's email address
   * @param password - New plain text password to be hashed
   * @param updateData - Updated user data (phoneNumber, profilePicture, fullName, role)
   * @param newVerifyToken - New verification token to be sent
   * @returns Updated user object
   */
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

  /**
   * Verifies user's email using the token from the verification email.
   * Clears verification tokens and marks user as verified.
   * 
   * @param token - Verification token from email
   * @returns Sanitized user object (without sensitive fields)
   */
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

  /**
   * Resends verification email to unverified user.
   * Generates new verification token with 24-hour expiry.
   * 
   * @param userId - ID of user to resend verification for
   */
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

  /**
   * Authenticates user with email and password.
   * 
   * Flow:
   * 1. Find user by email
   * 2. Compare password with hashed password in database
   * 3. If not verified, generate new verification token and return requiresVerification=true
   * 4. If verified, return user data with requiresVerification=false
   * 
   * @param credentials - Login credentials (email, password)
   * @returns Object with user data and requiresVerification flag
   */
  login: async ({ email, password }: Login) => {
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { ownedCoupons: true }
    });

    if (!user) throw new AppError("Invalid email or password", 401);

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      throw new AppError("Invalid email or password", 401);

    if (!user.isVerified) {
      const newVerifyToken = generateVerificationCode();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          verifyToken: newVerifyToken,
          verifyTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      return {
        user: { ...sanitizeUser(user), verifyToken: newVerifyToken },
        requiresVerification: true,
      };
    }

    return { user: sanitizeUser(user), requiresVerification: false };
  },

  /**
   * Retrieves current user's profile data including their coupons.
   * 
   * @param userId - ID of user to fetch
   * @returns Sanitized user object with ownedCoupons
   */
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

  /**
   * Updates user's profile fields.
   * Only updates fields that are provided (not undefined).
   * 
   * @param data - Profile update data (userId required, others optional)
   * @returns Updated user object with ownedCoupons
   */
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
      include: {
        ownedCoupons: true,
      },
    });
    return sanitizeUser(updatedUser);
  },

  /**
   * Changes user's password after verifying current password.
   * Ensures new password is different from current password.
   * 
   * @param passwordData - Object with currentPassword, newPassword, and userId
   * @returns Updated user object (without password field)
   */
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

  /**
   * Initiates password reset flow.
   * Generates reset token and sends reset email.
   * Note: Returns void if email doesn't exist (doesn't reveal to attackers).
   * 
   * @param email - User's email address
   */
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

  /**
   * Completes password reset using token from email.
   * Validates token hasn't expired and updates password.
   * 
   * @param resetData - Object with token and newPassword
   * @returns Updated user object (without password)
   */
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