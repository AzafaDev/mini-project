import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTransactionStore } from "../stores/useTransactionStore";
import { type Transaction, type TransactionStatus } from "../services/api";

type FilterStatus = "ALL" | TransactionStatus;

const MyTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const { 
    transactions, 
    fetchMyTransactions, 
    pagination,
    loading,
    error,
    clearTransactions 
  } = useTransactionStore();

  // Filter state
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  // Get unique statuses from transactions
  const availableStatuses: FilterStatus[] = [
    "ALL",
    "WAITING_PAYMENT",
    "WAITING_CONFIRMATION",
    "DONE",
    "CANCELED",
    "REJECTED",
  ];

  // Filtered transactions
  const filteredTransactions = transactions.filter((txn) => {
    if (filter === "ALL") return true;
    return txn.status === filter;
  });

  useEffect(() => {
    fetchMyTransactions(pagination.page, 20);
  }, [pagination.page]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(amount)
      .replace("Rp", "Rp ");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const getStatusConfig = (status: TransactionStatus) => {
    const configs: Record<TransactionStatus, { label: string; color: string; bgColor: string; icon: string }> = {
      WAITING_PAYMENT: {
        label: "Waiting Payment",
        color: "text-[#a44100]",
        bgColor: "bg-[#ffdbcc]/10",
        icon: "schedule",
      },
      WAITING_CONFIRMATION: {
        label: "Waiting Confirmation",
        color: "text-[#ffb695]",
        bgColor: "bg-[#ffdbcc]/20",
        icon: "hourglass_top",
      },
      DONE: {
        label: "Confirmed",
        color: "text-[#c0c1ff]",
        bgColor: "bg-[#c0c1ff]/10",
        icon: "check_circle",
      },
      REJECTED: {
        label: "Rejected",
        color: "text-[#ffb4ab]",
        bgColor: "bg-[#ffb4ab]/10",
        icon: "cancel",
      },
      EXPIRED: {
        label: "Expired",
        color: "text-[#666]",
        bgColor: "bg-[#666]/10",
        icon: "timer_off",
      },
      CANCELED: {
        label: "Canceled",
        color: "text-[#666]",
        bgColor: "bg-[#666]/10",
        icon: "not_interested",
      },
    };
    return configs[status] || configs.WAITING_PAYMENT;
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchMyTransactions(newPage, 20);
    }
  };

  if (loading && transactions.length === 0) {
    return (
      <div className="bg-[#131313] text-[#e5e2e1] min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#c0c1ff] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#c7c4d8]">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#131313] text-[#e5e2e1] min-h-screen font-sans selection:bg-[#c0c1ff]/30">
      <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[#c7c4d8] text-xs mb-4">
            <Link to="/" className="hover:text-[#c0c1ff]">Home</Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#c0c1ff]">My Transactions</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#e5e2e1]">
            My Transactions
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-2">
          {availableStatuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filter === status
                  ? "bg-[#c0c1ff] text-[#07006c]"
                  : "bg-[#1c1b1b] text-[#c7c4d8] hover:text-[#e5e2e1] hover:bg-[#2a2a2a]"
              }`}
            >
              {status === "ALL" ? "All" : getStatusConfig(status).label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {error && (
          <div className="bg-[#93000a]/10 border border-[#93000a]/30 rounded-xl p-6 mb-6">
            <p className="text-[#ffb4ab]">{error}</p>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="bg-[#1c1b1b] rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#666] mb-4">
              receipt_long
            </span>
            <h2 className="text-2xl font-bold text-[#e5e2e1] mb-2">
              No transactions found
            </h2>
            <p className="text-[#c7c4d8] mb-6">
              {filter === "ALL" 
                ? "You haven't made any transactions yet." 
                : `You don't have any transactions with status "${getStatusConfig(filter).label}".`
              }
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-[#c0c1ff] text-[#07006c] font-bold rounded-lg hover:opacity-90"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/transactions/${transaction.id}`)}
                className="bg-[#1c1b1b] rounded-xl p-6 cursor-pointer hover:bg-[#2a2a2a] transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Event Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#2a2a2a] flex-shrink-0">
                    {transaction.event?.imageUrl ? (
                      <img 
                        src={transaction.event.imageUrl} 
                        alt={transaction.event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-[#666]">
                          event
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-[#e5e2e1] truncate">
                          {transaction.event?.name}
                        </h3>
                        <p className="text-sm text-[#c7c4d8]">{transaction.ticket?.name}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusConfig(transaction.status).bgColor} ${getStatusConfig(transaction.status).color}`}>
                        <span className="material-symbols-outlined text-xs mr-1">
                          {getStatusConfig(transaction.status).icon}
                        </span>
                        {getStatusConfig(transaction.status).label}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-[#c7c4d8]">
                      <span>
                        {transaction.quantity} ticket{transaction.quantity > 1 ? "s" : ""}
                      </span>
                      <span className="text-[#666]">•</span>
                      <span>{formatDate(transaction.createdAt)}</span>
                      <span className="text-[#666]">•</span>
                      <span className="text-[#e5e2e1] font-medium">
                        {formatIDR(transaction.finalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="material-symbols-outlined text-[#666]">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                    pagination.page === pageNum
                      ? "bg-[#c0c1ff] text-[#07006c]"
                      : "bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1]"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {pagination.totalPages > 5 && (
              <span className="text-[#666] px-2">...</span>
            )}
            
            {pagination.totalPages > 5 && (
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                  pagination.page === pagination.totalPages
                    ? "bg-[#c0c1ff] text-[#07006c]"
                    : "bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1]"
                }`}
              >
                {pagination.totalPages}
              </button>
            )}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-zinc-950/90 backdrop-blur-md z-50 border-t border-zinc-800/50">
        <Link to="/" className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <div className="flex flex-col items-center justify-center bg-indigo-500/10 text-indigo-200 rounded-xl px-6 py-1">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            confirmation_number
          </span>
          <span className="text-[10px] font-medium">Tickets</span>
        </div>
        <Link to="/profile" className="flex flex-col items-center justify-center text-zinc-500">
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default MyTransactionsPage;