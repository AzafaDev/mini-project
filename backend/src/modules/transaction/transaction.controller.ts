import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../auth/auth.type";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import {
  transactionCreationService,
  transactionStatusService,
  transactionQueryService,
} from "./services";

export const transactionController = {
  createTransaction: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const body = req.body as Record<string, any>;

    const eventId = body.eventId as string;
    const ticketId = body.ticketId as string;
    const quantity = Number(body.quantity);
    const voucherCode = body.voucherCode as string | undefined;
    const couponCode = body.couponCode as string | undefined;
    const pointsUsed = body.pointsUsed ? Number(body.pointsUsed) : 0;
    const idempotencyKey = body.idempotencyKey as string | undefined;

    const transaction = await transactionCreationService.createTransaction({
      userId,
      eventId,
      ticketId,
      quantity,
      voucherCode,
      couponCode,
      pointsUsed,
      idempotencyKey,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created",
      data: transaction,
    });
  }),

  getTransactionById: catchAsync(async (req, res) => {
    const id = req.params.id as string;

    const transaction = await transactionQueryService.getTransactionById({ id });

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    res.status(200).json({
      success: true,
      data: transaction,
    });
  }),

  getMyTransactions: catchAsync<AuthRequest>(async (req, res) => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { page = 1, limit = 10 } = req.query;

    const { data, pagination } = await transactionQueryService.getUserTransactions({
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
      throw new AppError("Unauthorized", 401);
    }

    const eventId = req.params.eventId as string;

    const { page = 1, limit = 10 } = req.query;

    const { data, pagination } = await transactionQueryService.getEventTransactions({
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
      throw new AppError("Unauthorized", 401);
    }

    const { page = 1, limit = 100 } = req.query;

    const { data, pagination } = await transactionQueryService.getOrganizerTransactions({
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
      throw new AppError("Payment proof is required", 400);
    }

    const paymentProof = req.files.paymentProof as UploadedFile;

    const transaction = await transactionCreationService.uploadPaymentProof({
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

    const transaction = await transactionStatusService.acceptTransaction({ id });

    res.status(200).json({
      success: true,
      message: "Transaction accepted",
      data: transaction,
    });
  }),

  rejectTransaction: catchAsync<AuthRequest>(async (req, res) => {
    const id = req.params.id as string;

    const transaction = await transactionStatusService.rejectTransaction({ id });

    res.status(200).json({
      success: true,
      message: "Transaction rejected",
      data: transaction,
    });
  }),

   cancelTransaction: catchAsync<AuthRequest>(async (req, res) => {
     const id = req.params.id as string;

     const transaction = await transactionStatusService.cancelTransaction({ id });

     res.status(200).json({
       success: true,
       message: "Transaction cancelled",
       data: transaction,
     });
   }),

   checkUserPurchase: catchAsync<AuthRequest>(async (req, res) => {
     const eventId = req.params.eventId as string;
     const userId = req.userId as string;

     const hasPurchased = await transactionQueryService.hasUserPurchased({ userId, eventId });
     res.json({ success: true, hasPurchased });
   }),
};
