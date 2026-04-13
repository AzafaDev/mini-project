import React from "react";

interface TicketStatsProps {
  icon: string;
  label: string;
  value: string;
  subtext: string;
  colorClass?: string;
  border?: string;
}

export const TicketStats: React.FC<TicketStatsProps> = ({
  icon,
  label,
  value,
  subtext,
  colorClass = "text-primary",
  border = "",
}) => (
  <div className={`bg-[#1c1b1b] p-6 rounded-xl flex flex-col justify-between ${border}`}>
    <div>
      <span className={`material-symbols-outlined ${colorClass} mb-4`}>
        {icon}
      </span>
      <h3 className="text-[10px] uppercase tracking-widest text-[#c7c4d8] mb-1">
        {label}
      </h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
    <p
      className={`text-xs mt-4 ${colorClass === "text-tertiary" ? "text-tertiary" : "text-[#c7c4d8]"}`}
    >
      {subtext}
    </p>
  </div>
);
