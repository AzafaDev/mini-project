export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isVerified: boolean;
  profilePicture?: string;
  phoneNumber?: string;
  points?: number;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  role?: string;
  referrerCode?: string;
}

export interface VerifyEmailRequest {
  token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}