import React from "react";

interface TicketTierCardProps {
  type: "general" | "vip";
  title: string;
  description: string;
  price: number;
  quantity: number;
  onQuantityChange: (delta: number) => void;
  isPopular?: boolean;
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("Rp", "IDR");
};

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
      className={`bg-[#2a2a2a] border-2 ${isPopular || type === "vip" ? "border-[#c0c1ff] p-6 rounded-xl relative shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent hover:border-[#4b4dd8]/40 p-6 rounded-xl transition-all group"}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-6 bg-[#c0c1ff] px-3 py-1 rounded-full text-[10px] font-bold text-[#07006c]">
          MOST POPULAR
        </div>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-[#e5e2e1]">{title}</h4>
          <p className="text-[#c7c4d8] text-sm mt-1">{description}</p>
        </div>
        {isPopular || type === "vip" ? (
          <span className="bg-[#c0c1ff]/20 text-[#c0c1ff] px-2 py-1 rounded text-xs">
            Active
          </span>
        ) : (
          <span className="bg-[#353534] px-2 py-1 rounded text-xs text-[#c7c4d8]">
            Available
          </span>
        )}
      </div>
      <div className="flex justify-between items-end">
        <span className="text-xl font-black text-[#e5e2e1]">
          {formatIDR(price)}
        </span>
        <div
          className={`flex items-center gap-4 bg-[#0e0e0e] rounded-full px-4 py-2 ${type === "vip" ? "border border-[#c0c1ff]/30" : ""}`}
        >
          <button
            onClick={() => onQuantityChange(Math.max(0, quantity - 1))}
            className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
          >
            remove
          </button>
          <span className="font-bold w-4 text-center">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            className="material-symbols-outlined text-[#c7c4d8] hover:text-[#c0c1ff]"
          >
            add
          </button>
        </div>
      </div>
    </div>
  );
};
