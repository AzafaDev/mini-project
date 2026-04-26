import { prisma } from "../../config/prisma";

// Service untuk mengelola sistem poin user
// Menangani riwayat poin, perhitungan poin aktif, dan pembersihan poin expired
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

     const user = await prisma.user.findUnique({
       where: { id: userId },
       select: { points: true },
     });

     return {
       activePoints: user?.points || 0,
       expiredPoints: 0, // or calculate from expired PointTransaction if needed for reporting
       transactions: [],
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

  // Menghapus semua poin yang sudah kadaluarsa dari database
  // Dijalankan otomatis oleh cron job secara berkala
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