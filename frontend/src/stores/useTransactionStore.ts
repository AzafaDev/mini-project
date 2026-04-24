import { create } from "zustand";
import {
  transactionService,
  type Transaction,
  type CreateTransactionRequest,
  type TransactionsResponse,
  type TransactionResponse,
} from "../services/api";

/**
 * Zustand Store untuk mengelola seluruh data Transaksi pembelian tiket.
 * Menangani pembuatan transaksi, upload bukti bayar, pembatalan,
 * dan fitur approval/reject untuk Organizer.
 * Tersedia untuk user biasa (lihat transaksi sendiri) dan organizer.
 */
interface TransactionStore {
  // --- State Data Transaksi ---
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  
  // --- State Loading & Error ---
  loading: boolean;
  error: string | null;
  
  // --- State Pagination ---
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // --- Method User Biasa ---
  fetchMyTransactions: (page?: number, limit?: number) => Promise<void>;
  fetchTransactionById: (id: string) => Promise<Transaction | null>;
  createTransaction: (data: CreateTransactionRequest) => Promise<Transaction | null>;
  uploadPaymentProof: (id: string, file: File) => Promise<boolean>;
  cancelTransaction: (id: string) => Promise<boolean>;
  
  // --- Method Khusus Organizer ---
  acceptTransaction: (id: string) => Promise<boolean>;
  rejectTransaction: (id: string, reason?: string) => Promise<boolean>;
  fetchEventTransactions: (eventId: string, page?: number, limit?: number) => Promise<void>;
  fetchOrganizerTransactions: (page?: number, limit?: number) => Promise<void>;
  
  // --- Method Helper & Reset State ---
  setPage: (page: number) => void;
  clearTransactions: () => void;
  clearCurrentTransaction: () => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
  // --- Nilai Default State ---
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },

  /**
   * Mengambil daftar transaksi milik user yang sedang login
   * @param page - Nomor halaman (default: 1)
   * @param limit - Jumlah data per halaman (default: 20)
   */
  fetchMyTransactions: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionsResponse = await transactionService.getMyTransactions(page, limit);
      set({
        transactions: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  /**
   * Mengambil detail transaksi berdasarkan ID
   * @param id - ID transaksi yang akan diambil
   * @returns Data transaksi atau null jika gagal
   */
  fetchTransactionById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionResponse = await transactionService.getTransactionById(id);
      set({ currentTransaction: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.message || `Failed to fetch transaction with id ${id}`,
        loading: false,
      });
      return null;
    }
  },

  /**
   * Membuat transaksi baru saat user melakukan checkout
   * @param data - Data pesanan tiket
   * @returns Data transaksi yang berhasil dibuat atau null
   */
  createTransaction: async (data: CreateTransactionRequest) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionResponse = await transactionService.createTransaction(data);
      if (response.success) {
        set({ currentTransaction: response.data, loading: false });
        return response.data;
      } else {
        set({
          error: response.message || "Failed to create transaction",
          loading: false,
        });
        return null;
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to create transaction",
        loading: false,
      });
      return null;
    }
  },

  /**
   * Mengupload bukti pembayaran untuk transaksi
   * @param id - ID transaksi yang akan diupload bukti bayar
   * @param file - File gambar bukti pembayaran
   * @returns Status keberhasilan upload
   */
  uploadPaymentProof: async (id: string, file: File) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.uploadPaymentProof(id, file);
      if (response.success) {
        // Refresh data transaksi setelah upload sukses
        await get().fetchTransactionById(id);
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.message || "Failed to upload payment proof",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to upload payment proof",
        loading: false,
      });
      return false;
    }
  },

  /**
   * Membatalkan transaksi oleh user
   * @param id - ID transaksi yang akan dibatalkan
   * @returns Status keberhasilan pembatalan
   */
  cancelTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.cancelTransaction(id);
      if (response.success) {
        // Refresh data transaksi setelah batal
        await get().fetchTransactionById(id);
        set({ loading: false });
        return true;
      } else {
        set({
          error: response.message || "Failed to cancel transaction",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to cancel transaction",
        loading: false,
      });
      return false;
    }
  },

  /**
   * Menyetujui transaksi oleh Organizer
   * @param id - ID transaksi yang akan disetujui
   * @returns Status keberhasilan approval
   */
  acceptTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.acceptTransaction(id);
      if (response.success && response.data) {
        // Update UI secara langsung tanpa perlu fetch ulang
        const updatedTransaction = response.data;
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, status: updatedTransaction.status } : t
          ),
          currentTransaction: updatedTransaction,
          loading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || "Failed to accept transaction",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to accept transaction",
        loading: false,
      });
      return false;
    }
  },

  /**
   * Menolak transaksi oleh Organizer
   * @param id - ID transaksi yang akan ditolak
   * @param reason - Alasan penolakan (opsional)
   * @returns Status keberhasilan penolakan
   */
  rejectTransaction: async (id: string, reason?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.rejectTransaction(id, reason);
      if (response.success && response.data) {
        // Update UI secara langsung tanpa perlu fetch ulang
        const updatedTransaction = response.data;
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, status: updatedTransaction.status } : t
          ),
          currentTransaction: updatedTransaction,
          loading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || "Failed to reject transaction",
          loading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || "Failed to reject transaction",
        loading: false,
      });
      return false;
    }
  },

  /**
   * Mengambil daftar transaksi untuk event tertentu (khusus Organizer)
   * @param eventId - ID event yang daftar transaksinya akan diambil
   * @param page - Nomor halaman (default: 1)
   * @param limit - Jumlah data per halaman (default: 20)
   */
  fetchEventTransactions: async (eventId: string, page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionsResponse = await transactionService.getEventTransactions(eventId, page, limit);
      set({
        transactions: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  /**
   * Mengambil semua transaksi milik Organizer yang sedang login
   * @param page - Nomor halaman (default: 1)
   * @param limit - Jumlah data per halaman (default: 20)
   */
  fetchOrganizerTransactions: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionsResponse = await transactionService.getOrganizerTransactions(page, limit);
      set({
        transactions: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  /**
   * Mengubah halaman pagination untuk daftar transaksi user
   * @param page - Nomor halaman yang akan dituju
   */
  setPage: (page: number) => {
    const { fetchMyTransactions } = get();
    fetchMyTransactions(page);
  },

  /**
   * Membersihkan daftar transaksi dan mengembalikan pagination ke halaman 1
   */
  clearTransactions: () =>
    set({
      transactions: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }),

  /**
   * Membersihkan data transaksi yang sedang dibuka (untuk cleanup)
   */
  clearCurrentTransaction: () => set({ currentTransaction: null }),

  /**
   * Membersihkan pesan error dari state
   */
  clearError: () => set({ error: null }),
}));