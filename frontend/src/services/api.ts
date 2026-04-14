import axiosInstance from "../lib/axiosInstance";

// ============================================
// Event Types
// ============================================

export interface Event {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  organizerId: string;
  organizer: {
    id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
  tickets?: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    availableQuantity: number;
  }>;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetEventsParams {
  search?: string;
  category?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// ============================================
// Event Service
// ============================================

export const eventService = {
  getAllEvents: async (params: GetEventsParams): Promise<EventsResponse> => {
    const response = await axiosInstance.get<EventsResponse>("/events", { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<{ success: boolean; data: Event }> => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },
};

// ============================================
// Profile Types
// ============================================

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    email: string;
    fullName: string;
    role: string;
    isVerified: boolean;
    profilePicture?: string;
    phoneNumber?: string;
    points?: number;
    createdAt: string;
  };
}

export interface PointsResponse {
  success: boolean;
  points?: number;
  message?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
}

export interface MyCouponsResponse {
  success: boolean;
  data?: Coupon[];
}

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