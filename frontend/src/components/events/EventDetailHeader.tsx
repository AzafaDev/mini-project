import React from "react";
import { motion } from "framer-motion";

interface EventDetailHeaderProps {
  title: string;
  date: string;
  location: string;
  time: string;
  image: string;
  category: string;
  subcategory?: string;
}

export const EventDetailHeader: React.FC<EventDetailHeaderProps> = ({
  title,
  date,
  location,
  time,
  image,
  category,
  subcategory,
}) => {
  return (
    <section className="relative w-full h-[60vh] md:h-[614px] overflow-hidden">
      <img
        alt="Main Event Hero"
        className="w-full h-full object-cover"
        src={image}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/40 to-transparent"></div>

      <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-4"
        >
          <span className="bg-accent/20 text-primary px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
            {category}
          </span>
          {subcategory && (
            <span className="bg-dark-card text-text-muted px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-lg">
              {subcategory}
            </span>
          )}
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-light mb-6 leading-none">
          {title}
        </h1>

        <div className="flex flex-wrap gap-8 text-text-muted">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              calendar_today
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold">
                Date & Time
              </p>
              <p className="text-text-light font-medium">
                {date} • {time}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              location_on
            </span>
            <div>
              <p className="text-xs uppercase tracking-widest font-bold">
                Location
              </p>
              <p className="text-text-light font-medium">{location}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
