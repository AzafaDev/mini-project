import { prisma } from "../config/prisma";
import { TransactionStatus } from "../../generated/prisma/enums";
import { sendEmail } from "./sendEmail";
import { restoreTicketAvailability, restoreUserPoints, restoreVoucher, restoreCoupon } from "./transactionHelpers";

const EXPIRATION_HOURS = 2;
const AUTO_CANCEL_DAYS = 3;

async function processExpiredTransactions() {
  console.log("[CRON] Running processExpiredTransactions...");
  
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_PAYMENT,
      expiresAt: { lte: new Date() },
    },
    include: {
      user: { select: { email: true, fullName: true } },
      event: { select: { name: true } },
      ticket: true,
      voucher: true,
      coupon: true,
    },
  });

  console.log("[CRON] Found expired transactions:", expiredTransactions.length);

  for (const tx of expiredTransactions) {
    try {
      console.log("[CRON] Expiring transaction:", tx.id);
      
      await prisma.$transaction(async (txx) => {
        // Update status to EXPIRED
        await txx.transaction.update({
          where: { id: tx.id },
          data: { status: TransactionStatus.EXPIRED },
        });

        // Restore all resources
        await restoreTicketAvailability(txx, {
          ticketId: tx.ticketId,
          eventId: tx.eventId,
          quantity: tx.quantity,
        });

        await restoreUserPoints(txx, {
          userId: tx.userId,
          pointsUsed: tx.pointsUsed,
        });

        if (tx.voucherId) {
          await restoreVoucher(txx, { voucherId: tx.voucherId });
        }

        if (tx.couponId) {
          await restoreCoupon(txx, { couponId: tx.couponId });
        }
      });

      console.log("[CRON] Transaction expired:", tx.id);
    } catch (error) {
      console.error("[CRON] Error expiring transaction:", tx.id, error);
    }
  }

  console.log("[CRON] processExpiredTransactions completed");
}

async function processAutoCancelTransactions() {
  console.log("[CRON] Running processAutoCancelTransactions...");
  
  const autoCancelTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_CONFIRMATION,
      autoCancelAt: { lte: new Date() },
    },
    include: {
      user: { select: { email: true, fullName: true } },
      event: { select: { name: true } },
      ticket: true,
      voucher: true,
      coupon: true,
    },
  });

  console.log("[CRON] Found auto-cancel transactions:", autoCancelTransactions.length);

  for (const tx of autoCancelTransactions) {
    try {
      console.log("[CRON] Auto-canceling transaction:", tx.id);
      
      await prisma.$transaction(async (txx) => {
        // Update status to CANCELED
        await txx.transaction.update({
          where: { id: tx.id },
          data: { status: TransactionStatus.CANCELED },
        });

        // Restore all resources
        await restoreTicketAvailability(txx, {
          ticketId: tx.ticketId,
          eventId: tx.eventId,
          quantity: tx.quantity,
        });

        await restoreUserPoints(txx, {
          userId: tx.userId,
          pointsUsed: tx.pointsUsed,
        });

        if (tx.voucherId) {
          await restoreVoucher(txx, { voucherId: tx.voucherId });
        }

        if (tx.couponId) {
          await restoreCoupon(txx, { couponId: tx.couponId });
        }
      });

      // Send email notification (non-blocking)
      if (tx.user && tx.event) {
        sendEmail.transactionRejected({
          email: tx.user.email,
          username: tx.user.fullName,
          eventName: tx.event.name,
          finalPrice: tx.finalPrice,
          quantity: tx.quantity,
        }).catch(err => console.log("[CRON] Email send failed:", err.message));
      }

      console.log("[CRON] Transaction auto-canceled:", tx.id);
    } catch (error) {
      console.error("[CRON] Error auto-canceling transaction:", tx.id, error);
    }
  }

  console.log("[CRON] processAutoCancelTransactions completed");
}

async function cleanupExpiredPoints() {
  console.log("[CRON] Running cleanupExpiredPoints...");
  
  const result = await prisma.pointTransaction.deleteMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });

  console.log("[CRON] Deleted expired points:", result.count);
  console.log("[CRON] cleanupExpiredPoints completed");
}

// Export a function to start all cron jobs
export function startCronJobs() {
  console.log("[CRON] Starting cron jobs...");
  
  // Run expired transaction check every 5 minutes
  setInterval(processExpiredTransactions, 5 * 60 * 1000);
  
  // Run auto-cancel check every 5 minutes
  setInterval(processAutoCancelTransactions, 5 * 60 * 1000);
  
  // Run points cleanup every hour
  setInterval(cleanupExpiredPoints, 60 * 60 * 1000);
  
  console.log("[CRON] Cron jobs scheduled");
}
