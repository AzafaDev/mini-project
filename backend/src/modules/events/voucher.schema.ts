import { z } from "zod";

export const getVouchersParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    eventId: z.string({ message: "Event ID is required" }),
  }),
});

export const checkVoucherQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    eventId: z.string({ message: "Event ID is required" }),
    code: z.string({ message: "Voucher code is required" }),
    price: z.string().optional(),
    quantity: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

export const createVoucherSchema = z.object({
  body: z.object({
    eventId: z.string({ message: "Event ID is required" }),
    code: z.string({ message: "Voucher code is required" }),
    discountType: z.enum(["PERCENTAGE", "FIXED"], { message: "Discount type must be PERCENTAGE or FIXED" }),
    discountValue: z.number({ message: "Discount value is required" }).positive("Discount value must be positive"),
    startDate: z.string({ message: "Start date is required" }),
    endDate: z.string({ message: "End date is required" }),
    maxUsage: z.number().optional(),
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional(),
});

export const deleteVoucherParamsSchema = z.object({
  body: z.object({}).optional(),
  query: z.object({}).optional(),
  params: z.object({
    id: z.string({ message: "Voucher ID is required" }),
  }),
});
