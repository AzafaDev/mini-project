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

// Buat transaksi baru - User membeli tiket
transactionRouter.post(
  "/",
  authMiddleware.verifyAuthToken,
  validate(createTransactionSchema),
  transactionController.createTransaction,
);

// Ambil riwayat transaksi milik user yang login
transactionRouter.get(
  "/me",
  authMiddleware.verifyAuthToken,
  transactionController.getMyTransactions,
);

// Ambil semua transaksi untuk event tertentu - Hanya organizer yang boleh
transactionRouter.get(
  "/event/:eventId",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  validate(getTransactionsQuerySchema),
  transactionController.getEventTransactions,
);

// Ambil semua transaksi untuk semua event milik organizer
transactionRouter.get(
  "/organizer",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.getOrganizerTransactions,
);

// Ambil detail transaksi berdasarkan ID
transactionRouter.get(
  "/:id",
  authMiddleware.verifyAuthToken,
  transactionController.getTransactionById,
);

// Upload bukti pembayaran
transactionRouter.put(
  "/:id/payment-proof",
  authMiddleware.verifyAuthToken,
  transactionController.uploadPaymentProof,
);

// Terima transaksi - Hanya organizer yang boleh
transactionRouter.put(
  "/:id/accept",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.acceptTransaction,
);

// Tolak transaksi - Hanya organizer yang boleh
transactionRouter.put(
  "/:id/reject",
  authMiddleware.verifyAuthToken,
  authMiddleware.isOrganizer,
  transactionController.rejectTransaction,
);

// Batalkan transaksi - User membatalkan sebelum dikonfirmasi
transactionRouter.put(
  "/:id/cancel",
  authMiddleware.verifyAuthToken,
  transactionController.cancelTransaction,
);

// Cek apakah user sudah membeli tiket untuk event tertentu
transactionRouter.get(
  "/check-purchase/:eventId",
  authMiddleware.verifyAuthToken,
  transactionController.checkUserPurchase,
);

export default transactionRouter;