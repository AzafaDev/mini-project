import { POINTS_CONFIG } from './constants';

export interface PriceBreakdown {
  subtotal: number;
  voucherDiscount: number;
  couponDiscount: number;
  pointsDiscount: number;
  finalPrice: number;
}

export const calculateSubtotal = (
  ticketPrices: Array<{ price: number; quantity: number }>
): number => {
  return ticketPrices.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0);
};

export const calculateVoucherDiscount = (
  subtotal: number,
  discountValue: number,
  discountType: 'PERCENTAGE' | 'FIXED',
  maxDiscount?: number
): number => {
  if (discountType === 'FIXED') {
    return Math.min(discountValue, subtotal);
  }
  
  const percentageDiscount = (subtotal * discountValue) / 100;
  const discount = maxDiscount ? Math.min(percentageDiscount, maxDiscount) : percentageDiscount;
  return Math.min(discount, subtotal);
};

export const calculateCouponDiscount = calculateVoucherDiscount;

export const calculatePointsDiscount = (points: number): number => {
  return Math.min(points, POINTS_CONFIG.MAX_PER_TRANSACTION);
};

export const calculateFinalPrice = (
  subtotal: number,
  voucherDiscount: number = 0,
  couponDiscount: number = 0,
  pointsDiscount: number = 0
): number => {
  const totalDiscount = voucherDiscount + couponDiscount + pointsDiscount;
  return Math.max(0, subtotal - totalDiscount);
};

export const getPriceBreakdown = (
  ticketPrices: Array<{ price: number; quantity: number }>,
  voucherDiscount: number = 0,
  couponDiscount: number = 0,
  pointsDiscount: number = 0
): PriceBreakdown => {
  const subtotal = calculateSubtotal(ticketPrices);
  const finalPrice = calculateFinalPrice(subtotal, voucherDiscount, couponDiscount, pointsDiscount);
  
  return {
    subtotal,
    voucherDiscount,
    couponDiscount,
    pointsDiscount,
    finalPrice,
  };
};