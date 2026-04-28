export interface DiscountStrategy {
  calculate(subtotal: number, value: number): number;
}
