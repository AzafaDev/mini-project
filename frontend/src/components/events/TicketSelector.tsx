import React from "react";

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

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  })
    .format(amount)
    .replace("Rp", "IDR ");
};

export const TicketSelector: React.FC<TicketSelectorProps> = ({
  tickets,
  onUpdateTicket,
  prices,
}) => {
  return (
    <div className="space-y-4">
      {/* General */}
      <div
        className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${tickets.general > 0 ? "border-[#c0c1ff]" : "border-transparent"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <h4 className="font-bold text-[#e5e2e1]">
              General Admission
            </h4>
            <p className="text-xs text-[#c7c4d8]">
              Standard floor access
            </p>
          </div>
          <span className="text-[#c0c1ff] font-black">
            {formatIDR(prices.general)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[#ffdad6] bg-[#93000a]/30 px-2 py-0.5 rounded">
            Low Stock
          </span>
          <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
            <button
              onClick={() => onUpdateTicket("general", -1)}
              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
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
              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
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
        className={`p-5 bg-[#1c1b1b] rounded-lg border transition-all ${tickets.architect > 0 ? "border-[#c0c1ff] shadow-[0_0_20px_rgba(192,193,255,0.1)]" : "border-transparent"}`}
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-[#e5e2e1]">
                Architect Tier (VIP)
              </h4>
              <span className="material-symbols-outlined text-[#c0c1ff] text-sm">
                stars
              </span>
            </div>
            <p className="text-xs text-[#c7c4d8]">
              Lounge, open bar, artist meet
            </p>
          </div>
          <span className="text-[#c0c1ff] font-black">
            {formatIDR(prices.architect)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-[#c0c1ff] bg-[#c0c1ff]/10 px-2 py-0.5 rounded">
            Most Popular
          </span>
          <div className="flex items-center gap-4 bg-[#353534] px-3 py-1 rounded-full">
            <button
              onClick={() => onUpdateTicket("architect", -1)}
              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
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
              className="text-[#c7c4d8] hover:text-[#c0c1ff]"
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
