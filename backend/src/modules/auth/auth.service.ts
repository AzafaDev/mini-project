import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../config/prisma";
import crypto from "crypto";
import { hashPassword } from "../../utils/hashPassword";
import {
  sendVerificationEmail,
  sendResendVerificationEmail,
} from "../../utils/sendEmail";

interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  profilePicture?: string;
  role: Role;
  referralCode?: string;
}

/**
 * Generate referral code (8 chars alphanumeric)
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate coupon code
 */
function generateCouponCode(): string {
  return "REF-" + crypto.randomBytes(3).toString("hex").toUpperCase();
}

/**
 * Generate unique referral code with retry
 */
async function generateUniqueReferralCode(tx: any): Promise<string> {
  let code = generateReferralCode();
  let existing = await tx.user.findUnique({
    where: { referralCode: code },
  });
  while (existing) {
    code = generateReferralCode();
    existing = await tx.user.findUnique({ where: { referralCode: code } });
  }
  return code;
}

/**
 * Generate unique coupon code with retry
 */
async function generateUniqueCouponCode(tx: any): Promise<string> {
  let code = generateCouponCode();
  let existing = await tx.coupon.findUnique({ where: { code } });
  while (existing) {
    code = generateCouponCode();
    existing = await tx.coupon.findUnique({ where: { code } });
  }
  return code;
}

/**
 * Generate 6-digit verification token
 */
function generateVerificationToken(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authService = {
  /**
   * Register a new user
   */
  register: async (data: RegisterInput) => {
    try {
      // Normalize email to lowercase and trim
      const email = data.email.toLowerCase().trim();
      const fullName = data.fullName.trim();
      const referralCode = data.referralCode?.trim();

      // Check if email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error("Email is already registered");
      }

      // Validate referral code if provided
      let referrer = null;
      if (referralCode) {
        referrer = await prisma.user.findUnique({
          where: { referralCode },
        });

        if (!referrer) {
          throw new Error("Invalid referral code");
        }
      }

      // Hash password with bcrypt
      const hashedPassword = await hashPassword(data.password);

      // Use transaction for all related operations
      const result = await prisma.$transaction(async (tx) => {
        // Generate unique referral code for new user
        const newReferralCode = await generateUniqueReferralCode(tx);

        // Generate verification token
        const verifyToken = generateVerificationToken();
        const verifyTokenExpiresAt = new Date();
        verifyTokenExpiresAt.setHours(verifyTokenExpiresAt.getHours() + 24);

        // Generate unique coupon code if referral is used
        const couponCode = referrer ? await generateUniqueCouponCode(tx) : null;

        // Create the new user
        const user = await tx.user.create({
          data: {
            email,
            password: hashedPassword,
            fullName,
            phoneNumber: data.phoneNumber || null,
            profilePicture: data.profilePicture || null,
            role: data.role,
            referralCode: newReferralCode,
            referredBy: referrer?.referralCode || null,
            verifyToken,
            verifyTokenExpiresAt,
          },
        });

        // If referred, handle referral rewards
        if (referrer) {
          // 1. Give 10,000 points to referrer (expires in 3 months)
          const pointsExpiry = new Date();
          pointsExpiry.setMonth(pointsExpiry.getMonth() + 3);

          await tx.pointTransaction.create({
            data: {
              userId: referrer.id,
              amount: 10000,
              reason: "referral_reward",
              expiresAt: pointsExpiry,
            },
          });

          // Update referrer's points
          await tx.user.update({
            where: { id: referrer.id },
            data: {
              points: {
                increment: 10000,
              },
            },
          });

          // 2. Create referral coupon for new user (expires in 3 months)
          const couponExpiry = new Date();
          couponExpiry.setMonth(couponExpiry.getMonth() + 3);

          await tx.coupon.create({
            data: {
              code: couponCode!,
              discountType: "percentage",
              discountValue: 10,
              minPurchase: 0,
              startDate: new Date(),
              endDate: couponExpiry,
              userId: user.id,
            },
          });
        }

        return { user, verifyToken };
      });

      // Send verification email (outside transaction, non-blocking)
      console.log(
        "[AUTH SERVICE] Sending verification email to:",
        result.user.email,
      );
      console.log("[AUTH SERVICE] Verification token:", result.verifyToken);

      sendVerificationEmail({
        to: result.user.email,
        name: result.user.fullName,
        token: result.verifyToken,
      })
        .then(() => {
          console.log("[AUTH SERVICE] Verification email sent successfully");
        })
        .catch((error) => {
          console.error(
            "[AUTH SERVICE] Failed to send verification email:",
            error.message,
          );
          console.error("[AUTH SERVICE] Error details:", error);
        });

      return { user: result.user, verifyToken: result.verifyToken };
    } catch (error: any) {
      throw new Error(error.message);
    }
  },
  verifyEmail: async (token: string) => {
    // Find user with valid token that hasn't expired
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        verifyTokenExpiresAt: { gte: new Date() },
      },
    });

    if (!user) {
      throw new Error("Token is expired or invalid");
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verifyToken: null,
        verifyTokenExpiresAt: null,
      },
    });

    return { message: "Email verified successfully", email: user.email };
  },

  /**
   * Resend verification email with new token
   */
  resendVerifyEmail: async (userId: string) => {
    console.log("[AUTH SERVICE] resendVerifyEmail called with userId:", userId);

    // Find user by ID
    console.log("[AUTH SERVICE] Looking up user by ID...");
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    console.log("[AUTH SERVICE] User found:", !!user);
    if (!user) {
      console.log("[AUTH SERVICE] User not found for ID:", userId);
      throw new Error("User not found");
    }

    // Check if already verified
    console.log("[AUTH SERVICE] User verified status:", user.isVerified);
    if (user.isVerified) {
      console.log("[AUTH SERVICE] User already verified");
      throw new Error("Email is already verified");
    }

    // Generate new verification token
    const newToken = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = new Date();
    newExpiry.setHours(newExpiry.getHours() + 24);

    console.log("[AUTH SERVICE] New token generated:", newToken);
    console.log("[AUTH SERVICE] Token expires at:", newExpiry);

    // Update user with new token
    console.log("[AUTH SERVICE] Updating user with new token...");
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyToken: newToken,
        verifyTokenExpiresAt: newExpiry,
      },
    });
    console.log("[AUTH SERVICE] User updated successfully");

    // Send resend verification email
    console.log(
      "[AUTH SERVICE] Sending resend verification email to:",
      user.email,
    );
    console.log("[AUTH SERVICE] Verification token:", newToken);

    sendResendVerificationEmail({
      to: user.email,
      name: user.fullName,
      token: newToken,
    })
      .then(() => {
        console.log(
          "[AUTH SERVICE] Resend verification email sent successfully",
        );
      })
      .catch((error) => {
        console.error(
          "[AUTH SERVICE] Failed to send resend verification email:",
          error.message,
        );
      });

    return {
      message: "Verification email sent successfully",
      email: user.email,
    };
  },
};
