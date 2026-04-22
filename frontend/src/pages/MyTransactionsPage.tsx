import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTransactionStore } from "../stores/useTransactionStore";
import { formatIDR, formatDate } from "../lib/formatters";
import { type Transaction, type TransactionStatus } from "../services/api";
import { useAuthStore } from "../stores/useAuthStore";

type FilterStatus = "ALL" | TransactionStatus;

const MyTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    transactions,
    fetchMyTransactions,
    pagination,
    loading,
    error,
    clearTransactions,
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

  // Check if transaction needs payment proof upload
  const needsPaymentProof = (txn: Transaction) =>
    txn.status === "WAITING_PAYMENT" && !txn.paymentProof;

  useEffect(() => {
    fetchMyTransactions(pagination.page, 20);
  }, [pagination.page]);

  const getStatusConfig = (status: TransactionStatus) => {
    const configs: Record<
      TransactionStatus,
      { label: string; color: string; bgColor: string; icon: string }
    > = {
      WAITING_PAYMENT: {
        label: "Waiting Payment",
        color: "text-warning-dark",
        bgColor: "bg-warning-light/10",
        icon: "schedule",
      },
      WAITING_CONFIRMATION: {
        label: "Waiting Confirmation",
        color: "text-warning",
        bgColor: "bg-warning-light/20",
        icon: "hourglass_top",
      },
      DONE: {
        label: "Confirmed",
        color: "text-primary",
        bgColor: "bg-primary/10",
        icon: "check_circle",
      },
      REJECTED: {
        label: "Rejected",
        color: "text-error-light",
        bgColor: "bg-error-light/10",
        icon: "cancel",
      },
      EXPIRED: {
        label: "Expired",
        color: "text-text-secondary",
        bgColor: "bg-text-secondary/10",
        icon: "timer_off",
      },
      CANCELED: {
        label: "Canceled",
        color: "text-text-secondary",
        bgColor: "bg-text-secondary/10",
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
      <div className="bg-dark text-text-light min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-muted">Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30">
      <main className="pt-24 pb-32 px-6 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
            <Link to="/" className="hover:text-primary">
              Home
            </Link>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-primary">My Transactions</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-text-light">
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
                  ? "bg-primary text-primary-dark"
                  : "bg-dark-surface text-text-muted hover:text-text-light hover:bg-dark-elevated"
              }`}
            >
              {status === "ALL" ? "All" : getStatusConfig(status).label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-6 mb-6">
            <p className="text-error-light">{error}</p>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="bg-dark-surface rounded-xl p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
              receipt_long
            </span>
            <h2 className="text-2xl font-bold text-text-light mb-2">
              No transactions found
            </h2>
            <p className="text-text-muted mb-6">
              {filter === "ALL"
                ? "You haven't made any transactions yet."
                : `You don't have any transactions with status "${getStatusConfig(filter).label}".`}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-primary text-primary-dark font-bold rounded-lg hover:opacity-90"
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
                className="bg-dark-surface rounded-xl p-6 cursor-pointer hover:bg-dark-elevated transition-colors"
              >
                <div className="flex items-start gap-6">
                  {/* Event Image */}
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-dark-elevated flex-shrink-0">
                    {transaction.event?.imageUrl ? (
                      <img
                        src={transaction.event.imageUrl}
                        alt={transaction.event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl text-text-secondary">
                          event
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                       <div>
                         <h3 className="text-lg font-bold text-text-light truncate">
                           {transaction.event?.name}
                         </h3>
                         <p className="text-sm text-text-muted">
                           {transaction.quantity} ticket{transaction.quantity > 1 ? "s" : ""}
                         </p>
                       </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusConfig(transaction.status).bgColor} ${getStatusConfig(transaction.status).color} flex justify-center items-center`}
                        >
                          <span className="material-symbols-outlined text-xs mr-1">
                            {getStatusConfig(transaction.status).icon}
                          </span>
                          {getStatusConfig(transaction.status).label}
                        </div>
                        {needsPaymentProof(transaction) && (
                          <span className="text-xs bg-warning text-primary-dark px-2 py-1 rounded-full font-bold animate-pulse">
                            Upload Required
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-text-muted">
                      <span>
                        {transaction.quantity} ticket
                        {transaction.quantity > 1 ? "s" : ""}
                      </span>
                      <span className="text-text-secondary">•</span>
                      <span>{formatDate(transaction.createdAt)}</span>
                      <span className="text-text-secondary">•</span>
                      <span className="text-text-light font-medium">
                        {formatIDR(transaction.finalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="material-symbols-outlined text-text-secondary">
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
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-elevated text-text-muted hover:text-text-light disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>

            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                      pagination.page === pageNum
                        ? "bg-primary text-primary-dark"
                        : "bg-dark-elevated text-text-muted hover:text-text-light"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            {pagination.totalPages > 5 && (
              <span className="text-text-secondary px-2">...</span>
            )}

            {pagination.totalPages > 5 && (
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium ${
                  pagination.page === pagination.totalPages
                    ? "bg-primary text-primary-dark"
                    : "bg-dark-elevated text-text-muted hover:text-text-light"
                }`}
              >
                {pagination.totalPages}
              </button>
            )}

            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="w-10 h-10 flex items-center justify-center rounded-lg bg-dark-elevated text-text-muted hover:text-text-light disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>

      {/* Mobile BottomNavBar */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-2 bg-zinc-950/90 backdrop-blur-md z-50 border-t border-zinc-800/50">
        <Link
          to="/"
          className="flex flex-col items-center justify-center text-zinc-500"
        >
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
        <Link
          to="/profile"
          className="flex flex-col items-center justify-center text-zinc-500"
        >
          <span className="material-symbols-outlined">person</span>
          <span className="text-[10px] font-medium">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default MyTransactionsPage;
