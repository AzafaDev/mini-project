import { FALLBACK_IMAGES } from "../lib/constants";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEventStore } from "../stores/useEventStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import { EventStatsModal } from "../components/dashboard/EventStatsModal";
import { DashboardTab } from "../components/dashboard/DashboardTab";
import { EventsTab } from "../components/dashboard/EventsTab";
import { VouchersTab } from "../components/dashboard/VouchersTab";

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
  <div className="p-6 bg-dark-surface rounded-lg">
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
  onStatsClick,
}: EventItemProps & { onStatsClick?: () => void }) => {
  const navigate = useNavigate();
  const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatsClick) {
      onStatsClick();
    } else {
      navigate(`/events/${id}`);
    }
  };

  const handleViewEvent = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${id}`);
    setShowMenu(false);
  };

  const handleViewAttendees = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/events/${id}/attendees`);
    setShowMenu(false);
  };

  const handleViewStats = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onStatsClick) {
      onStatsClick();
    }
  };

  return (
    <div
      className="bg-dark-surface hover:bg-dark-elevated transition-colors p-4 flex items-center gap-4 group cursor-pointer relative"
      onClick={handleClick}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => setShowMenu(false)}
    >
      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <img
          alt={title}
          className="w-full h-full object-cover"
          src={image || FALLBACK_IMAGES.EVENT_SMALL}
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
        <div className="w-24 bg-dark-card h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-primary h-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="px-3 py-1 bg-[#C3C0FF]/10 text-[#C3C0FF] text-[10px] font-black uppercase rounded border border-[#C3C0FF]/20">
        {status}
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-dark-elevated border border-border-muted/10 rounded-lg shadow-xl py-2 min-w-[160px]">
          <button
            onClick={handleViewEvent}
            className="w-full px-4 py-2 text-left text-sm hover:bg-dark-card flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              visibility
            </span>
            View Event
          </button>
          <button
            onClick={handleViewStats}
            className="w-full px-4 py-2 text-left text-sm hover:bg-dark-card flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              analytics
            </span>
            View Stats
          </button>
          <button
            onClick={handleViewAttendees}
            className="w-full px-4 py-2 text-left text-sm hover:bg-dark-card flex items-center gap-2 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            View Attendees
          </button>
        </div>
      )}
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

// --- Main Dashboard Component ---

export default function OrganizerDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Stats modal state
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  // FIX: Use Zustand selectors to prevent unnecessary re-renders
  // Each field is subscribed individually - only re-render when that specific field changes
  const myEvents = useEventStore((s) => s.myEvents);
  const organizerStats = useEventStore((s) => s.organizerStats);
  const loadingMyEvents = useEventStore((s) => s.loadingMyEvents);
  const loadingOrganizerStats = useEventStore((s) => s.loadingOrganizerStats);
  const fetchMyEvents = useEventStore((s) => s.fetchMyEvents);
  const fetchOrganizerStats = useEventStore((s) => s.fetchOrganizerStats);
  const error = useEventStore((s) => s.error);
  const clearError = useEventStore((s) => s.clearError);

  // Handle query params for tab switching
  // FIX: Extract values SEBELUM useEffect - stable references
  const tab = searchParams.get("tab");
  const hasVouchers = searchParams.has("vouchers");

  useEffect(() => {
    if (hasVouchers) {
      setActiveTab("vouchers");
    } else if (tab) {
      setActiveTab(tab);
    } else {
      setActiveTab("dashboard");
    }
  }, [tab, hasVouchers]); // FIX: Stable - primitive values, bukan object

  // Fetch data on mount
  useEffect(() => {
    fetchMyEvents();
    fetchOrganizerStats(new Date().getFullYear());
  }, [fetchMyEvents, fetchOrganizerStats]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Smart Skeleton: hanya tampilkan skeleton saat initial load (data kosong)
  // Saat update filter (loading tapi data sudah ada), jangan unmount child
  const isInitialLoading = (loadingMyEvents && myEvents.length === 0) || 
                             (loadingOrganizerStats && !organizerStats);

  if (isInitialLoading) {
    return (
      <div className="bg-dark text-text-light antialiased min-h-screen font-['Inter']">
        <div className="p-4 md:p-8 pt-20 md:pt-8">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-surface rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="h-32 bg-dark-surface rounded-lg"></div>
              <div className="h-32 bg-dark-surface rounded-lg"></div>
              <div className="h-32 bg-dark-surface rounded-lg"></div>
              <div className="h-32 bg-dark-surface rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light antialiased min-h-screen font-['Inter'] selection:bg-accent selection:text-[#D9D8FF]">

      {/* Main Area */}
      <div className="pt-16">
        {/* Header */}
        <div className="pt-4 pb-4 px-4 md:px-8 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                {activeTab === "dashboard" && "Dashboard"}
                {activeTab === "events" && "My Events"}
                {activeTab === "vouchers" && "Vouchers"}
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Welcome back, {user?.fullName || "Organizer"}
              </p>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mx-4 md:mx-8 mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-between">
            <p className="text-red-400">{error}</p>
            <button
              onClick={clearError}
              className="text-red-400 hover:text-red-300"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Content */}
        <div className="pt-4 pb-12 px-4 md:px-8">
          {activeTab === "dashboard" && (
            <DashboardTab
              onNavigateToEvents={() => setActiveTab("events")}
              onStatsClick={(event) => {
                setSelectedEvent(event);
                setShowStatsModal(true);
              }}
              stats={organizerStats}
              myEvents={myEvents}
              onTimeRangeChange={(year, month, day) => {
                fetchOrganizerStats(year, month, day);
              }}
            />
          )}
          {activeTab === "events" && (
            <EventsTab
              onStatsClick={(event) => {
                setSelectedEvent(event);
                setShowStatsModal(true);
              }}
            />
          )}
          {activeTab === "vouchers" && <VouchersTab />}
        </div>

        {/* Event Stats Modal */}
        {showStatsModal && selectedEvent && (
          <EventStatsModal
            eventId={selectedEvent.id}
            eventName={selectedEvent.name}
            onClose={() => {
              setShowStatsModal(false);
              setSelectedEvent(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
