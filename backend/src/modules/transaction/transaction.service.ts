import { prisma } from "../../config/prisma";
import { sendEmail } from "../../utils/sendEmail";
import { handleFileUpload } from "../../utils/handleFileUpload";
import { UploadedFile } from "express-fileupload";
import { TransactionStatus, DiscountType } from "@prisma/client";
import {
  restoreTicketAvailability,
  restoreUserPoints,
  restoreVoucher,
  restoreCoupon,
} from "../../utils/transactionHelpers";
import { AppError } from "../../utils/AppError";
import { discountCalculatorService } from "../discount/discount-calculator.service";
import { voucherService } from "../discount/voucher.service";
import { couponService } from "../discount/coupon.service";
import { ticketPricingService } from "./ticket-pricing.service";
import {
  TRANSACTION_EXPIRATION_HOURS,
  TRANSACTION_AUTO_CANCEL_DAYS,
  POINTS_EARNED_MULTIPLIER,
  MAX_POINTS_PER_TRANSACTION,
} from "../../config/constants";
import { pointsService } from "../points/points.service";

// Service utama untuk mengelola seluruh alur transaksi
// Menggunakan atomic transaction untuk menjaga integritas data
// Semua operasi database berjalan sebagai satu kesatuan: semua berhasil atau semua gagal
export const transactionService = {
  createTransaction: async ({
    userId,
    eventId,
    ticketId,
    quantity,
    voucherCode,
    couponCode,
    pointsUsed = 0,
  }: {
    userId: string;
    eventId: string;
    ticketId: string;
    quantity: number;
    voucherCode?: string;
    couponCode?: string;
    pointsUsed?: number;
  }) => {
    console.log("[DEBUG] ========== CREATE TRANSACTION INPUT ==========");
    console.log("[DEBUG] userId:", userId);
    console.log("[DEBUG] eventId:", eventId);
    console.log("[DEBUG] ticketId:", ticketId);
    console.log("[DEBUG] quantity:", quantity);
    console.log("[DEBUG] voucherCode:", voucherCode);
    console.log("[DEBUG] couponCode:", couponCode);
    console.log("[DEBUG] pointsUsed:", pointsUsed);
    console.log("[DEBUG] ================================================");
    console.log("[DEBUG Transaction Service] createTransaction input:", {
      userId,
      eventId,
      ticketId,
      quantity,
      voucherCode,
      couponCode,
      pointsUsed,
    });

    // Validate points input early
    if (pointsUsed < 0) {
      throw new AppError("Points used cannot be negative", 400);
    }

    // Prevent using both voucher and coupon simultaneously
    if (voucherCode && couponCode) {
      throw new AppError(
        "Cannot use both voucher and coupon simultaneously",
        400,
      );
    }

    // Cek apakah ada transaksi pending (belum selesai) untuk event yang sama
    // Mencegah user memiliki lebih dari satu transaksi aktif untuk event yang sama
    // Hanya mengambil transaksi yang belum expired/terlalu batas waktu
    const now = new Date();
    const existingPending = await prisma.transaction.findFirst({
      where: {
        userId,
        eventId,
        OR: [
          { status: TransactionStatus.WAITING_PAYMENT, expiresAt: { gt: now } },
          {
            status: TransactionStatus.WAITING_CONFIRMATION,
            autoCancelAt: { gt: now },
          },
        ],
      },
    });

    if (existingPending) {
      console.log(
        "[DEBUG Transaction Service] Found existing WAITING_PAYMENT transaction, returning existing:",
        existingPending.id,
      );
      return existingPending;
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { tickets: true },
    });

    console.log("[DEBUG Transaction Service] event found:", !!event, event?.id);

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Validasi: Cek apakah event sudah berakhir
    // Mencegah pembelian tiket untuk event yang sudah lewat
    // (now already declared above for pending check)
    if (now > event.endDate) {
      throw new AppError(
        "This event has already ended and tickets are no longer available",
        400,
      );
    }

    // Organizer tidak diperbolehkan membeli tiket event mereka sendiri
    // Mencegah manipulasi statistik dan penjualan palsu
    if (event.organizerId === userId) {
      console.log(
        "[DEBUG Transaction Service] Organizer attempted to buy their own event:",
        {
          userId,
          eventId,
          organizerId: event.organizerId,
        },
      );
      throw new AppError(
        "Organizers cannot purchase tickets for their own events",
        403,
      );
    }

    const ticket = event.tickets.find((t) => t.id === ticketId);

    console.log(
      "[DEBUG Transaction Service] ticket found:",
      !!ticket,
      ticket?.id,
    );

    if (!ticket) {
      throw new AppError("Ticket not found", 404);
    }

    console.log(
      "[DEBUG Transaction Service] ticket available:",
      ticket.available,
      "requested:",
      quantity,
    );

    let voucherId: string | null = null;
    let couponId: string | null = null;
    let discount = 0;
    let voucher: any = null;

    if (voucherCode) {
      console.log("[DEBUG Transaction Service] checking voucher:", voucherCode);
      voucher = await prisma.voucher.findFirst({
        where: {
          code: voucherCode,
          eventId,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      console.log(
        "[DEBUG Transaction Service] voucher found:",
        !!voucher,
        voucher?.id,
      );

      if (!voucher) {
        throw new AppError("Invalid voucher code", 404);
      }

      // Validate eligibility (date range, maxUsage)
      const eligibility = discountCalculatorService.validateDiscountEligibility(
        voucher.startDate,
        voucher.endDate,
        voucher.maxUsage,
        voucher.usedCount,
      );
      if (!eligibility.valid) {
        throw new AppError(eligibility.error || "Voucher is not eligible", 400);
      }

      voucherId = voucher.id;
      const calculatedDiscount = discountCalculatorService.calculateDiscount(
        ticket.price,
        quantity,
        voucher.discountType as DiscountType,
        voucher.discountValue,
      );
      discount += calculatedDiscount;
      console.log(
        "[DEBUG Transaction Service] voucher discountValue:",
        voucher.discountValue,
        "discountType:",
        voucher.discountType,
      );
      console.log("[DEBUG Transaction Service] voucher discount:", discount);
    }

    if (couponCode) {
      console.log("[DEBUG Transaction Service] checking coupon:", couponCode);
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          isActive: true,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      });

      console.log(
        "[DEBUG Transaction Service] coupon found:",
        !!coupon,
        coupon?.id,
      );

      if (coupon) {
        const existingUsage = await prisma.transaction.findFirst({
          where: {
            userId,
            couponId: coupon.id,
            status: {
              in: [
                TransactionStatus.DONE,
                TransactionStatus.WAITING_CONFIRMATION,
                TransactionStatus.WAITING_PAYMENT,
              ],
            },
          },
        });

        if (existingUsage) {
          throw new AppError("Coupon has already been used", 400);
        }

        couponId = coupon.id;
        const calculatedDiscount = discountCalculatorService.calculateDiscount(
          ticket.price,
          quantity,
          coupon.discountType as DiscountType,
          coupon.discountValue,
        );
        discount += calculatedDiscount;
        console.log(
          "[DEBUG Transaction Service] coupon discountValue:",
          coupon.discountValue,
          "discountType:",
          coupon.discountType,
        );
        console.log("[DEBUG Transaction Service] total discount:", discount);
      }
    }

    const pointsDiscount = pointsUsed; // 1 poin = Rp1
    const pricing = ticketPricingService.calculateFinalPrice(
      ticket.price * quantity,
      discount,
      pointsDiscount,
    );
    const totalPrice = pricing.totalPrice;
    const finalPrice = pricing.finalPrice;

    console.log("[DEBUG Transaction Service] pricing:", {
      totalPrice,
      discount,
      pointsUsed,
      finalPrice,
    });

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TRANSACTION_EXPIRATION_HOURS);

    const autoCancelAt = new Date();
    autoCancelAt.setDate(autoCancelAt.getDate() + TRANSACTION_AUTO_CANCEL_DAYS);

    console.log(
      "[DEBUG Transaction Service] expiresAt:",
      expiresAt,
      "autoCancelAt:",
      autoCancelAt,
    );

    // Atomic transaction: semua operasi di dalam ini berjalan sebagai satu kesatuan
    // Jika ada satu operasi gagal, SEMUA perubahan otomatis di-rollback
    // Mencegah race condition dan memastikan integritas data selalu terjaga
    return prisma.$transaction(async (tx) => {
      console.log("[DEBUG Transaction Service] creating transaction in DB");

      if (pointsUsed > 0) {
        // Hitung total poin yang masih aktif dan belum expired
        const activePoints = await pointsService.getActivePointsTx(tx, userId);

        // Pastikan user punya poin yang cukup untuk digunakan
        if (pointsUsed > activePoints) {
          throw new AppError("Insufficient points balance", 400);
        }

        // Batasi maksimal poin yang bisa dipakai per transaksi
        if (pointsUsed > MAX_POINTS_PER_TRANSACTION) {
          throw new AppError(
            `Maximum points per transaction is ${MAX_POINTS_PER_TRANSACTION}`,
            400,
          );
        }

        // Deduct poin dengan operasi atomic di level database
        // Menggunakan updateMany dengan kondisi untuk mencegah negative balance
        // Tidak ada celah race condition antara cek dan update
        const updateResult = await tx.user.updateMany({
          where: {
            id: userId,
            points: { gte: pointsUsed },
          },
          data: { points: { decrement: pointsUsed } },
        });

        // Jika tidak ada baris yang terupdate, berarti poin tidak cukup
        if (updateResult.count === 0) {
          throw new AppError(
            "Failed to deduct points: insufficient balance or user not found",
            400,
          );
        }

        // Catat penggunaan poin (redeem)
        await tx.pointTransaction.create({
          data: {
            userId: userId,
            amount: -pointsUsed, // negatif untuk pengurangan
            reason: `Redeemed ${pointsUsed} points for event ticket`,
            expiresAt: new Date(), // tidak berlaku karena poin sudah terpakai
          },
        });

        console.log(
          "[DEBUG Transaction Service] points deducted:",
          pointsUsed,
          "remaining active:",
          activePoints - pointsUsed,
        );
      }

      const transaction = await tx.transaction.create({
        data: {
          userId,
          eventId,
          ticketId: ticketId,
          quantity,
          totalPrice,
          discount,
          pointsUsed,
          couponId,
          voucherId,
          finalPrice,
          // Auto-complete free events (no payment needed)
          status:
            finalPrice === 0
              ? TransactionStatus.DONE
              : TransactionStatus.WAITING_PAYMENT,
          expiresAt: finalPrice === 0 ? new Date() : expiresAt,
          autoCancelAt,
        },
      });

      // If free event, mark as paid immediately
      if (finalPrice === 0) {
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            status: TransactionStatus.DONE,
            paidAt: new Date(),
          },
        });

        // Deactivate coupon if used (single-use)
        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { isActive: false },
          });
        }
      }

      console.log(
        "[DEBUG Transaction Service] transaction created:",
        transaction.id,
      );

      // Increment voucher usedCount if voucher was used (within atomic transaction)
      if (voucherId) {
        const updatedVoucher = await tx.voucher.updateMany({
          where: {
            id: voucherId,
            usedCount: { lt: voucher.maxUsage }
          },
          data: { usedCount: { increment: 1 } }
        });
        if (updatedVoucher.count === 0) {
          throw new AppError("Voucher usage limit reached", 400);
        }
        console.log(
          `[DEBUG Transaction Service] voucher usedCount incremented:`,
          voucherId
        );
      }

      // Cek dan update ketersediaan tiket dalam satu operasi atomic
      // Semua operasi ini berjalan di level database
      // Tidak ada celah waktu antara cek ketersediaan dan update
      // Sehingga dua user tidak bisa mendapatkan tiket yang sama secara bersamaan
      try {
        // Untuk tiket custom, kurangi available di ticket
        await tx.ticket.update({
          where: {
            id: ticketId,
            available: { gte: quantity },
          },
          data: { available: { decrement: quantity } },
        });
        // Juga kurangi availableSeats di event untuk sinkronisasi
        await tx.event.update({
          where: { id: eventId },
          data: { availableSeats: { decrement: quantity } },
        });
      } catch (error: any) {
        // Error code P2025 = record tidak ditemukan / kondisi tidak terpenuhi
        if (error.code === "P2025") {
          throw new AppError("Not enough tickets available", 400);
        }
        throw error;
      }

      console.log("[DEBUG Transaction Service] ticket availability updated");

      return transaction;
    });
  },

  getTransactionById: async ({ id }: { id: string }) => {
    console.log("[DEBUG Transaction Service] getTransactionById input:", {
      id,
    });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                fullName: true,
                profilePicture: true,
              },
            },
          },
        },
        ticket: true,
        user: { select: { id: true, fullName: true, email: true } },
      },
    });

    console.log(
      "[DEBUG Transaction Service] transaction found:",
      !!transaction,
      transaction?.id,
    );

    if (!transaction) {
      return null;
    }

    return transaction;
  },

  getUserTransactions: async ({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) => {
    console.log("[DEBUG Transaction Service] getUserTransactions input:", {
      userId,
      page,
      limit,
    });

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId },
        select: {
          id: true,
          userId: true,
          eventId: true,
          ticketId: true,
          quantity: true,
          totalPrice: true,
          discount: true,
          pointsUsed: true,
          couponId: true,
          voucherId: true,
          finalPrice: true,
          status: true,
          paymentProof: true,
          paymentProofUploadedAt: true,
          paidAt: true,
          expiresAt: true,
          autoCancelAt: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              location: true,
              startDate: true,
              endDate: true,
            },
          },
          ticket: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { userId } }),
    ]);

    console.log("[DEBUG Transaction Service] getUserTransactions result:", {
      count: transactions.length,
      total,
    });

    return { data: transactions, pagination: { total, page, limit } };
  },

  getEventTransactions: async ({
    eventId,
    page = 1,
    limit = 10,
  }: {
    eventId: string;
    page?: number;
    limit?: number;
  }) => {
    console.log("[DEBUG Transaction Service] getEventTransactions input:", {
      eventId,
      page,
      limit,
    });

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { eventId },
        select: {
          id: true,
          userId: true,
          eventId: true,
          ticketId: true,
          quantity: true,
          totalPrice: true,
          discount: true,
          pointsUsed: true,
          couponId: true,
          voucherId: true,
          finalPrice: true,
          status: true,
          paymentProof: true,
          paymentProofUploadedAt: true,
          paidAt: true,
          expiresAt: true,
          autoCancelAt: true,
          createdAt: true,
          user: { select: { id: true, fullName: true, email: true } },
          ticket: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { eventId } }),
    ]);

    console.log("[DEBUG Transaction Service] getEventTransactions result:", {
      count: transactions.length,
      total,
    });

    return { data: transactions, pagination: { total, page, limit } };
  },

  getOrganizerTransactions: async ({
    organizerId,
    page = 1,
    limit = 100,
  }: {
    organizerId: string;
    page?: number;
    limit?: number;
  }) => {
    console.log("[DEBUG Transaction Service] getOrganizerTransactions input:", {
      organizerId,
      page,
      limit,
    });

    const skip = (page - 1) * limit;

    // Get all events created by this organizer
    const organizerEvents = await prisma.event.findMany({
      where: { organizerId },
      select: { id: true },
    });

    const eventIds = organizerEvents.map((e) => e.id);
    console.log(
      "[DEBUG Transaction Service] organizer events:",
      eventIds.length,
    );

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: { eventId: { in: eventIds } },
        select: {
          id: true,
          userId: true,
          eventId: true,
          ticketId: true,
          quantity: true,
          totalPrice: true,
          discount: true,
          pointsUsed: true,
          couponId: true,
          voucherId: true,
          finalPrice: true,
          status: true,
          paymentProof: true,
          paymentProofUploadedAt: true,
          paidAt: true,
          expiresAt: true,
          autoCancelAt: true,
          createdAt: true,
          event: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              location: true,
              startDate: true,
              endDate: true,
            },
          },
          user: { select: { id: true, fullName: true, email: true } },
          ticket: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where: { eventId: { in: eventIds } } }),
    ]);

    console.log(
      "[DEBUG Transaction Service] getOrganizerTransactions result:",
      { count: transactions.length, total },
    );

    return { data: transactions, pagination: { total, page, limit } };
  },

  uploadPaymentProof: async ({
    id,
    paymentProof,
  }: {
    id: string;
    paymentProof: UploadedFile;
  }) => {
    console.log("[DEBUG Transaction Service] uploadPaymentProof input:", {
      id,
      fileName: paymentProof.name,
    });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    console.log(
      "[DEBUG Transaction Service] transaction found:",
      !!transaction,
      "status:",
      transaction?.status,
    );

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== TransactionStatus.WAITING_PAYMENT) {
      throw new AppError("Invalid transaction status", 400);
    }

    if (new Date() > transaction.expiresAt) {
      throw new AppError("Transaction has expired", 400);
    }

    console.log("[DEBUG Transaction Service] uploading payment proof to cloud");

    const imageUrl = await handleFileUpload(paymentProof, {
      folder: "payment-proofs",
    });

    console.log(
      "[DEBUG Transaction Service] payment proof uploaded:",
      imageUrl,
    );

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        paymentProof: imageUrl,
        paymentProofUploadedAt: new Date(),
        status: TransactionStatus.WAITING_CONFIRMATION,
      },
    });

    console.log(
      "[DEBUG Transaction Service] transaction updated, new status:",
      updated.status,
    );

    return updated;
  },

  acceptTransaction: async ({ id }: { id: string }) => {
    console.log("[DEBUG Transaction Service] acceptTransaction input:", { id });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        ticket: true,
        user: { select: { email: true, fullName: true } },
        event: { select: { name: true } },
      },
    });

    console.log(
      "[DEBUG Transaction Service] transaction found:",
      !!transaction,
      "status:",
      transaction?.status,
    );

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("Invalid transaction status", 400);
    }

    const earnedPoints = ticketPricingService.calculateEarnedPoints(
      transaction.finalPrice,
      POINTS_EARNED_MULTIPLIER,
      MAX_POINTS_PER_TRANSACTION,
    );

    console.log("[DEBUG Transaction Service] earned points calculation:", {
      finalPrice: transaction.finalPrice,
      earnedPoints,
    });

    const updated = await prisma.$transaction(async (tx) => {
      console.log("[DEBUG Transaction Service] accepting transaction in DB");
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.DONE,
          paidAt: new Date(),
        },
      });

      // Deactivate coupon if used (single-use)
      if (transaction.couponId) {
        await tx.coupon.update({
          where: { id: transaction.couponId },
          data: { isActive: false },
        });
      }

      if (earnedPoints > 0) {
        console.log(
          "[DEBUG Transaction Service] adding earned points:",
          earnedPoints,
        );
        const user = await tx.user.findUnique({
          where: { id: transaction.userId },
        });

        if (user) {
          await tx.user.update({
            where: { id: user.id },
            data: {
              points: user.points + earnedPoints,
            },
          });

          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + 3);

          await tx.pointTransaction.create({
            data: {
              userId: user.id,
              amount: earnedPoints,
              reason: `Purchase reward for event ticket`,
              expiresAt,
            },
          });
        }
      }

      return result;
    });

    console.log(
      "[DEBUG Transaction Service] transaction accepted, new status:",
      updated.status,
    );

    // Send email notification (non-blocking)
    if (transaction.user && transaction.event) {
      sendEmail
        .transactionAccepted({
          email: transaction.user.email,
          username: transaction.user.fullName,
          eventName: transaction.event.name,
          finalPrice: transaction.finalPrice,
          quantity: transaction.quantity,
        })
        .catch((err) =>
          console.log(
            "[DEBUG Transaction Service] Email send failed:",
            err.message,
          ),
        );
    }

    return updated;
  },
  hasUserPurchased: async ({
    userId,
    eventId,
  }: {
    userId: string;
    eventId: string;
  }) => {
    const count = await prisma.transaction.count({
      where: {
        userId,
        eventId,
        status: TransactionStatus.DONE,
      },
    });
    return count > 0;
  },

  rejectTransaction: async ({ id }: { id: string }) => {
    console.log("[DEBUG Transaction Service] rejectTransaction input:", { id });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: {
        ticket: true,
        voucher: true,
        coupon: true,
        user: { select: { email: true, fullName: true } },
        event: { select: { name: true } },
      },
    });

    console.log(
      "[DEBUG Transaction Service] transaction found:",
      !!transaction,
      "status:",
      transaction?.status,
    );

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    if (transaction.status !== TransactionStatus.WAITING_CONFIRMATION) {
      throw new AppError("Invalid transaction status", 400);
    }

    // Semua operasi rollback berjalan sebagai satu kesatuan atomic
    // Jika satu gagal, SEMUA perubahan rollback otomatis
    // Tidak ada kondisi setengah selesai: semua resource dikembalikan atau tidak sama sekali
    const result = await prisma.$transaction(async (tx) => {
      console.log("[DEBUG Transaction Service] rejecting transaction in DB");
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.REJECTED,
        },
      });

      // Kembalikan ketersediaan tiket
      await restoreTicketAvailability(tx, {
        ticketId: transaction.ticketId,
        eventId: transaction.eventId,
        quantity: transaction.quantity,
      });

      // Kembalikan poin yang sudah di-deduct
      await restoreUserPoints(tx, {
        userId: transaction.userId,
        pointsUsed: transaction.pointsUsed,
      });

      // Kembalikan status voucher menjadi tersedia kembali
      if (transaction.voucherId) {
        await restoreVoucher(tx, { voucherId: transaction.voucherId });
      }

      // Kembalikan status coupon menjadi tersedia kembali
      if (transaction.couponId) {
        await restoreCoupon(tx, { couponId: transaction.couponId });
      }

      console.log(
        "[DEBUG Transaction Service] transaction rejected, new status:",
        result.status,
      );

      return result;
    });

    // Send email notification (non-blocking)
    if (transaction.user && transaction.event) {
      sendEmail
        .transactionRejected({
          email: transaction.user.email,
          username: transaction.user.fullName,
          eventName: transaction.event.name,
          finalPrice: transaction.finalPrice,
          quantity: transaction.quantity,
        })
        .catch((err) =>
          console.log(
            "[DEBUG Transaction Service] Email send failed:",
            err.message,
          ),
        );
    }

    return result;
  },

  expireTransaction: async ({ id }: { id: string }) => {
    console.log("[DEBUG Transaction Service] expireTransaction input:", { id });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { ticket: true, voucher: true, coupon: true },
    });

    console.log(
      "[DEBUG Transaction Service] transaction found:",
      !!transaction,
      "status:",
      transaction?.status,
    );

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    return prisma.$transaction(async (tx) => {
      console.log("[DEBUG Transaction Service] expiring transaction in DB");
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.EXPIRED,
        },
      });

      // Restore all resources
      await restoreTicketAvailability(tx, {
        ticketId: transaction.ticketId,
        eventId: transaction.eventId,
        quantity: transaction.quantity,
      });

      await restoreUserPoints(tx, {
        userId: transaction.userId,
        pointsUsed: transaction.pointsUsed,
      });

      if (transaction.voucherId) {
        await restoreVoucher(tx, { voucherId: transaction.voucherId });
      }

      if (transaction.couponId) {
        await restoreCoupon(tx, { couponId: transaction.couponId });
      }

      console.log(
        "[DEBUG Transaction Service] transaction expired, new status:",
        result.status,
      );

      return result;
    });
  },

  cancelTransaction: async ({ id }: { id: string }) => {
    console.log("[DEBUG Transaction Service] cancelTransaction input:", { id });

    const transaction = await prisma.transaction.findUnique({
      where: { id },
      include: { ticket: true, voucher: true, coupon: true },
    });

    console.log(
      "[DEBUG Transaction Service] transaction found:",
      !!transaction,
      "status:",
      transaction?.status,
    );

    if (!transaction) {
      throw new AppError("Transaction not found", 404);
    }

    const status = transaction.status as TransactionStatus;
    const allowedStatuses: TransactionStatus[] = [
      TransactionStatus.WAITING_PAYMENT,
      TransactionStatus.WAITING_CONFIRMATION,
    ];

    console.log(
      "[DEBUG Transaction Service] allowed to cancel:",
      allowedStatuses.includes(status),
    );

    if (!allowedStatuses.includes(status)) {
      throw new AppError("Cannot cancel this transaction", 400);
    }

    return prisma.$transaction(async (tx) => {
      console.log("[DEBUG Transaction Service] canceling transaction in DB");
      const result = await tx.transaction.update({
        where: { id },
        data: {
          status: TransactionStatus.CANCELED,
        },
      });

      // Restore all resources
      await restoreTicketAvailability(tx, {
        ticketId: transaction.ticketId,
        eventId: transaction.eventId,
        quantity: transaction.quantity,
      });

      await restoreUserPoints(tx, {
        userId: transaction.userId,
        pointsUsed: transaction.pointsUsed,
      });

      if (transaction.voucherId) {
        await restoreVoucher(tx, { voucherId: transaction.voucherId });
      }

      if (transaction.couponId) {
        await restoreCoupon(tx, { couponId: transaction.couponId });
      }

      console.log(
        "[DEBUG Transaction Service] transaction canceled, new status:",
        result.status,
      );

      return result;
    });
  },
};
