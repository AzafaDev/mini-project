import { FALLBACK_IMAGES } from "../lib/constants";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { formatIDR, formatDate } from "../lib/formatters";
import type { Transaction } from "../services/api";

// --- Sub-komponen: Stat Card ---
type StatCardProps = {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  colorClass?: string;
  border?: string;
};

const StatCard = ({
  icon,
  label,
  value,
  subtext,
  colorClass = "text-primary",
  border = "",
}: StatCardProps) => (
  <div
    className={`bg-dark-surface p-4 sm:p-6 rounded-xl flex flex-col justify-between ${border}`}
  >
    <div>
      <span className={`material-symbols-outlined ${colorClass} mb-3`}>
        {icon}
      </span>
      <h3 className="text-[10px] uppercase tracking-widest text-text-muted mb-1">
        {label}
      </h3>
      <p className="text-2xl sm:text-3xl font-bold">{value}</p>
    </div>
    <p
      className={`text-xs mt-3 ${colorClass === "text-tertiary" ? "text-tertiary" : "text-text-muted"}`}
    >
      {subtext}
    </p>
  </div>
);

// --- Sub-komponen: Ticket Card ---
type TicketCardProps = {
  status: string;
  eventId: string;
  transactionId: string;
  title: string;
  date: string;
  location: string;
  price: string;
  image: string;
  orderId: string;
  isPast: boolean;
  isPending: boolean;
};

