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

// ============================================================
// GET /events - Ambil semua event (public, dengan filter/pagination)
// ============================================================
eventRouter.get("/", validate(getAllEventsQuerySchema), eventController.getAllEvents);

// ============================================================
// GET /events/organizer/:id - Ambil profil organizer (public)
// ============================================================
eventRouter.get("/organizer/:id", eventController.getOrganizerProfile);

// ============================================================
// GET /events/me - Ambil event milik sendiri (organizer only)
// Middleware: verifyAuthToken (cek login) -> isOrganizer (cek role)
// ============================================================
eventRouter.get("/me", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getMyEvents);

// ============================================================
// GET /events/stats - Ambil statistik organizer (organizer only)
// ============================================================
eventRouter.get("/stats", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, eventController.getOrganizerStats);

// ============================================================
// GET /events/:id/stats - Ambil statistik event tertentu (organizer only, owner only)
// ============================================================
eventRouter.get("/:id/stats", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, isEventOwner, eventController.getEventStats);

// ============================================================
// GET /events/:id/attendees - Ambil peserta event (organizer only, owner only)
// ============================================================
eventRouter.get("/:id/attendees", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, isEventOwner, eventController.getEventAttendees);

// ============================================================
// GET /events/:id - Ambil detail event (public)
// ============================================================
eventRouter.get("/:id", eventController.getEventById);

// ============================================================
// POST /events - Buat event baru (ORGANIZER ONLY)
// ============================================================
// Middleware Chain (dieksekusi berurutan):
// 1. authMiddleware.verifyAuthToken - Cek user sudah login (dari cookie JWT)
// 2. authMiddleware.isOrganizer - Cek user punya role ORGANIZER
// 3. validate(createEventSchema) - Validasi input dengan Zod schema
// 4. eventController.createEvent - Eksekusi bisnis logic
eventRouter.post(
  "/",
  authMiddleware.verifyAuthToken,      // Step 1: Cek user login
  authMiddleware.isOrganizer,           // Step 2: Cek role ORGANIZER
  validate(createEventSchema),           // Step 3: Validasi input (name, description, dll)
  eventController.createEvent,          // Step 4: Buat event di database
);

// ============================================================
// PUT /events/:id - Update event (ORGANIZER + OWNER only)
// ============================================================
eventRouter.put(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  isEventOwner,                          // tambahan: Cek apakah benar owner event ini
  validate(updateEventSchema),
  eventController.updateEvent,
);

// ============================================================
// DELETE /events/:id - Hapus event (ORGANIZER + OWNER only)
// ============================================================
eventRouter.delete(
  "/:id",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  isEventOwner,
  eventController.deleteEvent,
);

export default eventRouter;
