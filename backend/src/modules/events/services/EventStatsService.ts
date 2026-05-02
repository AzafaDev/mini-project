import { TransactionStatus } from "@prisma/client";
import type { PrismaClientType } from "../../../config/prisma";
import { AppError } from "../../../utils/AppError";
import { logger } from "../../../utils/logger";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export class EventStatsService {
  constructor(private prisma: PrismaClientType) {}

  async getEventStats({
    id,
    organizerId,
  }: {
    id: string;
    organizerId: string;
  }) {
    const event = await this.prisma.event.findUnique({
      where: { id: id, organizerId: organizerId },
      select: {
        name: true,
        availableSeats: true,
        totalSeats: true,
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const [aggregated, attendeeCount] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: { eventId: id, status: TransactionStatus.DONE },
        _sum: { quantity: true, finalPrice: true },
      }),
      this.prisma.transaction.count({
        where: { eventId: id, status: TransactionStatus.DONE },
      }),
    ]);

    const ticketsSold = aggregated._sum.quantity || 0;
    const totalRevenue = aggregated._sum.finalPrice || 0;

    return {
      totalRevenue,
      ticketsSold,
      availableSeats: event.availableSeats,
      soldPercentage:
        event.totalSeats > 0 ? (ticketsSold / event.totalSeats) * 100 : 0,
      eventName: event.name,
      attendeeCount,
    };
  }

  async getOrganizerStats({
    organizerId,
    year,
    month,
    day,
  }: {
    organizerId: string;
    year?: number;
    month?: number;
    day?: number;
  }) {
    const currentYear = year || new Date().getFullYear();
    const currentMonth = month;

    const allOrganizerEvents = await this.prisma.event.findMany({
      where: { organizerId },
      select: { id: true, startDate: true, endDate: true },
    });

    const allEventIds = allOrganizerEvents.map((e) => e.id);

    if (allEventIds.length === 0) {
      return {
        totalRevenue: 0,
        totalTicketsSold: 0,
        totalEvents: 0,
        totalAttendees: 0,
        monthlyStats: [],
        dailyStats: [],
        yearlyStats: [],
      };
    }

    const buildDateFilter = () => {
      if (year && month && day) {
        const start = new Date(year, month - 1, day);
        const end = new Date(year, month - 1, day + 1);
        return { createdAt: { gte: start, lt: end } };
      }
      if (year && month) {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 1);
        return { createdAt: { gte: start, lt: end } };
      }
      if (year) {
        const start = new Date(year, 0, 1);
        const end = new Date(year + 1, 0, 1);
        return { createdAt: { gte: start, lt: end } };
      }
      return {};
    };

    const dateFilter = buildDateFilter();

    const [periodAggregation, countResult] = await Promise.all([
      this.prisma.transaction.aggregate({
        where: {
          eventId: { in: allEventIds },
          status: TransactionStatus.DONE,
          ...dateFilter,
        },
        _sum: { finalPrice: true, quantity: true },
        _count: true,
      }),
      this.prisma.transaction.count({
        where: {
          eventId: { in: allEventIds },
          status: TransactionStatus.DONE,
          ...dateFilter,
        },
      }),
    ]);

    const totalRevenue = periodAggregation._sum.finalPrice || 0;
    const totalTicketsSold = periodAggregation._sum.quantity || 0;
    const totalAttendees = countResult;

    let totalEvents = 0;
    if (year && month) {
      const startOfMonth = new Date(year, month - 1, 1);
      const endOfMonth = new Date(year, month, 1);
      totalEvents = allOrganizerEvents.filter(
        (e) => e.startDate >= startOfMonth && e.startDate < endOfMonth,
      ).length;
    } else if (year) {
      totalEvents = allOrganizerEvents.filter(
        (e) => e.startDate.getFullYear() === year,
      ).length;
    } else {
      totalEvents = allOrganizerEvents.length;
    }

    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    const monthlyRows = await this.prisma.$queryRaw<
      Array<{ month: string; revenue: bigint; tickets: bigint }>
    >`
      SELECT
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'Mon') as month,
        COALESCE(SUM("finalPrice"), 0) as revenue,
        COALESCE(SUM("quantity"), 0) as tickets
      FROM "Transaction"
      WHERE "eventId" IN (${allEventIds})
        AND "status" = ${TransactionStatus.DONE}::text
        AND "createdAt" >= ${startOfYear}
        AND "createdAt" < ${startOfNextYear}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `;

    const monthlyMap = new Map(monthlyRows.map((r) => [r.month, r]));

    const monthlyStats = MONTH_NAMES.map((mn) => {
      const row = monthlyMap.get(mn);
      return {
        month: mn,
        revenue: Number(row?.revenue || 0),
        tickets: Number(row?.tickets || 0),
      };
    });

    const dailyStats: { day: string; revenue: number; tickets: number }[] = [];
    if (currentMonth) {
      const startOfMonthD = new Date(currentYear, currentMonth - 1, 1);
      const startOfNextMonthD = new Date(currentYear, currentMonth, 1);

      const dailyRows = await this.prisma.$queryRaw<
        Array<{ day: string; revenue: bigint; tickets: bigint }>
      >`
        SELECT
          CAST(EXTRACT(DAY FROM "createdAt") AS TEXT) as day,
          COALESCE(SUM("finalPrice"), 0) as revenue,
          COALESCE(SUM("quantity"), 0) as tickets
        FROM "Transaction"
        WHERE "eventId" IN (${allEventIds})
          AND "status" = ${TransactionStatus.DONE}::text
          AND "createdAt" >= ${startOfMonthD}
          AND "createdAt" < ${startOfNextMonthD}
        GROUP BY EXTRACT(DAY FROM "createdAt")
        ORDER BY EXTRACT(DAY FROM "createdAt")
      `;

      const dailyMap = new Map(dailyRows.map((r) => [r.day, r]));
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

      for (let d = 1; d <= daysInMonth; d++) {
        const ds = String(d);
        const row = dailyMap.get(ds);
        dailyStats.push({
          day: ds,
          revenue: Number(row?.revenue || 0),
          tickets: Number(row?.tickets || 0),
        });
      }
    }

    const currentFullYear = new Date().getFullYear();
    const yearlyResults = await this.prisma.$queryRaw<
      Array<{ year: number; revenue: bigint; tickets: bigint }>
    >`
      SELECT
        CAST(EXTRACT(YEAR FROM "createdAt") AS INTEGER) as year,
        COALESCE(SUM("finalPrice"), 0) as revenue,
        COALESCE(SUM("quantity"), 0) as tickets
      FROM "Transaction"
      WHERE "eventId" IN (${allEventIds})
        AND "status" = ${TransactionStatus.DONE}::text
        AND EXTRACT(YEAR FROM "createdAt") >= ${currentFullYear - 4}
        AND EXTRACT(YEAR FROM "createdAt") <= ${currentFullYear}
      GROUP BY EXTRACT(YEAR FROM "createdAt")
      ORDER BY EXTRACT(YEAR FROM "createdAt")
    `;

    const yearlyMap = new Map(yearlyResults.map((r) => [r.year, r]));
    const yearlyStats = [];
    for (let y = currentFullYear - 4; y <= currentFullYear; y++) {
      const row = yearlyMap.get(y);
      yearlyStats.push({
        year: y,
        revenue: Number(row?.revenue || 0),
        tickets: Number(row?.tickets || 0),
      });
    }

    logger.debug("[EventStatsService] getOrganizerStats:", {
      organizerId,
      totalRevenue,
      totalTicketsSold,
      totalEvents,
      totalAttendees,
    });

    return {
      totalRevenue,
      totalTicketsSold,
      totalEvents,
      totalAttendees,
      monthlyStats,
      dailyStats,
      yearlyStats,
    };
  }
}
