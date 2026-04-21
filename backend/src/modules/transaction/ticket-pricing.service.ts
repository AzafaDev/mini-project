import { DiscountType } from "../../../generated/prisma/enums";
import { discountCalculatorService } from "../discount/discount-calculator.service";
import type { DiscountCalculatorService } from "../discount/discount-calculator.service";

/**
 * Ticket Pricing Service - Semua logika perhitungan harga tiket
 * SEMUA fungsi disini adalah PURE FUNCTION:
 * - Tidak ada side effect
 * - Tidak membutuhkan database
 * - Input sama selalu menghasilkan output sama
 * - 100% dapat di unit test tanpa dependency apapun
 */
class TicketPricingService {
  constructor(
    private discountCalculator = discountCalculatorService
  ) {}

  /**
   * Hitung harga dasar tiket
   * @param ticketPrice Harga satuan tiket
   * @param quantity Jumlah tiket
   */
  calculateBasePrice(ticketPrice: number, quantity: number): number {
    return ticketPrice * quantity;
  }

  /**
   * Hitung total diskon dari voucher dan coupon
   * @param ticketPrice Harga satuan tiket
   * @param quantity Jumlah tiket
   * @param voucherDiscount Nilai diskon voucher
   * @param couponDiscount Nilai diskon coupon
   */
  calculateTotalDiscount(
    ticketPrice: number,
    quantity: number,
    voucherDiscount: number = 0,
    couponDiscount: number = 0
  ): number {
    const totalPrice = ticketPrice * quantity;
    const totalDiscount = voucherDiscount + couponDiscount;

    // Pastikan total diskon tidak melebihi total harga
    return Math.min(totalDiscount, totalPrice);
  }

  /**
   * Hitung harga final setelah semua potongan
   * @param basePrice Harga dasar total
   * @param totalDiscount Total diskon
   * @param pointsUsed Jumlah poin yang digunakan
   */
  calculateFinalPrice(
    basePrice: number,
    totalDiscount: number,
    pointsUsed: number = 0
  ): {
    totalPrice: number;
    discount: number;
    pointsUsed: number;
    finalPrice: number;
  } {
    const finalPrice = Math.max(0, basePrice - totalDiscount - pointsUsed);

    return {
      totalPrice: basePrice,
      discount: totalDiscount,
      pointsUsed,
      finalPrice,
    };
  }

  /**
   * Hitung poin yang didapat dari transaksi
   * @param finalPrice Harga akhir transaksi
   * @param multiplier Pengali poin (dari constants)
   * @param maxPoints Batas maksimal poin per transaksi
   */
  calculateEarnedPoints(
    finalPrice: number,
    multiplier: number,
    maxPoints: number
  ): number {
    const earnedPoints = Math.floor(finalPrice * multiplier);
    return Math.min(earnedPoints, maxPoints);
  }

  /**
   * Hitung seluruh rangkaian harga transaksi dalam satu fungsi
   */
  calculateFullTransaction({
    ticketPrice,
    quantity,
    voucher = null,
    coupon = null,
    pointsUsed = 0,
  }: {
    ticketPrice: number;
    quantity: number;
    voucher?: { discountType: DiscountType; discountValue: number } | null;
    coupon?: { discountType: DiscountType; discountValue: number } | null;
    pointsUsed?: number;
  }): {
    totalPrice: number;
    discount: number;
    pointsUsed: number;
    finalPrice: number;
  } {
    const basePrice = this.calculateBasePrice(ticketPrice, quantity);

    let voucherDiscount = 0;
    let couponDiscount = 0;

    if (voucher) {
      voucherDiscount = this.discountCalculator.calculateDiscount(
        ticketPrice,
        quantity,
        voucher.discountType,
        voucher.discountValue
      );
    }

    if (coupon) {
      couponDiscount = this.discountCalculator.calculateDiscount(
        ticketPrice,
        quantity,
        coupon.discountType,
        coupon.discountValue
      );
    }

    const totalDiscount = this.calculateTotalDiscount(
      ticketPrice,
      quantity,
      voucherDiscount,
      couponDiscount
    );

    return this.calculateFinalPrice(basePrice, totalDiscount, pointsUsed);
  }
}

export const ticketPricingService = new TicketPricingService();
