import { Request, Response, NextFunction } from "express";
import { pointsService } from "./points.service";
import { AuthRequest } from "../auth/auth.type";

export const pointsController = {
  getPointsHistory: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      const { page, limit } = req.query;

      console.log("[DEBUG Points Controller] getPointsHistory:", { userId, page, limit });

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const result = await pointsService.getPointsHistory({
        userId,
        page: Number(page) || 1,
        limit: Number(limit) || 10,
      });

      console.log("[DEBUG Points Controller] getPointsHistory result:", result.data.length);

      res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error: any) {
      console.error("[DEBUG Points Controller] getPointsHistory error:", error.message);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },

  getActivePoints: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      console.log("[DEBUG Points Controller] getActivePoints:", { userId });

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const result = await pointsService.getActivePoints({
        userId,
      });

      console.log("[DEBUG Points Controller] getActivePoints result:", result.activePoints);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error("[DEBUG Points Controller] getActivePoints error:", error.message);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  },
};