import { Router } from "express";
import { pointsController } from "./points.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { validate } from "../../middleware/validate";
import { getPointsHistoryQuerySchema } from "./points.schema";
import { logger } from "../../utils/logger";

logger.debug("[Route] Registering Points routes");

const pointsRouter = Router();

pointsRouter.get(
  "/history",
  authMiddleware.verifyAuthToken,
  validate(getPointsHistoryQuerySchema),
  pointsController.getPointsHistory,
);

pointsRouter.get(
  "/active",
  authMiddleware.verifyAuthToken,
  pointsController.getActivePoints,
);

export default pointsRouter;
