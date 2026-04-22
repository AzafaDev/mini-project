import { DiscountType } from "@prisma/client";

/**
 * Discount Calculator Service - Single Source of Truth untuk semua logika diskon
 * Semua fungsi adalah pure function, tidak ada side effect, mudah di test
 */
class DiscountCalculatorService {
  constructor() {}

  /**
   * Hitung jumlah diskon berdasarkan tipe dan nilai diskon
   * @param basePrice Harga satuan tiket
   * @param quantity Jumlah tiket
   * @param discountType Tipe diskon (PERCENTAGE / FIXED)
   * @param discountValue Nilai diskon
   */
  calculateDiscount(
    basePrice: number,
    quantity: number,
    discountType: DiscountType,
    discountValue: number,
  ): number {
    const subtotal = basePrice * quantity;

    // Untuk tipe persentase, hitung persentase dari subtotal
    // Diskon tidak boleh melebihi subtotal total
    if (discountType === DiscountType.PERCENTAGE) {
      return Math.min((subtotal * discountValue) / 100, subtotal);
    }

    // Untuk tipe fixed, langsung pakai nilai diskon
    // Diskon tidak boleh melebihi subtotal total
    return Math.min(discountValue, subtotal);
  }

  /**
   * Validasi kelayakan diskon secara umum
   * @param startDate Tanggal mulai berlaku diskon
   * @param endDate Tanggal berakhir diskon
   * @param maxUsage Batas maksimal penggunaan
   * @param usedCount Jumlah yang sudah digunakan
   */
  validateDiscountEligibility(
    startDate: Date,
    endDate: Date,
    maxUsage?: number | null,
    usedCount?: number | null,
  ): { valid: boolean; error?: string } {
    const now = new Date();

    // Cek apakah diskon sudah mulai berlaku
    if (startDate > now) {
      return { valid: false, error: "Discount not yet active" };
    }

    // Cek apakah diskon sudah kadaluarsa
    if (endDate < now) {
      return { valid: false, error: "Discount expired" };
    }

    // Cek apakah batas penggunaan sudah tercapai
    if (maxUsage && usedCount && usedCount >= maxUsage) {
      return { valid: false, error: "Discount usage limit reached" };
    }

    return { valid: true };
  }

  /**
   * Hitung harga final setelah semua diskon diterapkan
   * @param basePrice Harga satuan
   * @param quantity Jumlah item
   * @param discounts Array diskon yang akan diterapkan
   * @param pointsUsed Jumlah poin yang digunakan
   */
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

  /**
   * Terapkan diskon pada harga
   * @param price Harga sebelum diskon
   * @param discount Nilai diskon
   */
  applyDiscount(price: number, discount: number): number {
    return Math.max(0, price - discount);
  }
}

export { DiscountCalculatorService };
export const discountCalculatorService = new DiscountCalculatorService();
