import axiosInstance from "../lib/axiosInstance";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
  ProfileResponse,
  PointsResponse,
  PointsHistoryResponse,
  MyCouponsResponse,
} from "../types";

export const profileService = {
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await axiosInstance.put("/auth/update-profile", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.put("/auth/change-password", data);
    return response.data;
  },

  getPoints: async (): Promise<PointsResponse> => {
    const response = await axiosInstance.get("/points/active");
    return response.data;
  },

  getPointsHistory: async (page?: number, limit?: number): Promise<PointsHistoryResponse> => {
    const response = await axiosInstance.get("/points/history", { params: { page, limit } });
    return response.data;
  },

  getCoupons: async (): Promise<MyCouponsResponse> => {
    const response = await axiosInstance.get("/events/my-coupons");
    return response.data;
  },

  uploadProfilePicture: async (file: File): Promise<ProfileResponse> => {
    const formData = new FormData();
    formData.append("profilePicture", file);
    
    const response = await axiosInstance.put("/auth/update-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};