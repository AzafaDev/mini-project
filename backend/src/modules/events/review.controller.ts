import { Request, Response, NextFunction } from "express";
import { reviewService } from "./review.service";
import { AuthRequest } from "../auth/auth.type";

export const reviewController = {
  createReview: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const eventId = req.params.id as string;
      const userId = req.userId;
      const { rating, comment } = req.body;

      console.log("[DEBUG Review Controller] createReview:", { eventId, userId, rating, comment });

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const review = await reviewService.createReview({
        userId,
        eventId,
        rating,
        comment,
      });

      console.log("[DEBUG Review Controller] createReview success:", review.id);

      res.status(201).json({
        success: true,
        message: "Review created successfully",
        data: review,
      });
    } catch (error: any) {
      console.error("[DEBUG Review Controller] createReview error:", error.message);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  updateReview: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId;
      const { rating, comment } = req.body;

      console.log("[DEBUG Review Controller] updateReview:", { id, userId, rating, comment });

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const review = await reviewService.updateReview({
        id,
        userId,
        rating,
        comment,
      });

      console.log("[DEBUG Review Controller] updateReview success:", review.id);

      res.status(200).json({
        success: true,
        message: "Review updated successfully",
        data: review,
      });
    } catch (error: any) {
      console.error("[DEBUG Review Controller] updateReview error:", error.message);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  deleteReview: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const userId = req.userId;

      console.log("[DEBUG Review Controller] deleteReview:", { id, userId });

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await reviewService.deleteReview({
        id,
        userId,
      });

      console.log("[DEBUG Review Controller] deleteReview success");

      res.status(200).json({
        success: true,
        message: "Review deleted successfully",
      });
    } catch (error: any) {
      console.error("[DEBUG Review Controller] deleteReview error:", error.message);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getEventReviews: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = req.params.id as string;
      const { page, limit } = req.query;

      console.log("[DEBUG Review Controller] getEventReviews:", { eventId, page, limit });

      const result = await reviewService.getEventReviews({
        eventId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      console.log("[DEBUG Review Controller] getEventReviews result:", result.data.length);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error("[DEBUG Review Controller] getEventReviews error:", error.message);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },
};