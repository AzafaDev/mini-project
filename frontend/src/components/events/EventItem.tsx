import React from "react";
import { useNavigate } from "react-router-dom";

interface EventItemProps {
  id?: string;
  title: string;
  date: string;
  location: string;
  sold: number;
  capacity: number;
  status: string;
  image: string;
  onStatsClick?: () => void;
  onClick?: () => void;
}

export const EventItem: React.FC<EventItemProps> = ({
  id,
  title,
  date,
  location,
  sold,
  capacity,
  status,
  image,
  onStatsClick,
  onClick,
}) => {
  const navigate = useNavigate();
  const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (onStatsClick) {
      onStatsClick();
    } else if (id) {
      navigate(`/events/${id}`);
    }
  };

  return (
    <div
      className="bg-[#1C1B1B] hover:bg-[#2A2A2A] transition-colors p-4 flex items-center gap-4 group cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <img
          alt={title}
          className="w-full h-full object-cover"
          src={image || "https://via.placeholder.com/64"}
        />
      </div>
      <div className="flex-1">
        <h5 className="font-bold text-on-surface">{title}</h5>
        <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2">
          <span className="material-symbols-outlined text-[14px]">
            calendar_today
          </span>{" "}
          {date}
          <span className="mx-2">•</span>
          <span className="material-symbols-outlined text-[14px]">
            location_on
          </span>{" "}
          {location}
        </p>
      </div>
      <div className="text-right hidden sm:block">
        <p className="text-sm font-bold text-on-surface">
          {sold.toLocaleString()} Sold
        </p>
        <div className="w-24 bg-[#353534] h-1 rounded-full mt-2 overflow-hidden">
          <div
            className="bg-[#C0C1FF] h-full"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="px-3 py-1 bg-[#C3C0FF]/10 text-[#C3C0FF] text-[10px] font-black uppercase rounded border border-[#C3C0FF]/20">
        {status}
      </div>
    </div>
  );
};
