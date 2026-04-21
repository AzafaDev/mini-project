import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEventStore } from "../../stores/useEventStore";
import { formatIDR, formatDate } from "../../lib/formatters";
import type { Event, OrganizerStats } from "../../services/api";
import { StatCard } from "../ui/StatCard";
import { EventItem } from "../events/EventItem";

type TimeRange = "7D" | "30D" | "12M" | "1Y" | "ALL";

const getEventStatus = (event: {
  startDate: string;
  endDate: string;
  isDeleted?: boolean;
}) => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  if (event.isDeleted) return "Deleted";
  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Active";
  if (now > end) return "Completed";
  return "Unknown";
};

interface DashboardTabProps {
  onNavigateToEvents: () => void;
  onStatsClick: (event: { id: string; name: string }) => void;
  stats: OrganizerStats | null;
  myEvents: Event[];
  onTimeRangeChange?: (year?: number, month?: number, day?: number) => void;
}

export function DashboardTab({
  onNavigateToEvents,
  onStatsClick,
  stats,
  myEvents,
  onTimeRangeChange,
}: DashboardTabProps) {
  const navigate = useNavigate();

  const [timeRange, setTimeRange] = useState<TimeRange>("12M");

  const loadingOrganizerStats = useEventStore.getState().loadingOrganizerStats;
  const fetchOrganizerStats = useEventStore.getState().fetchOrganizerStats;

  // Manual fetch function - only called when user changes timeRange
  const handleTimeRangeChange = (newRange: TimeRange) => {
    setTimeRange(newRange);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let year: number | undefined;
    let month: number | undefined;
    let day: number | undefined;

    switch (newRange) {
      case "7D":
        year = currentYear;
        month = currentMonth;
        day = currentDay;
        break;
      case "30D":
        year = currentYear;
        month = currentMonth;
        break;
      case "12M":
        year = currentYear;
        break;
      case "1Y":
        year = currentYear - 1;
        break;
      case "ALL":
        year = currentYear;
        break;
    }

    if (onTimeRangeChange) {
      onTimeRangeChange(year, month, day);
    } else {
      fetchOrganizerStats(year, month, day);
    }
  };

  // Data sudah dari props, tidak perlu ambil dari store
  const totalRevenue = stats?.totalRevenue || 0;
  const ticketsSold = stats?.totalTicketsSold || 0;
  const totalEvents = stats?.totalEvents || 0;
  const totalAttendees = stats?.totalAttendees || 0;

  const activeEventsCount = useMemo(() => {
    const now = new Date();
    return myEvents.filter((e) => {
      if (e.isDeleted) return false;
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return now >= start && now <= end;
    }).length;
  }, [myEvents]);

  const completedEventsCount = useMemo(() => {
    const now = new Date();
    return myEvents.filter((e) => {
      if (e.isDeleted) return false;
      const end = new Date(e.endDate);
      return end < now;
    }).length;
  }, [myEvents]);

  const chartData = useMemo(() => {
    if (!stats) return null;

    switch (timeRange) {
      case "7D":
      case "30D":
        return {
          data: stats.dailyStats || [],
          label: "Daily Revenue",
          getLabel: (d: any) => d.day,
        };
      case "12M":
      case "1Y":
        return {
          data: stats.monthlyStats || [],
          label: "Monthly Revenue",
          getLabel: (d: any) => d.month,
        };
      case "ALL":
        return {
          data: stats.yearlyStats || [],
          label: "Yearly Revenue",
          getLabel: (d: any) => String(d.year),
        };
      default:
        return null;
    }
  }, [stats, timeRange]);

  const revenueLabel = useMemo(() => {
    switch (timeRange) {
      case "7D":
        return "Revenue (Last 7 Days)";
      case "30D":
        return "Revenue (Current Month)";
      case "12M":
        return "Revenue (Current Year)";
      case "1Y":
        return "Revenue (Last Year)";
      case "ALL":
        return "Total Revenue (All Time)";
      default:
        return "Revenue";
    }
  }, [timeRange]);

  const activeEventsList = myEvents.filter((e) => !e.isDeleted).slice(0, 5);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="sm:col-span-2 p-4 md:p-6 bg-[#1C1B1B] rounded-lg flex flex-col justify-between border border-[#464555]/10">
          <div>
            <span className="uppercase tracking-widest text-[#C7C4D8] font-medium text-xs">
              {revenueLabel}
            </span>
            <h3 className="text-4xl font-bold tracking-tight mt-2">
              {formatIDR(totalRevenue)}
            </h3>
          </div>
          <div className="flex items-end justify-between mt-8">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-[#C0C1FF]/10 text-[#C0C1FF] rounded-lg font-bold">
                {totalEvents} Events
              </span>
              <span className="text-xs text-[#C7C4D8]">total</span>
            </div>
            {chartData && chartData.data.length > 0 && (
              <div className="flex items-baseline gap-1 h-12">
                {chartData.data.slice(-7).map((d: any, i: number) => {
                  const maxRevenue = Math.max(
                    ...(chartData.data?.map((s: any) => s.revenue) || [1]),
                  );
                  const height = Math.min((d.revenue / maxRevenue) * 100, 100);
                  return (
                    <div
                      key={i}
                      className="w-1.5 bg-[#C0C1FF] rounded-full"
                      style={{
                        height: `${Math.max(height, 10)}px`,
                        opacity: 0.2 + i * 0.1,
                      }}
                    ></div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <StatCard
          label="Tickets Sold"
          value={ticketsSold.toLocaleString()}
          trend={`${activeEventsCount} active`}
          icon="confirmation_number"
          iconColor="#C3C0FF"
        />
        <StatCard
          label="Total Events"
          value={totalEvents.toString()}
          trend={`${completedEventsCount} completed`}
          icon="event"
          iconColor="#FFB695"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {chartData && chartData.data.length > 0 ? (
            <div className="bg-[#1C1B1B] rounded-lg p-4 md:p-8 h-[350px] md:h-[400px] flex flex-col border border-[#464555]/10">
              <div className="flex items-center justify-between mb-8">
                <h4 className="text-lg font-bold tracking-tight">
                  {chartData.label}
                </h4>
                <div className="flex gap-2">
                  {(["7D", "30D", "12M", "1Y", "ALL"] as TimeRange[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => handleTimeRangeChange(t)}
                        className={`px-3 py-1 text-xs rounded-lg border border-[#464555]/10 transition-colors ${
                          timeRange === t
                            ? "bg-[#C0C1FF] text-[#07006C] font-bold"
                            : "bg-[#353534] hover:bg-[#404040]"
                        }`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="flex-1 overflow-x-auto scrollbar-hide -mx-4 px-4">
                <div className="flex items-end gap-2 md:gap-3 h-full min-w-[550px] pb-8">
                {chartData.data
                  .slice(
                    -(timeRange === "ALL" ? 5 : timeRange === "7D" ? 7 : 12),
                  )
                  .map((d: any, i: number) => {
                    const maxRevenue = Math.max(
                      ...(chartData.data?.map((s: any) => s.revenue) || [1]),
                    );
                    const height = (d.revenue / maxRevenue) * 100;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-lg transition-all relative group ${
                          i === (chartData.data?.length || 0) - 1
                            ? "bg-[#C0C1FF] shadow-[0_0_20px_rgba(192,193,255,0.2)]"
                            : "bg-[#4B4DD8]/30"
                        }`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#353534] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {formatIDR(d.revenue)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between pt-4 border-t border-[#464555]/10 text-[10px] text-[#C7C4D8] font-medium uppercase tracking-widest">
                {chartData.data
                  .slice(
                    -(timeRange === "ALL" ? 5 : timeRange === "7D" ? 7 : 12),
                  )
                  .map((d: any, i: number) => (
                    <span key={i}>{chartData.getLabel(d)}</span>
                  ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#1C1B1B] rounded-lg p-8 h-[400px] flex flex-col border border-[#464555]/10 items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-[#353534] mb-4">
                bar_chart
              </span>
              <p className="text-[#C7C4D8]">No revenue data yet</p>
              <p className="text-xs text-[#666] mt-2">
                {loadingOrganizerStats
                  ? "Loading..."
                  : "Create events to start tracking revenue"}
              </p>
            </div>
          )}

          <section>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold tracking-tight">
                Active Events
              </h4>
              <button
                onClick={onNavigateToEvents}
                className="text-[#C0C1FF] text-sm font-semibold flex items-center gap-1 hover:underline"
              >
                View all{" "}
                <span className="material-symbols-outlined text-sm">
                  chevron_right
                </span>
              </button>
            </div>
            {activeEventsList.length > 0 ? (
              <div className="space-y-4">
                {activeEventsList.map((event) => (
                  <EventItem
                    key={event.id}
                    id={event.id}
                    title={event.name}
                    date={`${formatDate(event.startDate)} - ${formatDate(
                      event.endDate,
                    )}`}
                    location={event.location}
                    sold={event.sold ?? (event.totalSeats - event.availableSeats)}
                    capacity={event.totalSeats}
                    status={getEventStatus(event)}
                    image={event.imageUrl || ""}
                    onStatsClick={() => {
                      onStatsClick({ id: event.id, name: event.name });
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[#1C1B1B] rounded-lg p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-[#353534] mb-4">
                  event
                </span>
                <p className="text-[#C7C4D8]">No events yet</p>
                <button
                  onClick={() => navigate("/events/create")}
                  className="mt-4 text-[#C0C1FF] text-sm font-semibold hover:underline"
                >
                  Create your first event
                </button>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#C7C4D8] mb-6">
              Quick Stats
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C0C1FF]"></div>
                <div>
                  <p className="text-sm leading-snug">
                    {activeEventsCount} active events
                  </p>
                  <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">
                    Currently running
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C3C0FF]"></div>
                <div>
                  <p className="text-sm leading-snug">
                    {myEvents.filter((e) => !e.isDeleted).length} total events
                  </p>
                  <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">
                    All time
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#FFB695]"></div>
                <div>
                  <p className="text-sm leading-snug">
                    {formatIDR(totalRevenue)} revenue
                  </p>
                  <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">
                    {timeRange === "ALL"
                      ? "All time"
                      : timeRange === "1Y"
                        ? "Last year"
                        : "Year to date"}
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#98D9A8]"></div>
                <div>
                  <p className="text-sm leading-snug">
                    {totalAttendees} attendees
                  </p>
                  <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">
                    Total transactions
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-[#2A2A2A]/80 backdrop-blur-xl border border-[#464555]/15 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#C0C1FF]/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#C7C4D8] mb-4">
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/events/create")}
                className="w-full bg-[#353534] hover:bg-[#393939] px-4 py-3 text-sm font-medium rounded transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Create Event
              </button>
              <button
                onClick={() => navigate("/transactions/organizer")}
                className="w-full bg-[#353534] hover:bg-[#393939] px-4 py-3 text-sm font-medium rounded transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  receipt_long
                </span>
                View Transactions
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
