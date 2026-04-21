import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// Request interceptor - attach auth token
axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Log requests in development mode
    if (import.meta.env.DEV) {
      console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - centralized error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const serverMessage = error.response.data?.message;

      switch (status) {
        case 400:
          errorMessage = serverMessage || "Bad request";
          break;
        case 401:
          errorMessage = "Session expired. Please login again.";
          // Optional: trigger logout or redirect to login
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
      // Request made but no response (network error)
      errorMessage = "Network error. Please check your connection.";
    }

    // Log errors in development mode
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${errorMessage}`, error.response?.data);
    }

    // Return formatted error
    return Promise.reject(new Error(errorMessage));
  }
);

export default axiosInstance;