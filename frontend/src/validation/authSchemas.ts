import * as Yup from "yup";

// Login Schema
export const loginSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  password: Yup.string().required("Password is required"),
});

// Register Schema
export const registerSchema = Yup.object().shape({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
  phoneNumber: Yup.string().matches(
    /^(\+62|0)[0-9]{9,14}$/,
    "Phone number must be 10-15 digits, can start with +62 or 0"
  ),
  password: Yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  role: Yup.string()
    .required("Role is required")
    .oneOf(["CUSTOMER", "ORGANIZER"], "Invalid role selected"),
  referrerCode: Yup.string(),
});

// Phone number regex for validation
export const PHONE_REGEX = /^(\+62|0)[0-9]{9,14}$/;

// Verify Email Schema (6-digit OTP)
export const verifyEmailSchema = Yup.object().shape({
  token: Yup.string()
    .required("Verification code is required")
    .length(6, "Verification code must be 6 characters"),
});

// Forgot Password Schema
export const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .required("Email is required")
    .email("Please enter a valid email address"),
});

// Reset Password Schema
export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});

// Update Profile Schema
export const updateProfileSchema = Yup.object().shape({
  fullName: Yup.string().min(1),
  phoneNumber: Yup.string().matches(
    /^(\+62|0)[0-9]{9,14}$/,
    "Phone number must be 10-15 digits, can start with +62 or 0"
  ),
  profilePicture: Yup.mixed().optional(),
});

// Change Password Schema
export const changePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("newPassword")], "Passwords do not match"),
});
