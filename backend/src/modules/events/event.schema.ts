import { z } from "zod";
import { TicketType } from "@prisma/client";

const ticketSchema = z.object({
  type: z.nativeEnum(TicketType),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  quantity: z.coerce
    .number()
    .int()
    .positive("Quantity must be a positive integer"),
});

const ticketSchemaOptional = ticketSchema.optional();

// Preprocess tickets: handle both string (from FormData) and array (from JSON)
const preprocessTickets = z.preprocess((val) => {
  if (typeof val === "string") {
    try {
      return JSON.parse(val);
    } catch {
      return undefined;
    }
  }
  return val;
}, z.array(ticketSchema).optional());

// Create event validation schema
export const createEventSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Event name is required"),
    description: z.string().min(1, "Description is required"),
    location: z.string().min(1, "Location is required"),
    category: z.string().min(1, "Category is required"),
    startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid start date format",
    }),
    endDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid end date format",
    }),
    totalSeats: z.coerce
      .number()
      .int()
      .positive("Total seats must be a positive integer"),
    price: z.coerce.number().min(0, "Price must be a non-negative number"),
    availableSeats: z.coerce
      .number()
      .int()
      .positive("Available seats must be a positive integer")
      .optional(),
    tickets: preprocessTickets,
  }),
});

// Update event validation schema
export const updateEventSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Event name is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    location: z.string().min(1, "Location is required").optional(),
    category: z.string().min(1, "Category is required").optional(),
    startDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid start date format",
      })
      .optional(),
    endDate: z
      .string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid end date format",
      })
      .optional(),
    totalSeats: z.coerce
      .number()
      .int()
      .positive("Total seats must be a positive integer")
      .optional(),
    price: z.coerce
      .number()
      .min(0, "Price must be a non-negative number")
      .optional(),
    availableSeats: z.coerce
      .number()
      .int()
      .positive("Available seats must be a positive integer")
      .optional(),
  }),
});

// Get all events query validation schema
export const getAllEventsQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    location: z.string().optional(),
    //
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    //
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    //
    sortBy: z.enum(["name", "startDate", "price", "createdAt"]).optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
    //
  }),
});

// Type exports
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type GetAllEventsQueryInput = z.infer<typeof getAllEventsQuerySchema>;
