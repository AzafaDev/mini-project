import { create } from "zustand";
import { getErrorMessage } from "../lib/error";
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

/**
 * Tipe untuk filter pencarian event
 */
interface EventFilters {
  search?: string;
  category?: string;
  location?: string;
}

/**
 * Zustand Store untuk mengelola seluruh data Event, Review, dan Voucher.
 * Menangani daftar event, detail event, review, voucher, dan semua fitur
 * untuk Organizer (buat event, kelola voucher, lihat statistik, dll).
 * Ini adalah store terbesar yang menangani hampir seluruh fitur utama aplikasi.
 */
interface EventStore {
  // --- State Utama Event ---
  events: Event[];
  currentEvent: Event | null;
  currentEventReviews: Review[];
  currentEventVouchers: Voucher[];
  organizerProfile: OrganizerProfile | null;
  
  // --- State Loading & Error ---
  loading: boolean;
  loadingEvent: boolean;
  error: string | null;
  
  // --- State Pagination & Filter ---
  pagination: {
    page: number;
    totalPages: number;
    total: number;
  };
  filters: EventFilters;
  
  // --- State Khusus Organizer ---
  myEvents: Event[];
  organizerStats: OrganizerStats | null;
  eventStats: EventStats | null;
  eventAttendees: EventAttendee[];
  myVouchers: VoucherWithEvent[];
  
  // --- State Loading Khusus Organizer ---
  loadingMyEvents: boolean;
  loadingOrganizerStats: boolean;
  loadingEventStats: boolean;
  loadingEventAttendees: boolean;
  loadingMyVouchers: boolean;
  loadingEventAction: boolean;
  
  // --- Method Utama User ---
  fetchEvents: (params: GetEventsParams) => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | null>;
  fetchEventReviews: (eventId: string) => Promise<void>;
  fetchEventVouchers: (eventId: string) => Promise<void>;
  fetchOrganizerProfile: (organizerId: string) => Promise<OrganizerProfile | null>;
  
  // --- Method Review ---
  createReview: (eventId: string, rating: number, comment: string) => Promise<boolean>;
  submitReview: (eventId: string, rating: number, comment: string) => Promise<boolean>;
  updateReview: (reviewId: string, eventId: string, rating: number, comment: string) => Promise<boolean>;
  
  // --- Method Voucher ---
  validateVoucher: (eventId: string, code: string, price: number, quantity: number) => Promise<{ discount: number; discountType?: "PERCENTAGE" | "FIXED"; discountValue?: number }>;
  
  // --- Method Khusus Organizer ---
  fetchMyEvents: () => Promise<void>;
  fetchOrganizerStats: (year?: number, month?: number, day?: number) => Promise<void>;
  fetchEventStats: (eventId: string) => Promise<void>;
  fetchEventAttendees: (eventId: string) => Promise<void>;
  createEvent: (data: CreateEventRequest & { imageFile?: File }) => Promise<Event | null>;
  deleteEvent: (id: string) => Promise<boolean>;
  fetchMyVouchers: () => Promise<void>;
  createVoucher: (data: CreateVoucherRequest) => Promise<boolean>;
  updateVoucher: (id: string, data: UpdateVoucherRequest) => Promise<boolean>;
  deleteVoucher: (id: string) => Promise<boolean>;
  
  // --- Method Helper & Reset State ---
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
  // --- Nilai Default State Utama ---
  events: [],
  currentEvent: null,
  currentEventReviews: [],
  currentEventVouchers: [],
  organizerProfile: null,
  loading: false,
  loadingEvent: false,
  error: null,
  pagination: { page: 1, totalPages: 1, total: 0 },
  filters: { search: undefined, category: undefined, location: undefined },
  
  // --- Nilai Default State Organizer ---
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

