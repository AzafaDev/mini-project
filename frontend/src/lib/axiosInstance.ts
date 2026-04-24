import axios, { AxiosError } from "axios";

/**
 * Instance Axios yang sudah dikonfigurasi untuk seluruh aplikasi.
 * Dilengkapi interceptor untuk autentikasi, logging, dan error handling terpusat.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

/**
 * Request Interceptor - Dijalankan sebelum setiap request dikirim
 * Fungsi:
 * - Menambahkan header Authorization Bearer token dari localStorage
 * - Logging request di mode development
 */
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log hanya di mode development
    if (import.meta.env.DEV) {
      console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response Interceptor - Dijalankan setelah setiap response diterima
 * Fungsi:
 * - Handling error secara terpusat untuk semua status code HTTP
 * - Format pesan error menjadi user friendly
 * - Logging error di mode development
 */
axiosInstance.interceptors.response.use(
  // Jika response sukses, kembalikan langsung
  (response) => response,
  
  // Jika response error, proses dan format pesan error
  (error: AxiosError<{ message?: string }>) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Jika server merespon dengan status error (4xx, 5xx)
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      switch (status) {
        case 400:
          errorMessage = serverMessage || "Bad request";
          break;
        case 401:
          errorMessage = "Session expired. Please login again.";
          break;
        case 403:
          errorMessage = serverMessage || "You don't have permission";
          break;
        case 404:
          errorMessage = serverMessage || "Resource not found";
          break;
        case 422:
          errorMessage = serverMessage || "Validation error";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        default:
          errorMessage = serverMessage || `Request failed (${status})`;
      }
    } else if (error.request) {
      // Jika request terkirim tapi tidak ada response (network error)
      errorMessage = "Network error. Please check your connection.";
    }

    // Log error hanya di mode development
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${errorMessage}`, error.response?.data);
    }

    // Kembalikan error yang sudah diformat
    return Promise.reject(new Error(errorMessage));
  },
);

export default axiosInstance;
