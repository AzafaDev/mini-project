import axiosInstance from "../lib/axiosInstance";
import type {
  Review,
  CreateReviewRequest,
  ReviewsResponse,
  ReviewResponse,
  Voucher,
  VouchersResponse,
  ValidateVoucherResponse,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  VoucherWithEvent,
} from "../types";

export const reviewService = {
  getEventReviews: async (eventId: string): Promise<ReviewsResponse> => {
    const response = await axiosInstance.get(`/reviews/event/${eventId}/reviews`);
    return response.data;
  },

  createReview: async (eventId: string, data: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await axiosInstance.post(`/reviews/event/${eventId}/reviews`, data);
    return response.data;
  },

  updateReview: async (reviewId: string, data: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await axiosInstance.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  getEventVouchers: async (eventId: string): Promise<VouchersResponse> => {
    const response = await axiosInstance.get(`/events/${eventId}/vouchers`);
    return response.data;
  },

  validateVoucher: async (
    eventId: string,
    code: string,
    price: number,
    quantity: number
  ): Promise<ValidateVoucherResponse> => {
    const response = await axiosInstance.get("/events/check-voucher", {
      params: { eventId, code, price, quantity },
    });
    return response.data;
  },

  validateCoupon: async (
    code: string,
    price: number,
    quantity: number
  ): Promise<ValidateVoucherResponse> => {
    const response = await axiosInstance.get("/events/coupons/validate", {
      params: { code, price, quantity },
    });
    return response.data;
  },

  getMyVouchers: async (): Promise<{ success: boolean; data: VoucherWithEvent[] }> => {
    const response = await axiosInstance.get('/events/my-vouchers');
    return response.data;
  },

  createVoucher: async (data: CreateVoucherRequest): Promise<{ success: boolean; data: Voucher; message?: string }> => {
    const response = await axiosInstance.post('/events/voucher', data);
    return response.data;
  },

  updateVoucher: async (id: string, data: UpdateVoucherRequest): Promise<{ success: boolean; data: Voucher; message?: string }> => {
    const response = await axiosInstance.put(`/events/voucher/${id}`, data);
    return response.data;
  },

  deleteVoucher: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/events/voucher/${id}`);
    return response.data;
  },
};