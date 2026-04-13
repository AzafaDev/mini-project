import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  icon: string;
  iconColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  trend,
  icon,
  iconColor,
}) => (
  <div className="p-6 bg-[#1C1B1B] rounded-lg">
    <div
      className={`w-10 h-10 rounded flex items-center justify-center mb-4`}
      style={{ backgroundColor: `${iconColor}1A` }}
    >
      <span className="material-symbols-outlined" style={{ color: iconColor }}>
        {icon}
      </span>
    </div>
    <span className="text-on-surface-variant text-xs uppercase tracking-widest">
      {label}
    </span>
    <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
    {trend && (
      <div className="mt-4 flex items-center gap-1 text-[10px] text-on-surface-variant font-medium">
        <span className="material-symbols-outlined text-[12px]">
          trending_up
        </span>
        {trend}
      </div>
    )}
  </div>
);
