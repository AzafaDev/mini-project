import { create } from "zustand";
import {
  transactionService,
  type Transaction,
  type CreateTransactionRequest,
  type TransactionsResponse,
  type TransactionResponse,
} from "../services/api";

interface TransactionStore {
  transactions: Transaction[];
  currentTransaction: Transaction | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchMyTransactions: (page?: number, limit?: number) => Promise<void>;
  fetchTransactionById: (id: string) => Promise<Transaction | null>;
  createTransaction: (
    data: CreateTransactionRequest
  ) => Promise<Transaction | null>;
  uploadPaymentProof: (id: string, file: File) => Promise<boolean>;
  cancelTransaction: (id: string) => Promise<boolean>;
  acceptTransaction: (id: string) => Promise<boolean>;
  rejectTransaction: (id: string, reason?: string) => Promise<boolean>;
  fetchEventTransactions: (
    eventId: string,
    page?: number,
    limit?: number
  ) => Promise<void>;
  fetchOrganizerTransactions: (page?: number, limit?: number) => Promise<void>;
  setPage: (page: number) => void;
  clearTransactions: () => void;
  clearCurrentTransaction: () => void;
  clearError: () => void;
}

export const useTransactionStore = create<TransactionStore>((set, get) => ({
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

  fetchMyTransactions: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionsResponse =
        await transactionService.getMyTransactions(page, limit);
      set({
        transactions: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  fetchTransactionById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionResponse =
        await transactionService.getTransactionById(id);
      set({ currentTransaction: response.data, loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message ||
          `Failed to fetch transaction with id ${id}`,
        loading: false,
      });
      return null;
    }
  },

  createTransaction: async (data: CreateTransactionRequest) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionResponse =
        await transactionService.createTransaction(data);
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
        error: error.response?.data?.message || "Failed to create transaction",
        loading: false,
      });
      return null;
    }
  },

  uploadPaymentProof: async (id: string, file: File) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.uploadPaymentProof(id, file);
      if (response.success) {
        // Refresh the current transaction
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
        error:
          error.response?.data?.message || "Failed to upload payment proof",
        loading: false,
      });
      return false;
    }
  },

  cancelTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.cancelTransaction(id);
      if (response.success) {
        // Refresh the current transaction
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
        error: error.response?.data?.message || "Failed to cancel transaction",
        loading: false,
      });
      return false;
    }
  },

  acceptTransaction: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.acceptTransaction(id);
      if (response.success && response.data) {
        // Update both currentTransaction and transactions array for immediate UI refresh
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
        error: error.response?.data?.message || "Failed to accept transaction",
        loading: false,
      });
      return false;
    }
  },

  rejectTransaction: async (id: string, reason?: string) => {
    set({ loading: true, error: null });
    try {
      const response = await transactionService.rejectTransaction(id, reason);
      if (response.success && response.data) {
        // Update both currentTransaction and transactions array for immediate UI refresh
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
        error: error.response?.data?.message || "Failed to reject transaction",
        loading: false,
      });
      return false;
    }
  },

  fetchEventTransactions: async (eventId: string, page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionsResponse =
        await transactionService.getEventTransactions(eventId, page, limit);
      set({
        transactions: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  fetchOrganizerTransactions: async (page = 1, limit = 20) => {
    set({ loading: true, error: null });
    try {
      const response: TransactionsResponse =
        await transactionService.getOrganizerTransactions(page, limit);
      set({
        transactions: response.data,
        pagination: response.pagination,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch transactions",
        loading: false,
      });
    }
  },

  setPage: (page: number) => {
    const { fetchMyTransactions } = get();
    fetchMyTransactions(page);
  },

  clearTransactions: () =>
    set({
      transactions: [],
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }),

  clearCurrentTransaction: () => set({ currentTransaction: null }),

  clearError: () => set({ error: null }),
}));