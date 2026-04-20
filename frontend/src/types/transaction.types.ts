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