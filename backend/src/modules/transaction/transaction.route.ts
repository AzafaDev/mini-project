import { Router } from "express";
import { transactionController } from "./transaction.controller";
import { authMiddleware } from "../auth/auth.middleware";
import { validate } from "../../middleware/validate";
import {
  createTransactionSchema,
  getTransactionsQuerySchema,
  transactionIdParamsSchema,
  eventIdParamsSchema,
  getUserTransactionsQuerySchema,
  getOrganizerTransactionsQuerySchema,
} from "./transaction.schema";

const transactionRouter = Router();

transactionRouter.post(
  "/",
  authMiddleware.verifyAuthToken,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

transactionRouter.get(
  "/me",
  authMiddleware.verifyAuthToken,
  validate(getUserTransactionsQuerySchema),
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
  validate(getOrganizerTransactionsQuerySchema),
  transactionController.getOrganizerTransactions,
);

transactionRouter.get(
  "/:id",
  authMiddleware.verifyAuthToken,
  validate(transactionIdParamsSchema),
  transactionController.getTransactionById,
);

transactionRouter.put(
  "/:id/payment-proof",
  authMiddleware.verifyAuthToken,
  validate(transactionIdParamsSchema),
  transactionController.uploadPaymentProof,
);

transactionRouter.put(
  "/:id/accept",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(transactionIdParamsSchema),
  transactionController.acceptTransaction,
);

transactionRouter.put(
  "/:id/reject",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(transactionIdParamsSchema),
  transactionController.rejectTransaction,
);

transactionRouter.put(
  "/:id/cancel",
  authMiddleware.verifyAuthToken,
  validate(transactionIdParamsSchema),
  transactionController.cancelTransaction,
);

transactionRouter.get(
  "/check-purchase/:eventId",
  authMiddleware.verifyAuthToken,
  transactionController.checkUserPurchase,
);

export default transactionRouter;
