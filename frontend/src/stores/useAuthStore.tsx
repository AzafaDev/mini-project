import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import type { User, LoginRequest, VerifyEmailRequest } from "../types/authTypes";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isRegistered: boolean;
  isResendingVerification: boolean;
  resendVerificationSuccess: boolean;
  resetPasswordSuccess: boolean;
  login: (data: LoginRequest) => Promise<{ success: boolean; requiresVerification?: boolean }>;
  register: (data: FormData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  verifyEmail: (data: VerifyEmailRequest) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
  clearRegistered: () => void;
  clearResendVerificationStatus: () => void;
  clearResetPasswordStatus: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isRegistered: false,
  isResendingVerification: false,
  resendVerificationSuccess: false,
  resetPasswordSuccess: false,

  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      if (response.data.success) {
        // Check if verification is required
        if (response.data.requiresVerification) {
          set({ isLoading: false });
          return { success: true, requiresVerification: true };
        }
        
        set({
          user: response.data.user || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true, requiresVerification: false };
      } else {
        set({ error: response.data.message, isLoading: false });
        return { success: false };
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Login failed",
        isLoading: false,
      });
      return { success: false };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null, isRegistered: false });
    try {
      const response = await axiosInstance.post("/auth/register", data);
      if (response.data.success) {
        set({ isLoading: false, isRegistered: true });
        return true;
      } else {
        set({ error: response.data.message, isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchCurrentUser: async () => {
    console.log("[AuthStore] fetchCurrentUser called");
    set({ isLoading: true });
    try {
      const response = await axiosInstance.get("/auth/me");
      console.log("[AuthStore] /auth/me response:", response.data.success);
      if (response.data.success) {
        set({
          user: response.data.user || null,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log("[AuthStore] user set:", response.data.user?.email);
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.log("[AuthStore] fetchCurrentUser error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  verifyEmail: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/verify-email", data);
      if (response.data.success) {
        set({
          user: response.data.user || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return true;
      } else {
        set({ error: response.data.message, isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Verification failed",
        isLoading: false,
      });
      return false;
    }
  },

  clearError: () => set({ error: null }),

  clearRegistered: () => set({ isRegistered: false }),

  resendVerification: async () => {
    set({ isResendingVerification: true, error: null, resendVerificationSuccess: false });
    try {
      const response = await axiosInstance.post("/auth/resend-verification");
      if (response.data.success) {
        set({ isResendingVerification: false, resendVerificationSuccess: true });
        return true;
      } else {
        set({ error: response.data.message, isResendingVerification: false });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to resend verification code",
        isResendingVerification: false,
      });
      return false;
    }
  },

  clearResendVerificationStatus: () => set({ resendVerificationSuccess: false, error: null }),

  forgotPassword: async (email: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      if (response.data.success) {
        set({ isLoading: false });
      } else {
        set({ error: response.data.message, isLoading: false });
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to send reset email",
        isLoading: false,
      });
    }
  },

  resetPassword: async (token: string, newPassword: string) => {
    set({ isLoading: true, error: null, resetPasswordSuccess: false });
    try {
      const response = await axiosInstance.post(`/auth/reset-password/${token}`, { newPassword });
      if (response.data.success) {
        set({ isLoading: false, resetPasswordSuccess: true });
        return true;
      } else {
        set({ error: response.data.message, isLoading: false });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to reset password",
        isLoading: false,
      });
      return false;
    }
  },

  clearResetPasswordStatus: () => set({ resetPasswordSuccess: false, error: null }),
}));
