import { Request, Response } from "express";
import { transactionService } from "./transaction.service";
import { handleFileUpload } from "../../utils/handleFileUpload";
import { UploadedFile } from "express-fileupload";
import { AuthRequest } from "../auth/auth.type";

export const transactionController = {
  createTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      console.log("[DEBUG Transaction Controller] createTransaction userId:", userId);

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const body = req.body as Record<string, any>;
      console.log("[DEBUG Transaction Controller] createTransaction body:", body);

      const eventId = body.eventId as string;
      const ticketId = body.ticketId as string;
      const quantity = Number(body.quantity);
      const voucherCode = body.voucherCode as string | undefined;
      const couponCode = body.couponCode as string | undefined;
      const pointsUsed = body.pointsUsed ? Number(body.pointsUsed) : 0;

      console.log("[DEBUG Transaction Controller] parsed params:", { eventId, ticketId, quantity, voucherCode, couponCode, pointsUsed });

      const transaction = await transactionService.createTransaction({
        userId,
        eventId,
        ticketId,
        quantity,
        voucherCode,
        couponCode,
        pointsUsed,
      });

      console.log("[DEBUG Transaction Controller] transaction created:", transaction.id);

      res.status(201).json({
        success: true,
        message: "Transaction created",
        data: transaction,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] createTransaction error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to create transaction",
      });
    }
  },

  getTransactionById: async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      console.log("[DEBUG Transaction Controller] getTransactionById id:", id);

      const transaction = await transactionService.getTransactionById({ id });

      console.log("[DEBUG Transaction Controller] getTransactionById result:", !!transaction);

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
      console.log("[DEBUG Transaction Controller] getTransactionById error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transaction",
      });
    }
  },

  getMyTransactions: async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.userId;
      console.log("[DEBUG Transaction Controller] getMyTransactions userId:", userId);

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { page = 1, limit = 10 } = req.query;
      console.log("[DEBUG Transaction Controller] getMyTransactions pagination:", { page, limit });

      const { data, pagination } = await transactionService.getUserTransactions({
        userId,
        page: Number(page),
        limit: Number(limit),
      });

      console.log("[DEBUG Transaction Controller] getMyTransactions result count:", data.length);

      res.status(200).json({
        success: true,
        data,
        pagination,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] getMyTransactions error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  },

  getEventTransactions: async (req: AuthRequest, res: Response) => {
    try {
      const organizerId = req.userId;
      console.log("[DEBUG Transaction Controller] getEventTransactions organizerId:", organizerId);

      if (!organizerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const eventId = req.params.eventId as string;
      console.log("[DEBUG Transaction Controller] getEventTransactions eventId:", eventId);

      const { page = 1, limit = 10 } = req.query;
      console.log("[DEBUG Transaction Controller] getEventTransactions pagination:", { page, limit });

      const { data, pagination } = await transactionService.getEventTransactions({
        eventId: eventId as string,
        page: Number(page),
        limit: Number(limit),
      });

      console.log("[DEBUG Transaction Controller] getEventTransactions result count:", data.length);

      res.status(200).json({
        success: true,
        data,
        pagination,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] getEventTransactions error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  },

  getOrganizerTransactions: async (req: AuthRequest, res: Response) => {
    try {
      const organizerId = req.userId;
      console.log("[DEBUG Transaction Controller] getOrganizerTransactions organizerId:", organizerId);

      if (!organizerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { page = 1, limit = 100 } = req.query;
      console.log("[DEBUG Transaction Controller] getOrganizerTransactions pagination:", { page, limit });

      const { data, pagination } = await transactionService.getOrganizerTransactions({
        organizerId,
        page: Number(page),
        limit: Number(limit),
      });

      console.log("[DEBUG Transaction Controller] getOrganizerTransactions result count:", data.length);

      res.status(200).json({
        success: true,
        data,
        pagination,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] getOrganizerTransactions error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to get transactions",
      });
    }
  },

  uploadPaymentProof: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      console.log("[DEBUG Transaction Controller] uploadPaymentProof id:", id);

      if (!req.files || !("paymentProof" in req.files)) {
        return res.status(400).json({
          success: false,
          message: "Payment proof is required",
        });
      }

      const paymentProof = req.files.paymentProof as UploadedFile;
      console.log("[DEBUG Transaction Controller] uploadPaymentProof file:", paymentProof.name);

      const transaction = await transactionService.uploadPaymentProof({
        id,
        paymentProof,
      });

      console.log("[DEBUG Transaction Controller] uploadPaymentProof success, transaction:", transaction.id);

      res.status(200).json({
        success: true,
        message: "Payment proof uploaded",
        data: transaction,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] uploadPaymentProof error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to upload payment proof",
      });
    }
  },

  acceptTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      console.log("[DEBUG Transaction Controller] acceptTransaction id:", id);

      const transaction = await transactionService.acceptTransaction({ id });

      console.log("[DEBUG Transaction Controller] acceptTransaction success, transaction:", transaction.id);

      res.status(200).json({
        success: true,
        message: "Transaction accepted",
        data: transaction,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] acceptTransaction error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to accept transaction",
      });
    }
  },

  rejectTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      console.log("[DEBUG Transaction Controller] rejectTransaction id:", id);

      const transaction = await transactionService.rejectTransaction({ id });

      console.log("[DEBUG Transaction Controller] rejectTransaction success, transaction:", transaction.id);

      res.status(200).json({
        success: true,
        message: "Transaction rejected",
        data: transaction,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] rejectTransaction error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to reject transaction",
      });
    }
  },

  cancelTransaction: async (req: AuthRequest, res: Response) => {
    try {
      const id = req.params.id as string;
      console.log("[DEBUG Transaction Controller] cancelTransaction id:", id);

      const transaction = await transactionService.cancelTransaction({ id });

      console.log("[DEBUG Transaction Controller] cancelTransaction success, transaction:", transaction.id);

      res.status(200).json({
        success: true,
        message: "Transaction cancelled",
        data: transaction,
      });
    } catch (error: any) {
      console.log("[DEBUG Transaction Controller] cancelTransaction error:", error.message);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to cancel transaction",
      });
    }
  },
};