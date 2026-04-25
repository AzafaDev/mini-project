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
  const { transactions, fetchMyTransactions, pagination, loading, error } =
    useTransactionStore();

  const [filter, setFilter] = useState<FilterStatus>("ALL");

  const availableStatuses: FilterStatus[] = [
    "ALL",
    "WAITING_PAYMENT",
    "WAITING_CONFIRMATION",
    "DONE",
    "CANCELED",
    "REJECTED",
  ];

  const filteredTransactions = transactions.filter((txn) => {
    if (filter === "ALL") return true;
    return txn.status === filter;
  });

  const needsPaymentProof = (txn: Transaction) =>
    txn.status === "WAITING_PAYMENT" && !txn.paymentProof;

  useEffect(() => {
    fetchMyTransactions(pagination.page, 20);
  }, [pagination.page, fetchMyTransactions]);

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
    <div className="bg-dark text-text-light min-h-screen font-sans selection:bg-primary/30 pb-20 md:pb-0">
      <main className=" pb-12 px-4 sm:px-6 md:px-12 max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-1 sm:gap-2 text-text-muted text-xs mb-3 sm:mb-4">
            <Link to="/" className="hover:text-primary flex items-center">
              Home
            </Link>
            <span className="material-symbols-outlined text-xs">
              chevron_right
            </span>
            <span className="text-primary">My Transactions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tighter text-text-light">
            My Transactions
          </h1>
        </div>

        {/* Filters */}
        <div className="mb-6 sm:mb-8 flex flex-wrap gap-2">
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

        {/* Error */}
        {error && (
          <div className="bg-error/10 border border-error/30 rounded-xl p-4 sm:p-6 mb-6">
            <p className="text-error-light">{error}</p>
          </div>
        )}

        {/* Transaction List */}
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <span className="material-symbols-outlined text-6xl text-text-secondary mb-4">
              receipt_long
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-text-light mb-2">
              No transactions found
            </h2>
            <p className="text-text-muted px-4">
              {filter !== "ALL"
                ? "Try adjusting your filters"
                : "You haven't made any transactions yet."}
            </p>
            {filter === "ALL" && (
              <Link
                to="/"
                className="inline-block mt-4 px-6 py-3 bg-primary text-primary-dark font-bold rounded-lg hover:opacity-90"
              >
                Browse Events
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                onClick={() => navigate(`/transactions/${transaction.id}`)}
                className="bg-dark-surface rounded-xl p-4 sm:p-6 border border-white/5 hover:border-white/10 transition-all cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Event Image - FIXED: menggunakan object-contain agar tidak terpotong */}
                  <div className="w-full sm:w-24 h-20 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-dark-elevated flex items-center justify-center">
                    <img
                      src={
                        transaction.event?.imageUrl ||
                        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=400"
                      }
                      alt={transaction.event?.name}
                      className="w-full h-full"
                    />
                  </div>

                  {/* Event Details */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-bold text-text-light truncate">
                          {transaction.event?.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-muted">
                          {transaction.quantity} ticket
                          {transaction.quantity > 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div
                          className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold ${getStatusConfig(transaction.status).bgColor} ${getStatusConfig(transaction.status).color} flex justify-center items-center`}
                        >
                          <span className="material-symbols-outlined text-xs mr-1">
                            {getStatusConfig(transaction.status).icon}
                          </span>
                          <span className="hidden sm:inline">
                            {getStatusConfig(transaction.status).label}
                          </span>
                          <span className="sm:hidden">
                            {
                              getStatusConfig(transaction.status).label.split(
                                " ",
                              )[0]
                            }
                          </span>
                        </div>
                        {needsPaymentProof(transaction) && (
                          <span className="text-[10px] bg-warning text-primary-dark px-2 py-1 rounded-full font-bold animate-pulse whitespace-nowrap">
                            Upload
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-text-muted">
                      <span>{formatDate(transaction.createdAt)}</span>
                      <span className="text-text-secondary">•</span>
                      <span className="text-text-light font-medium">
                        {formatIDR(transaction.finalPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <span className="material-symbols-outlined text-text-secondary flex-shrink-0 self-end sm:self-center">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 sm:mt-8 flex items-center justify-center gap-1 sm:gap-2 flex-wrap">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-dark-elevated text-text-muted hover:text-text-light disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
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
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-medium min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10 ${
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
              <span className="text-text-secondary px-1 sm:px-2">...</span>
            )}

            {pagination.totalPages > 5 && (
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-medium min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10 ${
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
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-dark-elevated text-text-muted hover:text-text-light disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] sm:min-h-10 sm:min-w-10"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTransactionsPage;
