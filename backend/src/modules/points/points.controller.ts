import { Request, Response } from "express";
import { pointsService } from "./points.service";
import { AuthRequest } from "../auth/auth.type";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";

export const pointsController = {
  getPointsHistory: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;
    const { page, limit } = req.query;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await pointsService.getPointsHistory({
      userId,
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }),

  getActivePoints: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await pointsService.getActivePoints({
      userId,
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  }),
};
