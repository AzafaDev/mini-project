import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useEventStore } from "../../stores/useEventStore";
import { formatIDR, formatDate } from "../../lib/formatters";
import { getEventStatus } from "../../lib/eventUtils";
import type { Event, OrganizerStats } from "../../services/api";
import { StatCard } from "../ui/StatCard";
import { EventItem } from "../events/EventItem";

type TimeRange = "7D" | "30D" | "12M" | "1Y" | "ALL";

interface DashboardTabProps {
  onNavigateToEvents: () => void;
  onStatsClick: (event: { id: string; name: string }) => void;
  stats: OrganizerStats | null;
  myEvents: Event[];
  onTimeRangeChange?: (year?: number, month?: number, day?: number) => void;
}

// Custom tooltip dengan tema gelap
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-elevated border border-border-muted/15 rounded-lg p-3 shadow-xl">
        <p className="text-text-muted text-xs mb-1">{label}</p>
        <p className="text-primary font-bold text-sm">
          Revenue: {formatIDR(payload[0].value)}
        </p>
        {payload[0]?.payload?.tickets !== undefined && (
          <p className="text-text-light text-xs">
            Tickets: {payload[0].payload.tickets}
          </p>
        )}
      </div>
    );
  }
  return null;
};

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

  // Data chart dengan properti dinamis untuk menghindari error tipe
  const chartData: {
    data: any[];
    label: string;
    xKey: string;
    dataKey: string;
  } | null = useMemo(() => {
    if (!stats) return null;

    switch (timeRange) {
      case "7D":
      case "30D":
        return {
          data: stats.dailyStats || [],
          label: "Daily Revenue",
          xKey: "day",
          dataKey: "revenue",
        };
      case "12M":
      case "1Y":
        return {
          data: stats.monthlyStats || [],
          label: "Monthly Revenue",
          xKey: "month",
          dataKey: "revenue",
        };
      case "ALL":
        return {
          data: stats.yearlyStats || [],
          label: "Yearly Revenue",
          xKey: "year",
          dataKey: "revenue",
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

  const activeEventsList = myEvents.filter((e) => !e.isDeleted).slice(0, 5);

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="sm:col-span-2 p-4 md:p-6 bg-dark-surface rounded-lg flex flex-col justify-between border border-border-muted/10">
          <div>
            <span className="uppercase tracking-widest text-text-muted font-medium text-xs">
              {revenueLabel}
            </span>
            <h3 className="text-4xl font-bold tracking-tight mt-2">
              {formatIDR(totalRevenue)}
            </h3>
          </div>
          <div className="flex items-end justify-between mt-8">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg font-bold">
                {totalEvents} Events
              </span>
              <span className="text-xs text-text-muted">total</span>
            </div>
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
          {/* Chart Section dengan Recharts */}
          {chartData && chartData.data.length > 0 ? (
            <div className="bg-dark-surface rounded-lg p-4 md:p-8 flex flex-col border border-border-muted/10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h4 className="text-lg font-bold tracking-tight">
                  {chartData.label}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(["7D", "30D", "12M", "1Y", "ALL"] as TimeRange[]).map(
                    (t) => (
                      <button
                        key={t}
                        onClick={() => handleTimeRangeChange(t)}
                        className={`px-3 py-1 text-xs rounded-lg border border-border-muted/10 transition-colors ${
                          timeRange === t
                            ? "bg-primary text-[#07006C] font-bold"
                            : "bg-dark-card hover:bg-[#404040]"
                        }`}
                      >
                        {t}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData.data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#2a2a2a"
                    vertical={false}
                  />
                  <XAxis
                    dataKey={chartData.xKey}
                    tick={{ fill: "#C7C4D8", fontSize: 12 }}
                    axisLine={{ stroke: "#464555" }}
                    tickLine={{ stroke: "#464555" }}
                  />
                  <YAxis
                    tick={{ fill: "#C7C4D8", fontSize: 12 }}
                    tickFormatter={(value) => formatIDR(value)}
                    axisLine={{ stroke: "#464555" }}
                    tickLine={{ stroke: "#464555" }}
                  />
                  <Tooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "#2a2a2a" }}
                  />
                  <Legend
                    wrapperStyle={{ color: "#C7C4D8", fontSize: 12 }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey={chartData.dataKey}
                    name="Revenue"
                    fill="#C0C1FF"
                    radius={[4, 4, 0, 0]}
                    animationDuration={800}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="bg-dark-surface rounded-lg p-8 h-[400px] flex flex-col border border-border-muted/10 items-center justify-center">
              <span className="material-symbols-outlined text-6xl text-dark-card mb-4">
                bar_chart
              </span>
              <p className="text-text-muted">No revenue data yet</p>
              <p className="text-xs text-text-secondary mt-2">
                {loadingOrganizerStats
                  ? "Loading..."
                  : "Create events to start tracking revenue"}
              </p>
            </div>
          )}

          {/* Active Events List */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-bold tracking-tight">
                Active Events
              </h4>
              <button
                onClick={onNavigateToEvents}
                className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
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
                    sold={event.sold ?? event.totalSeats - event.availableSeats}
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
              <div className="bg-dark-surface rounded-lg p-8 text-center">
                <span className="material-symbols-outlined text-6xl text-dark-card mb-4">
                  event
                </span>
                <p className="text-text-muted">No events yet</p>
                <button
                  onClick={() => navigate("/events/create")}
                  className="mt-4 text-primary text-sm font-semibold hover:underline"
                >
                  Create your first event
                </button>
              </div>
            )}
          </section>
        </div>

        {/* Right Sidebar: Quick Stats & Actions */}
        <div className="space-y-8">
          <div className="bg-dark-surface rounded-lg p-6 border border-border-muted/10">
            <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-6">
              Quick Stats
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-primary"></div>
                <div>
                  <p className="text-sm leading-snug">
                    {activeEventsCount} active events
                  </p>
                  <p className="text-[10px] text-text-muted mt-1 uppercase">
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
                  <p className="text-[10px] text-text-muted mt-1 uppercase">
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
                  <p className="text-[10px] text-text-muted mt-1 uppercase">
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
                  <p className="text-[10px] text-text-muted mt-1 uppercase">
                    Total transactions
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-dark-elevated/80 backdrop-blur-xl border border-border-muted/15 p-6 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 blur-2xl"></div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-text-muted mb-4">
              Quick Actions
            </h4>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/events/create")}
                className="w-full bg-dark-card hover:bg-dark-card-hover px-4 py-3 text-sm font-medium rounded transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add
                </span>
                Create Event
              </button>
              <button
                onClick={() => navigate("/transactions/organizer")}
                className="w-full bg-dark-card hover:bg-dark-card-hover px-4 py-3 text-sm font-medium rounded transition-colors flex items-center gap-2"
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
