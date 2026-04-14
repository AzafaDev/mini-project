import { Router } from "express";
import { reviewController } from "./review.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { validate } from "../../middleware/validate";
import { createReviewSchema, updateReviewSchema } from "./review.schema";

console.log("[DEBUG Route] Registering Review routes");

const reviewRouter = Router();

reviewRouter.get(
  "/event/:id/reviews",
  reviewController.getEventReviews
);

reviewRouter.post(
  "/event/:id/reviews",
  authMiddleware.verifyAuthToken,
  validate(createReviewSchema),
  reviewController.createReview,
);

reviewRouter.put(
  "/:id",
  authMiddleware.verifyAuthToken,
  validate(updateReviewSchema),
  reviewController.updateReview,
);

reviewRouter.delete(
  "/:id",
  authMiddleware.verifyAuthToken,
  reviewController.deleteReview,
);

export default reviewRouter;