import React from "react";

interface ActionBtnProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export const ActionBtn: React.FC<ActionBtnProps> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-[#2a2a2a] text-[#e5e2e1] px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-[#393939] transition-colors"
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);
