import { POINTS_CONFIG } from './constants';

/**
 * Interface untuk rincian perhitungan harga lengkap
 */
export interface PriceBreakdown {
  subtotal: number;
  voucherDiscount: number;
  couponDiscount: number;
  pointsDiscount: number;
  finalPrice: number;
}

/**
 * Menghitung subtotal harga dari daftar tiket yang dipilih
 * @param ticketPrices - Array berisi harga dan jumlah setiap tipe tiket
 * @returns Total subtotal sebelum diskon
 */
export const calculateSubtotal = (
  ticketPrices: Array<{ price: number; quantity: number }>
): number => {
  return ticketPrices.reduce((sum, ticket) => sum + ticket.price * ticket.quantity, 0);
};

/**
 * Menghitung nilai diskon voucher berdasarkan tipe diskon
 * @param subtotal - Total harga sebelum diskon
 * @param discountValue - Nilai diskon (persentase atau nominal)
 * @param discountType - Tipe diskon: 'PERCENTAGE' atau 'FIXED'
 * @param maxDiscount - Batas maksimal diskon (opsional)
 * @returns Nilai diskon dalam rupiah
 */
export const calculateVoucherDiscount = (
  subtotal: number,
  discountValue: number,
  discountType: 'PERCENTAGE' | 'FIXED',
  maxDiscount?: number
): number => {
  // Jika tipe diskon nominal (fixed)
  if (discountType === 'FIXED') {
    return Math.min(discountValue, subtotal);
  }
  
  // Jika tipe diskon persentase
  const percentageDiscount = (subtotal * discountValue) / 100;
  const discount = maxDiscount ? Math.min(percentageDiscount, maxDiscount) : percentageDiscount;
  // Pastikan diskon tidak melebihi subtotal (harga tidak negatif)
  return Math.min(discount, subtotal);
};

/**
 * Alias fungsi calculateVoucherDiscount untuk kupon (logika sama)
 */
export const calculateCouponDiscount = calculateVoucherDiscount;

/**
 * Menghitung nilai diskon dari poin loyalty
 * @param points - Jumlah poin yang ingin digunakan
 * @returns Nilai diskon poin dengan batas maksimal per transaksi
 */
export const calculatePointsDiscount = (points: number): number => {
  return Math.min(points, POINTS_CONFIG.MAX_PER_TRANSACTION);
};

/**
 * Menghitung harga final setelah semua diskon diterapkan
 * @param subtotal - Total harga sebelum diskon
 * @param voucherDiscount - Nilai diskon voucher
 * @param couponDiscount - Nilai diskon kupon
 * @param pointsDiscount - Nilai diskon poin
 * @returns Harga final dalam rupiah (minimal 0)
 */
export const calculateFinalPrice = (
  subtotal: number,
  voucherDiscount: number = 0,
  couponDiscount: number = 0,
  pointsDiscount: number = 0
): number => {
  const totalDiscount = voucherDiscount + couponDiscount + pointsDiscount;
  // Pastikan harga tidak pernah negatif
  return Math.max(0, subtotal - totalDiscount);
};

/**
 * Menghasilkan rincian harga lengkap dalam satu objek
 * @param ticketPrices - Daftar tiket yang dipilih
 * @param voucherDiscount - Nilai diskon voucher
 * @param couponDiscount - Nilai diskon kupon
 * @param pointsDiscount - Nilai diskon poin
 * @returns Objek PriceBreakdown dengan semua rincian perhitungan
 */
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