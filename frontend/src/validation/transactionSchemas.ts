import * as Yup from "yup";

// UUID validation regex
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Create Transaction Schema
export const createTransactionSchema = Yup.object().shape({
  eventId: Yup.string().required("Event is required").matches(uuidRegex, "Invalid event ID format"),
  ticketId: Yup.string().required("Ticket is required").test("ticket-id", "Invalid ticket ID", value => {
    return value === "default-ticket" || uuidRegex.test(value);
  }),
  quantity: Yup.number()
    .required("Quantity is required")
    .integer("Quantity must be an integer")
    .min(1, "Quantity must be at least 1"),
  voucherCode: Yup.string(),
  couponCode: Yup.string(),
  pointsUsed: Yup.number().integer().min(0),
});

// Update Transaction Status Schema
export const updateTransactionStatusSchema = Yup.object().shape({
  status: Yup.string()
    .required("Status is required")
    .oneOf(["PENDING", "PAID", "CANCELLED", "REFUNDED", "EXPIRED", "FAILED"], "Invalid status"),
});

// Transaction Query Schema
export const transactionQuerySchema = Yup.object().shape({
  eventId: Yup.string(),
  status: Yup.string(),
  page: Yup.number().integer().positive().default(1),
  limit: Yup.number().integer().positive().max(100).default(10),
});
