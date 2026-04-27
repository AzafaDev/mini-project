import { prisma } from "../config/prisma";
import { TransactionStatus } from "@prisma/client";
import { sendEmail } from "./sendEmail";
import { transactionService } from "../modules/transaction/transaction.service";

const EXPIRATION_HOURS = 2;
const AUTO_CANCEL_DAYS = 3;

async function processExpiredTransactions() {
  console.log("[CRON] Running processExpiredTransactions...");
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_PAYMENT,
      expiresAt: { lte: new Date() },
    },
    select: { id: true },
  });

  for (const tx of expiredTransactions) {
    try {
      await transactionService.expireTransaction({ id: tx.id });
      console.log("[CRON] Transaction expired:", tx.id);
    } catch (error) {
      console.error("[CRON] Error expiring transaction:", tx.id, error);
    }
  }
}

async function processAutoCancelTransactions() {
  console.log("[CRON] Running processAutoCancelTransactions...");
  const autoCancelTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_CONFIRMATION,
      autoCancelAt: { lte: new Date() },
    },
    select: { id: true },
  });

  for (const tx of autoCancelTransactions) {
    try {
      await transactionService.cancelTransaction({ id: tx.id });
      console.log("[CRON] Transaction auto-canceled:", tx.id);
    } catch (error) {
      console.error("[CRON] Error auto-canceling transaction:", tx.id, error);
    }
  }
}

async function cleanupExpiredPoints() {
  console.log("[CRON] Running cleanupExpiredPoints...");

  const now = new Date();

  // 1. Find all expired point transactions grouped by user
  const expiredTxns = await prisma.pointTransaction.findMany({
    where: {
      expiresAt: { lte: now },
      amount: { gt: 0 } // ONLY positive points can expire
    },
    select: { userId: true, amount: true },
  });

  if (expiredTxns.length === 0) {
    console.log("[CRON] No expired points to clean up");
    return;
  }

  // 2. Group by user and calculate total expired per user
  const userExpiredMap = new Map<string, number>();
  for (const tx of expiredTxns) {
    const current = userExpiredMap.get(tx.userId) || 0;
    userExpiredMap.set(tx.userId, current + tx.amount);
  }

  console.log(
    `[CRON] Found ${expiredTxns.length} expired point transactions across ${userExpiredMap.size} users`,
  );

  // 3. Batch update all users (decrement points) atomically
  await prisma.$transaction(async (tx) => {
    for (const [userId, totalExpired] of userExpiredMap.entries()) {
      // Use conditional update to prevent negative points (defense in depth)
      // The database constraint @@check([points >= 0]) will also protect
      const result = await tx.user.updateMany({
        where: {
          id: userId,
          points: { gte: totalExpired },
        },
        data: { points: { decrement: totalExpired } },
      });

      if (result.count === 0) {
        // User not found or points already less than totalExpired
        // This shouldn't happen if data is consistent, but log for monitoring
        console.warn(
          `[CRON] Could not decrement points for user ${userId}: insufficient balance or user not found`,
        );
      } else {
        console.log(
          `[CRON] Decremented ${totalExpired} points from user ${userId}`,
        );
      }
    }
  });

  // 4. Delete expired transactions
  const deleteResult = await prisma.pointTransaction.deleteMany({
    where: { expiresAt: { lte: now } },
  });

  console.log(
    `[CRON] Deleted ${deleteResult.count} expired point transactions`,
  );
  console.log("[CRON] cleanupExpiredPoints completed");
}

// Jalankan semua cron job background secara otomatis ketika server start
export function startCronJobs() {
  console.log("[CRON] Starting cron jobs...");

  // Cek transaksi expired setiap 5 menit
  setInterval(processExpiredTransactions, 5 * 60 * 1000);

  // Cek transaksi yang perlu auto cancel setiap 5 menit
  setInterval(processAutoCancelTransactions, 5 * 60 * 1000);

  // Bersihkan poin expired setiap 1 jam
  setInterval(cleanupExpiredPoints, 60 * 60 * 1000);

  console.log("[CRON] Cron jobs scheduled");
}
