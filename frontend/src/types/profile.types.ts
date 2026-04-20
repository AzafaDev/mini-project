export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUser {
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

export interface ProfileResponse {
  success: boolean;
  message?: string;
  user?: ProfileUser;
}

export interface PointsResponse {
  success: boolean;
  points?: number;
  message?: string;
}

export interface PointsHistoryItem {
  id: string;
  userId: string;
  points: number;
  type: "EARNED" | "REDEEMED";
  description: string;
  createdAt: string;
}

export interface PointsHistoryResponse {
  success: boolean;
  data: PointsHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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