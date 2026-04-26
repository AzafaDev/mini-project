export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  eventId: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    profilePicture?: string;
  };
}

export interface CreateReviewRequest {
  rating: number;
  comment: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: Review[];
}

export interface ReviewResponse {
  success: boolean;
  data: Review;
  message?: string;
}

export interface Voucher {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface VouchersResponse {
  success: boolean;
  data: Voucher[];
}

export interface ValidateVoucherResponse {
  success: boolean;
  valid: boolean;
  discount?: number;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  message?: string;
}

export interface CreateVoucherRequest {
  eventId: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUsage?: number;
}

export interface VoucherWithEvent extends Voucher {
  event: {
    id: string;
    name: string;
  };
}