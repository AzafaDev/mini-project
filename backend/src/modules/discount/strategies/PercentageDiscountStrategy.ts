import { DiscountStrategy } from "./DiscountStrategy";

export class PercentageDiscountStrategy implements DiscountStrategy {
  calculate(subtotal: number, value: number): number {
    return Math.min((subtotal * value) / 100, subtotal);
  }
}
