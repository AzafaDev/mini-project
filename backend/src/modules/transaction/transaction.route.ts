import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { validate } from "../../middleware/validate";
import {
  createTransactionSchema,
  updateTransactionStatusSchema,
  getTransactionsQuerySchema,
} from "./transaction.schema";

const transactionRouter = Router();

/**
 * Transaction Routes
 * Handles all ticket purchase and payment flows
 */

// Create new transaction - Customer buys tickets
transactionRouter.post(
  "/",
  authMiddleware.verifyAuthToken,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

// Get my transactions - Customer views their transaction history
transactionRouter.get(
  "/me",
  authMiddleware.verifyAuthToken,
  transactionController.getMyTransactions,
);

// Get event transactions - Organizer views transactions for specific event
transactionRouter.get(
  "/event/:eventId",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(getTransactionsQuerySchema),
  transactionController.getEventTransactions,
);

// Get organizer transactions - Organizer views all their transactions
transactionRouter.get(
  "/organizer",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.getOrganizerTransactions,
);

// Get transaction by ID - View specific transaction details
transactionRouter.get(
  "/:id",
  authMiddleware.verifyAuthToken,
  transactionController.getTransactionById,
);

// Upload payment proof - Customer submits payment receipt
transactionRouter.put(
  "/:id/payment-proof",
  authMiddleware.verifyAuthToken,
  transactionController.uploadPaymentProof,
);

// Accept transaction - Organizer confirms payment
transactionRouter.put(
  "/:id/accept",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.acceptTransaction,
);

// Reject transaction - Organizer rejects payment
transactionRouter.put(
  "/:id/reject",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.rejectTransaction,
);

// Cancel transaction - Customer cancels before confirmation
transactionRouter.put(
  "/:id/cancel",
  authMiddleware.verifyAuthToken,
  transactionController.cancelTransaction,
);

export default transactionRouter;