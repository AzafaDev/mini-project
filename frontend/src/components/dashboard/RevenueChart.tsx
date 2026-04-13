import React from "react";

interface RevenueChartProps {
  data?: number[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data = [30, 45, 65, 40, 80, 55, 95],
}) => {
  return (
    <div className="flex-1 flex items-end gap-3 px-4 pb-8">
      {data.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-lg transition-all relative group ${i === data.length - 1 ? "bg-[#C0C1FF] shadow-[0_0_20px_rgba(192,193,255,0.2)]" : "bg-[#4B4DD8]/30"}`}
          style={{ height: `${h}%` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#353534] text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            ${h / 2}k
          </div>
        </div>
      ))}
    </div>
  );
};
