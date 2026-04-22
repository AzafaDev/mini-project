import React from "react";
import { FALLBACK_IMAGES } from "../../lib/constants";
import { formatDate } from "../../lib/formatters";

interface EventHeroProps {
  event: any;
  eventStatus: string;
  averageRating: number;
}

export const EventHero: React.FC<EventHeroProps> = ({ event, eventStatus, averageRating }) => {
  return (
    <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
      <img
        src={event.imageUrl || FALLBACK_IMAGES.EVENT_HERO}
        alt={event.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>

      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <span className="bg-accent/20 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
          {eventStatus}
        </span>

        <h1 className="text-3xl md:text-5xl font-black mt-4 text-text-light">
          {event.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 mt-4 text-text-muted">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">calendar_today</span>
            <span>{formatDate(event.startDate)} - {formatDate(event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined">location_on</span>
            <span>{event.location}</span>
          </div>
          {averageRating > 0 && (
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`material-symbols-outlined text-lg ${star <= Math.round(averageRating) ? "text-primary" : "text-dark-card"}`}
                >
                  star
                </span>
              ))}
              <span className="ml-2">{averageRating.toFixed(1)} ({event.reviews?.length || 0} reviews)</span>
            </div>
          )}
        </div>

        <p className="text-text-muted mt-4 max-w-3xl">
          {event.description}
        </p>
      </div>
    </div>
  );
};
