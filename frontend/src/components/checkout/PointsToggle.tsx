import React from "react";

interface PointsToggleProps {
  pointsBalance: number;
  pointsToUse: number;
  discountValue: number;
  isEnabled: boolean;
  onToggle: () => void;
}

const formatIDR = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount).replace("Rp", "IDR");
};

export const PointsToggle: React.FC<PointsToggleProps> = ({
  pointsBalance,
  pointsToUse,
  discountValue,
  isEnabled,
  onToggle,
}) => {
  return (
    <div className="bg-[#1c1b1b] p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#c0c1ff]">
            stars
          </span>
          <h3 className="font-bold text-[#e5e2e1]">Loyalty Points</h3>
        </div>
        <span className="text-xs bg-[#c0c1ff]/10 text-[#c0c1ff] px-2 py-1 rounded-full font-semibold">
          {pointsBalance.toLocaleString()} pts
        </span>
      </div>
      <div className="flex items-center justify-between bg-[#0e0e0e] p-4 rounded-lg">
        <div>
          <p className="text-sm font-semibold text-[#e5e2e1]">
            Use {pointsToUse.toLocaleString()} Points
          </p>
          <p className="text-xs text-[#c7c4d8]">Save {formatIDR(discountValue)}</p>
        </div>
        <button
          onClick={onToggle}
          className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isEnabled ? "bg-[#c0c1ff]" : "bg-zinc-700"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? "left-7" : "left-1"}`}
          ></span>
        </button>
      </div>
    </div>
  );
};
