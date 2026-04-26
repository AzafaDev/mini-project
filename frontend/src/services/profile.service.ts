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
  updateProfile: async (
    data: UpdateProfileRequest,
  ): Promise<ProfileResponse> => {
    const response = await axiosInstance.put("/auth/update-profile", data);
    return response.data;
  },

  changePassword: async (
    data: ChangePasswordRequest,
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.put("/auth/change-password", data);
    return response.data;
  },

  getPoints: async (): Promise<PointsResponse> => {
    const response = await axiosInstance.get("/points/active");
    return response.data;
  },

  // frontend/src/services/profile.service.ts
  getPointsHistory: async (
    page?: number,
    limit?: number,
  ): Promise<PointsHistoryResponse> => {
    const response = await axiosInstance.get("/points/history", {
      params: { page, limit },
    });

    // Transform backend 'amount' to frontend 'points' and 'reason' to 'description'
    if (response.data.success && Array.isArray(response.data.data)) {
      response.data.data = response.data.data.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        points: item.amount, // ← map amount to points
        description: item.reason, // ← map reason to description
        type: item.amount > 0 ? "EARNED" : "REDEEMED", // determine type from amount sign
        createdAt: item.createdAt,
      }));
    }

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
