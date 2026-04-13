import { Router } from "express";
import { pointsController } from "./points.controller";
import { authMiddleware } from "../auth/auth.middleware";

console.log("[DEBUG Route] Registering Points routes");

const pointsRouter = Router();

pointsRouter.get(
  "/history",
  authMiddleware.verifyAuthToken,
  pointsController.getPointsHistory,
);

pointsRouter.get(
  "/active",
  authMiddleware.verifyAuthToken,
  pointsController.getActivePoints,
);

export default pointsRouter;