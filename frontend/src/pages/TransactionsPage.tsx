import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTransactionStore } from "../stores/useTransactionStore";
import { useAuthStore } from "../stores/useAuthStore";
import { useToastStore } from "../stores/useToastStore";
import { formatIDR, formatDate } from "../lib/formatters";
import { type TransactionStatus } from "../services/api";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

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
  const [activeTab, setActiveTab] = useState("transactions");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
   const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
   const [isAcceptDialogOpen, setIsAcceptDialogOpen] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch transactions on mount
  useEffect(() => {
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

  const getStatusConfig = (status: TransactionStatus) => {
    const configs: Record<TransactionStatus, { label: string; color: string; bgColor: string; icon: string }> = {
      WAITING_PAYMENT: {
        label: "Waiting Payment",
        color: "text-warning-dark",
        bgColor: "bg-warning-light/10 border-warning-dark/20",
        icon: "schedule",
      },
      WAITING_CONFIRMATION: {
        label: "Proof Uploaded",
        color: "text-warning",
        bgColor: "bg-warning-light/20 border-none",
        icon: "receipt_long",
      },
      DONE: {
        label: "Confirmed",
        color: "text-primary",
        bgColor: "bg-primary/10 border-accent/20",
        icon: "check_circle",
      },
      REJECTED: {
        label: "Rejected",
        color: "text-error-light",
        bgColor: "bg-error-light/10 border-error/20",
        icon: "cancel",
      },
      EXPIRED: {
        label: "Expired",
        color: "text-text-secondary",
        bgColor: "bg-text-secondary/10 border-text-secondary/20",
        icon: "timer_off",
      },
      CANCELED: {
        label: "Canceled",
        color: "text-text-secondary",
        bgColor: "bg-text-secondary/10 border-text-secondary/20",
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
     const success = await rejectTransaction(selectedTransactionId);
     setIsSubmitting(false);
     
     if (success) {
       addToast("success", "Transaction rejected");
       setIsRejectModalOpen(false);
       setSelectedTransactionId(null);
     } else {
       addToast("error", "Failed to reject transaction");
     }
   };

  const openProofModal = (id: string) => {
    setSelectedTransactionId(id);
    setIsProofModalOpen(true);
  };

  const openAcceptDialog = (id: string) => {
    setSelectedTransactionId(id);
    setIsAcceptDialogOpen(true);
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

  return (
    <div className="bg-dark text-text-light font-sans min-h-screen selection:bg-primary/30">

      {/* Main Content */}
      <div className="p-4 md:p-8 md:pt-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-text-light mb-2">
              Manage Transactions
            </h1>
            <p className="text-text-muted text-lg">
              Verify payments for{" "}
              <span className="text-primary font-semibold">
                {eventId ? "selected event" : "all events"}
              </span>
              .
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">
                search
              </span>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-dark-elevated pl-10 pr-4 py-2.5 rounded-lg text-text-light placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </header>

        {/* Stats Bento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-dark-surface p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
              Total Revenue
            </p>
            <h3 className="text-2xl font-bold text-text-light">
              {formatIDR(stats.totalRevenue)}
            </h3>
          </div>
          <div className="bg-dark-surface p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
              Waiting Payment
            </p>
            <h3 className="text-2xl font-bold text-warning">
              {stats.waitingPayment}
            </h3>
          </div>
          <div className="bg-dark-surface p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
              Pending Confirmation
            </p>
            <h3 className="text-2xl font-bold text-primary">
              {stats.waitingConfirmation}
            </h3>
          </div>
          <div className="bg-dark-surface p-6 rounded-xl border border-white/5 shadow-lg">
            <p className="text-text-muted text-xs uppercase tracking-widest mb-2">
              Confirmed
            </p>
            <h3 className="text-2xl font-bold text-primary">
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
                ? "bg-primary text-primary-dark"
                : "bg-dark-surface text-text-muted hover:text-text-light hover:bg-dark-elevated"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilter("WAITING_PAYMENT")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "WAITING_PAYMENT"
                ? "bg-warning text-warning-dark"
                : "bg-dark-surface text-text-muted hover:text-text-light hover:bg-dark-elevated"
            }`}
          >
            Waiting Payment ({stats.waitingPayment})
          </button>
          <button
            onClick={() => setFilter("WAITING_CONFIRMATION")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "WAITING_CONFIRMATION"
                ? "bg-warning text-warning-dark"
                : "bg-dark-surface text-text-muted hover:text-text-light hover:bg-dark-elevated"
            }`}
          >
            Waiting Confirmation ({stats.waitingConfirmation})
          </button>
          <button
            onClick={() => setFilter("DONE")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "DONE"
                ? "bg-primary text-primary-dark"
                : "bg-dark-surface text-text-muted hover:text-text-light hover:bg-dark-elevated"
            }`}
          >
            Confirmed ({stats.done})
          </button>
        </div>

         {/* Table Area */}
        <div className="bg-dark-surface rounded-xl overflow-hidden shadow-xl">
          {error && (
            <div className="p-4 sm:p-6 bg-error/10 border border-error/30">
              <p className="text-error-light">{error}</p>
            </div>
          )}

          {filteredTransactions.length === 0 && !loading ? (
            <div className="p-6 sm:p-12 text-center">
              <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
                receipt_long
              </span>
              <h2 className="text-2xl font-bold text-text-light mb-2">
                No transactions found
              </h2>
              <p className="text-text-muted px-4">
                {searchQuery || filter !== "ALL"
                  ? "Try adjusting your filters"
                  : "No transactions yet"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[640px]">
                  <thead className="bg-dark-elevated/50 text-text-muted text-xs uppercase tracking-widest">
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
                          className={`hover:bg-dark-elevated transition-colors ${
                            txn.status === "WAITING_CONFIRMATION" ? "border-l-4 border-warning" : ""
                          }`}
                        >
                          <td className="px-6 py-5 font-mono text-xs text-primary">
                            {txn.id}
                          </td>
                           <td className="px-6 py-5">
                             <div>
                               <p className="text-sm font-semibold text-text-light">
                                 {txn.user?.fullName || "Unknown"}
                               </p>
                               <p className="text-xs text-text-muted">
                                 {txn.user?.email || ""}
                               </p>
                             </div>
                           </td>
                          <td className="px-6 py-5">
                            <p className="text-sm text-text-muted">
                              {txn.event?.name}
                            </p>
                             <p className="text-xs text-text-secondary">
                               Qty: {txn.quantity}
                             </p>
                          </td>
                          <td className="px-6 py-5 text-sm font-bold text-text-light">
                            {formatIDR(txn.finalPrice)}
                          </td>
                          <td className="px-6 py-5">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${statusConfig.bgColor} ${statusConfig.color}`}
                            >
                              {statusConfig.icon === "schedule" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
                              )}
                              {statusConfig.icon === "receipt_long" && (
                                <span className="material-symbols-outlined text-[12px]">
                                  receipt_long
                                </span>
                              )}
                              {statusConfig.icon === "check_circle" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              )}
                              {statusConfig.icon === "cancel" && (
                                <span className="w-1.5 h-1.5 rounded-full bg-error-light"></span>
                              )}
                              {statusConfig.label}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {txn.status === "WAITING_CONFIRMATION" ? (
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => openRejectModal(txn.id)}
                                  disabled={isSubmitting}
                                  className="bg-red-500/20 text-red-400 px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-red-500/30 disabled:opacity-50"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => openAcceptDialog(txn.id)}
                                  disabled={isSubmitting}
                                  className="bg-primary text-primary-dark px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:brightness-110 disabled:opacity-50"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openProofModal(txn.id)}
                                  className="bg-dark-elevated text-text-muted px-3 py-1.5 rounded text-[10px] font-bold uppercase hover:bg-dark-card-hover"
                                >
                                  View Proof
                                </button>
                              </div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="px-6 py-4 flex items-center justify-between bg-dark-darker/50 border-t border-white/5">
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    Showing {(pagination.page - 1) * 20 + 1}-{Math.min(pagination.page * 20, pagination.total)} of {pagination.total} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold bg-dark-elevated text-text-muted hover:text-text-light disabled:opacity-30 disabled:cursor-not-allowed"
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
                              ? "bg-primary text-primary-dark"
                              : "bg-dark-elevated text-text-muted hover:text-text-light"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded text-xs font-bold bg-dark-elevated text-text-muted hover:text-text-light disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Payment Proof Modal */}
      {isProofModalOpen && selectedTransactionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsProofModalOpen(false)}
          />
          <div className="relative bg-dark-surface p-6 rounded-xl border border-white/10 w-full max-w-2xl">
            <button
              onClick={() => setIsProofModalOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-text-light"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <h3 className="text-xl font-bold text-text-light mb-6">
              Payment Proof
            </h3>
            <div className="bg-dark-darker rounded-lg p-4 min-h-[300px] flex items-center justify-center">
              {transactions.find(t => t.id === selectedTransactionId)?.paymentProof ? (
                <img 
                  src={transactions.find(t => t.id === selectedTransactionId)?.paymentProof} 
                  alt="Payment Proof"
                  className="max-w-full max-h-[500px] rounded-lg"
                />
              ) : (
                <p className="text-text-secondary">No payment proof uploaded</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Accept Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isAcceptDialogOpen}
        onClose={() => {
          setIsAcceptDialogOpen(false);
          setSelectedTransactionId(null);
        }}
        onConfirm={async () => {
          if (!selectedTransactionId) return;
          await handleAccept(selectedTransactionId);
          setIsAcceptDialogOpen(false);
        }}
        title="Approve Transaction"
        message="Are you sure you want to approve this transaction? The customer will receive their tickets and points will be awarded."
        confirmText="Approve"
        cancelText="Cancel"
      />

       {/* Reject Modal */}
       {isRejectModalOpen && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
           <div
             className="absolute inset-0 bg-black/70 backdrop-blur-sm"
             onClick={() => setIsRejectModalOpen(false)}
           />
           <div className="relative bg-dark-surface p-6 rounded-xl border border-white/10 w-full max-w-md">
             <button
               onClick={() => setIsRejectModalOpen(false)}
               className="absolute top-4 right-4 text-text-muted hover:text-text-light"
             >
               <span className="material-symbols-outlined">close</span>
             </button>
             <h3 className="text-xl font-bold text-text-light mb-4">
               Reject Transaction?
             </h3>
             <p className="text-text-muted mb-6">
               Are you sure you want to reject this transaction? This action cannot be undone.
             </p>
             <div className="flex gap-4">
               <button
                 onClick={() => setIsRejectModalOpen(false)}
                 className="flex-1 py-3 bg-dark-card text-text-light font-bold rounded-lg hover:bg-[#4a4a4a]"
               >
                 Cancel
               </button>
               <button
                 onClick={handleReject}
                 disabled={isSubmitting}
                 className="flex-1 py-3 bg-error text-text-light font-bold rounded-lg hover:bg-error-hover disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isSubmitting ? (
                   <span className="material-symbols-outlined animate-spin">sync</span>
                 ) : "Reject"}
               </button>
             </div>
           </div>
         </div>
        )}
     </div>
   </div>
  );
 };

export default TransactionsPage;