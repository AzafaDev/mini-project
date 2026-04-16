import { create } from "zustand";
import {
  eventService,
  reviewsVouchersService,
  type Event,
  type GetEventsParams,
  type Review,
  type Voucher,
  type OrganizerProfile,
  type OrganizerStats,
  type EventStats,
  type EventAttendee,
  type CreateEventRequest,
  type CreateVoucherRequest,
  type UpdateVoucherRequest,
  type VoucherWithEvent,
} from "../services/api";

interface EventFilters {
  search?: string;
  category?: string;
  location?: string;
}

interface EventStore {
  events: Event[];
  currentEvent: Event | null;
  currentEventReviews: Review[];
  currentEventVouchers: Voucher[];
  organizerProfile: OrganizerProfile | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  filters: EventFilters;
  
  // Organizer state
  myEvents: Event[];
  organizerStats: OrganizerStats | null;
  eventStats: EventStats | null;
  eventAttendees: EventAttendee[];
  myVouchers: VoucherWithEvent[];
  loadingMyEvents: boolean;
  loadingOrganizerStats: boolean;
  loadingEventStats: boolean;
  loadingEventAttendees: boolean;
  loadingMyVouchers: boolean;
  loadingEventAction: boolean;
  
  fetchEvents: (params: GetEventsParams) => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  fetchEventReviews: (eventId: string) => Promise<void>;
  fetchEventVouchers: (eventId: string) => Promise<void>;
  fetchOrganizerProfile: (
    organizerId: string,
  ) => Promise<OrganizerProfile | null>;
  createReview: (
    eventId: string,
    rating: number,
    comment: string,
  ) => Promise<boolean>;
  updateReview: (
    reviewId: string,
    eventId: string,
    rating: number,
    comment: string,
  ) => Promise<boolean>;
  validateVoucher: (
    eventId: string,
    code: string,
    price: number,
    quantity: number,
  ) => Promise<number>;
  
  // Organizer actions
  fetchMyEvents: () => Promise<void>;
  fetchOrganizerStats: (year?: number, month?: number, day?: number) => Promise<void>;
  fetchEventStats: (eventId: string) => Promise<void>;
  fetchEventAttendees: (eventId: string) => Promise<void>;
  createEvent: (data: CreateEventRequest & { imageFile?: File }) => Promise<Event | null>;
  updateEvent: (id: string, data: Partial<CreateEventRequest> & { imageFile?: File }) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  fetchMyVouchers: () => Promise<void>;
  createVoucher: (data: CreateVoucherRequest) => Promise<boolean>;
  updateVoucher: (id: string, data: UpdateVoucherRequest) => Promise<boolean>;
  deleteVoucher: (id: string) => Promise<boolean>;
  
  setPage: (page: number) => void;
  setFilters: (filters: EventFilters) => void;
  clearEvents: () => void;
  clearError: () => void;
  clearCurrentEvent: () => void;
  clearOrganizerProfile: () => void;
  clearEventData: () => void;
  clearOrganizerData: () => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  currentEvent: null,
  currentEventReviews: [],
  currentEventVouchers: [],
  organizerProfile: null,
  loading: false,
  error: null,
  pagination: { page: 1, totalPages: 1, total: 0 },
  filters: { search: undefined, category: undefined, location: undefined },
  
  // Organizer state
  myEvents: [],
  organizerStats: null,
  eventStats: null,
  eventAttendees: [],
  myVouchers: [],
  loadingMyEvents: false,
  loadingOrganizerStats: false,
  loadingEventStats: false,
  loadingEventAttendees: false,
  loadingMyVouchers: false,
  loadingEventAction: false,

  fetchEvents: async (params: GetEventsParams) => {
    set({ loading: true, error: null });
    try {
      const response = await eventService.getAllEvents(params);
      set({
        events: response.data,
        pagination: response.pagination,
        loading: false,
        filters: {
          search: params.search,
          category: params.category,
          location: params.location,
        },
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch events",
        loading: false,
      });
    }
  },

