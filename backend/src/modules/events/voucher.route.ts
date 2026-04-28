import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { voucherService } from "../discount";
import { catchAsync } from "../../utils/catchAsync";
import { AuthRequest } from "../auth/auth.type";
import { logger } from "../../utils/logger";
import { validate } from "../../middleware/validate";
import {
  checkVoucherQuerySchema,
  createVoucherSchema,
  deleteVoucherParamsSchema,
} from "./voucher.schema";

const voucherRouter = Router();

voucherRouter.get("/:eventId/vouchers", catchAsync(async (req, res) => {
  const { eventId } = req.params as { eventId: string };
  const vouchers = await voucherService.getEventVouchers({ eventId });
  res.json({ success: true, data: vouchers });
}));

voucherRouter.get("/check-voucher", validate(checkVoucherQuerySchema), catchAsync(async (req, res) => {
  const query = req.query as { eventId: string; code: string; price?: string; quantity?: string };
  const price = parseInt(query.price || "0") || 0;
  const quantity = parseInt(query.quantity || "1") || 1;

  const result = await voucherService.validateVoucher({
    eventId: query.eventId,
    code: query.code,
    price,
    quantity,
  });

  res.json({
    success: true,
    valid: true,
    discount: result.discount,
    discountType: result.discountType,
    discountValue: result.discountValue,
    message: "Voucher valid!",
  });
}));

voucherRouter.post("/voucher", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, validate(createVoucherSchema), catchAsync(async (req: AuthRequest, res) => {
  const organizerId = req.userId as string;
  const { eventId, code, discountType, discountValue, startDate, endDate, maxUsage } = req.body;

  const voucher = await voucherService.createVoucher({
    eventId,
    organizerId,
    code,
    discountType,
    discountValue,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    maxUsage,
  });

  res.json({ success: true, data: voucher, message: "Voucher created successfully!" });
}));

voucherRouter.get("/my-vouchers", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, catchAsync(async (req: AuthRequest, res) => {
  const userId = req.userId as string;
  const vouchers = await voucherService.getOrganizerVouchers({ organizerId: userId });
  res.json({ success: true, data: vouchers });
}));

voucherRouter.delete("/voucher/:id", authMiddleware.verifyAuthToken, authMiddleware.isOrganizer, validate(deleteVoucherParamsSchema), catchAsync(async (req: AuthRequest, res) => {
  const { id } = req.params as { id: string };
  const userId = req.userId as string;

  logger.debug("[Voucher Route] deleteVoucher id:", id, "userId:", userId);

  const result = await voucherService.deleteVoucher({ id, organizerId: userId });
  res.json({ success: true, message: "Voucher deleted" });
}));

export default voucherRouter;
