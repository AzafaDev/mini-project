import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import { type TransactionStatus } from "../services/api";

type FilterStatus = "ALL" | TransactionStatus;

interface TransactionsPageProps {
  eventId?: string;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({ eventId }) => {
  const navigate = useNavigate();
  
  const { 
    transactions, 
    fetchOrganizerTransactions,
    fetchEventTransactions,
    pagination,
    acceptTransaction,
    rejectTransaction,
    loading,
    error,
  } = useTransactionStore();
  
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  // Filter state
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOrganizer = user?.role === "ORGANIZER";

  // Fetch transactions on mount
  useEffect(() => {
    if (!isOrganizer) {
      navigate("/");
      return;
    }
    
    if (eventId) {
      fetchEventTransactions(eventId, pagination.page, 20);
    } else {
      fetchOrganizerTransactions(pagination.page, 20);
    }
  }, [pagination.page, eventId]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Status filter
      if (filter !== "ALL" && txn.status !== filter) return false;
      
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = txn.user?.fullName?.toLowerCase().includes(query);
        const matchesEmail = txn.user?.email?.toLowerCase().includes(query);
        const matchesEvent = txn.event?.name?.toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesEvent) return false;
      }
      
      return true;
    });
  }, [transactions, filter, searchQuery]);

  // Calculate stats from filtered transactions
  const stats = useMemo(() => {
    const total = transactions.length;
    const waitingPayment = transactions.filter(t => t.status === "WAITING_PAYMENT").length;
    const waitingConfirmation = transactions.filter(t => t.status === "WAITING_CONFIRMATION").length;
    const done = transactions.filter(t => t.status === "DONE").length;
    const rejected = transactions.filter(t => t.status === "REJECTED" || t.status === "CANCELED").length;
    const totalRevenue = transactions
      .filter(t => t.status === "DONE")
      .reduce((sum, t) => sum + t.finalPrice, 0);
    
    return { total, waitingPayment, waitingConfirmation, done, rejected, totalRevenue };
  }, [transactions]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp ");
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) {
      return "-";
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return "-";
    }
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusConfig = (status: TransactionStatus) => {
    const configs: Record<TransactionStatus, { label: string; color: string; bgColor: string; icon: string }> = {
      WAITING_PAYMENT: {
        label: "Waiting Payment",
        color: "text-[#a44100]",
        bgColor: "bg-[#ffdbcc]/10 border-[#a44100]/20",
        icon: "schedule",
      },
      WAITING_CONFIRMATION: {
        label: "Proof Uploaded",
        color: "text-[#ffb695]",
        bgColor: "bg-[#ffdbcc]/20 border-none",
        icon: "receipt_long",
      },
      DONE: {
        label: "Confirmed",
        color: "text-[#c0c1ff]",
        bgColor: "bg-[#c0c1ff]/10 border-[#4b4dd8]/20",
        icon: "check_circle",
      },
      REJECTED: {
        label: "Rejected",
        color: "text-[#ffb4ab]",
        bgColor: "bg-[#ffb4ab]/10 border-[#93000a]/20",
        icon: "cancel",
      },
      EXPIRED: {
        label: "Expired",
        color: "text-[#666]",
        bgColor: "bg-[#666]/10 border-[#666]/20",
        icon: "timer_off",
      },
      CANCELED: {
        label: "Canceled",
        color: "text-[#666]",
        bgColor: "bg-[#666]/10 border-[#666]/20",
        icon: "not_interested",
      },
    };
    return configs[status] || configs.WAITING_PAYMENT;
  };

  const handleAccept = async (id: string) => {
    setIsSubmitting(true);
    const success = await acceptTransaction(id);
    setIsSubmitting(false);
    
    if (success) {
      addToast("success", "Transaction approved!");
    } else {
      addToast("error", "Failed to approve transaction");
    }
  };

  const handleReject = async () => {
    if (!selectedTransactionId) return;
    setIsSubmitting(true);
    const success = await rejectTransaction(selectedTransactionId, rejectReason);
    setIsSubmitting(false);
    
    if (success) {
      addToast("success", "Transaction rejected");
      setIsRejectModalOpen(false);
      setRejectReason("");
      setSelectedTransactionId(null);
    } else {
      addToast("error", "Failed to reject transaction");
    }
  };

  const openProofModal = (id: string) => {
    setSelectedTransactionId(id);
    setIsProofModalOpen(true);
  };

  const openRejectModal = (id: string) => {
    setSelectedTransactionId(id);
    setIsRejectModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      if (eventId) {
        fetchEventTransactions(eventId, newPage, 20);
      } else {
        fetchOrganizerTransactions(newPage, 20);
      }
    }
  };

  if (!isOrganizer) {
    return null;
  }

  return (
    <div className="bg-[#131313] text-[#e5e2e1] font-sans min-h-screen selection:bg-[#c0c1ff]/30">
      {/* SideNavBar - Organizer specific */}
      <aside className="h-screen w-64 fixed left-0 top-16 bg-[#1C1B1B] flex flex-col py-6 px-4 gap-2 z-40 hidden md:flex">
        <div className="mt-16 mb-8 px-2">
          <h2 className="text-lg font-black text-[#E5E2E1]">
            Organizer Studio
          </h2>
          <p className="text-xs text-[#c7c4d8] uppercase tracking-widest mt-1">
            Premium Tier
          </p>
        </div>
        <div className="flex flex-col gap-1 flex-grow">
          <Link to="/dashboard" className="flex items-center gap-3 py-3 px-4 rounded-lg transition-all text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]">
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link to="/events" className="flex items-center gap-3 py-3 px-4 rounded-lg transition-all text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]">
            <span className="material-symbols-outlined">event</span>
            <span className="text-sm">Events</span>
          </Link>
          <Link to="/transactions" className="flex items-center gap-3 py-3 px-4 rounded-lg transition-all active:translate-x-1 duration-150 bg-[#2A2A2A] text-[#C0C1FF] font-semibold border-r-4 border-[#C0C1FF]">
            <span className="material-symbols-outlined">group</span>
            <span className="text-sm">Registrations</span>
          </Link>
          <Link to="/analytics" className="flex items-center gap-3 py-3 px-4 rounded-lg transition-all text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]">
            <span className="material-symbols-outlined">insights</span>
            <span className="text-sm">Analytics</span>
          </Link>
        </div>
        <div className="pt-4 border-t border-white/5 flex flex-col gap-1">
          <button className="flex items-center gap-3 py-2 px-4 text-[#C7C4D8] hover:text-[#E5E2E1] transition-all rounded-lg">
            <span className="material-symbols-outlined">help</span>
            <span className="text-sm">Help Center</span>
          </button>
          <button className="flex items-center gap-3 py-2 px-4 text-[#ffb4ab]/80 hover:text-[#ffb4ab] transition-all rounded-lg">
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 pt-24 pb-12 px-6 md:px-12">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-[#e5e2e1] mb-2">
              Manage Transactions
            </h1>
            <p className="text-[#c7c4d8] text-lg">
              Verify payments for{" "}
              <span className="text-[#c0c1ff] font-semibold">
                {eventId ? "selected event" : "all events"}
              </span>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#666]">
                search
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#2a2a2a] pl-10 pr-4 py-2.5 rounded-lg text-[#e5e2e1] placeholder-[#666] focus:outline-none focus:ring-2 focus:ring-[#c0c1ff]"
              />
            </div>
          </div>
        </header>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-[#1C1B1B] p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-[#c7c4d8] text-xs uppercase tracking-widest mb-2">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-[#e5e2e1]">
              {formatIDR(stats.totalRevenue)}
            </h3>
          </div>
          <div className="bg-[#1C1B1B] p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-[#c7c4d8] text-xs uppercase tracking-widest mb-2">
              Waiting Payment
            </p>
            <h3 className="text-2xl font-bold text-[#ffb695]">
              {stats.waitingPayment}
            </h3>
          </div>
          <div className="bg-[#1C1B1B] p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-[#c7c4d8] text-xs uppercase tracking-widest mb-2">
              Pending Confirmation
            </p>
            <h3 className="text-2xl font-bold text-[#c0c1ff]">
              {stats.waitingConfirmation}
            </h3>
          </div>
          <div className="bg-[#1C1B1B] p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-[#c7c4d8] text-xs uppercase tracking-widest mb-2">
              Confirmed
            </p>
            <h3 className="text-2xl font-bold text-[#c0c1ff]">
              {stats.done}
            </h3>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "ALL"
                ? "bg-[#c0c1ff] text-[#07006c]"
                : "bg-[#1c1b1b] text-[#c7c4d8] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter("WAITING_PAYMENT")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "WAITING_PAYMENT"
                ? "bg-[#ffb695] text-[#a44100]"
                : "bg-[#1c1b1b] text-[#c7c4d8] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
            }`}
          >
            Waiting Payment ({stats.waitingPayment})
          </button>
          <button
            onClick={() => setFilter("WAITING_CONFIRMATION")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "WAITING_CONFIRMATION"
                ? "bg-[#ffb695] text-[#a44100]"
                : "bg-[#1c1b1b] text-[#c7c4d8] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
            }`}
          >
            Waiting Confirmation ({stats.waitingConfirmation})
          </button>
          <button
            onClick={() => setFilter("DONE")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "DONE"
                ? "bg-[#c0c1ff] text-[#07006c]"
                : "bg-[#1c1b1b] text-[#c7c4d8] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
            }`}
          >
            Confirmed ({stats.done})
          </button>
        </div>

        {/* Table Area */}
        <div className="bg-[#1C1B1B] rounded-xl overflow-hidden shadow-xl">
          {error && (
            <div className="p-6 bg-[#93000a]/10 border border-[#93000a]/30">
              <p className="text-[#ffb4ab]">{error}</p>
            </div>
          )}
          
          {filteredTransactions.length === 0 && !loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-[#666] mb-4">
                receipt_long
              </span>
              <h2 className="text-2xl font-bold text-[#e5e2e1] mb-2">
                No transactions found
              </h2>
              <p className="text-[#c7c4d8]">
                {searchQuery || filter !== "ALL"
                  ? "Try adjusting your filters"
                  : "No transactions yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#2a2a2a]/50 text-[#c7c4d8] text-xs uppercase tracking-widest">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Transaction ID</th>
                      <th className="px-6 py-4 font-semibold">Customer</th>
                      <th className="px-6 py-4 font-semibold">Event</th>
                      <th className="px-6 py-4 font-semibold">Amount</th>
                      <th className="px-6 py-4 font-semibold">Status</th>
                      <th className="px-6 py-4 font-semibold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredTransactions.map((txn) => {
                      const statusConfig = getStatusConfig(txn.status);
                      return (
                        <tr
                          key={txn.id}
                          className={`hover:bg-[#2a2a2a] transition-colors ${
                            txn.status === "WAITING_CONFIRMATION" ? "border-l-4 border-[#ffb695]" : ""
                          }`}
                        >
                          <td className="px-6 py-5 font-mono text-xs text-[#c0c1ff]">
                            {txn.id}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-[#353534] flex items-center justify-center overflow-hidden">
                                {txn.user?.profilePicture ? (
                                  <img
                                    alt={txn.user.fullName}
                                    src={txn.user.profilePicture}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">
                                    person
                                  </span>
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#e5e2e1]">
                                  {txn.user?.fullName || "Unknown"}
                                </p>
                                <p className="text-xs text-[#c7c4d8]">
                                  {txn.user?.email || ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <p className="text-sm text-[#c7c4d8]">
                              {txn.event?.name}
                            </p>
                            <p className="text-xs text-[#666]">
                              {txn.ticket?.name} x{txn.quantity}
                            </p>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-[#e5e2e1]">
                            {formatIDR(txn.finalPrice)}
                          </td>
                          <td className="px-6 py-5">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig.bgColor} ${statusConfig.color}`}
                            >
                              {statusConfig.icon === "schedule" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb695] animate-pulse"></span>
                              )}
                              {statusConfig.icon === "receipt_long" && (
                                <span className="material-symbols-outlined text-[12px]">
                                  receipt_long
                                </span>
                              )}
                              {statusConfig.icon === "check_circle" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]"></span>
                              )}
                              {statusConfig.icon === "cancel" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
                              )}
                              {statusConfig.label}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {txn.status === "WAITING_CONFIRMATION" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleAccept(txn.id)}
                                  disabled={isSubmitting}
                                  className="bg-[#c0c1ff] text-[#07006c] px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:brightness-110 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openProofModal(txn.id)}
                                  className="bg-[#2a2a2a] text-[#c7c4d8] px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-[#393939]"
                                >
                                  View Proof
                                </button>
                              </div>
                            ) : txn.status === "WAITING_PAYMENT" ? (
                              <span className="text-[#c7c4d8] italic text-xs">
                                Awaiting payment
                              </span>
                            ) : (
                              <span className="text-[#c7c4d8] italic text-xs">
                                {formatDate(txn.updatedAt)}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between bg-[#0e0e0e]/50 border-t border-white/5">
                  <p className="text-xs text-[#c7c4d8] uppercase tracking-wider">
                    Showing {(pagination.page - 1) * 20 + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold ${
                            pagination.page === pageNum
                              ? "bg-[#c0c1ff] text-[#07006c]"
                              : "bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1] disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Payment Proof Modal */}
      {isProofModalOpen && selectedTransactionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsProofModalOpen(false)}
          />
          <div className="relative bg-[#1c1b1b] p-6 rounded-xl border border-white/10 w-full max-w-2xl">
            <button
              onClick={() => setIsProofModalOpen(false)}
              className="absolute top-4 right-4 text-[#c7c4d8] hover:text-[#e5e2e1]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-6">
              Payment Proof
            </h3>
            <div className="bg-[#0e0e0e] rounded-lg p-4 min-h-[300px] flex items-center justify-center">
              {transactions.find(t => t.id === selectedTransactionId)?.paymentProof ? (
                <img 
                  src={transactions.find(t => t.id === selectedTransactionId)?.paymentProof} 
                  alt="Payment Proof"
                  className="max-w-full max-h-[500px] rounded-lg"
                />
              ) : (
                <p className="text-[#666]">No payment proof uploaded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsRejectModalOpen(false)}
          />
          <div className="relative bg-[#1c1b1b] p-6 rounded-xl border border-white/10 w-full max-w-md">
            <button
              onClick={() => setIsRejectModalOpen(false)}
              className="absolute top-4 right-4 text-[#c7c4d8] hover:text-[#e5e2e1]"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-[#e5e2e1] mb-4">
              Reject Transaction
            </h3>
            <p className="text-[#c7c4d8] mb-4">
              Please provide a reason for rejecting this transaction:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 bg-[#0e0e0e] border border-white/10 rounded-lg px-4 py-3 text-[#e5e2e1] placeholder-[#c7c4d8]/50 focus:outline-none focus:border-[#c0c1ff] resize-none"
            />
            <button
              onClick={handleReject}
              disabled={isSubmitting || !rejectReason.trim()}
              className="w-full mt-4 py-3 bg-[#93000a] text-[#e5e2e1] font-bold rounded-lg hover:bg-[#b30000] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin">sync</span>
              ) : "Reject Transaction"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;