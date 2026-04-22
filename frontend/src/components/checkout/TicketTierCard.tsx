import React from "react";
import { formatIDR } from "../../lib/formatters";

interface TicketTierCardProps {
  type: "general" | "vip";
  title: string;
  description: string;
  price: number;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  isPopular?: boolean;
}

export const TicketTierCard: React.FC<TicketTierCardProps> = ({
  type,
  title,
  description,
  price,
  quantity,
  onQuantityChange,
  isPopular = false,
}) => {
  return (
    <div
      className={`bg-dark-elevated border-2 ${isPopular || type === "vip" ? "border-primary p-6 rounded-xl relative shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent hover:border-accent/40 p-6 rounded-xl transition-all group"}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-6 bg-primary px-3 py-1 rounded-full text-[10px] font-bold text-primary-dark">
          MOST POPULAR
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-text-light">{title}</h4>
          <p className="text-text-muted text-sm mt-1">{description}</p>
        </div>
        {isPopular || type === "vip" ? (
          <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs">
            Active
          </span>
        ) : (
          <span className="bg-dark-card px-2 py-1 rounded text-xs text-text-muted">
            Available
          </span>
        )}
      </div>
      <div className="flex justify-between items-end">
        <span className="text-xl font-black text-text-light">
          {formatIDR(price)}
        </span>
        <div
          className={`flex items-center gap-4 bg-dark-darker rounded-full px-4 py-2 ${type === "vip" ? "border border-primary/30" : ""}`}
        >
          <button
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            className="material-symbols-outlined text-text-muted hover:text-primary"
          >
            remove
          </button>
          <span className="font-bold w-4 text-center">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="material-symbols-outlined text-text-muted hover:text-primary"
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
};
