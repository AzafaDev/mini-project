import React from "react";

interface PaginationBtnProps {
  icon?: string;
  label?: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const PaginationBtn: React.FC<PaginationBtnProps> = ({
  icon,
  label,
  active = false,
  disabled = false,
  onClick,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${active ? "bg-[#c0c1ff] text-[#07006c]" : "bg-[#2a2a2a] text-[#c7c4d8] hover:text-[#e5e2e1]"}`}
  >
    {icon ? (
      <span className="material-symbols-outlined text-sm">{icon}</span>
    ) : (
      label
    )}
  </button>
);
