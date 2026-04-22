import React from "react";
import { formatIDR } from "../../lib/formatters";

interface PointsToggleProps {
  pointsBalance: number;
  pointsToUse: number;
  discountValue: number;
  isEnabled: boolean;
  onToggle: () => void;
}

export const PointsToggle: React.FC<PointsToggleProps> = ({
  pointsBalance,
  pointsToUse,
  discountValue,
  isEnabled,
  onToggle,
}) => {
  return (
    <div className="bg-dark-surface p-6 rounded-xl space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">
            stars
          </span>
          <h3 className="font-bold text-text-light">Loyalty Points</h3>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-semibold">
          {pointsBalance.toLocaleString()} pts
        </span>
      </div>
      <div className="flex items-center justify-between bg-dark-darker p-4 rounded-lg">
        <div>
          <p className="text-sm font-semibold text-text-light">
            Use {pointsToUse.toLocaleString()} Points
          </p>
          <p className="text-xs text-text-muted">Save {formatIDR(discountValue)}</p>
        </div>
        <button
          onClick={onToggle}
          className={`w-12 h-6 rounded-full relative transition-colors duration-200 ${isEnabled ? "bg-primary" : "bg-zinc-700"}`}
        >
          <span
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? "left-7" : "left-1"}`}
          ></span>
        </button>
      </div>
    </div>
  );
};