  setPage: (page: number) => {
    const { filters } = get();
    const { fetchEvents } = get();
    fetchEvents({
      ...filters,
      page,
      limit: 20,
    });
  },

  setFilters: (newFilters: EventFilters) => {
    const { fetchEvents } = get();
    fetchEvents({
      ...newFilters,
      page: 1,
      limit: 20,
    });
  },

  clearEvents: () =>
    set({
      events: [],
      pagination: { page: 1, totalPages: 1, total: 0 },
    }),

  clearError: () => set({ error: null }),

  fetchEventById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await eventService.getEventById(id);
      set({ currentEvent: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          `Failed to fetch event with id ${id}`,
        loading: false,
      });
      return null;
    }
  },

  fetchEventReviews: async (eventId: string) => {
    try {
      const response = await reviewsVouchersService.getEventReviews(eventId);
      set({ currentEventReviews: response.data });
    } catch (error: any) {
      console.error(
        "Failed to fetch reviews:",
        error.response?.data?.message || error.message,
      );
      set({ currentEventReviews: [] });
    }
  },

  fetchEventVouchers: async (eventId: string) => {
    try {
      const response = await reviewsVouchersService.getEventVouchers(eventId);
      set({ currentEventVouchers: response.data });
    } catch (error: any) {
      console.error(
        "Failed to fetch vouchers:",
        error.response?.data?.message || error.message,
      );
      set({ currentEventVouchers: [] });
    }
  },

  fetchOrganizerProfile: async (organizerId: string) => {
    try {
      const response = await eventService.getOrganizerProfile(organizerId);
      set({ organizerProfile: response.data });
      return response.data;
    } catch (error: any) {
      console.error(
        "Failed to fetch organizer profile:",
        error.response?.data?.message || error.message,
      );
      set({ organizerProfile: null });
      return null;
    }
  },

  createReview: async (eventId: string, rating: number, comment: string) => {
    try {
      const response = await reviewsVouchersService.createReview(eventId, {
        rating,
        comment,
      });
      if (response.success) {
        // Refresh reviews after creating a new one
        await get().fetchEventReviews(eventId);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(
        "Failed to create review:",
        error.response?.data?.message || error.message,
      );
      return false;
    }
  },

  updateReview: async (
    reviewId: string,
    eventId: string,
    rating: number,
    comment: string,
  ) => {
    try {
      const response = await reviewsVouchersService.updateReview(reviewId, {
        rating,
        comment,
      });
      if (response.success) {
        // Refresh reviews after updating
        await get().fetchEventReviews(eventId);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error(
        "Failed to update review:",
        error.response?.data?.message || error.message,
      );
      return false;
    }
  },

  validateVoucher: async (
    eventId: string,
    code: string,
    price: number,
    quantity: number,
  ) => {
    try {
      const response = await reviewsVouchersService.validateVoucher(
        eventId,
        code,
        price,
        quantity,
      );
      if (response.success && response.valid) {
        return response.discount || 0;
      }
      return 0;
    } catch (error: any) {
      console.error(
        "Failed to validate voucher:",
        error.response?.data?.message || error.message,
      );
      return 0;
    }
  },

  // Organizer actions
  fetchMyEvents: async () => {
    // Guard to prevent race conditions when fetch is called multiple times
    if (get().loadingMyEvents) {
      return;
    }
    set({ loadingMyEvents: true, error: null });
    try {
      const response = await eventService.getMyEvents();
      set({ myEvents: response.data, loadingMyEvents: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch my events",
        loadingMyEvents: false,
      });
    }
  },

  fetchOrganizerStats: async (year?: number, month?: number, day?: number) => {
    if (get().loadingOrganizerStats) {
      return;
    }
    set({ loadingOrganizerStats: true, error: null });
    try {
      const response = await eventService.getOrganizerStats(year, month, day);
      set({ organizerStats: response.data, loadingOrganizerStats: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch organizer stats",
        loadingOrganizerStats: false,
      });
    }
  },

  fetchEventStats: async (eventId: string) => {
    set({ loadingEventStats: true, error: null });
    try {
      const response = await eventService.getEventStats(eventId);
      set({ eventStats: response.data, loadingEventStats: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch event stats",
        loadingEventStats: false,
      });
    }
  },

  fetchEventAttendees: async (eventId: string) => {
    set({ loadingEventAttendees: true, error: null });
    try {
      const response = await eventService.getEventAttendees(eventId);
      set({ eventAttendees: response.data, loadingEventAttendees: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch event attendees",
        loadingEventAttendees: false,
      });
    }
  },

  createEvent: async (data) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await eventService.createEvent(data);
      if (response.success) {
        // Refresh my events list
        await get().fetchMyEvents();
        set({ loadingEventAction: false });
        return response.data;
      }
      set({ error: response.message || "Failed to create event", loadingEventAction: false });
      return null;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create event",
        loadingEventAction: false,
      });
      return null;
    }
  },

  updateEvent: async (id, data) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await eventService.updateEvent(id, data);
      if (response.success) {
        // Refresh my events list
        await get().fetchMyEvents();
        set({ loadingEventAction: false });
        return response.data;
      }
      set({ error: response.message || "Failed to update event", loadingEventAction: false });
      return null;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update event",
        loadingEventAction: false,
      });
      return null;
    }
  },

  deleteEvent: async (id: string) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await eventService.deleteEvent(id);
      if (response.success) {
        // Refresh my events list
        await get().fetchMyEvents();
        set({ loadingEventAction: false });
        return true;
      }
      set({ error: response.message || "Failed to delete event", loadingEventAction: false });
      return false;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete event",
        loadingEventAction: false,
      });
      return false;
    }
  },

  fetchMyVouchers: async () => {
    set({ loadingMyVouchers: true, error: null });
    try {
      const response = await reviewsVouchersService.getMyVouchers();
      set({ myVouchers: response.data, loadingMyVouchers: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch vouchers",
        loadingMyVouchers: false,
      });
    }
  },

  createVoucher: async (data: CreateVoucherRequest) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await reviewsVouchersService.createVoucher(data);
      if (response.success) {
        await get().fetchMyVouchers();
        set({ loadingEventAction: false });
        return true;
      }
      set({ error: response.message || "Failed to create voucher", loadingEventAction: false });
      return false;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create voucher",
        loadingEventAction: false,
      });
      return false;
    }
  },

  updateVoucher: async (id: string, data: UpdateVoucherRequest) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await reviewsVouchersService.updateVoucher(id, data);
      if (response.success) {
        await get().fetchMyVouchers();
        set({ loadingEventAction: false });
        return true;
      }
      set({ error: response.message || "Failed to update voucher", loadingEventAction: false });
      return false;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update voucher",
        loadingEventAction: false,
      });
      return false;
    }
  },

  deleteVoucher: async (id: string) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await reviewsVouchersService.deleteVoucher(id);
      if (response.success) {
        await get().fetchMyVouchers();
        set({ loadingEventAction: false });
        return true;
      }
      set({ error: response.message || "Failed to delete voucher", loadingEventAction: false });
      return false;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete voucher",
        loadingEventAction: false,
      });
      return false;
    }
  },

  clearCurrentEvent: () => set({ currentEvent: null }),

  clearOrganizerProfile: () => set({ organizerProfile: null }),

  clearEventData: () =>
    set({
      currentEvent: null,
      currentEventReviews: [],
      currentEventVouchers: [],
      organizerProfile: null,
    }),

  clearOrganizerData: () =>
    set({
      myEvents: [],
      organizerStats: null,
      eventStats: null,
      myVouchers: [],
    }),
}));
