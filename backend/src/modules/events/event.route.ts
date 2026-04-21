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

// Ambil semua event dengan filter
eventRouter.get("/", validate(getAllEventsQuerySchema), eventController.getAllEvents);
// Ambil profile publik organizer
eventRouter.get("/organizer/:id", eventController.getOrganizerProfile);
// Ambil semua event milik organizer yang login
eventRouter.get("/me", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getMyEvents);
// Ambil statistik semua event milik organizer
eventRouter.get("/stats", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getOrganizerStats);
// Ambil statistik untuk event tertentu
eventRouter.get("/:id/stats", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, isEventOwner, eventController.getEventStats);
// Ambil daftar peserta event
eventRouter.get("/:id/attendees", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, isEventOwner, eventController.getEventAttendees);
// Ambil detail event berdasarkan ID
eventRouter.get("/:id", eventController.getEventById);
// Buat event baru - Hanya organizer
eventRouter.post(
  "/",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(createEventSchema),
  eventController.createEvent,
);
// Update event - Hanya pemilik event
eventRouter.put(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  isEventOwner,
  validate(updateEventSchema),
  eventController.updateEvent,
);
// Hapus event (soft delete) - Hanya pemilik event
eventRouter.delete(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  isEventOwner,
  eventController.deleteEvent,
);

export default eventRouter;
