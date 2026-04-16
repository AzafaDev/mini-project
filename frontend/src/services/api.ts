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
    type: string;
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

// Create event request
export interface CreateEventRequest {
  name: string;
  description: string;
  location: string;
  category: string;
  startDate: string;
  endDate: string;
  totalSeats: number;
  price: number;
  availableSeats?: number;
}

// Organizer stats response
export interface OrganizerStats {
  totalRevenue: number;
  ticketsSold: number;
  totalEvents: number;
  totalAttendees: number;
  monthlyStats?: Array<{ month: string; revenue: number; tickets: number }>;
  dailyStats?: Array<{ day: string; revenue: number; tickets: number }>;
  yearlyStats?: Array<{ year: number; revenue: number; tickets: number }>;
}

export interface OrganizerStatsResponse {
  success: boolean;
  data: OrganizerStats;
}

// Event stats response
export interface EventStats {
  totalRevenue: number;
  ticketsSold: number;
  availableSeats: number;
  soldPercentage: number;
}

export interface EventStatsResponse {
  success: boolean;
  data: EventStats;
}

// Event attendees response
export interface EventAttendee {
  userId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  ticketId: string;
  ticketName: string;
  quantity: number;
  purchaseDate: string;
}

export interface EventAttendeesResponse {
  success: boolean;
  data: EventAttendee[];
}

// Event response
export interface EventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

// ============================================
// Event Service
// ============================================

export const eventService = {
  getAllEvents: async (params: GetEventsParams): Promise<EventsResponse> => {
    const response = await axiosInstance.get<EventsResponse>('/events', { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<{ success: boolean; data: Event }> => {
    const response = await axiosInstance.get(`/events/${id}`);
    return response.data;
  },

  getOrganizerProfile: async (organizerId: string): Promise<OrganizerProfileResponse> => {
    const response = await axiosInstance.get(`/events/organizer/${organizerId}`);
    return response.data;
  },

  // Organizer endpoints
  getMyEvents: async (): Promise<{ success: boolean; data: Event[] }> => {
    const response = await axiosInstance.get('/events/me');
    return response.data;
  },

  getOrganizerStats: async (year?: number, month?: number, day?: number): Promise<OrganizerStatsResponse> => {
    const response = await axiosInstance.get('/events/stats', { params: { year, month, day } });
    return response.data;
  },

  getEventStats: async (eventId: string): Promise<EventStatsResponse> => {
    const response = await axiosInstance.get(`/events/${eventId}/stats`);
    return response.data;
  },

  getEventAttendees: async (eventId: string): Promise<EventAttendeesResponse> => {
    const response = await axiosInstance.get(`/events/${eventId}/attendees`);
    return response.data;
  },

  createEvent: async (data: CreateEventRequest & { imageFile?: File }): Promise<EventResponse> => {
    const formData = new FormData();
    
    // Handle each field explicitly
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.category) formData.append('category', data.category);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    formData.append('totalSeats', String(data.totalSeats));
    formData.append('price', String(data.price));
    if (data.availableSeats !== undefined) {
      formData.append('availableSeats', String(data.availableSeats));
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile);
    }
    
    const response = await axiosInstance.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventRequest> & { imageFile?: File }): Promise<EventResponse> => {
    const formData = new FormData();
    
    // Handle each field explicitly
    if (data.name) formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data.location) formData.append('location', data.location);
    if (data.category) formData.append('category', data.category);
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (data.totalSeats !== undefined) formData.append('totalSeats', String(data.totalSeats));
    if (data.price !== undefined) formData.append('price', String(data.price));
    if (data.availableSeats !== undefined) {
      formData.append('availableSeats', String(data.availableSeats));
    }
    if (data.imageFile) {
      formData.append('imageFile', data.imageFile);
    }
    
    const response = await axiosInstance.put(`/events/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/events/${id}`);
    return response.data;
  },
};

// ============================================
// Organizer Profile Types
// ============================================

export interface OrganizerProfile {
  id: string;
  name: string;
  imageUrl?: string;
  createdAt: string;
  rating: number;
  reviewCount: number;
  eventCount: number;
  events: Array<{
    id: string;
    name: string;
    startDate: string;
    location: string;
    rating: number;
    reviewCount: number;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
      id: string;
      fullName: string;
      email: string;
      profilePicture?: string;
    };
    event: {
      id: string;
      name: string;
    };
  }>;
}

