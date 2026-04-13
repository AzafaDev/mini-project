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
    className={`flex items-center gap-3 py-3 px-4 rounded-lg transition-all active:translate-x-1 duration-150 ${active ? "bg-[#2A2A2A] text-[#C0C1FF] font-semibold border-r-4 border-[#C0C1FF]" : "text-[#C7C4D8] hover:bg-[#2A2A2A] hover:text-[#E5E2E1]"}`}
    href="#"
  >
    <span className="material-symbols-outlined">{icon}</span>
    <span className="text-sm">{label}</span>
  </a>
);
