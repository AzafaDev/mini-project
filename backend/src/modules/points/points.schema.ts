import { z } from "zod";

export const getPointsHistoryQuerySchema = z.object({
  body: z.object({}).optional(),
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(100).default(10).optional(),
  }),
  params: z.object({}).optional(),
});
