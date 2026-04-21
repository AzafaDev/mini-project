import * as Yup from "yup";

// Create Review Schema
export const createReviewSchema = Yup.object().shape({
  rating: Yup.number()
    .required("Rating is required")
    .integer("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: Yup.string().max(1000, "Comment must be less than 1000 characters"),
});

// Update Review Schema
export const updateReviewSchema = Yup.object().shape({
  rating: Yup.number()
    .integer("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  comment: Yup.string().max(1000, "Comment must be less than 1000 characters"),
});

// Review Query Schema
export const reviewQuerySchema = Yup.object().shape({
  page: Yup.number().integer().positive().default(1),
  limit: Yup.number().integer().positive().max(100).default(10),
});
