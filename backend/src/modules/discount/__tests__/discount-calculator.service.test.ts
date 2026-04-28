import { describe, it, expect } from 'vitest';
import { DiscountCalculatorService } from '../discount-calculator.service';
import { DiscountType } from '@prisma/client';

describe('DiscountCalculatorService', () => {
  const service = new DiscountCalculatorService();

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const result = service.calculateDiscount(100000, 2, DiscountType.PERCENTAGE, 10);
      expect(result).toBe(20000);
    });

    it('should not exceed subtotal for percentage discount', () => {
      const result = service.calculateDiscount(50000, 1, DiscountType.PERCENTAGE, 200);
      expect(result).toBe(50000);
    });

    it('should calculate fixed discount correctly', () => {
      const result = service.calculateDiscount(100000, 1, DiscountType.FIXED, 25000);
      expect(result).toBe(25000);
    });

    it('should not exceed subtotal for fixed discount', () => {
      const result = service.calculateDiscount(10000, 1, DiscountType.FIXED, 99999);
      expect(result).toBe(10000);
    });

    it('should handle zero quantity', () => {
      const result = service.calculateDiscount(100000, 0, DiscountType.PERCENTAGE, 10);
      expect(result).toBe(0);
    });

    it('should handle zero price', () => {
      const result = service.calculateDiscount(0, 2, DiscountType.FIXED, 10000);
      expect(result).toBe(0);
    });
  });

  describe('validateDiscountEligibility', () => {
    const now = new Date();

    it('should return valid for active discount', () => {
      const start = new Date(now.getTime() - 86400000);
      const end = new Date(now.getTime() + 86400000);
      const result = service.validateDiscountEligibility(start, end);
      expect(result.valid).toBe(true);
    });

    it('should return error for not-yet-active discount', () => {
      const start = new Date(now.getTime() + 86400000);
      const end = new Date(now.getTime() + 172800000);
      const result = service.validateDiscountEligibility(start, end);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Discount not yet active");
    });

    it('should return error for expired discount', () => {
      const start = new Date(now.getTime() - 172800000);
      const end = new Date(now.getTime() - 86400000);
      const result = service.validateDiscountEligibility(start, end);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Discount expired");
    });

    it('should return error when max usage reached', () => {
      const start = new Date(now.getTime() - 86400000);
      const end = new Date(now.getTime() + 86400000);
      const result = service.validateDiscountEligibility(start, end, 5, 5);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Discount usage limit reached");
    });

    it('should be valid when under max usage limit', () => {
      const start = new Date(now.getTime() - 86400000);
      const end = new Date(now.getTime() + 86400000);
      const result = service.validateDiscountEligibility(start, end, 5, 3);
      expect(result.valid).toBe(true);
    });
  });

  describe('calculateFinalPrice', () => {
    it('should calculate final price with discounts and points', () => {
      const result = service.calculateFinalPrice(100000, 2, [10000, 5000], 5000);
      expect(result.totalPrice).toBe(200000);
      expect(result.totalDiscount).toBe(15000);
      expect(result.finalPrice).toBe(180000);
    });

    it('should not go below zero', () => {
      const result = service.calculateFinalPrice(10000, 1, [50000], 10000);
      expect(result.finalPrice).toBe(0);
    });

    it('should handle empty discounts', () => {
      const result = service.calculateFinalPrice(50000, 2, [], 0);
      expect(result.totalPrice).toBe(100000);
      expect(result.totalDiscount).toBe(0);
      expect(result.finalPrice).toBe(100000);
    });
  });

  describe('applyDiscount', () => {
    it('should subtract discount from price', () => {
      expect(service.applyDiscount(100000, 25000)).toBe(75000);
    });

    it('should not go below zero', () => {
      expect(service.applyDiscount(5000, 10000)).toBe(0);
    });
  });
});
