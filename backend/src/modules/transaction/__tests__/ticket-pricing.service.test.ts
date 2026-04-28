import { describe, it, expect } from 'vitest';
import { TicketPricingService } from '../ticket-pricing.service';
import { DiscountType } from '@prisma/client';
import { DiscountCalculatorService } from '../../discount/discount-calculator.service';

describe('TicketPricingService', () => {
  const service = new TicketPricingService(new DiscountCalculatorService());

  describe('calculateBasePrice', () => {
    it('should calculate base price correctly', () => {
      expect(service.calculateBasePrice(50000, 3)).toBe(150000);
    });

    it('should handle single ticket', () => {
      expect(service.calculateBasePrice(100000, 1)).toBe(100000);
    });
  });

  describe('calculateTotalDiscount', () => {
    it('should sum voucher and coupon discounts', () => {
      const result = service.calculateTotalDiscount(100000, 2, 10000, 5000);
      expect(result).toBe(15000);
    });

    it('should not exceed total price', () => {
      const result = service.calculateTotalDiscount(10000, 1, 50000, 0);
      expect(result).toBe(10000);
    });

    it('should handle zero discounts', () => {
      const result = service.calculateTotalDiscount(50000, 2, 0, 0);
      expect(result).toBe(0);
    });
  });

  describe('calculateFinalPrice', () => {
    it('should compute final price correctly', () => {
      const result = service.calculateFinalPrice(200000, 50000, 10000);
      expect(result.totalPrice).toBe(200000);
      expect(result.discount).toBe(50000);
      expect(result.pointsUsed).toBe(10000);
      expect(result.finalPrice).toBe(140000);
    });

    it('should not go negative', () => {
      const result = service.calculateFinalPrice(5000, 10000, 5000);
      expect(result.finalPrice).toBe(0);
    });
  });

  describe('calculateEarnedPoints', () => {
    it('should calculate points with multiplier', () => {
      const result = service.calculateEarnedPoints(100000, 0.1, 50000);
      expect(result).toBe(10000);
    });

    it('should cap at max points', () => {
      const result = service.calculateEarnedPoints(1000000, 0.1, 50000);
      expect(result).toBe(50000);
    });

    it('should floor fractional points', () => {
      const result = service.calculateEarnedPoints(9999, 0.1, 50000);
      expect(result).toBe(999);
    });
  });

  describe('calculateFullTransaction', () => {
    it('should compute full transaction without discounts', () => {
      const result = service.calculateFullTransaction({
        ticketPrice: 50000,
        quantity: 2,
      });
      expect(result.totalPrice).toBe(100000);
      expect(result.discount).toBe(0);
      expect(result.finalPrice).toBe(100000);
    });

    it('should compute full transaction with voucher', () => {
      const result = service.calculateFullTransaction({
        ticketPrice: 100000,
        quantity: 2,
        voucher: { discountType: DiscountType.PERCENTAGE, discountValue: 10 },
      });
      expect(result.totalPrice).toBe(200000);
      expect(result.discount).toBe(20000);
      expect(result.finalPrice).toBe(180000);
    });

    it('should compute full transaction with both discounts and points', () => {
      const result = service.calculateFullTransaction({
        ticketPrice: 100000,
        quantity: 3,
        voucher: { discountType: DiscountType.PERCENTAGE, discountValue: 10 },
        coupon: { discountType: DiscountType.FIXED, discountValue: 25000 },
        pointsUsed: 5000,
      });
      expect(result.totalPrice).toBe(300000);
      expect(result.finalPrice).toBeLessThan(300000);
    });
  });
});
