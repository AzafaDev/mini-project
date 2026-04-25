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
  sold?: number;
  price: number;
  vipPrice?: number;
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
    rating?: number;
    reviewCount?: number;
  };
  reviews?: Array<any>;
  averageRating?: number;
  vouchers?: Array<{
    id: string;
    code: string;
    discountType: "PERCENTAGE" | "FIXED";
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    startDate: string;
    endDate: string;
    isActive: boolean;
  }>;
  tickets?: Array<{
    id: string;
    name: string;
    type: 'GENERAL' | 'VIP';
    description?: string;
    price: number;
    quantity: number;
    available: number;
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
  includePast?: boolean;
}

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
  tickets?: {
    type: 'GENERAL' | 'VIP';
    price: number;
    quantity: number;
  }[];
}

export interface OrganizerStats {
  totalRevenue: number;
  totalTicketsSold: number;
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

export interface EventAttendee {
  userId: string;
  fullName: string;
  email: string;
  profilePicture?: string;
  ticketId: string;
  ticketName: string;
  quantity: number;
  purchaseDate: string;
  totalPrice?: number;
}

export interface EventAttendeesResponse {
  success: boolean;
  data: EventAttendee[];
}

export interface EventResponse {
  success: boolean;
  message?: string;
  data: Event;
}

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
    userName: string;
    userImage?: string;
    eventName: string;
  }>;
}

export interface OrganizerProfileResponse {
  success: boolean;
  data: OrganizerProfile;
}

export interface Ticket {
  id: string;
  name: string;
  type: string;
  description?: string;
  price: number;
  quantity: number;
  availableQuantity: number;
}