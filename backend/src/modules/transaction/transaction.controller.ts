import { Request, Response } from "express";
import { transactionService } from "./transaction.service";
import { handleFileUpload } from "../../utils/handleFileUpload";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../auth/auth.type";

/**
 * Transaction controller handling all transaction-related endpoints.
 * Includes: create, view, upload payment proof, accept/reject/cancel transactions
 */
export const transactionController = {
  /**
   * Creates a new transaction for event tickets.
   * 
   * Process:
   * 1. Validates user is authenticated
   * 2. Parses request body (eventId, ticketId, quantity, voucherCode, couponCode, pointsUsed)
   * 3. Calls service to create transaction with price calculations
   * 4. Returns created transaction with details
   * 
   * @param req - Express request with authenticated user (req.userId) and transaction data
   * @param res - Express response
   * @returns JSON with created transaction data
   */
  createTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create transaction",
      });
    }
  },

  /**
   * Gets a single transaction by ID.
   * 
   * @param req - Express request with transaction ID in params
   * @param res - Express response
   * @returns JSON with transaction data or 404 if not found
   */
  getTransactionById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;

      const transaction = await transactionService.getTransactionById({ id });

      if (!transaction) {
        return res.status(404).json({
          success: false,
          message: "Transaction not found",
        });
      }

      res.status(200).json({
        success: true,
        data: transaction,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transaction",
      });
    }
  },

  /**
   * Gets all transactions for the authenticated user (customer).
   * Supports pagination.
   * 
   * @param req - Express request with authenticated user and query params (page, limit)
   * @param res - Express response
   * @returns JSON with array of transactions and pagination info
   */
  getMyTransactions: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  },

  /**
   * Gets all transactions for a specific event (organizer only).
   * 
   * @param req - Express request with authenticated organizer and eventId in params
   * @param res - Express response
   * @returns JSON with array of transactions for that event
   */
  getEventTransactions: async (req: AuthRequest, res: Response) => {
    try {
      const organizerId = req.userId;

      if (!organizerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  },

  /**
   * Gets all transactions for all events organized by the authenticated organizer.
   * 
   * @param req - Express request with authenticated organizer
   * @param res - Express response
   * @returns JSON with array of all transactions and pagination
   */
  getOrganizerTransactions: async (req: AuthRequest, res: Response) => {
    try {
      const organizerId = req.userId;

      if (!organizerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  },

  /**
   * Uploads payment proof for a transaction.
   * The transaction must be in WAITING_PAYMENT status.
   * 
   * @param req - Express request with transaction ID and payment proof file
   * @param res - Express response
   * @returns JSON with updated transaction
   */
  uploadPaymentProof: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;

      if (!req.files || !("paymentProof" in req.files)) {
        return res.status(400).json({
          success: false,
          message: "Payment proof is required",
        });
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
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload payment proof",
      });
    }
  },

  /**
   * Accepts a transaction (organizer only).
   * Changes status from WAITING_CONFIRMATION to DONE.
   * 
   * @param req - Express request with transaction ID in params
   * @param res - Express response
   * @returns JSON with updated transaction
   */
  acceptTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;

      const transaction = await transactionService.acceptTransaction({ id });

      res.status(200).json({
        success: true,
        message: "Transaction accepted",
        data: transaction,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to accept transaction",
      });
    }
  },

  /**
   * Rejects a transaction (organizer only).
   * Changes status from WAITING_CONFIRMATION to REJECTED.
   * Automatically rolls back points, vouchers, and coupons used.
   * 
   * @param req - Express request with transaction ID in params
   * @param res - Express response
   * @returns JSON with updated transaction
   */
  rejectTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;

      const transaction = await transactionService.rejectTransaction({ id });

      res.status(200).json({
        success: true,
        message: "Transaction rejected",
        data: transaction,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reject transaction",
      });
    }
  },

  /**
   * Cancels a transaction (customer or system).
   * Changes status to CANCELED.
   * Automatically rolls back points, vouchers, and coupons used.
   * Also restores available seats.
   * 
   * @param req - Express request with transaction ID in params
   * @param res - Express response
   * @returns JSON with updated transaction
   */
  cancelTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;

      const transaction = await transactionService.cancelTransaction({ id });

      res.status(200).json({
        success: true,
        message: "Transaction cancelled",
        data: transaction,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel transaction",
      });
    }
  },
};