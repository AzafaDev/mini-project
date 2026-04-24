import { create } from "zustand";
import axiosInstance from "../lib/axiosInstance";
import type { User, LoginRequest, VerifyEmailRequest } from "../types/authTypes";

/**
 * Zustand Store untuk mengelola seluruh state Autentikasi aplikasi.
 * Menangani login, register, logout, verifikasi email, forgot password,
 * dan pengecekan status otentikasi user secara global.
 * Semua state dan fungsi auth dapat diakses dari seluruh komponen aplikasi.
 */
interface AuthState {
  // --- State Data User ---
  user: User | null;
  isAuthenticated: boolean;
  
  // --- State Loading & Status ---
  isLoading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  
  // --- State Status Flow Autentikasi ---
  isRegistered: boolean;
  isResendingVerification: boolean;
  resendVerificationSuccess: boolean;
  resetPasswordSuccess: boolean;

  // --- Method Autentikasi Utama ---
  login: (data: LoginRequest) => Promise<{ success: boolean; requiresVerification?: boolean }>;
  register: (data: FormData) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  
  // --- Method Verifikasi & Recovery ---
  verifyEmail: (data: VerifyEmailRequest) => Promise<boolean>;
  resendVerification: () => Promise<boolean>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  
  // --- Method Helper Reset State ---
  clearError: () => void;
  clearRegistered: () => void;
  clearResendVerificationStatus: () => void;
  clearResetPasswordStatus: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // --- Nilai Default State ---
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isCheckingAuth: true,
  error: null,
  isRegistered: false,
  isResendingVerification: false,
  resendVerificationSuccess: false,
  resetPasswordSuccess: false,

  /**
   * Fungsi untuk proses login user
   * @param data - Data login berisi email dan password
   * @returns Object dengan status success dan apakah memerlukan verifikasi email
   */
  login: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      if (response.data.success) {
        // Jika user belum verifikasi email, arahkan ke halaman verifikasi
        if (response.data.requiresVerification) {
          set({ isLoading: false });
          return { success: true, requiresVerification: true };
        }
        
        // Jika login sukses dan terverifikasi, set state user dan autentikasi
        set({
          user: response.data.user || null,
          isAuthenticated: true,
          isLoading: false,
        });
        return { success: true, requiresVerification: false };
      } else {
        // Jika login gagal dari sisi backend
        set({ error: response.data.message, isLoading: false });
        return { success: false };
      }
    } catch (error: any) {
      // Jika terjadi error network atau server
      set({
        error: error.message || "Login failed",
        isLoading: false,
      });
      return { success: false };
    }
  },

  /**
   * Fungsi untuk proses registrasi user baru
   * @param data - FormData berisi data pendaftaran user
   * @returns Boolean status keberhasilan registrasi
   */
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
        error: error.message || "Registration failed",
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Fungsi untuk logout user dari sistem
   * Membersihkan seluruh state auth dan data di localStorage
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await axiosInstance.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Bersihkan timer verifikasi email yang tersimpan di localStorage
      localStorage.removeItem("emailVerificationTimer");
      localStorage.removeItem("emailVerificationTimerSetAt");
      // Reset seluruh state auth ke nilai default
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Fungsi untuk mengambil data user saat ini dari backend
   * Dipanggil pertama kali saat aplikasi diload untuk mengecek status login
   */
  fetchCurrentUser: async () => {
    console.log("[AuthStore] fetchCurrentUser called");
    set({ isCheckingAuth: true, isLoading: true });
    try {
      const response = await axiosInstance.get("/auth/me");
      console.log("[AuthStore] /auth/me response:", response.data.success);
      if (response.data.success) {
        // User terautentikasi, set data user
        set({
          user: response.data.user || null,
          isAuthenticated: true,
          isLoading: false,
          isCheckingAuth: false,
        });
        console.log("[AuthStore] user set:", response.data.user?.email);
      } else {
        // Token tidak valid atau sudah expired
        set({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
      }
    } catch (error) {
      // Error network atau server, anggap user tidak login
      console.log("[AuthStore] fetchCurrentUser error:", error);
      set({ user: null, isAuthenticated: false, isLoading: false, isCheckingAuth: false });
    }
  },

  /**
   * Fungsi untuk memverifikasi email user dengan kode OTP
   * @param data - Data berisi kode verifikasi
   * @returns Boolean status keberhasilan verifikasi
   */
  verifyEmail: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axiosInstance.post("/auth/verify-email", data);
      if (response.data.success) {
        // Verifikasi sukses, user otomatis login
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
        error: error.message || "Verification failed",
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Membersihkan pesan error yang ada di state
   */
  clearError: () => set({ error: null }),

  /**
   * Reset status registrasi setelah user diarahkan ke halaman verifikasi
   */
  clearRegistered: () => set({ isRegistered: false }),

  /**
   * Fungsi untuk mengirim ulang kode verifikasi email
   * @returns Boolean status keberhasilan pengiriman
   */
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
        error: error.message || "Failed to resend verification code",
        isResendingVerification: false,
      });
      return false;
    }
  },

  /**
   * Reset status resend verifikasi setelah notifikasi ditampilkan
   */
  clearResendVerificationStatus: () => set({ resendVerificationSuccess: false, error: null }),

  /**
   * Fungsi untuk mengirim email lupa password
   * @param email - Alamat email user yang ingin reset password
   */
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
        error: error.message || "Failed to send reset email",
        isLoading: false,
      });
    }
  },

  /**
   * Fungsi untuk mereset password dengan token dari email
   * @param token - Token reset password yang didapat dari email
   * @param newPassword - Password baru yang diinput user
   * @returns Boolean status keberhasilan reset password
   */
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
        error: error.message || "Failed to reset password",
        isLoading: false,
      });
      return false;
    }
  },

  /**
   * Reset status reset password setelah proses selesai
   */
  clearResetPasswordStatus: () => set({ resetPasswordSuccess: false, error: null }),
}));
