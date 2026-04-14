import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useAuthStore } from "../stores/useAuthStore";
import { Sidebar } from "../components/sidebar";

// --- Types ---
interface EventItemProps {
  id: string;
  title: string;
  date: string;
  location: string;
  sold: number;
  capacity: number;
  status: string;
  image: string;
}

// --- Sub-Components ---

const StatCard = ({
  label,
  value,
  trend,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  trend?: string;
  icon: string;
  iconColor: string;
}) => (
  <div className="p-6 bg-[#1C1B1B] rounded-lg">
    <div
      className={`w-10 h-10 rounded flex items-center justify-center mb-4`}
      style={{ backgroundColor: `${iconColor}1A` }}
    >
      <span className="material-symbols-outlined" style={{ color: iconColor }}>
        {icon}
      </span>
    </div>
    <span className="text-on-surface-variant text-xs uppercase tracking-widest">
      {label}
    </span>
    <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
        <span className="material-symbols-outlined text-[12px]">
          trending_up
        </span>
        {trend}
      </div>
    )}
  </div>
);

const EventItem = ({
  id,
  title,
  date,
  location,
  sold,
  capacity,
  status,
  image,
}: EventItemProps) => {
  const navigate = useNavigate();
  const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;
  
  return (
    <div 
      className="bg-[#1C1B1B] hover:bg-[#2A2A2A] transition-colors p-4 flex items-center gap-4 group cursor-pointer"
      onClick={() => navigate(`/events/${id}`)}
    >
      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <img 
          alt={title} 
          className="w-full h-full object-cover" 
          src={image || "https://via.placeholder.com/64"} 
        />
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-on-surface">{title}</h5>
        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">
            calendar_today
          </span>{" "}
          {date}
          <span className="mx-2">•</span>
          <span className="material-symbols-outlined text-[14px]">
            location_on
          </span>{" "}
          {location}
        </p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-on-surface">
          {sold.toLocaleString()} Sold
        </p>
        <div className="w-24 bg-[#353534] h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-[#C0C1FF] h-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="px-3 py-1 bg-[#C3C0FF]/10 text-[#C3C0FF] text-[10px] font-black uppercase rounded border border-[#C3C0FF]/20">
        {status}
      </div>
    </div>
  );
};

// --- Helper Functions ---

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getEventStatus = (event: { startDate: string; endDate: string; isDeleted?: boolean }) => {
  const now = new Date();
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  if (event.isDeleted) return "Deleted";
  if (now < start) return "Upcoming";
  if (now >= start && now <= end) return "Active";
  if (now > end) return "Completed";
  return "Unknown";
};

// --- Main Dashboard Component ---

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { user } = useAuthStore();
  const {
    myEvents,
    organizerStats,
    loadingMyEvents,
    loadingOrganizerStats,
    fetchMyEvents,
    fetchOrganizerStats,
    error,
    clearError,
  } = useEventStore();

  // Handle query params for tab switching
  useEffect(() => {
    const tab = searchParams.get("tab");
    const vouchers = searchParams.get("vouchers");
    if (vouchers) {
      setActiveTab("vouchers");
    } else if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("dashboard");
    }
  }, [searchParams]);

  // Fetch data on mount
  useEffect(() => {
    fetchMyEvents();
    fetchOrganizerStats();
  }, [fetchMyEvents, fetchOrganizerStats]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Loading skeleton
  if (loadingMyEvents || loadingOrganizerStats) {
    return (
      <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter']">
        <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
        <main className="md:ml-64 min-h-screen">
          <div className="pt-24 pb-12 px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-[#1C1B1B] rounded w-48 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
                <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
                <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
                <div className="h-32 bg-[#1C1B1B] rounded-lg"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Render based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "events":
        return renderEventsTab();
      case "vouchers":
        return renderVouchersTab();
      default:
        return renderDashboardTab();
    }
  };

  const renderDashboardTab = () => {
    const stats = organizerStats;
    const totalRevenue = stats?.totalRevenue || 0;
    const ticketsSold = stats?.ticketsSold || 0;
    const totalEvents = stats?.totalEvents || 0;
    const activeEvents = stats?.activeEvents || 0;
    
    // Get active/upcoming events (limit to 5)
    const activeEventsList = myEvents
      .filter(e => !e.isDeleted)
      .slice(0, 5);

    return (
      <>
        {/* Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="md:col-span-2 p-6 bg-[#1C1B1B] rounded-lg flex flex-col justify-between border border-[#464555]/10">
            <div>
              <span className="uppercase tracking-widest text-[#C7C4D8] font-medium text-xs">
                Total Revenue (MTD)
              </span>
              <h3 className="text-4xl font-bold tracking-tight mt-2">
                ${totalRevenue.toLocaleString()}
              </h3>
            </div>
            <div className="flex items-end justify-between mt-8">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-[#C0C1FF]/10 text-[#C0C1FF] rounded-lg font-bold">
                  {totalEvents} Events
                </span>
                <span className="text-xs text-[#C7C4D8]">total</span>
              </div>
              {stats?.monthlyStats && stats.monthlyStats.length > 0 && (
                <div className="flex items-baseline gap-1 h-12">
                  {stats.monthlyStats.slice(-7).map((m, i) => {
                    const height = Math.min((m.revenue / (stats.monthlyStats?.[0]?.revenue || 1)) * 100, 100);
                    return (
                      <div
                        key={i}
                        className="w-1.5 bg-[#C0C1FF] rounded-full"
                        style={{ height: `${Math.max(height, 10)}px`, opacity: 0.2 + i * 0.1 }}
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
            trend={`${activeEvents} active`}
            icon="confirmation_number"
            iconColor="#C3C0FF"
          />
          <StatCard
            label="Total Events"
            value={totalEvents.toString()}
            trend={`${stats?.completedEvents || 0} completed`}
            icon="event"
            iconColor="#FFB695"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Charts & Lists */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Chart */}
            {stats?.monthlyStats && stats.monthlyStats.length > 0 ? (
              <div className="bg-[#1C1B1B] rounded-lg p-8 h-[400px] flex flex-col border border-[#464555]/10">
                <div className="flex items-center justify-between mb-8">
                  <h4 className="text-lg font-bold tracking-tight">
                    Revenue Stream
                  </h4>
                  <div className="flex gap-2">
                    {["7D", "30D", "12M"].map((t) => (
                      <button
                        key={t}
                        className={`px-3 py-1 text-xs rounded-lg border border-[#464555]/10 ${t === "30D" ? "bg-[#C0C1FF] text-[#07006C] font-bold" : "bg-[#353534]"}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 flex items-end gap-3 px-4 pb-8">
                  {(stats.monthlyStats || []).slice(-7).map((m, i) => {
                    const maxRevenue = Math.max(...(stats.monthlyStats?.map(s => s.revenue) || [1]));
                    const height = (m.revenue / maxRevenue) * 100;
                    return (
                      <div
                        key={i}
                        className={`flex-1 rounded-t-lg transition-all relative group ${i === (stats.monthlyStats?.length || 0) - 1 ? "bg-[#C0C1FF] shadow-[0_0_20px_rgba(192,193,255,0.2)]" : "bg-[#4B4DD8]/30"}`}
                        style={{ height: `${Math.max(height, 10)}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#353534] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          ${(m.revenue / 1000).toFixed(1)}k
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between px-4 pt-4 border-t border-[#464555]/10 text-[10px] text-[#C7C4D8] font-medium uppercase tracking-widest">
                  {(stats.monthlyStats || []).slice(-7).map((m, i) => (
                    <span key={i}>{m.month}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-[#1C1B1B] rounded-lg p-8 h-[400px] flex flex-col border border-[#464555]/10 items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-[#353534] mb-4">
                  bar_chart
                </span>
                <p className="text-[#C7C4D8]">No revenue data yet</p>
                <p className="text-xs text-[#666] mt-2">Create events to start tracking revenue</p>
              </div>
            )}

            {/* Events List */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-bold tracking-tight">
                  Active Events
                </h4>
                <button 
                  onClick={() => setActiveTab("events")}
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
                      date={`${formatDate(event.startDate)} - ${formatDate(event.endDate)}`}
                      location={event.location}
                      sold={event.totalSeats - event.availableSeats}
                      capacity={event.totalSeats}
                      status={getEventStatus(event)}
                      image={event.imageUrl || ""}
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

          {/* Right Sidebar Widgets */}
          <div className="space-y-8">
            {/* Recent Activity */}
            <div className="bg-[#1C1B1B] rounded-lg p-6 border border-[#464555]/10">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#C7C4D8] mb-6">
                Quick Stats
              </h4>
              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C0C1FF]"></div>
                  <div>
                    <p className="text-sm leading-snug">{activeEvents} active events</p>
                    <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">Currently running</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#C3C0FF]"></div>
                  <div>
                    <p className="text-sm leading-snug">{myEvents.filter(e => !e.isDeleted).length} total events</p>
                    <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">All time</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0 bg-[#FFB695]"></div>
                  <div>
                    <p className="text-sm leading-snug">${totalRevenue.toLocaleString()} revenue</p>
                    <p className="text-[10px] text-[#C7C4D8] mt-1 uppercase">Month to date</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
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
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Create Event
                </button>
                <button
                  onClick={() => navigate("/transactions/organizer")}
                  className="w-full bg-[#353534] hover:bg-[#393939] px-4 py-3 text-sm font-medium rounded transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  View Transactions
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderEventsTab = () => {
    const allEvents = myEvents.filter(e => !e.isDeleted);
    
    return (
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">My Events</h2>
          <button
            onClick={() => navigate("/events/create")}
            className="bg-[#4B4DD8] hover:bg-[#3a3cb3] text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </button>
        </div>
        
        {allEvents.length > 0 ? (
          <div className="space-y-4">
            {allEvents.map((event) => (
              <EventItem
                key={event.id}
                id={event.id}
                title={event.name}
                date={`${formatDate(event.startDate)} - ${formatDate(event.endDate)}`}
                location={event.location}
                sold={event.totalSeats - event.availableSeats}
                capacity={event.totalSeats}
                status={getEventStatus(event)}
                image={event.imageUrl || ""}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#1C1B1B] rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-8xl text-[#353534] mb-4">
              event
            </span>
            <p className="text-xl text-[#C7C4D8] mb-2">No events yet</p>
            <p className="text-[#666] mb-6">Create your first event to get started</p>
            <button
              onClick={() => navigate("/events/create")}
              className="bg-[#4B4DD8] hover:bg-[#3a3cb3] text-white px-6 py-3 rounded-lg font-medium inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add</span>
              Create Event
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderVouchersTab = () => {
    return (
      <div className="bg-[#1C1B1B] rounded-lg p-12 text-center">
        <span className="material-symbols-outlined text-8xl text-[#353534] mb-4">
          local_offer
        </span>
        <p className="text-xl text-[#C7C4D8] mb-2">Vouchers Coming Soon</p>
        <p className="text-[#666] mb-6">Create and manage promotional vouchers for your events</p>
      </div>
    );
  };

  return (
    <div className="bg-[#131313] text-[#E5E2E1] antialiased min-h-screen font-['Inter'] selection:bg-[#4B4DD8] selection:text-[#D9D8FF]">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Area */}
      <main className="md:ml-64 min-h-screen">
        {/* Header */}
        <div className="pt-20 pb-4 px-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "events" && "My Events"}
                {activeTab === "vouchers" && "Vouchers"}
              </h1>
              <p className="text-sm text-[#C7C4D8] mt-1">
                Welcome back, {user?.fullName || "Organizer"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="pt-4 pb-12 px-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}