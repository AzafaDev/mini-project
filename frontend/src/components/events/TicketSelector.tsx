import React from "react";
import { formatIDR } from "../../lib/formatters";

interface TicketSelectorProps {
  tickets: {
    general: number;
    architect: number;
  };
  onUpdateTicket: (type: "general" | "architect", delta: number) => void;
  prices: {
    general: number;
    architect: number;
  };
}

export const TicketSelector: React.FC<TicketSelectorProps> = ({
  tickets,
  onUpdateTicket,
  prices,
}) => {
  return (
    <div className="space-y-4">
      {/* General */}
      <div
        className={`p-5 bg-dark-surface rounded-lg border transition-all ${tickets.general > 0 ? "border-primary" : "border-transparent"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-text-light">
              General Admission
            </h4>
            <p className="text-xs text-text-muted">
              Standard floor access
            </p>
          </div>
          <span className="text-primary font-black">
            {formatIDR(prices.general)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[#ffdad6] bg-error/30 px-2 py-0.5 rounded">
            Low Stock
          </span>
          <div className="flex items-center gap-4 bg-dark-card px-3 py-1 rounded-full">
            <button
              onClick={() => onUpdateTicket("general", -1)}
              className="text-text-muted hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">
                remove
              </span>
            </button>
            <span className="font-bold min-w-[1rem] text-center">
              {tickets.general}
            </span>
            <button
              onClick={() => onUpdateTicket("general", 1)}
              className="text-text-muted hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">
                add
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* VIP */}
      <div
        className={`p-5 bg-dark-surface rounded-lg border transition-all ${tickets.architect > 0 ? "border-primary shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-text-light">
                Architect Tier (VIP)
              </h4>
              <span className="material-symbols-outlined text-primary text-sm">
                stars
              </span>
            </div>
            <p className="text-xs text-text-muted">
              Lounge, open bar, artist meet
            </p>
          </div>
          <span className="text-primary font-black">
            {formatIDR(prices.architect)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">
            Most Popular
          </span>
          <div className="flex items-center gap-4 bg-dark-card px-3 py-1 rounded-full">
            <button
              onClick={() => onUpdateTicket("architect", -1)}
              className="text-text-muted hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">
                remove
              </span>
            </button>
            <span className="font-bold min-w-[1rem] text-center">
              {tickets.architect}
            </span>
            <button
              onClick={() => onUpdateTicket("architect", 1)}
              className="text-text-muted hover:text-primary"
            >
              <span className="material-symbols-outlined text-lg">
                add
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
