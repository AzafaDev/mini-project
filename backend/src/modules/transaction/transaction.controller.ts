import { Request, Response, NextFunction } from "express";
import { transactionService } from "./transaction.service";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../auth/auth.type";
import { catchAsync } from "../../utils/catchAsync";

/**
 * Transaction controller handling all transaction-related endpoints.
 * Includes: create, view, upload payment proof, accept/reject/cancel transactions
 */
export const transactionController = {
  // Semua error otomatis ditangkap oleh catchAsync wrapper
  // Tidak perlu buat try-catch manual di setiap controller
  createTransaction: catchAsync<AuthRequest>(async (req, res) => {
    // userId diambil dari token JWT yang sudah di-verify oleh auth middleware
    // Nilai ini sudah dijamin valid oleh middleware sebelumnya
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const body = req.body as Record<string, any>;

    const eventId = body.eventId as string;
    const ticketId = body.ticketId as string;
    const quantity = Number(body.quantity);
    const voucherCode = body.voucherCode as string | undefined;
    const couponCode = body.couponCode as string | undefined;
    const pointsUsed = body.pointsUsed ? Number(body.pointsUsed) : 0;

    const transaction = await transactionService.createTransaction({
      userId,
      eventId,
      ticketId,
      quantity,
      voucherCode,
      couponCode,
      pointsUsed,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created",
      data: transaction,
    });
  }),

  getTransactionById: catchAsync(async (req, res) => {
    const id = req.params.id as string;

    const transaction = await transactionService.getTransactionById({ id });

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  }),

  getMyTransactions: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { page = 1, limit = 10 } = req.query;

    const { data, pagination } = await transactionService.getUserTransactions({
      userId,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      data,
      pagination,
    });
  }),

  getEventTransactions: catchAsync<AuthRequest>(async (req, res) => {
    const organizerId = req.userId;

    if (!organizerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const eventId = req.params.eventId as string;

    const { page = 1, limit = 10 } = req.query;

    const { data, pagination } = await transactionService.getEventTransactions({
      eventId: eventId as string,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      data,
      pagination,
    });
  }),

  getOrganizerTransactions: catchAsync<AuthRequest>(async (req, res) => {
    const organizerId = req.userId;

    if (!organizerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { page = 1, limit = 100 } = req.query;

    const { data, pagination } = await transactionService.getOrganizerTransactions({
      organizerId,
      page: Number(page),
      limit: Number(limit),
    });

    res.status(200).json({
      success: true,
      data,
      pagination,
    });
  }),

  uploadPaymentProof: catchAsync<AuthRequest>(async (req, res) => {
    const id = req.params.id as string;

    if (!req.files || !("paymentProof" in req.files)) {
      res.status(400).json({
        success: false,
        message: "Payment proof is required",
      });
      return;
    }

    const paymentProof = req.files.paymentProof as UploadedFile;

    const transaction = await transactionService.uploadPaymentProof({
      id,
      paymentProof,
    });

    res.status(200).json({
      success: true,
      message: "Payment proof uploaded",
      data: transaction,
    });
  }),

  acceptTransaction: catchAsync<AuthRequest>(async (req, res) => {
    const id = req.params.id as string;

    const transaction = await transactionService.acceptTransaction({ id });

    res.status(200).json({
      success: true,
      message: "Transaction accepted",
      data: transaction,
    });
  }),

  rejectTransaction: catchAsync<AuthRequest>(async (req, res) => {
    const id = req.params.id as string;

    const transaction = await transactionService.rejectTransaction({ id });

    res.status(200).json({
      success: true,
      message: "Transaction rejected",
      data: transaction,
    });
  }),

   cancelTransaction: catchAsync<AuthRequest>(async (req, res) => {
     const id = req.params.id as string;

     const transaction = await transactionService.cancelTransaction({ id });

     res.status(200).json({
       success: true,
       message: "Transaction cancelled",
       data: transaction,
     });
   }),

   checkUserPurchase: catchAsync<AuthRequest>(async (req, res) => {
     const eventId = req.params.eventId as string;
     const userId = req.userId;

     const hasPurchased = await transactionService.hasUserPurchased({ userId, eventId });
     res.json({ success: true, hasPurchased });
   }),
};
