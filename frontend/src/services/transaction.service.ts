import axiosInstance from "../lib/axiosInstance";
import type {
  Transaction,
  CreateTransactionRequest,
  TransactionsResponse,
  TransactionResponse,
  TransactionActionResponse,
} from "../types";

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
     const response = await axiosInstance.put(`/transactions/${id}/reject`, { reason });
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