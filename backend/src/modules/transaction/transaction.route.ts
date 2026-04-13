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

console.log("[DEBUG Route] Registering Transaction routes");

transactionRouter.post(
  "/",
  authMiddleware.verifyAuthToken,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

transactionRouter.get(
  "/me",
  authMiddleware.verifyAuthToken,
  transactionController.getMyTransactions,
);

transactionRouter.get(
  "/event/:eventId",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(getTransactionsQuerySchema),
  transactionController.getEventTransactions,
);

transactionRouter.get(
  "/organizer",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.getOrganizerTransactions,
);

transactionRouter.get(
  "/:id",
  authMiddleware.verifyAuthToken,
  transactionController.getTransactionById,
);

transactionRouter.put(
  "/:id/payment-proof",
  authMiddleware.verifyAuthToken,
  transactionController.uploadPaymentProof,
);

transactionRouter.put(
  "/:id/accept",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.acceptTransaction,
);

transactionRouter.put(
  "/:id/reject",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.rejectTransaction,
);

transactionRouter.put(
  "/:id/cancel",
  authMiddleware.verifyAuthToken,
  transactionController.cancelTransaction,
);

export default transactionRouter;