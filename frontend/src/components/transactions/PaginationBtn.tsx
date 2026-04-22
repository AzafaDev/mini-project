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
    className={`w-8 h-8 flex items-center justify-center rounded text-xs font-bold transition-all ${disabled ? "opacity-30 cursor-not-allowed" : ""} ${active ? "bg-primary text-primary-dark" : "bg-dark-elevated text-text-muted hover:text-text-light"}`}
  >
    {icon ? (
      <span className="material-symbols-outlined text-sm">{icon}</span>
    ) : (
      label
    )}
  </button>
);
