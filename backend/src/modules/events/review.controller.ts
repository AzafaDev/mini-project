import { Request, Response } from "express";
import { reviewService } from "./review.service";
import { AuthRequest } from "../auth/auth.type";
import { catchAsync } from "../../utils/catchAsync";

export const reviewController = {
  createReview: catchAsync<AuthRequest>(async (req, res) => {
    const eventId = req.params.id as string;
    const userId = req.userId;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const review = await reviewService.createReview({
      userId,
      eventId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  }),

  updateReview: catchAsync<AuthRequest>(async (req, res) => {
    const id = req.params.id as string;
    const userId = req.userId;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const review = await reviewService.updateReview({
      id,
      userId,
      rating,
      comment,
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: review,
    });
  }),

  deleteReview: catchAsync<AuthRequest>(async (req, res) => {
    const id = req.params.id as string;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    await reviewService.deleteReview({
      id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  }),

  getEventReviews: catchAsync(async (req: Request, res: Response) => {
    const eventId = req.params.id as string;
    const { page, limit } = req.query;

    const result = await reviewService.getEventReviews({
      eventId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }),
};
