import { z } from "zod";

export const validateCouponQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    code: z.string({ message: "Coupon code is required" }),
    price: z.string().optional(),
    quantity: z.string().optional(),
  }),
  params: z.object({}).optional(),
});

export const getCouponsQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    userId: z.string().optional(),
  }),
  params: z.object({}).optional(),
});
