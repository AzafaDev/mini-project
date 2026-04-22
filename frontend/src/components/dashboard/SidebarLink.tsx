import React from "react";

interface SidebarLinkProps {
  icon: string;
  label: string;
  active?: boolean;
}

export const SidebarLink: React.FC<SidebarLinkProps> = ({
  icon,
  label,
  active = false,
}) => (
  <a
    className={`${active ? "bg-dark-elevated text-primary" : "text-text-muted hover:bg-dark-elevated/50"} rounded-lg flex items-center gap-3 px-4 py-3 font-medium text-sm transition-all duration-200 cursor-pointer active:translate-x-1`}
  >
    <span
      className="material-symbols-outlined"
      style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}
    >
      {icon}
    </span>
    {label}
  </a>
);
