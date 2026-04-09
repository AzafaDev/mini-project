import { Router } from "express";
import { eventController } from "./event.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { validate } from "../../middleware/validate";
import {
  createEventSchema,
  updateEventSchema,
  getAllEventsQuerySchema,
} from "./event.schema";

const eventRouter = Router();

eventRouter.get("/", validate(getAllEventsQuerySchema), eventController.getAllEvents);
eventRouter.get("/me", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getMyEvents);
eventRouter.get("/:id", eventController.getEventById);
eventRouter.post(
  "/",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(createEventSchema),
  eventController.createEvent,
);
eventRouter.put(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(updateEventSchema),
  eventController.updateEvent,
);
eventRouter.delete(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  eventController.deleteEvent,
);

export default eventRouter;