  /**
   * Mengambil daftar semua event dengan filter dan pagination
   * @param params - Parameter pencarian, filter, dan pagination
   */
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
    } catch (error: unknown) {
      set({
        error: getErrorMessage(error) || "Failed to fetch events",
        loading: false,
      });
    }
  },

  /**
   * Mengubah halaman pagination dan memuat ulang daftar event
   * @param page - Nomor halaman yang akan dituju
   */
  setPage: (page: number) => {
    const { filters } = get();
    const { fetchEvents } = get();
    fetchEvents({
      ...filters,
      page,
      limit: 20,
    });
  },

  /**
   * Mengatur filter pencarian dan memuat ulang daftar event dari halaman 1
   * @param newFilters - Filter baru yang akan diterapkan
   */
  setFilters: (newFilters: EventFilters) => {
    const { fetchEvents } = get();
    fetchEvents({
      ...newFilters,
      page: 1,
      limit: 20,
    });
  },

  /**
   * Membersihkan daftar event dan mengembalikan pagination ke halaman 1
   */
  clearEvents: () =>
    set({
      events: [],
      pagination: { page: 1, totalPages: 1, total: 0 },
    }),

  /**
   * Membersihkan pesan error dari state
   */
  clearError: () => set({ error: null }),

  /**
   * Mengambil detail event berdasarkan ID
   * @param id - ID event yang akan diambil
   * @returns Data event atau null jika gagal
   */
  fetchEventById: async (id: string) => {
    set({ loadingEvent: true, loading: true, error: null });
    try {
      const response = await eventService.getEventById(id);
      set({ currentEvent: response.data, loadingEvent: false, loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.message || `Failed to fetch event with id ${id}`,
        loadingEvent: false,
        loading: false,
      });
      return null;
    }
  },

  /**
   * Mengambil semua review untuk event tertentu
   * @param eventId - ID event yang reviewnya akan diambil
   */
  fetchEventReviews: async (eventId: string) => {
    try {
      const response = await reviewsVouchersService.getEventReviews(eventId);
      set({ currentEventReviews: response.data });
    } catch (error: any) {
      console.error("Failed to fetch reviews:", error.message);
      set({ currentEventReviews: [] });
    }
  },

  /**
   * Mengambil semua voucher yang tersedia untuk event tertentu
   * @param eventId - ID event yang vouchernya akan diambil
   */
  fetchEventVouchers: async (eventId: string) => {
    try {
      const response = await reviewsVouchersService.getEventVouchers(eventId);
      set({ currentEventVouchers: response.data });
    } catch (error: any) {
      console.error("Failed to fetch vouchers:", error.message);
      set({ currentEventVouchers: [] });
    }
  },

  /**
   * Mengambil profil organizer berdasarkan ID
   * @param organizerId - ID organizer yang profilnya akan diambil
   * @returns Data profil organizer atau null jika gagal
   */
  fetchOrganizerProfile: async (organizerId: string) => {
    try {
      const response = await eventService.getOrganizerProfile(organizerId);
      set({ organizerProfile: response.data });
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch organizer profile:", error.message);
      set({ organizerProfile: null });
      return null;
    }
  },

  /**
   * Membuat review baru untuk event
   * @param eventId - ID event yang akan direview
   * @param rating - Nilai rating (1-5)
   * @param comment - Komentar review
   * @returns Status keberhasilan pembuatan review
   */
  createReview: async (eventId: string, rating: number, comment: string) => {
    try {
      const response = await reviewsVouchersService.createReview(eventId, {
        rating,
        comment,
      });
      if (response.success) {
        // Refresh daftar review setelah membuat yang baru
        await get().fetchEventReviews(eventId);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Failed to create review:", error.message);
      return false;
    }
  },

  /**
   * Alias untuk fungsi createReview (kompatibilitas backward)
   */
  submitReview: async (eventId: string, rating: number, comment: string) => {
    return get().createReview(eventId, rating, comment);
  },

  /**
   * Memperbarui review yang sudah ada
   * @param reviewId - ID review yang akan diupdate
   * @param eventId - ID event terkait review
   * @param rating - Nilai rating baru
   * @param comment - Komentar baru
   * @returns Status keberhasilan update review
   */
  updateReview: async (reviewId: string, eventId: string, rating: number, comment: string) => {
    try {
      const response = await reviewsVouchersService.updateReview(reviewId, {
        rating,
        comment,
      });
      if (response.success) {
        // Refresh daftar review setelah update
        await get().fetchEventReviews(eventId);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error("Failed to update review:", error.message);
      return false;
    }
  },

  /**
   * Memvalidasi kode voucher untuk event tertentu
   * @param eventId - ID event yang voucher akan digunakan
   * @param code - Kode voucher yang diinput user
   * @param price - Total harga pesanan saat ini
   * @param quantity - Jumlah tiket yang dipesan
   * @returns Object dengan discount, discountType, dan discountValue, atau { discount: 0 } jika tidak valid
   */
  validateVoucher: async (eventId: string, code: string, price: number, quantity: number) => {
    try {
      const response = await reviewsVouchersService.validateVoucher(
        eventId,
        code,
        price,
        quantity,
      );
      if (response.success && response.valid) {
        return {
          discount: response.discount || 0,
          discountType: response.discountType,
          discountValue: response.discountValue,
        };
      }
      return { discount: 0 };
    } catch (error: any) {
      console.error("Failed to validate voucher:", error.message);
      return { discount: 0 };
    }
  },

  // --- Method Khusus Organizer ---

  /**
   * Mengambil daftar event yang dibuat oleh organizer yang sedang login
   */
  fetchMyEvents: async () => {
    // Guard untuk mencegah race condition jika dipanggil berkali-kali
    if (get().loadingMyEvents) return;
    
    set({ loadingMyEvents: true, error: null });
    try {
      const response = await eventService.getMyEvents();
      set({ myEvents: response.data, loadingMyEvents: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch my events",
        loadingMyEvents: false,
      });
    }
  },

  /**
   * Mengambil statistik keseluruhan untuk organizer
   * @param year - Tahun filter (opsional)
   * @param month - Bulan filter (opsional)
   * @param day - Hari filter (opsional)
   */
  fetchOrganizerStats: async (year?: number, month?: number, day?: number) => {
    if (get().loadingOrganizerStats) return;
    
    set({ loadingOrganizerStats: true, error: null });
    try {
      const response = await eventService.getOrganizerStats(year, month, day);
      set({ organizerStats: response.data, loadingOrganizerStats: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch organizer stats",
        loadingOrganizerStats: false,
      });
    }
  },

  /**
   * Mengambil statistik detail untuk event tertentu
   * @param eventId - ID event yang statistiknya akan diambil
   */
  fetchEventStats: async (eventId: string) => {
    set({ loadingEventStats: true, error: null });
    try {
      const response = await eventService.getEventStats(eventId);
      set({ eventStats: response.data, loadingEventStats: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch event stats",
        loadingEventStats: false,
      });
    }
  },

  /**
   * Mengambil daftar peserta yang sudah mendaftar event
   * @param eventId - ID event yang daftar pesertanya akan diambil
   */
  fetchEventAttendees: async (eventId: string) => {
    set({ loadingEventAttendees: true, error: null });
    try {
      const response = await eventService.getEventAttendees(eventId);
      // Transformasi data untuk memastikan format konsisten
      const mappedAttendees = response.data.map((attendee: any) => ({
        userId: attendee.userId,
        fullName: attendee.fullName || attendee.userName || "",
        email: attendee.email || attendee.userEmail || "",
        profilePicture: attendee.profilePicture,
        ticketId: attendee.ticketId,
        ticketName: attendee.ticketName || attendee.ticketType || "General Admission",
        quantity: attendee.quantity,
        totalPrice: attendee.totalPrice,
        purchaseDate: attendee.purchaseDate || attendee.paidAt || attendee.createdAt,
        status: attendee.status,
      }));
      set({ eventAttendees: mappedAttendees, loadingEventAttendees: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch event attendees",
        loadingEventAttendees: false,
      });
    }
  },

  /**
   * Membuat event baru oleh organizer
   * @param data - Data event termasuk file gambar
   * @returns Data event yang berhasil dibuat atau null
   */
  createEvent: async (data) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await eventService.createEvent(data);
      if (response.success) {
        await get().fetchMyEvents();
        set({ loadingEventAction: false });
        return response.data;
      }
      set({ error: response.message || "Failed to create event", loadingEventAction: false });
      return null;
    } catch (error: any) {
      set({
        error: error.message || "Failed to create event",
        loadingEventAction: false,
      });
      return null;
    }
  },

  /**
   * Memperbarui data event yang sudah ada
   * @param id - ID event yang akan diupdate
   * @param data - Data event yang akan diubah


  /**
   * Menghapus event
   * @param id - ID event yang akan dihapus
   * @returns Status keberhasilan penghapusan
   */
  deleteEvent: async (id: string) => {
    set({ loadingEventAction: true, error: null });
    try {
      const response = await eventService.deleteEvent(id);
      if (response.success) {
        await get().fetchMyEvents();
        set({ loadingEventAction: false });
        return true;
      }
      set({ error: response.message || "Failed to delete event", loadingEventAction: false });
      return false;
    } catch (error: any) {
      set({
        error: error.message || "Failed to delete event",
        loadingEventAction: false,
      });
      return false;
    }
  },

  /**
   * Mengambil daftar semua voucher yang dibuat oleh organizer
   */
  fetchMyVouchers: async () => {
    set({ loadingMyVouchers: true, error: null });
    try {
      const response = await reviewsVouchersService.getMyVouchers();
      set({ myVouchers: response.data, loadingMyVouchers: false });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch vouchers",
        loadingMyVouchers: false,
      });
    }
  },

  /**
   * Membuat voucher baru untuk event
   * @param data - Data voucher yang akan dibuat
   * @returns Status keberhasilan pembuatan voucher
   */
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
        error: error.message || "Failed to create voucher",
        loadingEventAction: false,
      });
      return false;
    }
  },

  /**
   * Memperbarui data voucher yang sudah ada
   * @param id - ID voucher yang akan diupdate
   * @param data - Data voucher yang akan diubah
   * @returns Status keberhasilan update voucher
   */
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
        error: error.message || "Failed to update voucher",
        loadingEventAction: false,
      });
      return false;
    }
  },

  /**
   * Menghapus voucher
   * @param id - ID voucher yang akan dihapus
   * @returns Status keberhasilan penghapusan
   */
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
        error: error.message || "Failed to delete voucher",
        loadingEventAction: false,
      });
      return false;
    }
  },

  /**
   * Membersihkan data event yang sedang dibuka (untuk cleanup)
   */
  clearCurrentEvent: () => set({ currentEvent: null }),

  /**
   * Membersihkan data profil organizer dari state
   */
  clearOrganizerProfile: () => set({ organizerProfile: null }),

  /**
   * Membersihkan semua data event terkait (detail, review, voucher)
   */
  clearEventData: () =>
    set({
      currentEvent: null,
      currentEventReviews: [],
      currentEventVouchers: [],
      organizerProfile: null,
    }),

  /**
   * Membersihkan semua data organizer dari state
   */
  clearOrganizerData: () =>
    set({
      myEvents: [],
      organizerStats: null,
      eventStats: null,
      myVouchers: [],
    }),
}));
