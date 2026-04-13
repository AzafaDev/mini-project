import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
    comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5").optional(),
    comment: z.string().max(1000, "Comment must be less than 1000 characters").optional(),
  }),
});

export const getEventReviewsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
  }),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type GetEventReviewsQueryInput = z.infer<typeof getEventReviewsQuerySchema>;