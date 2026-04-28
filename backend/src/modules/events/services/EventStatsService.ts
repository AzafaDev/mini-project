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
      where: { id: id, organizerId: organizerId, isDeleted: false },
      select: {
        name: true,
        availableSeats: true,
        totalSeats: true,
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    const soldResult = await this.prisma.transaction.aggregate({
      where: { eventId: id, status: "DONE" },
      _sum: { quantity: true },
    });
    const ticketsSold = soldResult._sum.quantity || 0;

    const revenueResult = await this.prisma.transaction.aggregate({
      where: { eventId: id, status: "DONE" },
      _sum: { finalPrice: true },
    });
    const totalRevenue = revenueResult._sum.finalPrice || 0;

    const attendeeCount = await this.prisma.transaction.count({
      where: { eventId: id, status: "DONE" },
    });

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
    const currentDay = day;

    const allOrganizerEvents = await this.prisma.event.findMany({
      where: {
        organizerId,
        isDeleted: false,
      },
      select: { id: true, startDate: true, endDate: true },
    });

    const allEventIds = allOrganizerEvents.map((e) => e.id);

    const allTransactions = await this.prisma.transaction.findMany({
      where: {
        eventId: { in: allEventIds },
        status: "DONE",
      },
    });

    let filteredTransactions = allTransactions;
    if (currentYear && currentMonth && currentDay) {
      filteredTransactions = allTransactions.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return (
          txDate.getDate() === currentDay &&
          txDate.getMonth() + 1 === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      });
    } else if (currentYear && currentMonth) {
      filteredTransactions = allTransactions.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return (
          txDate.getMonth() + 1 === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      });
    } else if (currentYear) {
      filteredTransactions = allTransactions.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === currentYear;
      });
    }

    const totalRevenue = filteredTransactions.reduce(
      (sum, tx) => sum + tx.finalPrice,
      0,
    );
    const totalTicketsSold = filteredTransactions.reduce(
      (sum, tx) => sum + tx.quantity,
      0,
    );
    const totalAttendees = filteredTransactions.length;

    let filteredEvents = allOrganizerEvents;
    if (currentYear && currentMonth) {
      filteredEvents = allOrganizerEvents.filter((e) => {
        const startDate = new Date(e.startDate);
        return (
          startDate.getFullYear() === currentYear &&
          startDate.getMonth() + 1 === currentMonth
        );
      });
    } else if (currentYear) {
      filteredEvents = allOrganizerEvents.filter((e) => {
        const startDate = new Date(e.startDate);
        return startDate.getFullYear() === currentYear;
      });
    }
    const totalEvents = filteredEvents.length;

    const monthlyStats: { month: string; revenue: number; tickets: number }[] =
      [];
    const yearTransactions = allTransactions.filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate.getFullYear() === currentYear;
    });

    for (let m = 1; m <= 12; m++) {
      const monthTransactions = yearTransactions.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate.getMonth() + 1 === m;
      });

      monthlyStats.push({
        month: MONTH_NAMES[m - 1],
        revenue: monthTransactions.reduce((sum, tx) => sum + tx.finalPrice, 0),
        tickets: monthTransactions.reduce((sum, tx) => sum + tx.quantity, 0),
      });
    }

    const dailyStats: { day: string; revenue: number; tickets: number }[] = [];
    if (currentMonth) {
      const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
      const monthTransactions = allTransactions.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return (
          txDate.getMonth() + 1 === currentMonth &&
          txDate.getFullYear() === currentYear
        );
      });

      for (let d = 1; d <= daysInMonth; d++) {
        const dayTransactions = monthTransactions.filter((tx) => {
          const txDate = new Date(tx.createdAt);
          return txDate.getDate() === d;
        });

        dailyStats.push({
          day: String(d),
          revenue: dayTransactions.reduce((sum, tx) => sum + tx.finalPrice, 0),
          tickets: dayTransactions.reduce((sum, tx) => sum + tx.quantity, 0),
        });
      }
    }

    const yearlyStats: { year: number; revenue: number; tickets: number }[] =
      [];
    const currentFullYear = new Date().getFullYear();
    for (let y = currentFullYear - 4; y <= currentFullYear; y++) {
      const yearTransactionsData = allTransactions.filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate.getFullYear() === y;
      });

      yearlyStats.push({
        year: y,
        revenue: yearTransactionsData.reduce(
          (sum, tx) => sum + tx.finalPrice,
          0,
        ),
        tickets: yearTransactionsData.reduce((sum, tx) => sum + tx.quantity, 0),
      });
    }

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
