import React from "react";
import { useNavigate } from "react-router-dom";
import { FALLBACK_IMAGES } from "../../lib/constants";

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
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
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

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      className="bg-dark-surface hover:bg-dark-elevated transition-colors p-4 flex flex-wrap sm:flex-nowrap items-center gap-4 group cursor-pointer"
      onClick={handleClick}
    >
      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
        <img
          alt={title}
          className="w-full h-full object-cover"
          src={image || FALLBACK_IMAGES.EVENT_SMALL}
        />
      </div>
      <div className="flex-1 min-w-[150px]">
        <h5 className="font-bold text-sm md:text-base text-on-surface">{title}</h5>
        <p className="text-[10px] md:text-xs text-on-surface-variant mt-1 flex flex-wrap gap-1">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] md:text-[14px]">
              calendar_today
            </span>{" "}
            {date}
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[12px] md:text-[14px]">
              location_on
            </span>{" "}
            {location}
          </span>
        </p>
      </div>
      <div className="w-full sm:w-auto sm:ml-auto">
        <div className="flex items-center justify-between sm:justify-end gap-4">
          <div className="w-full sm:w-24">
            <p className="text-sm font-bold text-on-surface sm:text-right">
              {sold.toLocaleString()} Sold
            </p>
            <div className="w-full bg-dark-card h-1 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-primary h-full"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase rounded border border-primary/20">
        {status}
      </div>
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {onEdit && (
            <button
              onClick={handleEdit}
              className="h-10 w-10 p-2 text-text-secondary hover:text-on-surface hover:bg-dark-card rounded transition-colors flex items-center justify-center"
              title="Edit event"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
            </button>
          )}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="h-10 w-10 p-2 text-text-secondary hover:text-red-500 hover:bg-dark-card rounded transition-colors flex items-center justify-center"
              title="Delete event"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
