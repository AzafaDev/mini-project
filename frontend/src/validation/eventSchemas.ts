import * as Yup from "yup";

// Create Event Schema
export const createEventSchema = Yup.object().shape({
  name: Yup.string().required("Event name is required"),
  description: Yup.string().required("Description is required"),
  location: Yup.string().required("Location is required"),
  category: Yup.string().required("Category is required"),
  startDate: Yup.string().required("Start date is required").matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Invalid date format"),
  endDate: Yup.string().required("End date is required").matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Invalid date format"),
  totalSeats: Yup.number()
    .required("Total seats is required")
    .integer("Total seats must be an integer")
    .positive("Total seats must be a positive number"),
  availableSeats: Yup.number().integer().positive().optional(),
  price: Yup.number()
    .required("Price is required")
    .min(0, "Price must be a non-negative number"),
  tickets: Yup.array().of(
    Yup.object().shape({
      type: Yup.string().oneOf(["GENERAL", "VIP"]).required("Ticket type is required"),
      price: Yup.number().required("Ticket price is required").min(0),
      quantity: Yup.number().required("Quantity is required").integer().positive(),
    })
  ).optional(),
});

// Update Event Schema
export const updateEventSchema = Yup.object().shape({
  name: Yup.string().min(1),
  description: Yup.string().min(1),
  location: Yup.string().min(1),
  category: Yup.string().min(1),
  startDate: Yup.string().matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Invalid date format"),
  endDate: Yup.string().matches(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/, "Invalid date format"),
  totalSeats: Yup.number().integer().positive(),
  availableSeats: Yup.number().integer().positive().optional(),
  price: Yup.number().min(0),
});

// Event Query Schema
export const eventQuerySchema = Yup.object().shape({
  search: Yup.string(),
  category: Yup.string(),
  location: Yup.string(),
  minPrice: Yup.number(),
  maxPrice: Yup.number(),
  startDate: Yup.string(),
  endDate: Yup.string(),
  page: Yup.number().integer().positive().default(1),
  limit: Yup.number().integer().positive().max(100).default(10),
  sortBy: Yup.string().oneOf(["name", "startDate", "price", "createdAt"]),
  sortOrder: Yup.string().oneOf(["asc", "desc"]),
});
