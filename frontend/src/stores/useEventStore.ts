import { create } from "zustand";
import { eventService } from "../services/api";
import type { Event, GetEventsParams } from "../services/api";

interface EventFilters {
  search?: string;
  category?: string;
  location?: string;
}

interface EventStore {
  events: Event[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  filters: EventFilters;
  fetchEvents: (params: GetEventsParams) => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: EventFilters) => void;
  clearEvents: () => void;
  clearError: () => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  events: [],
  loading: false,
  error: null,
  pagination: { page: 1, totalPages: 1, total: 0 },
  filters: { search: undefined, category: undefined, location: undefined },

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
}));