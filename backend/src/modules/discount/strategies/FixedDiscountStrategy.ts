import { DiscountStrategy } from "./DiscountStrategy";

export class FixedDiscountStrategy implements DiscountStrategy {
  calculate(subtotal: number, value: number): number {
    return Math.min(value, subtotal);
  }
}
