import React from "react";

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  active = false,
}) => (
  <a
    className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all active:translate-x-1 duration-150 ${active ? "bg-dark-elevated text-primary font-semibold border-r-4 border-primary" : "text-text-muted hover:bg-dark-elevated hover:text-text-light"}`}
    href="#"
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm">{label}</span>
  </a>
);