export interface OrganizerProfileResponse {
  success: boolean;
  data: OrganizerProfile;
}

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

// ============================================
// Review Types
// ============================================

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

// ============================================
// Voucher Types
// ============================================

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
  message?: string;
}

// Voucher management types
export interface CreateVoucherRequest {
  eventId: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  startDate: string;
  endDate: string;
  maxUsage?: number;
}

export interface UpdateVoucherRequest {
  code?: string;
  discountType?: "PERCENTAGE" | "FIXED";
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  maxUsage?: number;
  isActive?: boolean;
}

export interface VoucherWithEvent extends Voucher {
  event: {
    id: string;
    name: string;
  };
}

// ============================================
// Reviews & Vouchers Service
// ============================================

export const reviewsVouchersService = {
  // Reviews
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

  // Vouchers
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

  // Voucher management (organizer)
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

// ============================================
// Transaction Types
// ============================================

export type TransactionStatus =
  | "WAITING_PAYMENT"
  | "WAITING_CONFIRMATION"
  | "DONE"
  | "REJECTED"
  | "EXPIRED"
  | "CANCELED";

export interface TransactionEvent {
  id: string;
  name: string;
  imageUrl?: string;
  location?: string;
  startDate?: string;
}

export interface TransactionTicket {
  id: string;
  name: string;
  price: number;
  description?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  eventId: string;
  event: TransactionEvent;
  ticketId: string;
  ticket: TransactionTicket;
  quantity: number;
  totalPrice: number;
  discount: number;
  pointsUsed: number;
  finalPrice: number;
  status: TransactionStatus;
  paymentProof?: string;
  paymentProofUploadedAt?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
    profilePicture?: string;
  };
}

export interface CreateTransactionRequest {
  eventId: string;
  ticketId: string;
  quantity: number;
  voucherCode?: string;
  couponCode?: string;
  pointsUsed?: number;
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TransactionResponse {
  success: boolean;
  data: Transaction;
  message?: string;
}

export interface TransactionActionResponse {
  success: boolean;
  message?: string;
  data?: Transaction;
}

// ============================================
// Transaction Service
// ============================================

export const transactionService = {
  createTransaction: async (
    data: CreateTransactionRequest
  ): Promise<TransactionResponse> => {
    const response = await axiosInstance.post("/transactions", data);
    return response.data;
  },

  getMyTransactions: async (
    page?: number,
    limit?: number
  ): Promise<TransactionsResponse> => {
    const response = await axiosInstance.get("/transactions/me", {
      params: { page, limit },
    });
    return response.data;
  },

  getTransactionById: async (id: string): Promise<TransactionResponse> => {
    const response = await axiosInstance.get(`/transactions/${id}`);
    return response.data;
  },

  uploadPaymentProof: async (
    id: string,
    file: File
  ): Promise<TransactionActionResponse> => {
    const formData = new FormData();
    formData.append("paymentProof", file);
    const response = await axiosInstance.put(
      `/transactions/${id}/payment-proof`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data;
  },

  cancelTransaction: async (
    id: string
  ): Promise<TransactionActionResponse> => {
    const response = await axiosInstance.put(`/transactions/${id}/cancel`);
    return response.data;
  },

  acceptTransaction: async (
    id: string
  ): Promise<TransactionActionResponse> => {
    const response = await axiosInstance.put(`/transactions/${id}/accept`);
    return response.data;
  },

  rejectTransaction: async (
    id: string,
    reason?: string
  ): Promise<TransactionActionResponse> => {
    const response = await axiosInstance.put(`/transactions/${id}/reject`, {
      reason,
    });
    return response.data;
  },

  getEventTransactions: async (
    eventId: string,
    page?: number,
    limit?: number
  ): Promise<TransactionsResponse> => {
    const response = await axiosInstance.get(`/transactions/event/${eventId}`, {
      params: { page, limit },
    });
    return response.data;
  },

  getOrganizerTransactions: async (
    page?: number,
    limit?: number
  ): Promise<TransactionsResponse> => {
    const response = await axiosInstance.get("/transactions/organizer", {
      params: { page, limit },
    });
    return response.data;
  },
};