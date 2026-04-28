import { Router } from "express";
import { authMiddleware } from "../auth/auth.middleware";
import { couponService } from "../discount";
import { catchAsync } from "../../utils/catchAsync";
import { AuthRequest } from "../auth/auth.type";
import { logger } from "../../utils/logger";
import { validate } from "../../middleware/validate";
import {
  validateCouponQuerySchema,
  getCouponsQuerySchema,
} from "./coupon.schema";

const couponRouter = Router();

couponRouter.get("/validate", validate(validateCouponQuerySchema), catchAsync(async (req, res) => {
  const { code, price: priceStr, quantity: quantityStr } = req.query as Record<string, string>;
  const price = parseInt(priceStr) || 0;
  const quantity = parseInt(quantityStr) || 1;

  const result = await couponService.validateCoupon({ code, price, quantity });

  res.json({
    success: true,
    valid: true,
    discount: result.discount,
    discountType: result.discountType,
    discountValue: result.discountValue,
    message: "Coupon valid!",
  });
}));

couponRouter.get("/", validate(getCouponsQuerySchema), catchAsync(async (req, res) => {
  const userId = req.query.userId as string;
  const coupons = await couponService.getAllCoupons({ userId });
  res.json({ success: true, data: coupons });
}));

couponRouter.get("/my-coupons", authMiddleware.verifyAuthToken, catchAsync(async (req: AuthRequest, res) => {
  const userId = req.userId as string;
  const coupons = await couponService.getUserCoupons({ userId });
  res.json({ success: true, data: coupons });
}));

export default couponRouter;