const TicketCard = ({
  status,
  eventId,
  transactionId,
  title,
  date,
  location,
  price,
  image,
  orderId,
  isPast,
  isPending,
}: TicketCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/transactions/${transactionId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${
        isPast
          ? "bg-dark-darker/50 border border-border-muted/10 opacity-60 hover:opacity-100"
          : isPending
            ? "bg-dark-elevated shadow-2xl shadow-black/20"
            : "bg-dark-surface"
      } rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300`}
    >
      {/* Image section */}
      <div className="md:w-48 h-40 md:h-auto relative overflow-hidden flex-shrink-0">
        <img
          className={`w-full h-full object-cover transition-all duration-500 ${
            isPast ? "grayscale" : "group-hover:scale-110"
          }`}
          src={image}
          alt={title}
        />
        <div className="absolute top-3 left-3">
          <span
            className={`px-2 py-1 rounded-full text-[10px] font-bold backdrop-blur-md border ${
              isPending
                ? "bg-warning-dark/30 text-warning border-warning-dark/50"
                : isPast
                  ? "bg-dark-card-hover text-text-muted border-transparent"
                  : "bg-primary/10 text-primary border-primary/20"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      {/* Content section */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between min-w-0">
        {/* Top row: event info + price */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <Link
              to={`/events/${eventId}`}
              className={`text-lg sm:text-xl font-bold tracking-tight mb-1 hover:text-primary transition-colors ${
                isPast ? "text-text-muted" : "text-text-light"
              }`}
            >
              {title}
            </Link>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-text-muted text-xs sm:text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  calendar_month
                </span>
                {date}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>
                {location}
              </span>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[10px] text-text-muted mb-1">{orderId}</p>
            <p
              className={`text-lg sm:text-xl font-black ${
                isPending ? "text-warning" : "text-primary"
              }`}
            >
              {price}
            </p>
          </div>
        </div>

        {/* Bottom row: warning or avatar stack + buttons */}
        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isPending ? (
            <div className="flex items-center gap-3 text-sm text-warning">
              <span className="material-symbols-outlined">info</span>
              <span>Proof of payment must be uploaded within 24 hours.</span>
            </div>
          ) : (
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-dark bg-dark-card overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDn-FArK1l_5_YNPDgqyu5sb-Pj7e2E1m5c8DmnXy8_LJgVnD4KPXYhIiWXtT-C1Ps2Gsl4EQEgttumnFqV1fkgcXSmsUYqclTIXvI5Ou-UXlNAXhXewRwBN3MlZ5IC5ZcnOajF_ah6UT38AHme79MpmXvsal-rHAfZaDlD9j-5tamGTeImlxyPplFgpYeWYf_VgGOgLSLK4PsYc-bjSRdlVFtuhUkxm2iBi9w6D7oQGtb_Q2dM2Nxn30uWQ1_AWo8kipJ44f_YibL"
                  alt="User"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-dark bg-primary text-primary-darker text-[10px] flex items-center justify-center font-bold">
                +1
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleViewDetails}
              className="bg-dark-card text-text-light py-2 px-6 rounded-lg font-bold hover:bg-dark-card-hover transition-all text-sm min-h-[44px]"
            >
              View Details
            </button>
            {isPending && (
              <button className="py-2 px-6 rounded-lg font-bold transition-all flex items-center gap-2 text-sm bg-gradient-to-br from-warning to-warning-dark text-[#351000]">
                <span className="material-symbols-outlined text-sm">
                  upload
                </span>
                Upload Proof
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// --- Komponen Utama ---
export const MyTickets = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { transactions, fetchMyTransactions, pagination, loading, error } =
    useTransactionStore();

  const [activeTab, setActiveTab] = useState<"upcoming" | "pending" | "past">(
    "upcoming",
  );

  // Fetch transactions on mount
  useEffect(() => {
    fetchMyTransactions(1, 20);
  }, [fetchMyTransactions]);

  const now = new Date();

  // Compute stats
  const upcomingCount = transactions.filter((tx) => {
    const eventDate = tx.event?.startDate ? new Date(tx.event.startDate) : null;
    const isFuture = eventDate ? eventDate >= now : false;
    return (
      (tx.status === "DONE" || tx.status === "WAITING_CONFIRMATION") && isFuture
    );
  }).length;

  const pendingCount = transactions.filter(
    (tx) => tx.status === "WAITING_PAYMENT",
  ).length;

  const pastCount = transactions.filter((tx) => {
    const eventDate = tx.event?.startDate ? new Date(tx.event.startDate) : null;
    const isPast = eventDate ? eventDate < now : false;
    return isPast;
  }).length;

  // Next upcoming event for stats subtext
  const upcomingTransactions = transactions
    .filter((tx) => {
      const eventDate = tx.event?.startDate
        ? new Date(tx.event.startDate)
        : null;
      const isFuture = eventDate ? eventDate >= now : false;
      return (
        (tx.status === "DONE" || tx.status === "WAITING_CONFIRMATION") &&
        isFuture
      );
    })
    .sort(
      (a, b) =>
        new Date(a.event?.startDate || 0).getTime() -
        new Date(b.event?.startDate || 0).getTime(),
    );
  const nextUpcoming = upcomingTransactions[0];

  const getTicketCardProps = (tx: Transaction) => {
    const eventStart = tx.event?.startDate
      ? new Date(tx.event.startDate)
      : null;
    const isPast = eventStart ? eventStart < now : false;

    let statusDisplay = "";
    let priceDisplay = "";
    let orderIdDisplay = "";

    switch (tx.status) {
      case "WAITING_PAYMENT":
        statusDisplay = "Pending Payment";
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Order #${tx.id.slice(0, 8).toUpperCase()}`;
        break;
      case "WAITING_CONFIRMATION":
        statusDisplay = "Confirmed";
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Ticket #${tx.id.slice(0, 8).toUpperCase()}`;
        break;
      case "DONE":
        if (isPast) {
          statusDisplay = "Past Event";
        } else {
          statusDisplay = "Confirmed";
        }
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Ticket #${tx.id.slice(0, 8).toUpperCase()}`;
        break;
      case "REJECTED":
        statusDisplay = "Rejected";
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Order #${tx.id.slice(0, 8).toUpperCase()}`;
        break;
      case "EXPIRED":
        statusDisplay = "Expired";
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Order #${tx.id.slice(0, 8).toUpperCase()}`;
        break;
      case "CANCELED":
        statusDisplay = "Canceled";
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Order #${tx.id.slice(0, 8).toUpperCase()}`;
        break;
      default:
        statusDisplay = "Unknown";
        priceDisplay = formatIDR(tx.finalPrice);
        orderIdDisplay = `Order #${tx.id.slice(0, 8).toUpperCase()}`;
    }

    return {
      status: statusDisplay,
      eventId: tx.event?.id || "",
      transactionId: tx.id,
      title: tx.event?.name || "Unknown Event",
      date: tx.event?.startDate ? formatDate(tx.event.startDate) : "",
      location: tx.event?.location || "Location TBD",
      price: priceDisplay,
      image: tx.event?.imageUrl || FALLBACK_IMAGES.EMPTY_STATE,
      orderId: orderIdDisplay,
      isPast,
      isPending: tx.status === "WAITING_PAYMENT",
    };
  };

  const getNextEventText = () => {
    if (!nextUpcoming) return "No upcoming events";
    const dateStr = nextUpcoming.event?.startDate
      ? formatDate(nextUpcoming.event.startDate)
      : "";
    return `Next: ${nextUpcoming.event?.name || "Unknown Event"} (${dateStr})`;
  };

  // Filter displayed tickets based on activeTab
  const filteredTransactions = transactions.filter((tx) => {
    const eventDate = tx.event?.startDate ? new Date(tx.event.startDate) : null;
    const isPast = eventDate ? eventDate < now : false;
    const isPending = tx.status === "WAITING_PAYMENT";
    const isUpcoming = !isPending && !isPast;

    if (activeTab === "upcoming") return isUpcoming;
    if (activeTab === "pending") return isPending;
    if (activeTab === "past") return isPast;
    return true;
  });

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light font-sans selection:bg-primary/30">
      <main className="pb-12 px-4 sm:px-6 md:px-12 max-w-7xl mx-auto">
        <section className="mb-8 sm:mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter mb-3 sm:mb-4"
          >
            My Tickets
          </motion.h1>
          <p className="text-text-muted max-w-2xl leading-relaxed text-sm sm:text-base">
            Manage your event registrations, access your digital passes, and
            finalize pending payments for upcoming experiences.
          </p>
        </section>

        {/* Bento Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <StatCard
            icon="confirmation_number"
            label="Upcoming"
            value={`${upcomingCount} Events`}
            subtext={getNextEventText()}
          />
          <StatCard
            icon="pending_actions"
            label="Action Required"
            value={`${pendingCount} Pending`}
            subtext="Upload payment proof for VIP access"
            colorClass="text-tertiary"
            border="border-l-4 border-warning"
          />
          <StatCard
            icon="history"
            label="Archived"
            value={`${pastCount} Past`}
            subtext="2023 Season Summary available"
            colorClass="text-text-tertiary"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8 border-b border-border-muted/20 overflow-x-auto">
          <button
            className={`pb-3 sm:pb-4 whitespace-nowrap ${activeTab === "upcoming" ? "text-primary border-b-2 border-primary font-bold" : "text-text-muted hover:text-white transition-colors"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`pb-3 sm:pb-4 whitespace-nowrap ${activeTab === "pending" ? "text-primary border-b-2 border-primary font-bold" : "text-text-muted hover:text-white transition-colors"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Payment
          </button>
          <button
            className={`pb-3 sm:pb-4 whitespace-nowrap ${activeTab === "past" ? "text-primary border-b-2 border-primary font-bold" : "text-text-muted hover:text-white transition-colors"}`}
            onClick={() => setActiveTab("past")}
          >
            Past
          </button>
        </div>

        {/* Ticket List */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-6 mb-6">
            <p className="text-error-light">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {filteredTransactions.map((tx) => {
            const props = getTicketCardProps(tx);
            return <TicketCard key={tx.id} {...props} />;
          })}
        </div>

        {filteredTransactions.length === 0 && !loading && (
          <div className="bg-dark-surface rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
              confirmation_number
            </span>
            <h2 className="text-2xl font-bold text-text-light mb-2">
              No tickets found
            </h2>
            <p className="text-text-muted">
              {activeTab === "upcoming"
                ? "You don't have any upcoming events."
                : activeTab === "pending"
                  ? "You don't have any pending payments."
                  : "You haven't attended any events yet."}
            </p>
          </div>
        )}

        {/* Help Center */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-dark-surface to-dark-darker border border-border-muted/10 text-center">
          <h3 className="text-xl font-bold mb-2">
            Need help with your tickets?
          </h3>
          <p className="text-text-muted mb-6 text-sm">
            Our support team is available 24/7 for order inquiries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-2 rounded-lg bg-dark-card hover:bg-dark-card-hover font-bold text-sm transition-all">
              Visit Help Center
            </button>
            <button className="px-6 py-2 rounded-lg border border-primary/20 text-primary hover:bg-primary/5 font-bold text-sm transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyTickets;
