import { prisma } from "../../config/prisma";

export const pointsService = {
  getPointsHistory: async ({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) => {
    console.log("[DEBUG Points Service] getPointsHistory input:", { userId, page, limit });

    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pointTransaction.count({ where: { userId } }),
    ]);

    console.log("[DEBUG Points Service] getPointsHistory result:", { count: transactions.length, total });

    return { data: transactions, pagination: { total, page, limit } };
  },

  getActivePoints: async ({ userId }: { userId: string }) => {
    console.log("[DEBUG Points Service] getActivePoints input:", { userId });

    const now = new Date();

    const expiredPoints = await prisma.pointTransaction.aggregate({
      where: {
        userId,
        expiresAt: { lte: now },
      },
      _sum: {
        amount: true,
      },
    });

    console.log("[DEBUG Points Service] expired points sum:", expiredPoints._sum.amount);

    const activeTransactions = await prisma.pointTransaction.findMany({
      where: {
        userId,
        expiresAt: { gt: now },
      },
    });

    const activePoints = activeTransactions.reduce((sum, tx) => sum + tx.amount, 0);

    console.log("[DEBUG Points Service] active points:", activePoints);

    return {
      activePoints,
      expiredPoints: expiredPoints._sum.amount || 0,
      transactions: activeTransactions,
    };
  },

  /**
   * Calculate active (non-expired) points for a user within a transaction.
   * Use this inside prisma.$transaction blocks for atomic consistency.
   */
  getActivePointsTx: async (tx: any, userId: string): Promise<number> => {
    const now = new Date();
    const result = await tx.pointTransaction.aggregate({
      where: { userId, expiresAt: { gt: now } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  },

  cleanupExpiredPoints: async () => {
    console.log("[DEBUG Points Service] cleanupExpiredPoints called");

    const now = new Date();

    const result = await prisma.pointTransaction.deleteMany({
      where: {
        expiresAt: { lte: now },
      },
    });

    console.log("[DEBUG Points Service] deleted expired points:", result.count);

    return result;
  },
};