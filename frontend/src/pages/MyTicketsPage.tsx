import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    className={`bg-[#1c1b1b] p-6 rounded-xl flex flex-col justify-between ${border}`}
  >
    <div>
      <span className={`material-symbols-outlined ${colorClass} mb-4`}>
        {icon}
      </span>
      <h3 className="text-[10px] uppercase tracking-widest text-[#c7c4d8] mb-1">
        {label}
      </h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    <p
      className={`text-xs mt-4 ${colorClass === "text-tertiary" ? "text-tertiary" : "text-[#c7c4d8]"}`}
    >
      {subtext}
    </p>
  </div>
);

// --- Sub-komponen: Ticket Card ---
type TicketCardProps = {
  status: string;
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
  title,
  date,
  location,
  price,
  image,
  orderId,
  isPast,
  isPending,
}: TicketCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`${
        isPast
          ? "bg-[#0e0e0e]/50 border border-[#464555]/10 opacity-60 hover:opacity-100"
          : isPending
            ? "bg-[#2a2a2a] shadow-2xl shadow-black/20"
            : "bg-[#1c1b1b]"
      } rounded-xl overflow-hidden flex flex-col md:flex-row group transition-all duration-300`}
    >
      <div className="md:w-64 h-48 md:h-auto relative overflow-hidden">
        <img
          className={`w-full h-full object-cover transition-all duration-500 ${isPast ? "grayscale" : "group-hover:scale-110"}`}
          src={image}
          alt={title}
        />
        <div className="absolute top-4 left-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
              isPending
                ? "bg-[#a44100]/30 text-[#ffb695] border-[#a44100]/50"
                : isPast
                  ? "bg-[#393939] text-[#c7c4d8] border-transparent"
                  : "bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#c0c1ff]/20"
            }`}
          >
            {status}
          </span>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <h2
              className={`text-2xl font-bold tracking-tight mb-1 ${isPast ? "text-[#c7c4d8]" : "text-[#e5e2e1]"}`}
            >
              {title}
            </h2>
            <div className="flex items-center gap-4 text-[#c7c4d8] text-sm">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  calendar_month
                </span>{" "}
                {date}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  location_on
                </span>{" "}
                {location}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#c7c4d8] mb-1">{orderId}</p>
            <p
              className={`text-xl font-black ${isPending ? "text-[#ffb695]" : "text-[#c0c1ff]"}`}
            >
              {price}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {isPending ? (
            <div className="flex items-center gap-3 text-sm text-[#ffb695]">
              <span className="material-symbols-outlined">info</span>
              <span>Proof of payment must be uploaded within 24 hours.</span>
            </div>
          ) : (
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#353534] overflow-hidden">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDDn-FArK1l_5_YNPDgqyu5sb-Pj7e2E1m5c8DmnXy8_LJgVnD4KPXYhIiWXtT-C1Ps2Gsl4EQEgttumnFqV1fkgcXSmsUYqclTIXvI5Ou-UXlNAXhXewRwBN3MlZ5IC5ZcnOajF_ah6UT38AHme79MpmXvsal-rHAfZaDlD9j-5tamGTeImlxyPplFgpYeWYf_VgGOgLSLK4PsYc-bjSRdlVFtuhUkxm2iBi9w6D7oQGtb_Q2dM2Nxn30uWQ1_AWo8kipJ44f_YibL"
                  alt="User"
                />
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-[#131313] bg-[#c0c1ff] text-[#1000a9] text-[10px] flex items-center justify-center font-bold">
                +1
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {isPast ? (
              <button className="text-[#c0c1ff] text-sm font-semibold flex items-center gap-1 hover:underline">
                Download Invoice{" "}
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
              </button>
            ) : (
              <>
                <button className="bg-[#353534] text-[#e5e2e1] py-2 px-6 rounded-lg font-bold hover:bg-[#393939] transition-all text-sm">
                  Details
                </button>
                <button
                  className={`py-2 px-6 rounded-lg font-bold transition-all flex items-center gap-2 text-sm ${
                    isPending
                      ? "bg-gradient-to-br from-[#ffb695] to-[#a44100] text-[#351000]"
                      : "bg-[#c0c1ff] text-[#07006c]"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isPending ? "upload" : "qr_code_2"}
                  </span>
                  {isPending ? "Upload Proof" : "View Pass"}
                </button>
              </>
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
  const { user, isAuthenticated } = useAuthStore();
  const {
    transactions,
    fetchMyTransactions,
    pagination,
    loading,
    error,
  } = useTransactionStore();

  const [activeTab, setActiveTab] = useState<"upcoming" | "pending" | "past">("upcoming");

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      navigate("/login");
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch transactions on mount
  useEffect(() => {
    fetchMyTransactions(1, 20);
  }, [fetchMyTransactions]);

  const now = new Date();

  // Compute stats
  const upcomingCount = transactions.filter((tx) => {
    const eventDate = tx.event?.startDate ? new Date(tx.event.startDate) : null;
    const isFuture = eventDate ? eventDate >= now : false;
    return (tx.status === "DONE" || tx.status === "WAITING_CONFIRMATION") && isFuture;
  }).length;

  const pendingCount = transactions.filter((tx) => tx.status === "WAITING_PAYMENT").length;

  const pastCount = transactions.filter((tx) => {
    const eventDate = tx.event?.startDate ? new Date(tx.event.startDate) : null;
    const isPast = eventDate ? eventDate < now : false;
    return isPast;
  }).length;

  // Next upcoming event for stats subtext
  const upcomingTransactions = transactions
    .filter((tx) => {
      const eventDate = tx.event?.startDate ? new Date(tx.event.startDate) : null;
      const isFuture = eventDate ? eventDate >= now : false;
      return (tx.status === "DONE" || tx.status === "WAITING_CONFIRMATION") && isFuture;
    })
    .sort(
      (a, b) =>
        new Date(a.event?.startDate || 0).getTime() -
        new Date(b.event?.startDate || 0).getTime()
    );
  const nextUpcoming = upcomingTransactions[0];

  const getTicketCardProps = (tx: Transaction) => {
    const eventStart = tx.event?.startDate ? new Date(tx.event.startDate) : null;
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
      title: tx.event?.name || "Unknown Event",
      date: tx.event?.startDate ? formatDate(tx.event.startDate) : "",
      location: tx.event?.location || "Location TBD",
      price: priceDisplay,
      image: tx.event?.imageUrl || "https://via.placeholder.com/300x200?text=No+Image",
      orderId: orderIdDisplay,
      isPast,
      isPending: tx.status === "WAITING_PAYMENT",
    };
  };

  const getNextEventText = () => {
    if (!nextUpcoming) return "No upcoming events";
    const dateStr = nextUpcoming.event?.startDate ? formatDate(nextUpcoming.event.startDate) : "";
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
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#c7c4d8]">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <main className="pt-24 pb-20 px-4 md:px-12 max-w-7xl mx-auto">
        <section className="mb-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-4"
          >
            My Tickets
          </motion.h1>
          <p className="text-[#c7c4d8] max-w-2xl leading-relaxed">
            Manage your event registrations, access your digital passes, and
            finalize pending payments for upcoming experiences.
          </p>
        </section>

        {/* Bento Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
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
            border="border-l-4 border-[#ffb695]"
          />
          <StatCard
            icon="history"
            label="Archived"
            value={`${pastCount} Past`}
            subtext="2023 Season Summary available"
            colorClass="text-[#918fa1]"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-8 border-b border-[#464555]/20">
          <button
            className={`pb-4 ${activeTab === "upcoming" ? "text-[#c0c1ff] border-b-2 border-[#c0c1ff] font-bold" : "text-[#c7c4d8] hover:text-white transition-colors"}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`pb-4 ${activeTab === "pending" ? "text-[#c0c1ff] border-b-2 border-[#c0c1ff] font-bold" : "text-[#c7c4d8] hover:text-white transition-colors"}`}
            onClick={() => setActiveTab("pending")}
          >
            Pending Payment
          </button>
          <button
            className={`pb-4 ${activeTab === "past" ? "text-[#c0c1ff] border-b-2 border-[#c0c1ff] font-bold" : "text-[#c7c4d8] hover:text-white transition-colors"}`}
            onClick={() => setActiveTab("past")}
          >
            Past Events
          </button>
        </div>

        {/* Ticket List */}
        {error && (
          <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-xl p-6 mb-6">
            <p className="text-[#ffb4ab]">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {filteredTransactions.map((tx) => {
            const props = getTicketCardProps(tx);
            return <TicketCard key={tx.id} {...props} />;
          })}
        </div>

        {filteredTransactions.length === 0 && !loading && (
          <div className="bg-[#1c1b1b] rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#666] mb-4">
              confirmation_number
            </span>
            <h2 className="text-2xl font-bold text-[#e5e2e1] mb-2">
              No tickets found
            </h2>
            <p className="text-[#c7c4d8]">
              {activeTab === "upcoming"
                ? "You don't have any upcoming events."
                : activeTab === "pending"
                ? "You don't have any pending payments."
                : "You haven't attended any events yet."}
            </p>
          </div>
        )}

        {/* Help Center */}
        <div className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-[#1c1b1b] to-[#0e0e0e] border border-[#464555]/10 text-center">
          <h3 className="text-xl font-bold mb-2">Need help with your tickets?</h3>
          <p className="text-[#c7c4d8] mb-6 text-sm">
            Our support team is available 24/7 for order inquiries.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="px-6 py-2 rounded-lg bg-[#353534] hover:bg-[#393939] font-bold text-sm transition-all">
              Visit Help Center
            </button>
            <button className="px-6 py-2 rounded-lg border border-[#c0c1ff]/20 text-[#c0c1ff] hover:bg-[#c0c1ff]/5 font-bold text-sm transition-all">
              Contact Support
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyTickets;
