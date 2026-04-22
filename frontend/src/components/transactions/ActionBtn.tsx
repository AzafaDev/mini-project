import React from "react";

interface ActionBtnProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export const ActionBtn: React.FC<ActionBtnProps> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-dark-elevated text-text-light px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-dark-card-hover transition-colors"
  >
    <span className="material-symbols-outlined text-xl">{icon}</span>
    <span className="font-semibold text-sm">{label}</span>
  </button>
);
