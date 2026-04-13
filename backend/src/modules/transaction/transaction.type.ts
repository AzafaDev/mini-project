export enum TransactionStatus {
  WAITING_PAYMENT = "WAITING_PAYMENT",
  WAITING_CONFIRMATION = "WAITING_CONFIRMATION",
  DONE = "DONE",
  REJECTED = "REJECTED",
  EXPIRED = "EXPIRED",
  CANCELED = "CANCELED",
}

export interface CreateTransaction {
  eventId: string;
  ticketId: string;
  quantity: number;
  voucherCode?: string;
  couponCode?: string;
  pointsUsed?: number;
}

export interface TransactionFilters {
  userId?: string;
  eventId?: string;
  status?: TransactionStatus;
  page?: number;
  limit?: number;
}

export interface UpdateTransactionStatus {
  status: TransactionStatus;
}

export interface TransactionResponse {
  id: string;
  userId: string;
  eventId: string;
  ticketId: string;
  quantity: number;
  totalPrice: number;
  discount: number;
  pointsUsed: number;
  couponId: string | null;
  voucherId: string | null;
  finalPrice: number;
  status: TransactionStatus;
  paymentProof: string | null;
  paymentProofUploadedAt: Date | null;
  paidAt: Date | null;
  expiresAt: Date;
  autoCancelAt: Date | null;
  createdAt: Date;
}