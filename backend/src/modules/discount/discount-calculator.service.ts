import { DiscountType } from "@prisma/client";
import { DiscountStrategy, PercentageDiscountStrategy, FixedDiscountStrategy } from "./strategies";

class DiscountCalculatorService {
  private strategies: Record<DiscountType, DiscountStrategy>;

  constructor() {
    this.strategies = {
      [DiscountType.PERCENTAGE]: new PercentageDiscountStrategy(),
      [DiscountType.FIXED]: new FixedDiscountStrategy(),
    };
  }

  calculateDiscount(
    basePrice: number,
    quantity: number,
    discountType: DiscountType,
    discountValue: number,
  ): number {
    const subtotal = basePrice * quantity;
    const strategy = this.strategies[discountType];
    return strategy.calculate(subtotal, discountValue);
  }

  validateDiscountEligibility(
    startDate: Date,
    endDate: Date,
    maxUsage?: number | null,
    usedCount?: number | null,
  ): { valid: boolean; error?: string } {
    const now = new Date();

    if (startDate > now) {
      return { valid: false, error: "Discount not yet active" };
    }

    if (endDate < now) {
      return { valid: false, error: "Discount expired" };
    }

    if (maxUsage && usedCount && usedCount >= maxUsage) {
      return { valid: false, error: "Discount usage limit reached" };
    }

    return { valid: true };
  }

  calculateFinalPrice(
    basePrice: number,
    quantity: number,
    discounts: Array<number>,
    pointsUsed: number = 0,
  ): {
    totalPrice: number;
    totalDiscount: number;
    finalPrice: number;
  } {
    const totalPrice = basePrice * quantity;
    const totalDiscount = discounts.reduce(
      (sum, discount) => sum + discount,
      0,
    );
    const finalPrice = Math.max(0, totalPrice - totalDiscount - pointsUsed);

    return {
      totalPrice,
      totalDiscount,
      finalPrice,
    };
  }

  applyDiscount(price: number, discount: number): number {
    return Math.max(0, price - discount);
  }
}

export { DiscountCalculatorService };
export const discountCalculatorService = new DiscountCalculatorService();
