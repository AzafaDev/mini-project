import React from "react";

type TransactionStatus = "waiting" | "done" | "pending" | "rejected";

interface StatusBadgeProps {
  status: TransactionStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    waiting: "bg-[#ffdbcc]/10 text-[#ffb695] border-[#a44100]/20",
    done: "bg-[#c0c1ff]/10 text-[#c0c1ff] border-[#4b4dd8]/20",
    pending: "bg-[#ffdbcc]/20 text-[#ffb695] border-none",
    rejected: "bg-[#ffb4ab]/10 text-[#ffb4ab] border-[#93000a]/20",
  };

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status]}`}
    >
      {status === "waiting" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb695] animate-pulse"></span>
      )}
      {status === "done" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#c0c1ff]"></span>
      )}
      {status === "pending" && (
        <span className="material-symbols-outlined text-[12px]">
          receipt_long
        </span>
      )}
      {status === "rejected" && (
        <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]"></span>
      )}
      {status === "waiting"
        ? "Waiting for Payment"
        : status === "pending"
          ? "Proof Uploaded"
          : status}
    </div>
  );
};
