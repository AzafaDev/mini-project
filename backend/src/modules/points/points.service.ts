import type { PrismaClientType, TxClient } from "../../config/prisma";
import { prisma as prismaClient } from "../../config/prisma";
import { logger } from "../../utils/logger";

export class PointsService {
  constructor(private prisma: PrismaClientType) {}

  async getPointsHistory({
    userId,
    page = 1,
    limit = 10,
  }: {
    userId: string;
    page?: number;
    limit?: number;
  }) {
    const skip = (page - 1) * limit;

    const [transactions, total] = await Promise.all([
      this.prisma.pointTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.pointTransaction.count({ where: { userId } }),
    ]);

    logger.debug("[PointsService] getPointsHistory:", { userId, count: transactions.length, total });

    return { data: transactions, pagination: { total, page, limit } };
  }

  async getActivePoints({ userId }: { userId: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { points: true },
    });

    logger.debug("[PointsService] getActivePoints:", { userId, activePoints: user?.points });

    return {
      activePoints: user?.points || 0,
      expiredPoints: 0,
      transactions: [],
    };
  }

  async getActivePointsTx(tx: TxClient, userId: string): Promise<number> {
    const now = new Date();
    const result = await tx.pointTransaction.aggregate({
      where: { userId, expiresAt: { gt: now } },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  async cleanupExpiredPoints() {
    const now = new Date();
    const result = await this.prisma.pointTransaction.deleteMany({
      where: { expiresAt: { lte: now } },
    });

    logger.debug("[PointsService] cleanupExpiredPoints:", { deleted: result.count });

    return result;
  }
}

export const pointsService = new PointsService(prismaClient);
