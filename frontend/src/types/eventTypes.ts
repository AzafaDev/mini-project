/**
 * Event type definitions for the Kinetix Events application.
 * These types match the API response format from GET /api/events
 */

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
  organizer: EventOrganizer;
  tickets?: EventTicket[];
  sold?: number;
}

export interface EventOrganizer {
  id: string;
  fullName: string;
  email: string;
  profilePicture?: string;
}

export interface EventTicket {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  availableQuantity: number;
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

/**
 * Formatted event for UI display
 * Transformed from API Event to match existing EventCard expectations
 */
export interface FormattedEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  price: string;
  attendees: string;
  category: string;
  image: string;
}