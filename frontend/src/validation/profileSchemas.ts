import * as Yup from "yup";

// Update Profile Schema
export const updateProfileSchema = Yup.object().shape({
  fullName: Yup.string(),
  phoneNumber: Yup.string(),
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
