/**
 * Application-wide constants
 * Centralized magic numbers for easy maintenance
 */

// Transaction constants
export const TRANSACTION_EXPIRATION_HOURS = 2;
export const TRANSACTION_AUTO_CANCEL_DAYS = 3;
export const POINTS_EARNED_MULTIPLIER = 10;
export const MAX_POINTS_PER_TRANSACTION = 50000;

// Referral constants
export const REFERRAL_POINT_REWARD = 10000;
export const POINTS_EXPIRATION_MONTHS = 3;
export const COUPON_EXPIRATION_MONTHS = 3;

// Discount constants
export const REFERRAL_DISCOUNT_PERCENTAGE = 10;

// Pagination defaults
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

// Email token expiration
export const VERIFICATION_TOKEN_EXPIRY_HOURS = 24;
export const RESET_PASSWORD_TOKEN_EXPIRY_MINUTES = 15;

// Password hashing
export const BCRYPT_SALT_ROUNDS = 10;
