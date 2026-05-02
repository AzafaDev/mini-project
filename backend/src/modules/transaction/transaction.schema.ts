import { z } from "zod";
import { TransactionStatus } from "@prisma/client";

export const createTransactionSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
    ticketId: z.string().uuid("Invalid ticket ID"),
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
    voucherCode: z.string().optional(),
    couponCode: z.string().optional(),
    pointsUsed: z.coerce.number().int().min(0).optional(),
    idempotencyKey: z.string().uuid("Invalid idempotency key").optional(),
  }),
});

export const updateTransactionStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(TransactionStatus),
  }),
});

export const getTransactionsQuerySchema = z.object({
  query: z.object({
    eventId: z.string().optional(),
    status: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export const transactionIdParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string().uuid("Invalid transaction ID"),
  }),
});

export const eventIdParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    eventId: z.string().uuid("Invalid event ID"),
  }),
});

export const getUserTransactionsQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  }),
  params: z.object({}).optional(),
});

export const getOrganizerTransactionsQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(100).optional(),
  }),
  params: z.object({}).optional(),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<
  typeof updateTransactionStatusSchema
>;
export type GetTransactionsQueryInput = z.infer<
  typeof getTransactionsQuerySchema
>;
