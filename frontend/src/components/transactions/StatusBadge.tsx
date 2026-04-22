import React from "react";

type TransactionStatus = "waiting" | "done" | "pending" | "rejected";

interface StatusBadgeProps {
  status: TransactionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    waiting: "bg-warning-light/10 text-warning border-warning-dark/20",
    done: "bg-primary/10 text-primary border-accent/20",
    pending: "bg-warning-light/20 text-warning border-none",
    rejected: "bg-error-light/10 text-error-light border-error/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status]}`}
    >
      {status === "waiting" && (
        <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse"></span>
      )}
      {status === "done" && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
      )}
      {status === "pending" && (
        <span className="material-symbols-outlined text-[12px]">
          receipt_long
        </span>
      )}
      {status === "rejected" && (
        <span className="w-1.5 h-1.5 rounded-full bg-error-light"></span>
      )}
      {status === "waiting"
        ? "Waiting for Payment"
        : status === "pending"
          ? "Proof Uploaded"
          : status}
    </div>
  );
};
