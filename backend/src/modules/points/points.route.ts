import { Router } from "express";
import { pointsController } from "./points.controller";
import { authMiddleware } from "../auth/auth.middleware";

console.log("[DEBUG Route] Registering Points routes");

const pointsRouter = Router();

// Ambil riwayat transaksi poin
pointsRouter.get(
  "/history",
  authMiddleware.verifyAuthToken,
  pointsController.getPointsHistory,
);

// Ambil total poin aktif user
pointsRouter.get(
  "/active",
  authMiddleware.verifyAuthToken,
  pointsController.getActivePoints,
);

export default pointsRouter;