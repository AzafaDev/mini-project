import { DiscountType } from "../../generated/prisma/enums";

export const calculateDiscount = (
  basePrice: number,
  quantity: number,
  discountType: DiscountType,
  discountValue: number
): number => {
  const subtotal = basePrice * quantity;
  if (discountType === DiscountType.PERCENTAGE) {
    return Math.min((subtotal * discountValue) / 100, subtotal);
  }
  return Math.min(discountValue, subtotal);
};