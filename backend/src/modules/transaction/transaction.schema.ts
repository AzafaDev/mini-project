import { z } from "zod";

export const createTransactionSchema = z.object({
  body: z.object({
    eventId: z.string().uuid("Invalid event ID"),
    ticketId: z.union([
      z.string().uuid("Invalid ticket ID"),
      z.literal("default-ticket"),
    ]),
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
    voucherCode: z.string().optional(),
    couponCode: z.string().optional(),
    pointsUsed: z.coerce.number().int().min(0).optional(),
  }),
});

export const updateTransactionStatusSchema = z.object({
  body: z.object({
    status: z.enum([
      "WAITING_PAYMENT",
      "WAITING_CONFIRMATION",
      "DONE",
      "REJECTED",
      "EXPIRED",
      "CANCELED",
    ]),
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

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionStatusInput = z.infer<typeof updateTransactionStatusSchema>;
export type GetTransactionsQueryInput = z.infer<typeof getTransactionsQuerySchema>;