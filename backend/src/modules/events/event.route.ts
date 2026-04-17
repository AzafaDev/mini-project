import { Router } from "express";
import { eventController } from "./event.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { isEventOwner } from "../../middleware/isEventOwner";
import { validate } from "../../middleware/validate";
import {
  createEventSchema,
  updateEventSchema,
  getAllEventsQuerySchema,
} from "./event.schema";

const eventRouter = Router();

console.log("[DEBUG Route] Registering Event routes");

eventRouter.get("/", validate(getAllEventsQuerySchema), eventController.getAllEvents);
eventRouter.get("/organizer/:id", eventController.getOrganizerProfile);
eventRouter.get("/me", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getMyEvents);
eventRouter.get("/stats", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getOrganizerStats);
eventRouter.get("/:id/stats", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, isEventOwner, eventController.getEventStats);
eventRouter.get("/:id/attendees", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, isEventOwner, eventController.getEventAttendees);
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
  isEventOwner,
  validate(updateEventSchema),
  eventController.updateEvent,
);
eventRouter.delete(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  isEventOwner,
  eventController.deleteEvent,
);

export default eventRouter;
