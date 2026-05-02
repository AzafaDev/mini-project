import cron from "node-cron";
import { prisma } from "../config/prisma";
import { TransactionStatus } from "@prisma/client";
import { transactionStatusService } from "../modules/transaction/services";
import { logger } from "./logger";

const EXPIRATION_HOURS = 2;
const AUTO_CANCEL_DAYS = 3;

async function processExpiredTransactions() {
  logger.debug("[CRON] Running processExpiredTransactions...");
  const expiredTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_PAYMENT,
      expiresAt: { lte: new Date() },
    },
    select: { id: true },
  });

  for (const tx of expiredTransactions) {
    try {
      await transactionStatusService.expireTransaction({ id: tx.id });
      logger.debug("[CRON] Transaction expired:", tx.id);
    } catch (error) {
      logger.error("[CRON] Error expiring transaction:", tx.id, error);
    }
  }
}

async function processAutoCancelTransactions() {
  logger.debug("[CRON] Running processAutoCancelTransactions...");
  const autoCancelTransactions = await prisma.transaction.findMany({
    where: {
      status: TransactionStatus.WAITING_CONFIRMATION,
      autoCancelAt: { lte: new Date() },
    },
    select: { id: true },
  });

  for (const tx of autoCancelTransactions) {
    try {
      await transactionStatusService.cancelTransaction({ id: tx.id });
      logger.debug("[CRON] Transaction auto-canceled:", tx.id);
    } catch (error) {
      logger.error("[CRON] Error auto-canceling transaction:", tx.id, error);
    }
  }
}

async function cleanupExpiredPoints() {
  logger.debug("[CRON] Running cleanupExpiredPoints...");

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
    logger.debug("[CRON] No expired points to clean up");
    return;
  }

  // 2. Group by user and calculate total expired per user
  const userExpiredMap = new Map<string, number>();
  for (const tx of expiredTxns) {
    const current = userExpiredMap.get(tx.userId) || 0;
    userExpiredMap.set(tx.userId, current + tx.amount);
  }

  logger.debug(
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
        logger.warn(
          `[CRON] Could not decrement points for user ${userId}: insufficient balance or user not found`,
        );
      } else {
        logger.debug(
          `[CRON] Decremented ${totalExpired} points from user ${userId}`,
        );
      }
    }
  });

  // 4. Delete expired transactions
  const deleteResult = await prisma.pointTransaction.deleteMany({
    where: { expiresAt: { lte: now } },
  });

  logger.debug(
    `[CRON] Deleted ${deleteResult.count} expired point transactions`,
  );
  logger.debug("[CRON] cleanupExpiredPoints completed");
}

export function startCronJobs() {
  logger.debug("[CRON] Starting cron jobs...");

  cron.schedule("*/5 * * * *", () => {
    processExpiredTransactions().catch((err) =>
      logger.error("[CRON] processExpiredTransactions error:", err),
    );
  });

  cron.schedule("*/5 * * * *", () => {
    processAutoCancelTransactions().catch((err) =>
      logger.error("[CRON] processAutoCancelTransactions error:", err),
    );
  });

  cron.schedule("0 * * * *", () => {
    cleanupExpiredPoints().catch((err) =>
      logger.error("[CRON] cleanupExpiredPoints error:", err),
    );
  });

  logger.debug("[CRON] Cron jobs scheduled");
}
